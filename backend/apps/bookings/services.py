import datetime
import logging
from email.utils import formataddr
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.accounts.models import User
from apps.clients.models import TrainerClientLink

from .models import Booking, BookingService, TrainerAvailability, TrainerBlackout

logger = logging.getLogger(__name__)


def _resolve_tz(tz_str):
    try:
        if not tz_str or not str(tz_str).strip():
            raise ZoneInfoNotFoundError("empty")
        label = str(tz_str).strip()
        return ZoneInfo(label), label
    except (ZoneInfoNotFoundError, Exception):
        fallback = getattr(settings, "TRAINER_TIMEZONE", "UTC")
        try:
            return ZoneInfo(fallback), fallback
        except (ZoneInfoNotFoundError, Exception):
            return datetime.timezone.utc, "UTC"


def _trainer_tz():
    tz, _ = _resolve_tz(getattr(settings, "TRAINER_TIMEZONE", "Asia/Kolkata"))
    return tz


def _wall_time_to_utc(day, wall_time, local_tz):
    """
    Convert a trainer/client wall-clock date+time in local_tz to UTC.

    DST-safe: skips non-existent local times (spring-forward gaps) and
    normalizes ambiguous times (fall-back) via a UTC round-trip (fold=0).
    Returns None if the local wall time does not exist.
    """
    naive = datetime.datetime.combine(day, wall_time)
    try:
        local_aware = naive.replace(tzinfo=local_tz)
        as_utc = local_aware.astimezone(datetime.timezone.utc)
        # Round-trip resolves ambiguous times consistently
        normalized_local = as_utc.astimezone(local_tz)
        if (
            normalized_local.date() != day
            or normalized_local.hour != wall_time.hour
            or normalized_local.minute != wall_time.minute
        ):
            # Landed on a different wall clock (DST gap) — treat as invalid
            return None
        return as_utc
    except Exception:
        return None


def _format_booking_local(dt, tz_str=None):
    zone, label = _resolve_tz(tz_str or getattr(settings, "TRAINER_TIMEZONE", "UTC"))
    local = dt.astimezone(zone)
    return f"{local.strftime('%A, %B %d, %Y at %I:%M %p')} ({label})"


def build_meeting_link(service_title):
    """
    Placeholder unique join URL until Zoom/Google Meet API credentials are wired.
    VIDEO_PROVIDER records the confirmed Phase 1 provider choice.
    """
    import hashlib

    stub = booking_id_stub(service_title)
    provider = getattr(settings, "VIDEO_PROVIDER", "zoom").lower()
    if provider == "google_meet":
        return f"https://meet.google.com/lookup/{stub.lower()}"
    # Numeric stub ID until Zoom Server-to-Server OAuth creates real meetings
    meeting_id = int(hashlib.sha256(stub.encode()).hexdigest()[:11], 16) % (10**11)
    return f"https://zoom.us/j/{meeting_id}"


def build_intake_url(booking):
    return f"{settings.FRONTEND_BASE_URL}/intake/{booking.intake_token}"


def build_booking_success_url(booking):
    return f"{settings.FRONTEND_BASE_URL}/booking/success/{booking.id}"


def generate_booking_ics(booking, client_timezone=None):
    """Build a .ics calendar invite for the client confirmation email (Phase 1 §5.5)."""
    zone, tz_label = _resolve_tz(client_timezone or getattr(settings, "TRAINER_TIMEZONE", "UTC"))
    start_local = booking.start_time.astimezone(zone)
    end_local = booking.end_time.astimezone(zone)
    stamp = timezone.now().astimezone(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    uid = f"{booking.id}@haqqathlete"
    summary = f"{booking.service.title} — Haqq Athlete"
    description = (
        f"Session with Haqq Athlete\\n"
        f"Join: {booking.meeting_link or ''}\\n"
        f"Intake: {build_intake_url(booking)}"
    )
    location = booking.meeting_link or "Online video session"

    def _fmt(dt):
        # Floating local time with TZID (widely supported by calendar apps)
        return dt.strftime("%Y%m%dT%H%M%S")

    return "\r\n".join([
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Haqq Athlete//Bookings//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{stamp}",
        f"DTSTART;TZID={tz_label}:{_fmt(start_local)}",
        f"DTEND;TZID={tz_label}:{_fmt(end_local)}",
        f"SUMMARY:{summary}",
        f"DESCRIPTION:{description}",
        f"LOCATION:{location}",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
        "",
    ])

def generate_available_slots(trainer_id, service_id, start_date, end_date, target_tz_str='UTC'):
    """
    Generate bookable slots for a service between start_date and end_date (inclusive).

    - Weekly availability hours are wall-clock times in TRAINER_TIMEZONE.
    - ``start_date`` / ``end_date`` are calendar days in the *client* timezone
      (``target_tz_str``). Only slots that *display* on those client days are returned.
    - Past / already-started slots are never returned.
    - Coaching vs consultation calendars remain independent (Task 5).
    """
    try:
        service = BookingService.objects.get(id=service_id, is_active=True)
    except BookingService.DoesNotExist:
        raise ValidationError("Invalid or inactive booking service specified.")

    trainer = User.objects.filter(id=trainer_id, role='trainer').first()
    if not trainer:
        trainer = User.objects.filter(role='trainer').first()
        if not trainer:
            return []

    trainer_tz = _trainer_tz()
    target_tz, target_tz_label = _resolve_tz(target_tz_str)

    availabilities = TrainerAvailability.objects.filter(
        trainer=trainer,
        service_type=service.service_type,
        is_active=True,
    )
    if not availabilities.exists():
        avail_map = {d: [(datetime.time(9, 0), datetime.time(17, 0))] for d in range(5)}
    else:
        avail_map = {}
        for avail in availabilities:
            avail_map.setdefault(avail.day_of_week, []).append((avail.start_time, avail.end_time))

    # Client-local day span → UTC query window (±1 trainer day for TZ offset / DST edges)
    client_range_start = (
        datetime.datetime.combine(start_date, datetime.time.min)
        .replace(tzinfo=target_tz)
        .astimezone(datetime.timezone.utc)
    )
    client_range_end = (
        datetime.datetime.combine(end_date + datetime.timedelta(days=1), datetime.time.min)
        .replace(tzinfo=target_tz)
        .astimezone(datetime.timezone.utc)
    )

    search_start = (client_range_start.astimezone(trainer_tz).date() - datetime.timedelta(days=1))
    search_end = (client_range_end.astimezone(trainer_tz).date() + datetime.timedelta(days=1))

    range_start_dt = (
        datetime.datetime.combine(search_start, datetime.time.min)
        .replace(tzinfo=trainer_tz)
        .astimezone(datetime.timezone.utc)
    )
    range_end_dt = (
        datetime.datetime.combine(search_end + datetime.timedelta(days=1), datetime.time.min)
        .replace(tzinfo=trainer_tz)
        .astimezone(datetime.timezone.utc)
    )

    existing_bookings = list(Booking.objects.filter(
        trainer=trainer,
        status__in=[Booking.Status.CONFIRMED, Booking.Status.PENDING],
        end_time__gt=range_start_dt,
        start_time__lt=range_end_dt,
    ))

    blackouts = list(TrainerBlackout.objects.filter(
        trainer=trainer,
        end_datetime__gt=range_start_dt,
        start_datetime__lt=range_end_dt,
    ))

    duration = datetime.timedelta(minutes=service.duration_minutes)
    buffer_time = datetime.timedelta(minutes=service.buffer_minutes)
    total_slot_step = duration + buffer_time
    now_utc = timezone.now()

    available_slots = []
    current_date = search_start

    while current_date <= search_end:
        weekday = current_date.weekday()
        if weekday in avail_map:
            for start_t, end_t in avail_map[weekday]:
                slot_start_utc = _wall_time_to_utc(current_date, start_t, trainer_tz)
                window_end_utc = _wall_time_to_utc(current_date, end_t, trainer_tz)
                if slot_start_utc is None or window_end_utc is None:
                    continue
                if slot_start_utc >= window_end_utc:
                    continue

                while slot_start_utc + duration <= window_end_utc:
                    slot_end_utc = slot_start_utc + duration

                    # Never show past / already-started slots
                    if slot_start_utc <= now_utc:
                        slot_start_utc += total_slot_step
                        continue

                    start_local = slot_start_utc.astimezone(target_tz)
                    # Only include slots that fall on the requested client calendar day(s)
                    if start_local.date() < start_date or start_local.date() > end_date:
                        slot_start_utc += total_slot_step
                        continue

                    has_booking_conflict = any(
                        b.start_time < slot_end_utc and b.end_time > slot_start_utc
                        for b in existing_bookings
                    )
                    has_blackout_conflict = any(
                        blk.start_datetime < slot_end_utc and blk.end_datetime > slot_start_utc
                        for blk in blackouts
                    )

                    if not has_booking_conflict and not has_blackout_conflict:
                        end_local = slot_end_utc.astimezone(target_tz)
                        available_slots.append({
                            'start_time': slot_start_utc.isoformat(),
                            'end_time': slot_end_utc.isoformat(),
                            'display_start': start_local.strftime('%I:%M %p'),
                            'display_end': end_local.strftime('%I:%M %p'),
                            'display_date': start_local.strftime('%A, %B %d, %Y'),
                            'formatted_local': (
                                f"{start_local.strftime('%I:%M %p')} - "
                                f"{end_local.strftime('%I:%M %p')} ({target_tz_label})"
                            ),
                        })

                    slot_start_utc += total_slot_step

        current_date += datetime.timedelta(days=1)

    available_slots.sort(key=lambda s: s['start_time'])
    return available_slots


def _ensure_start_is_bookable(trainer, service, start_dt, client_timezone=None):
    """Reject past times and starts that are outside the service calendar windows."""
    if timezone.is_naive(start_dt):
        start_dt = start_dt.replace(tzinfo=datetime.timezone.utc)
    else:
        start_dt = start_dt.astimezone(datetime.timezone.utc)

    if start_dt <= timezone.now():
        raise ValidationError("This time slot has already passed. Please select another slot.")

    client_tz_str = client_timezone or getattr(settings, "TRAINER_TIMEZONE", "UTC")
    client_tz, _ = _resolve_tz(client_tz_str)
    client_date = start_dt.astimezone(client_tz).date()

    slots = generate_available_slots(
        trainer_id=trainer.id,
        service_id=service.id,
        start_date=client_date,
        end_date=client_date,
        target_tz_str=client_tz_str,
    )
    for slot in slots:
        slot_start = datetime.datetime.fromisoformat(slot['start_time'].replace('Z', '+00:00'))
        if abs((slot_start - start_dt).total_seconds()) < 60:
            return start_dt

    raise ValidationError(
        "Selected slot is not within the trainer's availability for this service. Please pick another time."
    )


@transaction.atomic
def create_booking_with_lock(
    service_id,
    trainer_id,
    start_time_utc,
    client_name,
    client_email,
    client_phone,
    client_notes='',
    authenticated_client=None,
    client_timezone=None,
):
    """
    Creates a booking using row-level locking (select_for_update) to guarantee zero double-bookings.
    """
    service = BookingService.objects.select_for_update().get(id=service_id, is_active=True)

    trainer = User.objects.filter(id=trainer_id, role='trainer').first()
    if not trainer:
        trainer = User.objects.filter(role='trainer').first()
        if not trainer:
            raise ValidationError("No valid trainer available for booking.")

    start_dt = datetime.datetime.fromisoformat(start_time_utc.replace('Z', '+00:00'))
    if timezone.is_naive(start_dt):
        start_dt = start_dt.replace(tzinfo=datetime.timezone.utc)
    else:
        start_dt = start_dt.astimezone(datetime.timezone.utc)

    start_dt = _ensure_start_is_bookable(
        trainer, service, start_dt, client_timezone=client_timezone
    )
    end_dt = start_dt + datetime.timedelta(minutes=service.duration_minutes)

    # Check atomic lock for conflicting bookings
    conflicts = Booking.objects.select_for_update().filter(
        trainer=trainer,
        status__in=[Booking.Status.CONFIRMED, Booking.Status.PENDING],
        start_time__lt=end_dt,
        end_time__gt=start_dt
    )

    if conflicts.exists():
        raise ValidationError("This time slot has just been booked by another client. Please select another slot.")

    # Check blackouts
    blackouts = TrainerBlackout.objects.filter(
        trainer=trainer,
        end_datetime__gt=start_dt,
        start_datetime__lt=end_dt
    )
    if blackouts.exists():
        raise ValidationError("The trainer is unavailable at the selected time.")

    # Auto-link client if user with matching email exists
    client_user = authenticated_client
    if not client_user:
        client_user = User.objects.filter(email=client_email, role='client').first()

    booking = Booking.objects.create(
        service=service,
        trainer=trainer,
        client=client_user,
        client_name=client_name,
        client_email=client_email,
        client_phone=client_phone,
        start_time=start_dt,
        end_time=end_dt,
        status=Booking.Status.CONFIRMED,
        client_notes=client_notes,
        meeting_link=build_meeting_link(service.title),
    )

    # If it's a 1-on-1 coaching booking and client user exists, link trainer & client if not linked
    if service.service_type == BookingService.ServiceType.ONE_ON_ONE_COACHING and client_user:
        TrainerClientLink.objects.get_or_create(trainer=trainer, client=client_user)

    # Trigger email notifications (failures must not roll back the booking)
    try:
        send_booking_confirmation_emails(booking, client_timezone=client_timezone)
    except Exception:
        logger.exception("Booking confirmation email failed for booking_id=%s", booking.id)

    return booking


def send_booking_confirmation_emails(booking, client_timezone=None):
    """
    Phase 1 §5.5 — trainer alert + client confirmation with local time,
    meeting link, intake link, cancellation policy, and .ics attachment.
    """
    tz_for_client = client_timezone or getattr(settings, "TRAINER_TIMEZONE", "UTC")
    session_when = _format_booking_local(booking.start_time, tz_for_client)
    session_when_trainer = _format_booking_local(
        booking.start_time, getattr(settings, "TRAINER_TIMEZONE", "UTC")
    )
    intake_url = build_intake_url(booking)
    success_url = build_booking_success_url(booking)
    meeting_link = booking.meeting_link or ""
    policy = getattr(settings, "BOOKING_CANCELLATION_POLICY", "")
    from_email = formataddr(("Haqq Athlete", settings.DEFAULT_FROM_EMAIL))

    # --- Client confirmation ---
    client_subject = f"Booking Confirmed: {booking.service.title} with Haqq Athlete"
    client_message = f"""Hi {booking.client_name},

Your {booking.service.title} has been confirmed.

Session Date & Time: {session_when}
Meeting Link: {meeting_link}

Next Step: Please complete your pre-session intake form before the call.
Intake Form: {intake_url}

Booking Summary: {success_url}

Cancellation / Rescheduling Policy:
{policy}

A calendar invite (.ics) is attached so you can add this session to your calendar.

Thank you,
Haqq Athlete Team
"""
    client_email = EmailMultiAlternatives(
        subject=client_subject,
        body=client_message,
        from_email=from_email,
        to=[booking.client_email],
    )
    client_email.attach(
        "haqq-athlete-session.ics",
        generate_booking_ics(booking, client_timezone=tz_for_client),
        "text/calendar",
    )
    client_email.send(fail_silently=False)

    # --- Trainer notification ---
    trainer_to = getattr(settings, "TRAINER_NOTIFY_EMAIL", "") or booking.trainer.email
    trainer_subject = f"New Booking Alert: {booking.client_name} ({booking.service.title})"
    trainer_message = f"""New Client Booking Alert

Client Name: {booking.client_name}
Email: {booking.client_email}
Phone: {booking.client_phone}
Service: {booking.service.title}
Date & Time (trainer timezone): {session_when_trainer}
Date & Time (client timezone): {session_when}
Meeting Link: {meeting_link}
Intake Form: {intake_url}
Notes: {booking.client_notes or '—'}
"""
    trainer_email = EmailMultiAlternatives(
        subject=trainer_subject,
        body=trainer_message,
        from_email=from_email,
        to=[trainer_to],
    )
    trainer_email.send(fail_silently=False)


def booking_id_stub(title):
    import re
    clean = re.sub(r'[^a-zA-Z0-9]', '', title)
    return f"{clean}-{datetime.datetime.now().strftime('%m%d%H%M')}"
