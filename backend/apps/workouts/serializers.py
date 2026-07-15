from rest_framework import serializers
from apps.exercises.serializers import ExerciseSerializer
from .models import (
    WorkoutPlan, WorkoutPlanExercise, 
    WorkoutTemplate, WorkoutTemplateExercise,
    WorkoutLog, WorkoutLogEntry
)

# ──────────────────────────────────────────
# Workout Plan Serializers
# ──────────────────────────────────────────

class WorkoutPlanExerciseSerializer(serializers.ModelSerializer):
    exercise_detail = ExerciseSerializer(source='exercise', read_only=True)
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    exercise_category = serializers.CharField(source='exercise.category', read_only=True)
    exercise_demo_link = serializers.CharField(source='exercise.demo_link', read_only=True, allow_null=True)

    class Meta:
        model = WorkoutPlanExercise
        fields = [
            'id', 'exercise', 'exercise_detail', 'exercise_name', 'exercise_category', 'exercise_demo_link',
            'sets', 'reps', 'weight_kg', 'rest_seconds', 'order', 'notes'
        ]
        read_only_fields = ['id']


class WorkoutPlanSerializer(serializers.ModelSerializer):
    exercises = WorkoutPlanExerciseSerializer(many=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    is_completed = serializers.SerializerMethodField()
    is_past = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPlan
        fields = [
            'id', 'client', 'client_name', 'client_email',
            'scheduled_date', 'title', 'notes',
            'exercises', 'created_at', 'updated_at',
            'is_completed', 'is_past'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_is_completed(self, obj):
        from .models import WorkoutLog
        return WorkoutLog.objects.filter(client=obj.client, date=obj.scheduled_date, completed=True).exists()

    def get_is_past(self, obj):
        from django.utils import timezone
        return obj.scheduled_date < timezone.localdate()

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        plan = WorkoutPlan.objects.create(**validated_data)
        for idx, exercise_data in enumerate(exercises_data):
            exercise_data['order'] = exercise_data.get('order', idx)
            WorkoutPlanExercise.objects.create(workout_plan=plan, **exercise_data)
        return plan

    def update(self, instance, validated_data):
        exercises_data = validated_data.pop('exercises', None)

        # Update plan-level fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Full replace of exercises if provided
        if exercises_data is not None:
            instance.exercises.all().delete()
            for idx, exercise_data in enumerate(exercises_data):
                exercise_data['order'] = exercise_data.get('order', idx)
                WorkoutPlanExercise.objects.create(workout_plan=instance, **exercise_data)

        return instance


class WorkoutPlanListSerializer(serializers.ModelSerializer):
    """Lighter serializer for calendar/list views."""
    client_name = serializers.CharField(source='client.name', read_only=True)
    exercise_count = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPlan
        fields = ['id', 'client', 'client_name', 'scheduled_date', 'title', 'exercise_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_exercise_count(self, obj):
        return obj.exercises.count()


# ──────────────────────────────────────────
# Workout Template Serializers
# ──────────────────────────────────────────

class WorkoutTemplateExerciseSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    exercise_category = serializers.CharField(source='exercise.category', read_only=True)

    class Meta:
        model = WorkoutTemplateExercise
        fields = [
            'id', 'exercise', 'exercise_name', 'exercise_category',
            'sets', 'reps', 'weight_kg', 'rest_seconds', 'order', 'notes'
        ]
        read_only_fields = ['id']


class WorkoutTemplateSerializer(serializers.ModelSerializer):
    exercises = WorkoutTemplateExerciseSerializer(many=True)

    class Meta:
        model = WorkoutTemplate
        fields = ['id', 'title', 'notes', 'exercises', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        template = WorkoutTemplate.objects.create(**validated_data)
        for idx, exercise_data in enumerate(exercises_data):
            exercise_data['order'] = exercise_data.get('order', idx)
            WorkoutTemplateExercise.objects.create(template=template, **exercise_data)
        return template

    def update(self, instance, validated_data):
        exercises_data = validated_data.pop('exercises', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if exercises_data is not None:
            instance.exercises.all().delete()
            for idx, exercise_data in enumerate(exercises_data):
                exercise_data['order'] = exercise_data.get('order', idx)
                WorkoutTemplateExercise.objects.create(template=instance, **exercise_data)

        return instance


class WorkoutTemplateListSerializer(serializers.ModelSerializer):
    exercise_count = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutTemplate
        fields = ['id', 'title', 'notes', 'exercise_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_exercise_count(self, obj):
        return obj.exercises.count()


# ──────────────────────────────────────────
# Workout Log Serializers
# ──────────────────────────────────────────

class WorkoutLogEntrySerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    exercise_category = serializers.CharField(source='exercise.category', read_only=True)
    exercise_demo_link = serializers.CharField(source='exercise.demo_link', read_only=True, allow_null=True)

    class Meta:
        model = WorkoutLogEntry
        fields = [
            'id', 'exercise', 'exercise_name', 'exercise_category', 'exercise_demo_link',
            'actual_sets', 'actual_reps', 'actual_weight_kg', 'order', 'notes'
        ]
        read_only_fields = ['id']


class WorkoutLogSerializer(serializers.ModelSerializer):
    entries = WorkoutLogEntrySerializer(many=True, read_only=True)
    plan_title = serializers.CharField(source='plan.title', read_only=True, allow_null=True)

    class Meta:
        model = WorkoutLog
        fields = [
            'id', 'client', 'plan', 'plan_title', 'date',
            'notes', 'completed', 'entries', 'logged_at'
        ]
        read_only_fields = ['id', 'client', 'logged_at']


class WorkoutLogCreateUpdateSerializer(serializers.ModelSerializer):
    entries = WorkoutLogEntrySerializer(many=True)

    class Meta:
        model = WorkoutLog
        fields = [
            'id', 'client', 'plan', 'date',
            'notes', 'completed', 'entries', 'logged_at'
        ]
        read_only_fields = ['id', 'client', 'logged_at']

    def create(self, validated_data):
        entries_data = validated_data.pop('entries', [])
        log = WorkoutLog.objects.create(**validated_data)
        for idx, entry_data in enumerate(entries_data):
            entry_data['order'] = entry_data.get('order', idx)
            WorkoutLogEntry.objects.create(workout_log=log, **entry_data)
        return log

    def update(self, instance, validated_data):
        entries_data = validated_data.pop('entries', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if entries_data is not None:
            instance.entries.all().delete()
            for idx, entry_data in enumerate(entries_data):
                entry_data['order'] = entry_data.get('order', idx)
                WorkoutLogEntry.objects.create(workout_log=instance, **entry_data)

        return instance
