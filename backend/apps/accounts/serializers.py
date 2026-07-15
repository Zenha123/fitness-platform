from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role', 'needs_password_change', 'created_at', 'weight_unit')
        read_only_fields = ('id', 'created_at', 'email', 'role', 'needs_password_change')


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Allows clients/trainers to update their own preferences."""
    class Meta:
        model = User
        fields = ('weight_unit',)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to the token payload
        token['email'] = user.email
        token['name'] = user.name
        token['role'] = user.role
        token['needs_password_change'] = user.needs_password_change
        token['weight_unit'] = user.weight_unit
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user profile data to the response body
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'name': self.user.name,
            'role': self.user.role,
            'needs_password_change': self.user.needs_password_change,
            'weight_unit': self.user.weight_unit,
        }
        return data

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value
