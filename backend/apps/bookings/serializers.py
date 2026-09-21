from rest_framework import serializers
from .models import BookingService, TrainerAvailability, TrainerBlackout, Booking, IntakeFormSubmission
from apps.accounts.serializers import UserSerializer

class BookingServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingService
        fields = ['id', 'trainer', 'service_type', 'title', 'duration_minutes', 'buffer_minutes', 'description', 'is_active', 'created_at']


class TrainerAvailabilitySerializer(serializers.ModelSerializer):
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)

    class Meta:
        model = TrainerAvailability
        fields = [
            'id', 'trainer', 'service_type', 'service_type_display',
            'day_of_week', 'start_time', 'end_time', 'is_active',
        ]
        read_only_fields = ['id', 'trainer']

    def validate_service_type(self, value):
        valid = {c[0] for c in BookingService.ServiceType.choices}
        if value not in valid:
            raise serializers.ValidationError(
                "service_type must be 'one_on_one_coaching' or 'consultation'."
            )
        return value

    def validate(self, attrs):
        start = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if start and end and start >= end:
            raise serializers.ValidationError("end_time must be after start_time.")
        return attrs


class TrainerBlackoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainerBlackout
        fields = ['id', 'trainer', 'start_datetime', 'end_datetime', 'reason', 'created_at']
        read_only_fields = ['id', 'trainer']


class IntakeFormSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntakeFormSubmission
        fields = ['id', 'booking', 'form_type', 'responses', 'submitted_at']
        read_only_fields = ['id', 'booking', 'submitted_at']


class BookingSerializer(serializers.ModelSerializer):
    service_details = BookingServiceSerializer(source='service', read_only=True)
    trainer_details = UserSerializer(source='trainer', read_only=True)
    intake_submission = IntakeFormSubmissionSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'service', 'service_details', 'trainer', 'trainer_details', 'client',
            'client_name', 'client_email', 'client_phone', 'start_time', 'end_time',
            'status', 'meeting_link', 'intake_token', 'client_notes', 'created_at',
            'intake_submission'
        ]
        read_only_fields = ['id', 'trainer', 'intake_token', 'created_at']


class CreateBookingSerializer(serializers.Serializer):
    service_id = serializers.UUIDField()
    trainer_id = serializers.UUIDField(required=False, allow_null=True)
    start_time = serializers.DateTimeField()
    client_name = serializers.CharField(max_length=255)
    client_email = serializers.EmailField()
    client_phone = serializers.CharField(max_length=50)
    client_notes = serializers.CharField(required=False, allow_blank=True, default='')
    client_timezone = serializers.CharField(required=False, allow_blank=True, default='')
