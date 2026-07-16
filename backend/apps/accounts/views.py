from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    MyTokenObtainPairSerializer, 
    ChangePasswordSerializer, 
    UserSerializer, 
    UserPreferenceSerializer,
    TrainerRegistrationSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        old_password = serializer.validated_data.get('old_password')
        new_password = serializer.validated_data.get('new_password')

        # Verify old password
        if not user.check_password(old_password):
            return Response(
                {"old_password": ["Incorrect password."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password and disable first-login change flag
        user.set_password(new_password)
        user.needs_password_change = False
        user.save()

        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK
        )


class UserProfileView(APIView):
    """Returns the authenticated user's profile including preferences."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        """Update user preferences (weight_unit etc.)."""
        serializer = UserPreferenceSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class TrainerRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = TrainerRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"message": "Trainer account created successfully."},
            status=status.HTTP_201_CREATED
        )
