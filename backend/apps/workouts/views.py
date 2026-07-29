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
        from django.utils import timezone
        from rest_framework.exceptions import ValidationError
        from .models import WorkoutLog
        
        plan = serializer.instance
        today = timezone.localdate()
        
        if plan.scheduled_date < today:
            raise ValidationError("Past scheduled workouts cannot be modified or deleted.")
            
        if WorkoutLog.objects.filter(client=plan.client, date=plan.scheduled_date, completed=True).exists():
            raise ValidationError("Completed workouts cannot be modified or deleted.")
            
        serializer.save()

    def perform_destroy(self, instance):
        from django.utils import timezone
        from rest_framework.exceptions import ValidationError
        from .models import WorkoutLog
        
        today = timezone.localdate()
        
        if instance.scheduled_date < today:
            raise ValidationError("Past scheduled workouts cannot be modified or deleted.")
            
        if WorkoutLog.objects.filter(client=instance.client, date=instance.scheduled_date, completed=True).exists():
            raise ValidationError("Completed workouts cannot be modified or deleted.")
            
        instance.delete()


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


from rest_framework.views import APIView
from django.utils import timezone
import datetime

class WorkoutReportsView(APIView):
    permission_classes = [IsTrainer]

    def get(self, request):
        trainer = request.user
        links = TrainerClientLink.objects.filter(trainer=trainer).select_related('client')
        
        today = timezone.localdate()
        current_year = today.year
        current_month = today.month

        reports = []
        for link in links:
            client = link.client
            
            plans = WorkoutPlan.objects.filter(client=client, trainer=trainer)
            logs = WorkoutLog.objects.filter(client=client, completed=True)
            
            total_assigned = plans.count()
            total_completed = logs.count()
            monthly_completed = logs.filter(date__year=current_year, date__month=current_month).count()
            
            last_log = logs.order_by('-date').first()
            last_workout_date = str(last_log.date) if last_log else None
            
            completion_rate = round((total_completed / total_assigned) * 100) if total_assigned > 0 else 0
            
            # Simple streak calculation (consecutive completed sessions)
            streak = 0
            recent_logs = list(logs.order_by('-date')[:10])
            if recent_logs:
                streak = len(recent_logs)
                
            reports.append({
                "client_id": str(client.id),
                "client_name": client.name,
                "client_email": client.email,
                "is_active": client.is_active,
                "total_assigned": total_assigned,
                "total_completed": total_completed,
                "monthly_completed": monthly_completed,
                "completion_rate": completion_rate,
                "streak": streak,
                "last_workout_date": last_workout_date
            })

        # Calculate roster summary stats
        total_clients = len(reports)
        active_clients = sum(1 for r in reports if r["is_active"])
        overall_completion = round(sum(r["completion_rate"] for r in reports) / total_clients) if total_clients > 0 else 0
        total_monthly_sessions = sum(r["monthly_completed"] for r in reports)

        # Leaderboard: clients sorted by monthly completed sessions descending
        leaderboard = sorted(reports, key=lambda x: (x["monthly_completed"], x["total_completed"]), reverse=True)

        return Response({
            "summary": {
                "total_clients": total_clients,
                "active_clients": active_clients,
                "overall_completion_rate": overall_completion,
                "total_monthly_sessions": total_monthly_sessions
            },
            "client_reports": reports,
            "leaderboard": leaderboard
        })

