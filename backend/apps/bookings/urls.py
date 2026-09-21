from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BookingServiceListView,
    AvailableSlotsView,
    CreateBookingView,
    IntakeFormView,
    TrainerAvailabilityViewSet,
    TrainerBlackoutViewSet,
    TrainerBookingViewSet,
    ClientBookingListView
)

router = DefaultRouter()
router.register(r'trainer/availability', TrainerAvailabilityViewSet, basename='trainer-availability')
router.register(r'trainer/blackouts', TrainerBlackoutViewSet, basename='trainer-blackout')
router.register(r'trainer/manage-bookings', TrainerBookingViewSet, basename='trainer-bookings')

urlpatterns = [
    # Public endpoints
    path('services/', BookingServiceListView.as_view(), name='booking-services'),
    path('available-slots/', AvailableSlotsView.as_view(), name='available-slots'),
    path('create/', CreateBookingView.as_view(), name='create-booking'),
    path('intake/<uuid:token>/', IntakeFormView.as_view(), name='intake-form'),

    # Authenticated client endpoint
    path('client/my-bookings/', ClientBookingListView.as_view(), name='client-bookings'),

    # Router endpoints (Trainer)
    path('', include(router.urls)),
]
