from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TrainerClientLink
import random
import string

User = get_user_model()

class ClientListSerializer(serializers.ModelSerializer):
    """Serializer for listing clients on the trainer dashboard"""
    # these fields will be real calculated fields later (Modules 4/5).
    # For now, we mock them.
    last_completed_workout = serializers.SerializerMethodField()
    missed_sessions_flag = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'is_active', 'needs_password_change', 'created_at', 'last_completed_workout', 'missed_sessions_flag']

    def get_last_completed_workout(self, obj):
        from apps.workouts.models import WorkoutLog
        log = WorkoutLog.objects.filter(client=obj, completed=True).order_by('-date', '-logged_at').first()
        if log:
            return log.date.strftime('%Y-%m-%d')
        return None

    def get_missed_sessions_flag(self, obj):
        from apps.workouts.models import WorkoutPlan, WorkoutLog
        from django.utils import timezone
        today = timezone.localdate()
        past_plans = WorkoutPlan.objects.filter(client=obj, scheduled_date__lt=today).order_by('-scheduled_date')[:2]
        if len(past_plans) < 2:
            return False
        for plan in past_plans:
            has_completed_log = WorkoutLog.objects.filter(
                client=obj,
                date=plan.scheduled_date,
                completed=True
            ).exists()
            if has_completed_log:
                return False
        return True


class ClientCreateSerializer(serializers.Serializer):
    """Serializer for trainer to register a new client"""
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        trainer = self.context['request'].user
        
        # Generate temporary password
        temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        
        # Create client user
        client = User.objects.create_user(
            email=validated_data['email'],
            password=temp_password,
            name=validated_data['name'],
            role='client',
            needs_password_change=True
        )
        
        # Link to trainer
        TrainerClientLink.objects.create(trainer=trainer, client=client)
        
        return {
            'client': client,
            'temp_password': temp_password
        }


class ClientUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating client details (e.g. name, is_active)"""
    class Meta:
        model = User
        fields = ['name', 'is_active']
