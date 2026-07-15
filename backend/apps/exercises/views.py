from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from apps.clients.views import IsTrainer
from .models import Exercise
from .serializers import ExerciseSerializer

class IsTrainerOrReadOnlyForClient(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'trainer':
            return True
        if request.user.role == 'client' and request.method in permissions.SAFE_METHODS:
            return True
        return False

class ExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = ExerciseSerializer
    permission_classes = [IsTrainerOrReadOnlyForClient]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'notes']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'trainer':
            return Exercise.objects.filter(trainer=user)
        elif user.role == 'client':
            from apps.clients.models import TrainerClientLink
            try:
                link = TrainerClientLink.objects.get(client=user)
                return Exercise.objects.filter(trainer=link.trainer)
            except TrainerClientLink.DoesNotExist:
                return Exercise.objects.none()
        return Exercise.objects.none()
