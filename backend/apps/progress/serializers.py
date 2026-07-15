from rest_framework import serializers
from .models import WeightEntry


KG_TO_LB = 2.20462


class WeightEntrySerializer(serializers.ModelSerializer):
    """Full serializer — used for create/update and detail view."""
    # Display fields (read-only)
    photo_url = serializers.SerializerMethodField()
    weight_display = serializers.SerializerMethodField()
    weight_unit = serializers.SerializerMethodField()

    class Meta:
        model = WeightEntry
        fields = [
            'id', 'client', 'date', 'weight_kg',
            'weight_display', 'weight_unit',
            'photo', 'photo_url', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'client', 'created_at', 'photo_url', 'weight_display', 'weight_unit']
        extra_kwargs = {
            'photo': {'write_only': True, 'required': False},
            'weight_kg': {'required': True},
        }

    def _get_unit(self):
        request = self.context.get('request')
        if request and hasattr(request.user, 'weight_unit'):
            return request.user.weight_unit
        return 'kg'

    def get_weight_unit(self, obj):
        return self._get_unit()

    def get_weight_display(self, obj):
        """Return weight in the user's preferred unit."""
        unit = self._get_unit()
        if unit == 'lb':
            return round(float(obj.weight_kg) * KG_TO_LB, 1)
        return float(obj.weight_kg)

    def get_photo_url(self, obj):
        """Return the authenticated media URL; never a raw media path."""
        if not obj.photo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/progress/photos/{obj.id}/')
        return None

    def validate_weight_kg(self, value):
        """Accept input in either kg or lb; always store as kg."""
        # The frontend sends weight in the user's preferred unit.
        # We detect via the `input_unit` context key set by the view.
        input_unit = self.context.get('input_unit', 'kg')
        if input_unit == 'lb':
            value = float(value) / KG_TO_LB
            from decimal import Decimal
            return Decimal(str(round(value, 4)))
        return value


class WeightEntryListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list/chart views — no photo binary."""
    photo_url = serializers.SerializerMethodField()
    weight_display = serializers.SerializerMethodField()
    weight_unit = serializers.SerializerMethodField()
    has_photo = serializers.SerializerMethodField()

    class Meta:
        model = WeightEntry
        fields = [
            'id', 'date', 'weight_kg', 'weight_display', 'weight_unit',
            'photo_url', 'has_photo', 'notes', 'created_at'
        ]
        read_only_fields = fields

    def _get_unit(self):
        request = self.context.get('request')
        if request and hasattr(request.user, 'weight_unit'):
            return request.user.weight_unit
        return 'kg'

    def get_weight_unit(self, obj):
        return self._get_unit()

    def get_weight_display(self, obj):
        unit = self._get_unit()
        if unit == 'lb':
            return round(float(obj.weight_kg) * KG_TO_LB, 1)
        return float(obj.weight_kg)

    def get_photo_url(self, obj):
        if not obj.photo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/progress/photos/{obj.id}/')
        return None

    def get_has_photo(self, obj):
        return bool(obj.photo)
