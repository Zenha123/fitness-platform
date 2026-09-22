import uuid
from django.db import models
from django.conf import settings

class BookingService(models.Model):
    class ServiceType(models.TextChoices):
        ONE_ON_ONE_COACHING = 'one_on_one_coaching', 'One-on-One Coaching'
        CONSULTATION = 'consultation', 'Consultation'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='booking_services',
        limit_choices_to={'role': 'trainer'},
        null=True,
        blank=True
    )
    service_type = models.CharField(max_length=50, choices=ServiceType.choices)
    title = models.CharField(max_length=255)
    duration_minutes = models.PositiveIntegerField(default=60)
    buffer_minutes = models.PositiveIntegerField(default=15)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['service_type', 'title']

    def __str__(self):
        return f"{self.title} ({self.get_service_type_display()}) - {self.duration_minutes}m"


class TrainerAvailability(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='availabilities',
        limit_choices_to={'role': 'trainer'}
    )
    # Phase 1 §5.2/5.3 — independent calendars per service category
    service_type = models.CharField(
        max_length=50,
        choices=BookingService.ServiceType.choices,
        help_text="Which booking calendar this weekly window belongs to.",
    )
    day_of_week = models.PositiveIntegerField(help_text="0=Monday, 6=Sunday")
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['service_type', 'day_of_week', 'start_time']

    def __str__(self):
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        day_str = days[self.day_of_week] if 0 <= self.day_of_week <= 6 else str(self.day_of_week)
        return (
            f"{self.trainer.name} [{self.get_service_type_display()}]: "
            f"{day_str} {self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"
        )

class TrainerBlackout(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blackouts',
        limit_choices_to={'role': 'trainer'}
    )
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    reason = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_datetime']

    def __str__(self):
        return f"Blackout for {self.trainer.name}: {self.start_datetime} to {self.end_datetime}"


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(
        BookingService,
        on_delete=models.SET_NULL,
        null=True,
        related_name='bookings'
    )
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trainer_bookings',
        limit_choices_to={'role': 'trainer'}
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='client_bookings',
        limit_choices_to={'role': 'client'}
    )
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=50)
    start_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    meeting_link = models.URLField(blank=True, null=True)
    intake_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    client_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"Booking: {self.client_name} with {self.trainer.name} at {self.start_time}"


class IntakeFormSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='intake_submission'
    )
    form_type = models.CharField(max_length=50)  # coaching_intake or consultation_intake
    responses = models.JSONField(default=dict)
    has_risk_flags = models.BooleanField(default=False)
    risk_flags = models.JSONField(default=list, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

class AssessmentReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='assessment_report'
    )
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trainer_assessment_reports',
        limit_choices_to={'role': 'trainer'}
    )
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()

    goals_summary = models.TextField(help_text="Client goals summary & target objectives.")
    baseline_assessment = models.TextField(help_text="Current baseline assessment, posture, fitness level, PAR-Q findings.")
    recommended_program = models.TextField(help_text="Recommended program direction, training frequency, protocols.")
    suggested_timeline = models.TextField(help_text="Suggested timeline, milestones, and evaluation dates.")
    trainer_notes = models.TextField(blank=True, default="", help_text="Additional notes or advisory from trainer.")

    pdf_file = models.FileField(upload_to='assessment_reports/', blank=True, null=True)
    is_released = models.BooleanField(default=False, help_text="Whether report is released and emailed to client.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Assessment Report for {self.client_name} (Booking {self.booking.id})"


