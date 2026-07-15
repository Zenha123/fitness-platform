from django.db import models
from django.conf import settings
import uuid


class WeeklyReview(models.Model):
    """
    Freeform trainer feedback note posted to a client at any time.
    Despite the name inherited from the SRS, it is NOT tied to a fixed week.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='authored_reviews',
        limit_choices_to={'role': 'trainer'}
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_reviews',
        limit_choices_to={'role': 'client'}
    )
    summary = models.TextField(help_text="Overall progress summary.")
    improvements_needed = models.TextField(help_text="Areas the client should focus on.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.trainer.name} for {self.client.name} on {self.created_at:%Y-%m-%d}"
