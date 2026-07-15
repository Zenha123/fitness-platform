from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model
from django.http import FileResponse, Http404
from django.db.models import Max
from apps.clients.views import IsTrainer
from apps.clients.models import TrainerClientLink
from apps.workouts.models import WorkoutLogEntry
from .models import WeightEntry
from .serializers import WeightEntrySerializer, WeightEntryListSerializer

User = get_user_model()


class IsClientOwnerOrTrainer(permissions.BasePermission):
    """
    Clients can CRUD their own entries.
    Trainers can only read entries of their assigned clients.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'client':
            return obj.client == user
        if user.role == 'trainer':
            # Trainers: read-only on their assigned clients
            if request.method in permissions.SAFE_METHODS:
                return TrainerClientLink.objects.filter(trainer=user, client=obj.client).exists()
        return False


class WeightEntryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsClientOwnerOrTrainer]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return WeightEntry.objects.filter(client=user).order_by('date')
        elif user.role == 'trainer':
            assigned = TrainerClientLink.objects.filter(trainer=user).values_list('client', flat=True)
            qs = WeightEntry.objects.filter(client__in=assigned).order_by('date')
            client_id = self.request.query_params.get('client')
            if client_id:
                qs = qs.filter(client__id=client_id)
            return qs
        return WeightEntry.objects.none()

    def get_serializer_class(self):
        if self.action == 'list':
            return WeightEntryListSerializer
        return WeightEntrySerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        # Pass client's input_unit so validate_weight_kg can convert
        ctx['input_unit'] = self.request.data.get('input_unit', self.request.user.weight_unit)
        return ctx

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'client':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only clients can log weight entries.")
        serializer.save(client=user)

    def perform_update(self, serializer):
        user = self.request.user
        if user.role != 'client':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only clients can edit weight entries.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role != 'client':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only clients can delete weight entries.")
        # Delete the photo file from disk before deleting the record
        if instance.photo:
            instance.photo.delete(save=False)
        instance.delete()


class PrivatePhotoView(APIView):
    """
    Authenticated endpoint to serve private progress photos.
    Only the owning client or their trainer can access a photo.
    This view is the ONLY way to retrieve a photo — no public media URL.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, entry_id, *args, **kwargs):
        try:
            entry = WeightEntry.objects.select_related('client').get(id=entry_id)
        except WeightEntry.DoesNotExist:
            raise Http404

        user = request.user
        # Check access: client owns it OR trainer is assigned to that client
        if user.role == 'client' and entry.client != user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if user.role == 'trainer':
            if not TrainerClientLink.objects.filter(trainer=user, client=entry.client).exists():
                return Response(status=status.HTTP_403_FORBIDDEN)

        if not entry.photo:
            raise Http404

        try:
            return FileResponse(entry.photo.open('rb'), content_type='image/jpeg')
        except FileNotFoundError:
            raise Http404


class StrengthDataView(APIView):
    """
    GET /api/progress/strength/?exercise=<id>[&client=<id>]

    Returns per-date max weight lifted for a given exercise, sourced entirely
    from WorkoutLogEntry records (no separate model).
    Also returns the all-time personal record (PR) record.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        exercise_id = request.query_params.get('exercise')
        if not exercise_id:
            return Response({'detail': 'exercise query param is required.'}, status=400)

        user = request.user

        if user.role == 'client':
            client_id = str(user.id)
        elif user.role == 'trainer':
            client_id = request.query_params.get('client')
            if not client_id:
                return Response({'detail': 'client query param is required for trainers.'}, status=400)
            # Ensure trainer owns this client
            if not TrainerClientLink.objects.filter(trainer=user, client__id=client_id).exists():
                return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

        # Query all log entries for this client + exercise, with a weight
        entries = (
            WorkoutLogEntry.objects
            .filter(
                workout_log__client__id=client_id,
                exercise__id=exercise_id,
                actual_weight_kg__isnull=False,
                workout_log__completed=True,
            )
            .select_related('workout_log', 'exercise')
            .order_by('workout_log__date')
        )

        if not entries.exists():
            return Response({'data': [], 'pr': None, 'exercise_name': None})

        exercise_name = entries.first().exercise.name

        # Group by date, take max weight per day
        from collections import defaultdict
        day_map = defaultdict(list)
        for e in entries:
            day_map[str(e.workout_log.date)].append(float(e.actual_weight_kg))

        # Build sorted data points
        data = []
        pr_weight = 0
        pr_date = None

        # Weight unit preference
        weight_unit = user.weight_unit
        KG_TO_LB = 2.20462

        for date_str in sorted(day_map.keys()):
            max_kg = max(day_map[date_str])
            display_weight = round(max_kg * KG_TO_LB, 1) if weight_unit == 'lb' else max_kg
            if max_kg > pr_weight:
                pr_weight = max_kg
                pr_date = date_str
            data.append({
                'date': date_str,
                'weight_kg': max_kg,
                'weight_display': display_weight,
            })

        # Mark PR
        pr_display = round(pr_weight * KG_TO_LB, 1) if weight_unit == 'lb' else pr_weight

        return Response({
            'exercise_name': exercise_name,
            'weight_unit': weight_unit,
            'data': data,
            'pr': {
                'weight_kg': pr_weight,
                'weight_display': pr_display,
                'date': pr_date,
            } if pr_date else None,
        })


class ExercisesLoggedView(APIView):
    """
    GET /api/progress/strength/exercises/[?client=<id>]

    Returns the list of distinct exercises a client has actually logged,
    to populate the exercise selector on the Strength page.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if user.role == 'client':
            client_id = str(user.id)
        elif user.role == 'trainer':
            client_id = request.query_params.get('client')
            if not client_id:
                return Response({'detail': 'client param required.'}, status=400)
            if not TrainerClientLink.objects.filter(trainer=user, client__id=client_id).exists():
                return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

        exercises = (
            WorkoutLogEntry.objects
            .filter(
                workout_log__client__id=client_id,
                actual_weight_kg__isnull=False,
                workout_log__completed=True,
            )
            .select_related('exercise')
            .values('exercise__id', 'exercise__name', 'exercise__category')
            .distinct()
            .order_by('exercise__name')
        )

        return Response([
            {
                'id': str(e['exercise__id']),
                'name': e['exercise__name'],
                'category': e['exercise__category'],
            }
            for e in exercises
        ])
