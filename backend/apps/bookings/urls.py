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
    ClientBookingListView,
    AssessmentReportCreateUpdateView,
    AssessmentReportReleaseView,
    AssessmentReportPDFDownloadView,
)

router = DefaultRouter()
router.register(r'trainer/availability', TrainerAvailabilityViewSet, basename='trainer-availability')
router.register(r'trainer/blackouts', TrainerBlackoutViewSet, basename='trainer-blackout')
router.register(r'trainer/manage-bookings', TrainerBookingViewSet, basename='trainer-bookings')

urlpatterns = [
    # Public & Intake endpoints
    path('services/', BookingServiceListView.as_view(), name='booking-services'),
    path('available-slots/', AvailableSlotsView.as_view(), name='available-slots'),
    path('create/', CreateBookingView.as_view(), name='create-booking'),
    path('intake/<uuid:token>/', IntakeFormView.as_view(), name='intake-form'),

    # Assessment Report endpoints (§5.7)
    path('reports/save/', AssessmentReportCreateUpdateView.as_view(), name='save-assessment-report'),
    path('reports/<uuid:report_id>/release/', AssessmentReportReleaseView.as_view(), name='release-assessment-report'),
    path('reports/<uuid:report_id>/pdf/', AssessmentReportPDFDownloadView.as_view(), name='download-assessment-report-pdf'),

    # Authenticated client endpoint
    path('client/my-bookings/', ClientBookingListView.as_view(), name='client-bookings'),

    # Router endpoints (Trainer)
    path('', include(router.urls)),
]
