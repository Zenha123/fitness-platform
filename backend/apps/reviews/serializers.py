from rest_framework import serializers
from .models import WeeklyReview


class WeeklyReviewSerializer(serializers.ModelSerializer):
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = WeeklyReview
        fields = [
            'id', 'trainer', 'trainer_name', 'client', 'client_name',
            'summary', 'improvements_needed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'trainer', 'trainer_name', 'client_name', 'created_at', 'updated_at']

    def validate(self, data):
        # On create, trainer and client are injected by the view
        request = self.context.get('request')
        if request and request.method == 'POST':
            client = data.get('client')
            if client:
                from apps.clients.models import TrainerClientLink
                if not TrainerClientLink.objects.filter(trainer=request.user, client=client).exists():
                    raise serializers.ValidationError(
                        "You can only post reviews for your own clients."
                    )
        return data


class WeeklyReviewListSerializer(serializers.ModelSerializer):
    """Compact serializer for list views — truncates long text."""
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)

    class Meta:
        model = WeeklyReview
        fields = [
            'id', 'trainer_name', 'client',
            'summary', 'improvements_needed',
            'created_at', 'updated_at'
        ]
        read_only_fields = fields
