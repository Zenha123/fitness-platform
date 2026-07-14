Software Requirements Specification

Fitness Coaching & Client Progress Platform

Web Application --- Phase 1 (Mobile app to follow)

Version 1.0

Prepared for: Development Team

Date: June 19, 2026

# 1. Project Overview

This document specifies the requirements for a web-based coaching
platform that connects personal trainers with their clients. Multiple
trainers use the platform independently, each managing their own roster
of clients. Trainers schedule workouts and track client progress;
clients log their own workout results and view their progress over time.

Phase 1 is a responsive web application (mobile-browser friendly). A
native mobile app (iOS/Android) is planned as Phase 2, reusing the same
backend and data model.

## 1.1 Goals

Let trainers schedule workouts for their assigned clients and review
progress weekly.

Let clients log workout results after each session, with minimal
friction.

Automatically visualize client attendance, strength gains, and body
transformation over time.

Keep all data strictly private between a client and their assigned
trainer.

## 1.2 Out of Scope (v1)

Client self-signup (trainers create all accounts manually).

Payments / billing / subscriptions.

Public profiles, social feed, or in-app sharing/export (clients share
progress via screenshot).

Messaging / chat between trainer and client.

Multi-trainer shared clients (each client belongs to exactly one trainer
in v1).

# 2. User Roles & Permissions

Note: There is no platform-wide admin or super-trainer role in v1. Each
trainer's data is isolated from other trainers' data.

## 2.1 Data Isolation Rules (must be enforced at the data layer, not just UI)

A trainer can only view, edit, or query clients explicitly assigned to
them.

A client can only view, edit, or query their own records.

Clients cannot see other clients' data under any circumstance --- no
leaderboards, no shared views.

Progress photos are private: visible only to the client who uploaded
them and their assigned trainer.

# 3. Data Model

The following entities form the core schema. Field names are
suggestions; the developer may adjust types/naming to fit the chosen
stack, provided the relationships and constraints are preserved.

### 3.1 User

### 3.2 TrainerClientLink

Defines which clients belong to which trainer. One client belongs to
exactly one trainer in v1.

### 3.3 Exercise

Reusable exercise definitions, owned per trainer (trainers build their
own library).

### 3.4 WorkoutPlan

A workout assigned by a trainer to a specific client for a specific
date.

### 3.5 WorkoutLog

The client's actual recorded performance for an assigned workout. This
is the single source of truth that drives the attendance calendar and
strength charts --- there is no separate data entry for either.

### 3.6 WeightEntry

### 3.7 WeeklyReview

Despite the name, this is a freeform, timestamped note a trainer posts
whenever they choose --- not tied to a fixed calendar week.

### 3.8 Attendance (derived, not stored separately)

Attendance is calculated, not entered. For any given calendar day: if a
WorkoutLog exists for that client with completed = true, the day is
'attended' (green). If a WorkoutPlan existed for that day but no
completed WorkoutLog exists, the day is 'absent' (grey). Days with no
assigned workout are left neutral/blank.

# 4. Functional Requirements

## 4.1 Authentication

FR-1.1: Users log in with email + password. No public self-registration.

FR-1.2: Trainers create client accounts manually (name, email, temporary
password). System should support a 'force password change on first
login' flow.

FR-1.3: Passwords must be hashed (e.g. bcrypt/argon2); never stored or
logged in plaintext.

FR-1.4: Session/token-based auth (e.g. JWT) with reasonable expiry and
refresh.

## 4.2 Trainer Dashboard

FR-2.1: On login, a trainer sees a list of only their assigned clients.

FR-2.2: Each client row shows: name, date of last completed workout, and
a flag if the client has missed their last 2+ scheduled sessions.

FR-2.3: Trainer can click into any client to view their full profile
(workouts, progress, reviews).

## 4.3 Client Management

FR-3.1: Trainer can create a new client account (name, email,
auto-generated or manually-set temp password).

FR-3.2: Trainer can edit or deactivate a client record. Deactivation
should preserve historical data, not delete it.

## 4.4 Exercise Library

FR-4.1: Trainer can create, edit, and delete exercises in their own
library (name, category, optional notes/demo link).

FR-4.2: Exercise library is private per trainer (not shared across
trainers in v1).

## 4.5 Workout Scheduling (Trainer)

FR-5.1: Trainer selects a client, a date, and builds a workout from
their exercise library, specifying prescribed sets/reps/weight per
exercise.

FR-5.2: Trainer can save a workout as a reusable template and apply it
to any client/date.

FR-5.3: Trainer can view a calendar of all workouts scheduled for a
given client.

FR-5.4: Trainer can edit or cancel a future scheduled workout.
Past/completed workouts should not be editable by the trainer (to
preserve log integrity).

## 4.6 Workout Logging (Client)

FR-6.1: Client sees their assigned workout for today (and can view
upcoming/past workouts).

FR-6.2: For each exercise, client enters actual sets/reps/weight
performed.

FR-6.3: Client can add a free-text note to the session.

FR-6.4: Client marks the session 'complete' --- this triggers the
attendance calculation for that day.

FR-6.5: Client can log a workout even if there is no scheduled plan for
that day (ad hoc session).

## 4.7 Attendance Calendar

FR-7.1: Both trainer (viewing a client) and the client themselves see a
monthly calendar view.

FR-7.2: Days are colored green (workout completed) or grey (scheduled
but missed). Days with no scheduled workout are unstyled/neutral.

FR-7.3: No red or punitive styling --- grey only, per product decision.

## 4.8 Weight & Photo Tracking

FR-8.1: Client can log a weight entry with an optional photo, intended
roughly every 14 days. The system should not block off-cadence entries,
but may show a gentle reminder if 14+ days have passed since the last
entry.

FR-8.2: Weight history is displayed as a line chart over time.

FR-8.3: Photos are displayed in a chronological timeline; client can
compare any two photos side-by-side.

FR-8.4: The progress screen (chart + photos) displays a small,
persistent trainer/brand name or handle, so it appears naturally if the
client screenshots the screen to share externally. This is a passive
branding element, not an active share/export feature.

FR-8.5: Photos and weight data are visible only to the client and their
assigned trainer --- never public, never shared with other clients.

## 4.9 Strength Tracking

FR-9.1: For each exercise a client has logged, the system auto-generates
a line chart of weight lifted over time, sourced entirely from
WorkoutLog entries (no separate data entry).

FR-9.2: System detects and highlights personal records (e.g. heaviest
weight logged for a given exercise).

## 4.10 Trainer Review Notes

FR-10.1: Trainer can post a freeform note to a client at any time (not
tied to a fixed week), containing a progress summary and areas to
improve.

FR-10.2: Client sees all review notes from their trainer in a
reverse-chronological feed, read-only.

FR-10.3: Trainer can edit or delete their own review notes.

# 5. Non-Functional Requirements

# 6. Screen / Page Inventory

## 6.1 Trainer-facing

Login

Dashboard (client list + status flags)

Client profile (tabs: Workouts / Progress / Reviews)

Schedule workout (build/assign)

Exercise library (manage)

Post review note

## 6.2 Client-facing

Login

Today's / upcoming workout

Log workout results

Attendance calendar

Weight & photo journey

Strength charts

Review notes feed (read-only)

# 7. Privacy & Storage Notes

Progress photos must be stored in private object storage (not a public
bucket/CDN path); access via signed/authenticated URLs only.

No feature in v1 sends client data outside the platform automatically
--- sharing is manual, via screenshot, by the client's own choice.

No client-facing list of other clients should exist anywhere in the UI
or API responses.

# 8. Future Phases (Not in v1, for context only)

Native mobile app (iOS/Android) wrapping the same backend.

Push notifications (workout reminders, new review note posted).

Payments/subscriptions if the trainer wants to charge through the
platform.

Optional in-app social sharing (currently: screenshot only).

# 9. Glossary

  -----------------------------------------------------------------------
  Role                    Description             Key Permissions
  ----------------------- ----------------------- -----------------------
  Trainer                 A coach managing their  Create client accounts
                          own roster of clients.  • Schedule workouts •
                                                  Maintain exercise
                                                  library • View progress
                                                  for own clients only •
                                                  Post review notes

  Client                  An individual being     View assigned workouts
                          coached.                • Log workout results •
                                                  Log weight/photo
                                                  (biweekly) • View own
                                                  attendance, strength,
                                                  weight history • Read
                                                  trainer's review notes
  -----------------------------------------------------------------------

  Field           Type       Notes
  --------------- ---------- ----------------------------
  id              UUID       Primary key
  name            string     Full name
  email           string     Unique, used for login
  password_hash   string     Never store plaintext
  role            enum       'trainer' or 'client'
  created_at      datetime   Account creation timestamp

  -----------------------------------------------------------------------
  Field                   Type                    Notes
  ----------------------- ----------------------- -----------------------
  id                      UUID                    Primary key

  trainer_id              UUID (FK → User)        Must reference a user
                                                  with role = trainer

  client_id               UUID (FK → User)        Must reference a user
                                                  with role = client;
                                                  unique (one trainer per
                                                  client)

  assigned_at             datetime                
  -----------------------------------------------------------------------

  Field        Type               Notes
  ------------ ------------------ -------------------------------------
  id           UUID               Primary key
  trainer_id   UUID (FK → User)   Owner
  name         string             e.g. 'Barbell Back Squat'
  category     string             e.g. legs, push, pull, core, cardio
  notes        text               Optional cues, demo link, etc.

  -----------------------------------------------------------------------
  Field                   Type                    Notes
  ----------------------- ----------------------- -----------------------
  id                      UUID                    Primary key

  trainer_id              UUID (FK → User)        Who assigned it

  client_id               UUID (FK → User)        Who it's assigned to

  date                    date                    Scheduled date

  exercises               array                   List of { exercise_id,
                                                  prescribed_sets,
                                                  prescribed_reps,
                                                  prescribed_weight }

  created_at              datetime                
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Field                   Type                    Notes
  ----------------------- ----------------------- -----------------------
  id                      UUID                    Primary key

  client_id               UUID (FK → User)        

  plan_id                 UUID (FK → WorkoutPlan) Nullable if logged ad
                                                  hoc without a plan

  date                    date                    Date the workout was
                                                  actually performed

  entries                 array                   List of { exercise_id,
                                                  actual_sets,
                                                  actual_reps,
                                                  actual_weight }

  notes                   text                    Optional client note,
                                                  e.g. 'felt heavy'

  completed               boolean                 True once the client
                                                  marks the session done

  logged_at               datetime                
  -----------------------------------------------------------------------

  Field       Type               Notes
  ----------- ------------------ ------------------------------------------------
  id          UUID               Primary key
  client_id   UUID (FK → User)   
  date        date               Entry date --- expected roughly every 14 days
  weight_kg   decimal            Or lb, per user preference setting
  photo_url   string             Nullable; private storage only (see Section 7)

  Field                 Type               Notes
  --------------------- ------------------ ------------------------------------------
  id                    UUID               Primary key
  trainer_id            UUID (FK → User)   Author
  client_id             UUID (FK → User)   Recipient
  summary               text               Overall progress summary
  improvements_needed   text               What the client should work on
  created_at            datetime           Displayed to client, sorted newest first

  -----------------------------------------------------------------------
  Category                            Requirement
  ----------------------------------- -----------------------------------
  Privacy                             Strict data isolation per Section
                                      2.1. No cross-client or
                                      cross-trainer visibility under any
                                      role.

  Security                            Hashed passwords, HTTPS everywhere,
                                      authenticated API routes,
                                      role-based access control enforced
                                      server-side.

  Responsiveness                      Fully usable on mobile browser
                                      widths (this is the primary access
                                      pattern); desktop is secondary.

  Performance                         Dashboard and chart views should
                                      load in under 2 seconds for a
                                      client with up to 2 years of logged
                                      history.

  Data retention                      Deactivating a client preserves
                                      their historical records; no hard
                                      deletes without explicit trainer
                                      action.

  Scalability                         Schema should comfortably support
                                      multiple trainers, each with dozens
                                      of clients, without redesign.

  Portability                         Architecture should allow Phase 2
                                      (native mobile app) to reuse the
                                      same backend/API without rebuild.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Term                                Meaning
  ----------------------------------- -----------------------------------
  Trainer                             A coach with their own roster of
                                      clients.

  Client                              An individual being coached, with
                                      one assigned trainer.

  WorkoutPlan                         What the trainer schedules/assigns.

  WorkoutLog                          What the client actually performed;
                                      source of truth for attendance and
                                      strength data.

  Attendance Calendar                 Derived calendar view, green =
                                      completed, grey = missed.

  Review Note                         Freeform trainer feedback, posted
                                      anytime.
  -----------------------------------------------------------------------
