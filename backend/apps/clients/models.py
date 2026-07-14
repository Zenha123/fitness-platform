from django.db import models
from django.conf import settings

class TrainerClientLink(models.Model):
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_links',
        limit_choices_to={'role': 'trainer'}
    )
    client = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trainer_link',
        limit_choices_to={'role': 'client'}
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['trainer', 'client'], name='unique_trainer_client')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.trainer.name} -> {self.client.name}"
