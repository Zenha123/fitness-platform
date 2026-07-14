from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.clients.views import IsTrainer
from apps.clients.models import TrainerClientLink
from .models import WorkoutPlan, WorkoutTemplate, WorkoutLog
from .serializers import (
    WorkoutPlanSerializer, WorkoutPlanListSerializer,
    WorkoutTemplateSerializer, WorkoutTemplateListSerializer,
    WorkoutLogSerializer, WorkoutLogCreateUpdateSerializer
)

User = get_user_model()


class WorkoutPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'trainer':
            qs = WorkoutPlan.objects.filter(trainer=user).select_related('client')
            client_id = self.request.query_params.get('client')
            if client_id:
                qs = qs.filter(client__id=client_id)
        elif user.role == 'client':
            qs = WorkoutPlan.objects.filter(client=user).select_related('client')
        else:
            qs = WorkoutPlan.objects.none()

        # Filter by month (e.g. ?month=2026-07)
        month = self.request.query_params.get('month')
        if month:
            try:
                year, mon = month.split('-')
                qs = qs.filter(scheduled_date__year=year, scheduled_date__month=mon)
            except (ValueError, AttributeError):
                pass

        return qs.prefetch_related('exercises__exercise').order_by('scheduled_date')

    def get_serializer_class(self):
        if self.action in ['list']:
            return WorkoutPlanListSerializer
        return WorkoutPlanSerializer

    def perform_create(self, serializer):
        # Ensure the client belongs to this trainer
        client = serializer.validated_data.get('client')
        from apps.clients.models import TrainerClientLink
        if not TrainerClientLink.objects.filter(client=client, trainer=self.request.user).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only schedule workouts for your own clients.")
        serializer.save(trainer=self.request.user)

    def perform_update(self, serializer):
        serializer.save()


class WorkoutTemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTrainer]

    def get_queryset(self):
        return WorkoutTemplate.objects.filter(
            trainer=self.request.user
        ).prefetch_related('exercises__exercise').order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return WorkoutTemplateListSerializer
        return WorkoutTemplateSerializer

    def perform_create(self, serializer):
        serializer.save(trainer=self.request.user)


class WorkoutLogViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            qs = WorkoutLog.objects.filter(client=user)
        elif user.role == 'trainer':
            # Trainer sees logs of their clients
            assigned_clients = TrainerClientLink.objects.filter(trainer=user).values_list('client', flat=True)
            qs = WorkoutLog.objects.filter(client__in=assigned_clients)
            
            client_id = self.request.query_params.get('client')
            if client_id:
                qs = qs.filter(client__id=client_id)
        else:
            qs = WorkoutLog.objects.none()

        # Filter by month
        month = self.request.query_params.get('month')
        if month:
            try:
                year, mon = month.split('-')
                qs = qs.filter(date__year=year, date__month=mon)
            except (ValueError, AttributeError):
                pass
                
        return qs.select_related('plan').prefetch_related('entries__exercise').order_by('-date', '-logged_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WorkoutLogCreateUpdateSerializer
        return WorkoutLogSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'client':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only clients can log workouts.")
        serializer.save(client=user)

    def perform_update(self, serializer):
        user = self.request.user
        if user.role != 'client':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only clients can edit workout logs.")
        serializer.save()
        
    def perform_destroy(self, instance):
        user = self.request.user
        if user.role != 'client':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only clients can delete workout logs.")
        instance.delete()
