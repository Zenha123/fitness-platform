"""Timezone / slot-boundary tests for Phase 1 Task 6."""
import datetime
from unittest.mock import patch
from zoneinfo import ZoneInfo

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone

from apps.bookings.models import Booking, BookingService, TrainerAvailability
from apps.bookings.services import (
    _wall_time_to_utc,
    generate_available_slots,
    _ensure_start_is_bookable,
)
from rest_framework.exceptions import ValidationError

User = get_user_model()


@override_settings(TRAINER_TIMEZONE="Asia/Kolkata")
class WallTimeConversionTests(TestCase):
    def test_ist_evening_maps_to_expected_utc(self):
        day = datetime.date(2026, 9, 21)  # Monday
        utc = _wall_time_to_utc(day, datetime.time(18, 0), ZoneInfo("Asia/Kolkata"))
        self.assertIsNotNone(utc)
        self.assertEqual(utc.hour, 12)
        self.assertEqual(utc.minute, 30)

    def test_dst_spring_forward_gap_returns_none(self):
        # US Eastern spring forward 2026-03-08: 02:00–02:59 do not exist
        day = datetime.date(2026, 3, 8)
        utc = _wall_time_to_utc(day, datetime.time(2, 30), ZoneInfo("America/New_York"))
        self.assertIsNone(utc)


@override_settings(TRAINER_TIMEZONE="Asia/Kolkata")
class GenerateAvailableSlotsTimezoneTests(TestCase):
    def setUp(self):
        self.trainer = User.objects.create_user(
            email="trainer-tz@example.com",
            password="pass12345",
            role="trainer",
            name="Tz Trainer",
        )
        self.service = BookingService.objects.create(
            trainer=self.trainer,
            service_type=BookingService.ServiceType.ONE_ON_ONE_COACHING,
            title="1-on-1 Coaching",
            duration_minutes=60,
            buffer_minutes=0,
            is_active=True,
        )
        # Monday 18:00–20:00 IST
        TrainerAvailability.objects.create(
            trainer=self.trainer,
            service_type=BookingService.ServiceType.ONE_ON_ONE_COACHING,
            day_of_week=0,
            start_time=datetime.time(18, 0),
            end_time=datetime.time(20, 0),
            is_active=True,
        )

    def test_slots_display_in_client_timezone(self):
        # Monday 2026-09-21 — far enough in the future relative to "now" when frozen
        monday = datetime.date(2026, 9, 21)
        frozen_now = datetime.datetime(2026, 9, 21, 5, 0, tzinfo=datetime.timezone.utc)
        with patch("apps.bookings.services.timezone.now", return_value=frozen_now):
            slots = generate_available_slots(
                trainer_id=self.trainer.id,
                service_id=self.service.id,
                start_date=monday,
                end_date=monday,
                target_tz_str="Asia/Kolkata",
            )
        self.assertEqual(len(slots), 2)
        self.assertEqual(slots[0]["display_start"], "06:00 PM")
        self.assertEqual(slots[1]["display_start"], "07:00 PM")
        self.assertIn("Asia/Kolkata", slots[0]["formatted_local"])

    def test_past_same_day_slots_hidden(self):
        monday = datetime.date(2026, 9, 21)
        # After 18:30 IST = 13:00 UTC — first slot already started
        frozen_now = datetime.datetime(2026, 9, 21, 13, 0, tzinfo=datetime.timezone.utc)
        with patch("apps.bookings.services.timezone.now", return_value=frozen_now):
            slots = generate_available_slots(
                trainer_id=self.trainer.id,
                service_id=self.service.id,
                start_date=monday,
                end_date=monday,
                target_tz_str="Asia/Kolkata",
            )
        starts = [s["display_start"] for s in slots]
        self.assertNotIn("06:00 PM", starts)
        self.assertEqual(starts, ["07:00 PM"])

    def test_client_date_boundary_across_timezones(self):
        """
        Monday 06:00 IST = Sunday afternoon America/Los_Angeles.
        Asking for Sunday (LA) must still surface that trainer Monday window.
        """
        TrainerAvailability.objects.create(
            trainer=self.trainer,
            service_type=BookingService.ServiceType.ONE_ON_ONE_COACHING,
            day_of_week=0,
            start_time=datetime.time(6, 0),
            end_time=datetime.time(8, 0),
            is_active=True,
        )
        sunday_la = datetime.date(2026, 9, 20)
        frozen_now = datetime.datetime(2026, 9, 20, 0, 0, tzinfo=datetime.timezone.utc)
        with patch("apps.bookings.services.timezone.now", return_value=frozen_now):
            slots = generate_available_slots(
                trainer_id=self.trainer.id,
                service_id=self.service.id,
                start_date=sunday_la,
                end_date=sunday_la,
                target_tz_str="America/Los_Angeles",
            )
        self.assertTrue(len(slots) >= 1)
        for s in slots:
            self.assertEqual(s["display_date"], "Sunday, September 20, 2026")

    def test_ensure_start_rejects_past(self):
        past = timezone.now() - datetime.timedelta(hours=1)
        with self.assertRaises(ValidationError):
            _ensure_start_is_bookable(
                self.trainer, self.service, past, client_timezone="Asia/Kolkata"
            )


class IntakeRiskEvaluationTests(TestCase):
    def test_parq_yes_triggers_risk_flags(self):
        from apps.bookings.services import evaluate_intake_risk_flags
        responses = {
            "parq_heart_condition": "yes",
            "parq_chest_pain_activity": "no",
            "parq_details": "Diagnosed with mild arrhythmia",
        }
        has_flags, flags = evaluate_intake_risk_flags(responses)
        self.assertTrue(has_flags)
        self.assertIn("PAR-Q: Doctor-diagnosed heart condition", flags)

    def test_medical_condition_triggers_risk_flags(self):
        from apps.bookings.services import evaluate_intake_risk_flags
        responses = {
            "health_conditions": ["High Blood Pressure", "Asthma"],
        }
        has_flags, flags = evaluate_intake_risk_flags(responses)
        self.assertTrue(has_flags)
        self.assertEqual(len(flags), 2)

    def test_no_risks_returns_false(self):
        from apps.bookings.services import evaluate_intake_risk_flags
        responses = {
            "parq_heart_condition": "no",
            "parq_chest_pain_activity": "no",
            "parq_chest_pain_resting": "no",
            "parq_dizziness_consciousness": "no",
            "parq_bone_joint_problem": "no",
            "parq_bp_heart_meds": "no",
            "parq_other_reason": "no",
            "health_conditions": ["None of the above"],
            "has_injuries": "no",
            "takes_medications": "no",
        }
        has_flags, flags = evaluate_intake_risk_flags(responses)
        self.assertFalse(has_flags)
        self.assertEqual(len(flags), 0)


class AssessmentReportTests(TestCase):

    def setUp(self):
        self.trainer = User.objects.create_user(
            email="trainer-report@example.com",
            password="password123",
            role="trainer",
            name="Coach Pro"
        )
        self.service = BookingService.objects.create(
            trainer=self.trainer,
            service_type=BookingService.ServiceType.ONE_ON_ONE_COACHING,
            title="1-on-1 Fitness Coaching",
            duration_minutes=60,
        )
        self.booking = Booking.objects.create(
            service=self.service,
            trainer=self.trainer,
            client_name="Test Client",
            client_email="client@example.com",
            client_phone="+15550001111",
            start_time=timezone.now() + datetime.timedelta(days=1),
            end_time=timezone.now() + datetime.timedelta(days=1, hours=1),
        )

    def test_pdf_generation_creates_file(self):
        from apps.bookings.models import AssessmentReport
        from apps.bookings.services import generate_assessment_report_pdf
        report = AssessmentReport.objects.create(
            booking=self.booking,
            trainer=self.trainer,
            client_name=self.booking.client_name,
            client_email=self.booking.client_email,
            goals_summary="Fat Loss & Muscle Building",
            baseline_assessment="Posture normal, no major joint issues.",
            recommended_program="4-day hypertrophy split",
            suggested_timeline="3-6 months",
        )
        pdf_file = generate_assessment_report_pdf(report)
        self.assertTrue(bool(pdf_file))
        self.assertTrue(report.pdf_file.name.endswith(".pdf"))

    def test_release_report_sends_email(self):
        from apps.bookings.models import AssessmentReport
        from apps.bookings.services import send_assessment_report_email
        report = AssessmentReport.objects.create(
            booking=self.booking,
            trainer=self.trainer,
            client_name=self.booking.client_name,
            client_email=self.booking.client_email,
            goals_summary="Strength Gain",
            baseline_assessment="Lightly active",
            recommended_program="3-day full body split",
            suggested_timeline="3 months",
        )
        send_assessment_report_email(report)
        report.refresh_from_db()
        self.assertTrue(report.is_released)
        self.assertTrue(bool(report.pdf_file))


