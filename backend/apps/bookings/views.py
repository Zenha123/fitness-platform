import datetime
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

        submission = IntakeFormSubmission.objects.create(
            booking=booking,
            form_type=form_type,
            responses=responses
        )
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
