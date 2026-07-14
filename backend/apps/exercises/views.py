from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.clients.views import IsTrainer
from .models import Exercise
from .serializers import ExerciseSerializer

class ExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = ExerciseSerializer
    permission_classes = [IsTrainer]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'notes']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        # Trainers only see and manage their own exercises
        return Exercise.objects.filter(trainer=self.request.user)
