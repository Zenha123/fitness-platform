from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0002_workoutlog_workoutlogentry'),
    ]

    operations = [
        migrations.AddField(
            model_name='workoutlog',
            name='duration_seconds',
            field=models.PositiveIntegerField(default=0, help_text='Elapsed session duration in seconds'),
        ),
        migrations.CreateModel(
            name='WorkoutLogSet',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('set_index', models.PositiveIntegerField()),
                ('prescribed_reps', models.CharField(blank=True, max_length=50, null=True)),
                ('prescribed_weight_kg', models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ('actual_reps', models.PositiveIntegerField(blank=True, null=True)),
                ('actual_weight_kg', models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ('completed', models.BooleanField(default=False)),
                ('entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sets', to='workouts.workoutlogentry')),
            ],
            options={
                'ordering': ['set_index'],
            },
        ),
    ]
