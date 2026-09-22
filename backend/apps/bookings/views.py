import datetime
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import BookingService, TrainerAvailability, TrainerBlackout, Booking, IntakeFormSubmission
from .serializers import (
    BookingServiceSerializer,
    TrainerAvailabilitySerializer,
    TrainerBlackoutSerializer,
    BookingSerializer,
    CreateBookingSerializer,
    IntakeFormSubmissionSerializer
)
from .services import generate_available_slots, create_booking_with_lock
from apps.accounts.models import User


class BookingServiceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        services = BookingService.objects.filter(is_active=True)
        if not services.exists():
            # Seed default services if none exist
            trainer = User.objects.filter(role='trainer').first()
            BookingService.objects.create(
                trainer=trainer,
                service_type=BookingService.ServiceType.ONE_ON_ONE_COACHING,
                title="1-on-1 Fitness Coaching Kickoff",
                duration_minutes=60,
                buffer_minutes=15,
                description="Comprehensive 60-minute coaching session to discuss goals, program design, and custom training protocol."
            )
            BookingService.objects.create(
                trainer=trainer,
                service_type=BookingService.ServiceType.CONSULTATION,
                title="Strategy Consultation",
                duration_minutes=30,
                buffer_minutes=15,
                description="30-minute discovery call to evaluate your current routine, nutrition, and coaching suitability."
            )
            services = BookingService.objects.filter(is_active=True)

        serializer = BookingServiceSerializer(services, many=True)
        return Response(serializer.data)


class AvailableSlotsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service_id = request.query_params.get('service_id')
        trainer_id = request.query_params.get('trainer_id')
        date_str = request.query_params.get('date')  # YYYY-MM-DD in client timezone
        timezone_str = request.query_params.get('timezone', 'UTC')

        if not service_id:
            return Response({'error': 'service_id query parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.bookings.services import _resolve_tz
        _, resolved_tz = _resolve_tz(timezone_str)

        if date_str:
            try:
                target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # "Today" in the client's timezone, not the server clock alone
            target_tz, _ = _resolve_tz(timezone_str)
            target_date = datetime.datetime.now(tz=target_tz).date()

        slots = generate_available_slots(
            trainer_id=trainer_id,
            service_id=service_id,
            start_date=target_date,
            end_date=target_date,
            target_tz_str=resolved_tz,
        )
        from django.conf import settings as dj_settings
        return Response({
            'date': target_date.strftime('%Y-%m-%d'),
            'timezone': resolved_tz,
            'trainer_timezone': getattr(dj_settings, 'TRAINER_TIMEZONE', 'UTC'),
            'slots': slots,
        })


class CreateBookingView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        authenticated_client = request.user if request.user.is_authenticated and request.user.role == 'client' else None

        try:
            booking = create_booking_with_lock(
                service_id=data['service_id'],
                trainer_id=data.get('trainer_id'),
                start_time_utc=data['start_time'].isoformat(),
                client_name=data['client_name'],
                client_email=data['client_email'],
                client_phone=data['client_phone'],
                client_notes=data.get('client_notes', ''),
                authenticated_client=authenticated_client,
                client_timezone=data.get('client_timezone') or None,
            )
        except ValidationError as e:
            return Response({'error': str(e.detail[0] if isinstance(e.detail, list) else e.detail)}, status=status.HTTP_400_BAD_REQUEST)

        response_serializer = BookingSerializer(booking)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class IntakeFormView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            booking = Booking.objects.get(intake_token=token)
        except Booking.DoesNotExist:
            return Response({'error': 'Invalid or expired intake form link.'}, status=status.HTTP_404_NOT_FOUND)

        form_type = 'coaching_intake' if booking.service.service_type == 'one_on_one_coaching' else 'consultation_intake'
        has_submitted = hasattr(booking, 'intake_submission')

        submission_data = None
        if has_submitted:
            submission_data = IntakeFormSubmissionSerializer(booking.intake_submission).data

        return Response({
            'booking_id': booking.id,
            'client_name': booking.client_name,
            'client_email': booking.client_email,
            'service_title': booking.service.title,
            'form_type': form_type,
            'already_submitted': has_submitted,
            'submission': submission_data
        })

    def post(self, request, token):
        try:
            booking = Booking.objects.get(intake_token=token)
        except Booking.DoesNotExist:
            return Response({'error': 'Invalid or expired intake form link.'}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(booking, 'intake_submission'):
            return Response({'error': 'Intake form has already been submitted for this booking.'}, status=status.HTTP_400_BAD_REQUEST)

        responses = request.data.get('responses', {})
        form_type = 'coaching_intake' if booking.service.service_type == 'one_on_one_coaching' else 'consultation_intake'

        from .services import evaluate_intake_risk_flags, send_trainer_risk_alert_email
        has_risk_flags, risk_flags = evaluate_intake_risk_flags(responses)

        submission = IntakeFormSubmission.objects.create(
            booking=booking,
            form_type=form_type,
            responses=responses,
            has_risk_flags=has_risk_flags,
            risk_flags=risk_flags,
        )

        if has_risk_flags:
            try:
                send_trainer_risk_alert_email(booking, submission, risk_flags)
            except Exception:
                pass

        return Response(IntakeFormSubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)



class TrainerAvailabilityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TrainerAvailabilitySerializer

    def get_queryset(self):
        if self.request.user.role != 'trainer':
            return TrainerAvailability.objects.none()
        qs = TrainerAvailability.objects.filter(trainer=self.request.user)
        service_type = self.request.query_params.get('service_type')
        if service_type:
            qs = qs.filter(service_type=service_type)
        return qs

    def perform_create(self, serializer):
        if self.request.user.role != 'trainer':
            raise ValidationError("Only trainers can manage availability.")
        serializer.save(trainer=self.request.user)


class TrainerBlackoutViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TrainerBlackoutSerializer

    def get_queryset(self):
        if self.request.user.role != 'trainer':
            return TrainerBlackout.objects.none()
        return TrainerBlackout.objects.filter(trainer=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != 'trainer':
            raise ValidationError("Only trainers can manage blackouts.")
        serializer.save(trainer=self.request.user)


class TrainerBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        if self.request.user.role != 'trainer':
            return Booking.objects.none()
        return Booking.objects.filter(trainer=self.request.user).order_by('-start_time')


class ClientBookingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'client':
            return Response({'error': 'Only clients can access client bookings.'}, status=status.HTTP_403_FORBIDDEN)
        bookings = Booking.objects.filter(client=request.user).order_by('-start_time')
        return Response(BookingSerializer(bookings, many=True).data)


class AssessmentReportCreateUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'trainer':
            return Response({'error': 'Only trainers can generate assessment reports.'}, status=status.HTTP_403_FORBIDDEN)

        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response({'error': 'booking_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(id=booking_id, trainer=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found or not owned by trainer.'}, status=status.HTTP_404_NOT_FOUND)

        from .models import AssessmentReport
        from .serializers import AssessmentReportSerializer
        from .services import generate_assessment_report_pdf

        report, created = AssessmentReport.objects.get_or_create(
            booking=booking,
            defaults={
                'trainer': request.user,
                'client_name': booking.client_name,
                'client_email': booking.client_email,
                'goals_summary': request.data.get('goals_summary', ''),
                'baseline_assessment': request.data.get('baseline_assessment', ''),
                'recommended_program': request.data.get('recommended_program', ''),
                'suggested_timeline': request.data.get('suggested_timeline', ''),
                'trainer_notes': request.data.get('trainer_notes', ''),
            }
        )

        if not created:
            report.goals_summary = request.data.get('goals_summary', report.goals_summary)
            report.baseline_assessment = request.data.get('baseline_assessment', report.baseline_assessment)
            report.recommended_program = request.data.get('recommended_program', report.recommended_program)
            report.suggested_timeline = request.data.get('suggested_timeline', report.suggested_timeline)
            report.trainer_notes = request.data.get('trainer_notes', report.trainer_notes)
            report.save()

        # Always generate PDF upon save
        generate_assessment_report_pdf(report)

        return Response(AssessmentReportSerializer(report).data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class AssessmentReportReleaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, report_id):
        import logging
        logger = logging.getLogger(__name__)

        if request.user.role != 'trainer':
            return Response({'error': 'Only trainers can release reports.'}, status=status.HTTP_403_FORBIDDEN)

        from .models import AssessmentReport
        from .serializers import AssessmentReportSerializer
        from .services import send_assessment_report_email, generate_assessment_report_pdf

        try:
            report = AssessmentReport.objects.get(id=report_id, trainer=request.user)
        except AssessmentReport.DoesNotExist:
            return Response({'error': 'Assessment report not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Ensure PDF file exists before attempting email
        if not report.pdf_file:
            try:
                generate_assessment_report_pdf(report)
                report.refresh_from_db()
            except Exception as e:
                logger.exception("Failed to generate PDF for report %s", report_id)
                return Response({'error': f'Failed to generate PDF: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            send_assessment_report_email(report)
            report.refresh_from_db()
            logger.info(
                "Assessment report %s released and email sent to %s (backend=%s)",
                report_id, report.client_email, settings.EMAIL_BACKEND
            )
        except Exception as e:
            logger.exception("Failed to send assessment report email for report %s", report_id)
            return Response({'error': f'Report saved but email failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(AssessmentReportSerializer(report).data, status=status.HTTP_200_OK)


class AssessmentReportPDFDownloadView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, report_id):
        from django.http import HttpResponse, Http404
        from .models import AssessmentReport
        from .services import generate_assessment_report_pdf

        try:
            report = AssessmentReport.objects.get(id=report_id)
        except AssessmentReport.DoesNotExist:
            raise Http404("Assessment report not found.")

        token = request.query_params.get('token')
        is_owner_trainer = request.user.is_authenticated and request.user == report.trainer
        is_client_user = request.user.is_authenticated and report.booking.client == request.user
        is_valid_token = token and str(report.booking.intake_token) == str(token)

        if not (is_owner_trainer or is_client_user or is_valid_token):
            return Response({'error': 'Permission denied to view this report PDF.'}, status=status.HTTP_403_FORBIDDEN)

        if not report.pdf_file:
            generate_assessment_report_pdf(report)

        report.pdf_file.open('rb')
        response = HttpResponse(report.pdf_file.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="Haqq_Assessment_Report_{report.client_name.replace(" ", "_")}.pdf"'
        report.pdf_file.close()
        return response

