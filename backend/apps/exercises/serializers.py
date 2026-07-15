from rest_framework import serializers
from .models import Exercise

class ExerciseSerializer(serializers.ModelSerializer):
    trainer = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Exercise
        fields = ['id', 'trainer', 'name', 'category', 'notes', 'demo_link', 'created_at']
        read_only_fields = ['id', 'created_at']
