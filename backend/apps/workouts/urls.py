from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkoutPlanViewSet, WorkoutTemplateViewSet, WorkoutLogViewSet, WorkoutReportsView

router = DefaultRouter()
router.register(r'plans', WorkoutPlanViewSet, basename='workout-plan')
router.register(r'templates', WorkoutTemplateViewSet, basename='workout-template')
router.register(r'logs', WorkoutLogViewSet, basename='workout-log')

urlpatterns = [
    path('reports/', WorkoutReportsView.as_view(), name='workout-reports'),
    path('', include(router.urls)),
]

