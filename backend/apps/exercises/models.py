from django.db import models
from django.conf import settings
import uuid

class Exercise(models.Model):
    CATEGORY_CHOICES = [
        ('Chest', 'Chest'),
        ('Back', 'Back'),
        ('Shoulders', 'Shoulders'),
        ('Biceps', 'Biceps'),
        ('Triceps', 'Triceps'),
        ('Legs', 'Legs'),
        ('Glutes', 'Glutes'),
        ('Core', 'Core'),
        ('Cardio', 'Cardio'),
        ('Full Body', 'Full Body'),
        ('Mobility', 'Mobility'),
        ('Stretching', 'Stretching'),
        ('Custom', 'Custom'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exercises',
        limit_choices_to={'role': 'trainer'}
    )
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    notes = models.TextField(blank=True, null=True)
    demo_link = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['trainer', 'name'], name='unique_exercise_name_per_trainer')
        ]
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.category})"
