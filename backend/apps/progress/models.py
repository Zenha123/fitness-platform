from django.db import models
from django.conf import settings
import uuid
import os


def weight_photo_upload_path(instance, filename):
    """
    Store photos privately under MEDIA_ROOT/progress_photos/<client_id>/<filename>.
    File path is NOT exposed publicly; access goes through an authenticated view.
    """
    ext = os.path.splitext(filename)[1].lower()
    new_filename = f"{uuid.uuid4()}{ext}"
    return f"progress_photos/{instance.client_id}/{new_filename}"


class WeightEntry(models.Model):
    """A client's weight check-in, with an optional progress photo."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='weight_entries',
        limit_choices_to={'role': 'client'}
    )
    date = models.DateField(help_text="Date of the weight entry (expected ~every 14 days).")
    weight_kg = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Always stored in kg; converted to lb in the API response if user prefers."
    )
    photo = models.ImageField(
        upload_to=weight_photo_upload_path,
        null=True,
        blank=True,
        help_text="Optional progress photo. Stored privately; never publicly accessible."
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"{self.client.name} — {self.weight_kg}kg on {self.date}"
