from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import ClientListSerializer, ClientCreateSerializer, ClientUpdateSerializer

User = get_user_model()

class IsTrainer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'trainer'

class ClientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTrainer]
    
    def get_queryset(self):
        # Trainers only see their own clients
        return User.objects.filter(role='client', trainer_link__trainer=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return ClientCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ClientUpdateSerializer
        return ClientListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        
        # Return the created client details plus the temp password
        client_serializer = ClientListSerializer(result['client'])
        return Response({
            'client': client_serializer.data,
            'temp_password': result['temp_password']
        }, status=status.HTTP_201_CREATED)
