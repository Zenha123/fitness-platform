from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeeklyReviewViewSet

router = DefaultRouter()
router.register(r'', WeeklyReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
