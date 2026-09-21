# Generated manually for Phase 1 Task 5 — service-specific availability

import uuid

from django.db import migrations, models


def forwards_assign_service_types(apps, schema_editor):
    """
    Existing weekly rules were shared. Duplicate each rule onto both calendars
    so coaching and consultation keep working until the trainer customizes them.
    """
    TrainerAvailability = apps.get_model("bookings", "TrainerAvailability")
    existing = list(TrainerAvailability.objects.all())
    for row in existing:
        # Keep original as coaching
        row.service_type = "one_on_one_coaching"
        row.save(update_fields=["service_type"])
        # Mirror onto consultation calendar
        TrainerAvailability.objects.create(
            id=uuid.uuid4(),
            trainer_id=row.trainer_id,
            service_type="consultation",
            day_of_week=row.day_of_week,
            start_time=row.start_time,
            end_time=row.end_time,
            is_active=row.is_active,
        )


def backwards_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="traineravailability",
            name="service_type",
            field=models.CharField(
                choices=[
                    ("one_on_one_coaching", "One-on-One Coaching"),
                    ("consultation", "Consultation"),
                ],
                default="one_on_one_coaching",
                help_text="Which booking calendar this weekly window belongs to.",
                max_length=50,
            ),
            preserve_default=False,
        ),
        migrations.AlterModelOptions(
            name="traineravailability",
            options={"ordering": ["service_type", "day_of_week", "start_time"]},
        ),
        migrations.RunPython(forwards_assign_service_types, backwards_noop),
    ]
