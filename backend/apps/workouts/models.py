from django.db import models
from django.conf import settings
import uuid


class WorkoutTemplate(models.Model):
    """A saved, reusable workout structure — no client or date attached."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workout_templates',
        limit_choices_to={'role': 'trainer'}
    )
    title = models.CharField(max_length=255)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (Template)"


class WorkoutTemplateExercise(models.Model):
    """A line-item exercise inside a WorkoutTemplate."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(
        WorkoutTemplate,
        on_delete=models.CASCADE,
        related_name='exercises'
    )
    exercise = models.ForeignKey(
        'exercises.Exercise',
        on_delete=models.PROTECT,
        related_name='template_uses'
    )
    sets = models.PositiveIntegerField(default=3)
    reps = models.CharField(max_length=50, default='10')  # Flexible: "10", "8-12", "AMRAP"
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    rest_seconds = models.PositiveIntegerField(null=True, blank=True, help_text="Rest time in seconds")
    order = models.PositiveIntegerField(default=0)
    notes = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.exercise.name} x{self.sets}"


class WorkoutPlan(models.Model):
    """A scheduled workout session for a specific client on a specific date."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='scheduled_plans',
        limit_choices_to={'role': 'trainer'}
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workout_plans',
        limit_choices_to={'role': 'client'}
    )
    scheduled_date = models.DateField()
    title = models.CharField(max_length=255)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheduled_date']

    def __str__(self):
        return f"{self.title} — {self.client.name} on {self.scheduled_date}"


class WorkoutPlanExercise(models.Model):
    """A prescribed exercise line-item inside a WorkoutPlan."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workout_plan = models.ForeignKey(
        WorkoutPlan,
        on_delete=models.CASCADE,
        related_name='exercises'
    )
    exercise = models.ForeignKey(
        'exercises.Exercise',
        on_delete=models.PROTECT,
        related_name='plan_uses'
    )
    sets = models.PositiveIntegerField(default=3)
    reps = models.CharField(max_length=50, default='10')
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    rest_seconds = models.PositiveIntegerField(null=True, blank=True, help_text="Rest time in seconds")
    order = models.PositiveIntegerField(default=0)
    notes = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.exercise.name} x{self.sets} for {self.workout_plan.client.name}"


class WorkoutLog(models.Model):
    """The client's actual recorded performance for a workout session."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workout_logs',
        limit_choices_to={'role': 'client'}
    )
    plan = models.ForeignKey(
        WorkoutPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='logs',
        help_text="The scheduled plan this log fulfills, if any."
    )
    date = models.DateField(help_text="Date the workout was actually performed")
    notes = models.TextField(blank=True, null=True, help_text="Optional client note, e.g. 'felt heavy'")
    completed = models.BooleanField(default=False, help_text="True once the client marks the session done")
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-logged_at']

    def __str__(self):
        return f"Log for {self.client.name} on {self.date}"


class WorkoutLogEntry(models.Model):
    """A client's recorded performance for a specific exercise in a session."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workout_log = models.ForeignKey(
        WorkoutLog,
        on_delete=models.CASCADE,
        related_name='entries'
    )
    exercise = models.ForeignKey(
        'exercises.Exercise',
        on_delete=models.PROTECT,
        related_name='log_entries'
    )
    actual_sets = models.PositiveIntegerField(default=1)
    actual_reps = models.CharField(max_length=50, blank=True, null=True)
    actual_weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    notes = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.exercise.name} actuals for {self.workout_log.client.name}"
