"""Timezone / slot-boundary tests for Phase 1 Task 6."""
import datetime
from unittest.mock import patch
from zoneinfo import ZoneInfo

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone

from apps.bookings.models import BookingService, TrainerAvailability
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
