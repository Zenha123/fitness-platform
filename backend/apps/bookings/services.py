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


def evaluate_intake_risk_flags(responses):
    """
    Evaluates submitted intake responses against Phase 1 §5.6 PAR-Q and health risk criteria.
    Returns (has_risk_flags: bool, risk_flags: list[str]).
    """
    risk_flags = []
    if not isinstance(responses, dict):
        return False, []

    # 1. PAR-Q Questions (7 standard questions)
    parq_questions = [
        ('parq_heart_condition', 'PAR-Q: Doctor-diagnosed heart condition'),
        ('parq_chest_pain_activity', 'PAR-Q: Chest pain during physical activity'),
        ('parq_chest_pain_resting', 'PAR-Q: Chest pain at rest in past month'),
        ('parq_dizziness_consciousness', 'PAR-Q: Loss of balance or consciousness due to dizziness'),
        ('parq_bone_joint_problem', 'PAR-Q: Bone or joint problem aggravated by exercise'),
        ('parq_bp_heart_meds', 'PAR-Q: Prescribed medication for blood pressure or heart condition'),
        ('parq_other_reason', 'PAR-Q: Other medical reason preventing physical activity'),
    ]

    for key, label in parq_questions:
        val = str(responses.get(key, '')).lower().strip()
        if val in ['yes', 'true', '1']:
            risk_flags.append(label)

    # 2. Medical Conditions Checkbox / Selection
    health_conditions = responses.get('health_conditions', [])
    if isinstance(health_conditions, list):
        risk_conditions = {'Heart Disease', 'High Blood Pressure', 'Stroke', 'Uncontrolled Diabetes', 'Asthma'}
        for cond in health_conditions:
            if cond in risk_conditions or any(rc.lower() in str(cond).lower() for rc in risk_conditions):
                risk_flags.append(f"Medical History: Flagged condition ({cond})")

    # 3. Current Injuries requiring medical oversight
    if str(responses.get('has_injuries', '')).lower() in ['yes', 'true', '1']:
        details = responses.get('injuries_details', '').strip()
        if details:
            risk_flags.append(f"Active Injury/Limitation: {details[:100]}")

    # 4. Prescription Medications
    if str(responses.get('takes_medications', '')).lower() in ['yes', 'true', '1']:
        details = responses.get('medications_details', '').strip()
        if details and any(kw in details.lower() for kw in ['heart', 'bp', 'blood pressure', 'cardio', 'beta blocker', 'insulin']):
            risk_flags.append(f"Medication Flag: {details[:100]}")

    has_flags = len(risk_flags) > 0
    return has_flags, risk_flags


def send_trainer_risk_alert_email(booking, submission, risk_flags):
    """
    Phase 1 §5.6 — Immediate trainer email alert when a client flags a PAR-Q or medical risk factor.
    """
    trainer_to = getattr(settings, "TRAINER_NOTIFY_EMAIL", "") or booking.trainer.email
    from_email = formataddr(("Haqq Athlete Alerts", settings.DEFAULT_FROM_EMAIL))
    session_when = _format_booking_local(booking.start_time, getattr(settings, "TRAINER_TIMEZONE", "Asia/Kolkata"))

    formatted_flags = "\n".join([f"  • {flag}" for flag in risk_flags])
    dashboard_url = f"{settings.FRONTEND_BASE_URL}/trainer/bookings"

    subject = f"⚠️ MEDICAL RISK ALERT: Pre-Session Intake Flagged for {booking.client_name}"
    message = f"""URGENT: Pre-Session Intake Risk Alert

Client Name: {booking.client_name}
Client Email: {booking.client_email}
Client Phone: {booking.client_phone}
Service: {booking.service.title}
Session Time: {session_when}

The client completed their pre-session intake form and FLAGGED 1 or more PAR-Q medical / health risk factors:

{formatted_flags}

ACTION REQUIRED: Please review the client's intake responses prior to your call. Medical clearance may be required before starting high-intensity physical activity.

View Full Intake Form: {dashboard_url}

Thank you,
Haqq Athlete System
"""
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=message,
            from_email=from_email,
            to=[trainer_to],
        )
        email.send(fail_silently=False)
    except Exception:
        logger.exception("Failed to send trainer risk alert email for booking_id=%s", booking.id)


def generate_assessment_report_pdf(report):
    """
    Generates a branded PDF Goal & Assessment Report (§5.7) for a client booking.
    Stores the resulting PDF file on `report.pdf_file`.
    """
    import io
    from django.core.files.base import ContentFile
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    SIGNAL_COLOR = colors.HexColor("#E8431A")
    INK_COLOR = colors.HexColor("#0B0B0C")
    TEXT_MUTED = colors.HexColor("#666666")
    BG_LIGHT = colors.HexColor("#F9F9F8")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.white,
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=SIGNAL_COLOR,
    )
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SIGNAL_COLOR,
        spaceBefore=10,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=INK_COLOR,
    )
    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=TEXT_MUTED,
    )
    meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=INK_COLOR,
    )

    story = []

    header_data = [
        [
            Paragraph("HAQQ ATHLETE", title_style),
            Paragraph("GOAL & BASELINE ASSESSMENT REPORT", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[270, 270])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), INK_COLOR),
        ('ALIGN', (0,0), (0,0), 'LEFT'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 14),
        ('BOTTOMPADDING', (0,0), (-1,-1), 14),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 12))

    booking = report.booking
    service_title = booking.service.title if booking and booking.service else "1-on-1 Fitness Coaching"
    session_time = _format_booking_local(booking.start_time, getattr(settings, "TRAINER_TIMEZONE", "Asia/Kolkata")) if booking else "N/A"

    meta_data = [
        [
            Paragraph("CLIENT NAME:", meta_label), Paragraph(report.client_name, meta_val),
            Paragraph("DATE RELEASED:", meta_label), Paragraph(timezone.now().strftime("%B %d, %Y"), meta_val)
        ],
        [
            Paragraph("CLIENT EMAIL:", meta_label), Paragraph(report.client_email, meta_val),
            Paragraph("SERVICE TYPE:", meta_label), Paragraph(service_title, meta_val)
        ],
        [
            Paragraph("SESSION TIME:", meta_label), Paragraph(session_time, meta_val),
            Paragraph("TRAINER / COACH:", meta_label), Paragraph(report.trainer.name or "Haqq Athlete Coach", meta_val)
        ],
    ]
    meta_table = Table(meta_data, colWidths=[90, 180, 90, 180])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E2DF")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F0F0ED")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    def add_section(title_text, body_text):
        story.append(Paragraph(title_text.upper(), h2_style))
        story.append(HRFlowable(width="100%", thickness=1, color=SIGNAL_COLOR, spaceBefore=2, spaceAfter=6))
        text = body_text.replace('\n', '<br/>') if body_text else "Not specified."
        story.append(Paragraph(text, body_style))
        story.append(Spacer(1, 8))

    add_section("1. Client Goals Summary", report.goals_summary)
    add_section("2. Current Baseline Assessment", report.baseline_assessment)
    add_section("3. Recommended Program Direction", report.recommended_program)
    add_section("4. Suggested Timeline & Milestones", report.suggested_timeline)

    if report.trainer_notes and report.trainer_notes.strip():
        add_section("5. Trainer Advisory Notes", report.trainer_notes)

    story.append(Spacer(1, 10))
    footer_text = Paragraph(
        "<font color='#888888'>Confidential Assessment Report — Haqq Athlete Personal Training Platform. Prepared specifically for "
        f"{report.client_name}. All Rights Reserved.</font>",
        ParagraphStyle('Footer', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10, alignment=1)
    )
    story.append(footer_text)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    filename = f"Assessment_Report_{report.id}.pdf"
    report.pdf_file.save(filename, ContentFile(pdf_bytes), save=True)
    return report.pdf_file


def send_assessment_report_email(report):
    """
    Phase 1 §5.7 — Emails the generated PDF Assessment Report to the client.
    Uses Django's configured EMAIL_BACKEND (console for local dev, SMTP for production).
    """
    import os

    # Ensure PDF file exists on disk; regenerate if missing
    if not report.pdf_file or not report.pdf_file.name:
        logger.info("No PDF file set on report %s, generating now...", report.id)
        generate_assessment_report_pdf(report)
        report.refresh_from_db()
    else:
        # Check that the actual file exists on disk
        try:
            full_path = report.pdf_file.path
            if not os.path.exists(full_path):
                logger.warning("PDF file missing from disk for report %s at %s, regenerating...", report.id, full_path)
                generate_assessment_report_pdf(report)
                report.refresh_from_db()
        except Exception:
            logger.warning("Could not verify PDF file path for report %s, regenerating...", report.id)
            generate_assessment_report_pdf(report)
            report.refresh_from_db()

    from_email = formataddr(("Haqq Athlete Coaching", settings.DEFAULT_FROM_EMAIL))
    subject = f"Your Haqq Athlete Assessment & Goal Report ({report.client_name})"

    message = f"""Hi {report.client_name},

Your trainer has finalized and released your personalized Haqq Athlete Goal & Assessment Report!

Please find your official assessment report attached as a PDF. This report outlines your baseline assessment, recommended program direction, and suggested training timeline.

If you have any questions before your session, feel free to reply directly to this email.

Best regards,
Haqq Athlete Coaching Team
"""
    email = EmailMultiAlternatives(
        subject=subject,
        body=message,
        from_email=from_email,
        to=[report.client_email],
    )

    # Attach the PDF
    if report.pdf_file and report.pdf_file.name:
        try:
            report.pdf_file.open('rb')
            email.attach(
                "Haqq_Athlete_Assessment_Report.pdf",
                report.pdf_file.read(),
                "application/pdf"
            )
            report.pdf_file.close()
        except Exception:
            logger.exception("Failed to attach PDF file to email for report %s", report.id)

    email.send(fail_silently=False)

    logger.info(
        "Assessment report email sent for report_id=%s to=%s using backend=%s",
        report.id, report.client_email, settings.EMAIL_BACKEND
    )

    report.is_released = True
    report.save()

