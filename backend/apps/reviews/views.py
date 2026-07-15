from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from apps.clients.views import IsTrainer
from apps.clients.models import TrainerClientLink
from .models import WeeklyReview
from .serializers import WeeklyReviewSerializer, WeeklyReviewListSerializer


class WeeklyReviewViewSet(viewsets.ModelViewSet):
    """
    - Trainers: full CRUD on reviews they authored for their clients.
    - Clients: read-only list/retrieve of reviews addressed to them.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'trainer':
            qs = WeeklyReview.objects.filter(trainer=user).select_related('client', 'trainer')
            client_id = self.request.query_params.get('client')
            if client_id:
                qs = qs.filter(client__id=client_id)
            return qs.order_by('-created_at')
        elif user.role == 'client':
            return WeeklyReview.objects.filter(client=user).select_related('trainer').order_by('-created_at')
        return WeeklyReview.objects.none()

    def get_serializer_class(self):
        if self.action == 'list':
            return WeeklyReviewListSerializer
        return WeeklyReviewSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'trainer':
            raise PermissionDenied("Only trainers can post review notes.")
        serializer.save(trainer=user)

    def perform_update(self, serializer):
        # Ensure only the authoring trainer can edit
        if self.get_object().trainer != self.request.user:
            raise PermissionDenied("You can only edit your own review notes.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.trainer != self.request.user:
            raise PermissionDenied("You can only delete your own review notes.")
        instance.delete()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        # Clients can only read their own reviews
        if user.role == 'client' and obj.client != user:
            raise PermissionDenied("You can only view your own reviews.")
        # Trainers can only access reviews they authored
        if user.role == 'trainer' and obj.trainer != user:
            raise PermissionDenied("You can only access reviews you authored.")
        return obj
