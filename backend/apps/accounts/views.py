from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, ChangePasswordSerializer

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
