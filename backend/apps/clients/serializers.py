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
        return None # Placeholder

    def get_missed_sessions_flag(self, obj):
        return False # Placeholder


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
