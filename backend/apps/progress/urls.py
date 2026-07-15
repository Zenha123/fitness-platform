from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeightEntryViewSet, PrivatePhotoView, StrengthDataView, ExercisesLoggedView

router = DefaultRouter()
router.register(r'weights', WeightEntryViewSet, basename='weight-entry')

urlpatterns = [
    path('', include(router.urls)),
    # Private photo serving — authenticated, not a public media URL
    path('photos/<uuid:entry_id>/', PrivatePhotoView.as_view(), name='private-photo'),
    # Strength chart data (derived from WorkoutLogEntry)
    path('strength/', StrengthDataView.as_view(), name='strength-data'),
    path('strength/exercises/', ExercisesLoggedView.as_view(), name='strength-exercises'),
]
