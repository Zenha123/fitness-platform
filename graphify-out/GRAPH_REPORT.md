# Graph Report - fitness-platform  (2026-09-23)

## Corpus Check
- 158 files · ~132,740 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 878 nodes · 1606 edges · 96 communities (35 shown, 34 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ddc3b65a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- workouts/serializers.py
- bookings/views.py
- WeightEntry
- WeeklyReviewViewSet
- accounts/views.py
- TrainerLayout.jsx
- devDependencies
- dependencies
- App.jsx
- PortfolioPage.jsx
- ScheduleWorkoutPage.jsx
- TrainerDashboard.jsx
- ClientListSerializer
- exercises/views.py
- Haqq Athlete — Master Implementation Plan (v2.0.0)
- ClientProfileShell.jsx
- ViewLogPage.jsx
- 4. Functional Requirements
- PageContainer.jsx
- TrainerClientLink
- AuthContext.jsx
- tokens.js
- package.json
- Button.jsx
- WeightJourneyPage.jsx
- AccountsConfig
- BookingsConfig
- ClientsConfig
- ExercisesConfig
- ProgressConfig
- ReviewsConfig
- WorkoutsConfig
- main
- fix_typography.py
- accounts/migrations/0001_initial.py
- 0002_user_weight_unit.py
- bookings/migrations/0001_initial.py
- clients/migrations/0001_initial.py
- 0002_alter_trainerclientlink_id.py
- exercises/migrations/0001_initial.py
- 0002_exercise_demo_link.py
- reviews/migrations/0001_initial.py
- workouts/migrations/0001_initial.py
- 0002_workoutlog_workoutlogentry.py
- 0003_workoutlog_duration_seconds_workoutlogset.py
- build.sh
- asgi.py
- wsgi.py
- vercel.json
- React + Vite
- ExerciseLibraryPage.jsx
- eslint
- @eslint/js
- postcss
- tailwindcss
- @types/react-dom
- AppConfig
- register
- services.py
- progress/views.py
- GenerateAvailableSlotsTimezoneTests
- BookingService
- 0002_traineravailability_service_type.py
- bookings/urls.py
- evaluate_intake_risk_flags
- bookings/tests.py
- 0003_intakeformsubmission_has_risk_flags_and_more.py
- 0004_assessmentreport.py
- APIView

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 29 edges
2. `Button()` - 28 edges
3. `Alert()` - 23 edges
4. `PageContainer()` - 20 edges
5. `TrainerClientLink` - 19 edges
6. `Spinner()` - 17 edges
7. `Booking` - 16 edges
8. `generate_available_slots()` - 16 edges
9. `BookingService` - 15 edges
10. `WorkoutLog` - 15 edges

## Surprising Connections (you probably didn't know these)
- `create_booking_with_lock()` --uses--> `BookingService`  [INFERRED]
  backend/apps/bookings/services.py → backend/apps/bookings/models.py
- `generate_available_slots()` --uses--> `BookingService`  [INFERRED]
  backend/apps/bookings/services.py → backend/apps/bookings/models.py
- `AssessmentReportTests` --uses--> `BookingService`  [INFERRED]
  backend/apps/bookings/tests.py → backend/apps/bookings/models.py
- `GenerateAvailableSlotsTimezoneTests` --uses--> `BookingService`  [INFERRED]
  backend/apps/bookings/tests.py → backend/apps/bookings/models.py
- `TrainerAvailabilitySerializer` --uses--> `TrainerAvailability`  [INFERRED]
  backend/apps/bookings/serializers.py → backend/apps/bookings/models.py

## Import Cycles
- None detected.

## Communities (96 total, 34 thin omitted)

### Community 0 - "workouts/serializers.py"
Cohesion: 0.05
Nodes (40): WorkoutLogAdmin, WorkoutLogEntryInline, WorkoutLogSetInline, WorkoutPlanAdmin, WorkoutPlanExerciseInline, WorkoutTemplateAdmin, WorkoutTemplateExerciseInline, Meta (+32 more)

### Community 1 - "bookings/views.py"
Cohesion: 0.18
Nodes (13): Booking, IntakeFormSubmission, Meta, Status, TrainerAvailability, TrainerBlackout, BookingSerializer, CreateBookingSerializer (+5 more)

### Community 2 - "WeightEntry"
Cohesion: 0.08
Nodes (16): register, WeightEntryAdmin, Migration, Meta, A client's weight check-in, with an optional progress photo., Store photos privately under MEDIA_ROOT/progress_photos/<client_id>/<filename>.…, weight_photo_upload_path(), WeightEntry (+8 more)

### Community 3 - "WeeklyReviewViewSet"
Cohesion: 0.13
Nodes (11): register, WeeklyReviewAdmin, Meta, Freeform trainer feedback note posted to a client at any time. Despite the name…, WeeklyReview, Meta, Compact serializer for list views — truncates long text., WeeklyReviewListSerializer (+3 more)

### Community 4 - "accounts/views.py"
Cohesion: 0.09
Nodes (22): AbstractUser, register, UserAdmin, Role, User, UserManager, ChangePasswordSerializer, Meta (+14 more)

### Community 5 - "TrainerLayout.jsx"
Cohesion: 0.08
Nodes (27): createBooking(), createTrainerAvailability(), createTrainerBlackout(), deleteTrainerAvailability(), deleteTrainerBlackout(), downloadAssessmentReportPdf(), getAvailableSlots(), getBookingServices() (+19 more)

### Community 6 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+9 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (17): axios, chart.js, dependencies, axios, chart.js, react, react-chartjs-2, react-dom (+9 more)

### Community 8 - "App.jsx"
Cohesion: 0.15
Nodes (14): getClientBookings(), App(), ChangePasswordRoute(), ProtectedRoute(), PublicRoute(), PageLoader(), WorkoutCalendar(), useAuth() (+6 more)

### Community 9 - "PortfolioPage.jsx"
Cohesion: 0.10
Nodes (14): DualBookingCta(), MarketingLayout(), bookingNav, Navbar(), primaryNav, AboutPage(), certificationPlaceholders, credentialPlaceholders (+6 more)

### Community 10 - "ScheduleWorkoutPage.jsx"
Cohesion: 0.17
Nodes (4): workoutsApi, Spinner(), ExercisePicker(), TemplatePicker()

### Community 11 - "TrainerDashboard.jsx"
Cohesion: 0.13
Nodes (4): clientsApi, AddClientModal(), EditClientModal(), Modal()

### Community 12 - "ClientListSerializer"
Cohesion: 0.18
Nodes (7): ClientListSerializer, ClientUpdateSerializer, Meta, Serializer for listing clients on the trainer dashboard, Serializer for updating client details (e.g. name, is_active), ClientViewSet, IsTrainer

### Community 13 - "exercises/views.py"
Cohesion: 0.20
Nodes (8): ExerciseAdmin, register, Exercise, Meta, ExerciseSerializer, Meta, ExerciseViewSet, IsTrainerOrReadOnlyForClient

### Community 14 - "Haqq Athlete — Master Implementation Plan (v2.0.0)"
Cohesion: 0.06
Nodes (33): 10. Browser Verification Checklists, 11. Final MVP Completion Checklist, 1. Project Overview, 2.1 Strengths, 2.2 Technical Debt, 2.3 Areas Needing Attention, 2. Architecture Review, 3. Current Project Status & Completion Calculation (+25 more)

### Community 15 - "ClientProfileShell.jsx"
Cohesion: 0.11
Nodes (10): progressApi, StrengthChart(), ReviewCard(), ReviewForm(), CalendarIcon(), ChatIcon(), ClientProfileShell(), OverviewIcon() (+2 more)

### Community 16 - "ViewLogPage.jsx"
Cohesion: 0.10
Nodes (5): BottomTabBar(), ClientLayout(), isLinkActive(), navLinks, ViewLogPage()

### Community 17 - "4. Functional Requirements"
Cohesion: 0.06
Nodes (32): 1.1 Goals, 1.2 Out of Scope (v1), 1. Project Overview, 2.1 Data Isolation Rules (must be enforced at the data layer, not just UI), 2. User Roles & Permissions, 3.1 User, 3.2 TrainerClientLink, 3.3 Exercise (+24 more)

### Community 18 - "PageContainer.jsx"
Cohesion: 0.10
Nodes (6): PageContainer(), Input(), ChangePasswordPage(), REQUIREMENTS, LoginPage(), services

### Community 19 - "TrainerClientLink"
Cohesion: 0.15
Nodes (8): register, TrainerClientLinkAdmin, Meta, TrainerClientLink, ClientCreateSerializer, Serializer for trainer to register a new client, IsClientOwnerOrTrainer, Clients can CRUD their own entries. Trainers can only read entries of their…

### Community 20 - "AuthContext.jsx"
Cohesion: 0.38
Nodes (7): axiosClient, clearTokens(), getAccessToken(), setTokens(), AuthContext, AuthProvider(), parseJwt()

### Community 21 - "tokens.js"
Cohesion: 0.17
Nodes (11): chartPalette, colors, fontFamilies, fontSizes, fontWeights, lineHeights, motion, radius (+3 more)

### Community 22 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 23 - "Button.jsx"
Cohesion: 0.09
Nodes (12): getIntakeForm(), submitIntakeForm(), Alert(), variants, Button(), sizes, variants, BookingSuccessPage() (+4 more)

### Community 24 - "WeightJourneyPage.jsx"
Cohesion: 0.17
Nodes (4): getDateDifference(), PhotoTimeline(), WeightChart(), AuthenticatedImage()

### Community 76 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 77 - "ExerciseLibraryPage.jsx"
Cohesion: 0.08
Nodes (8): exercisesApi, CATEGORIES, ExerciseModal(), variants, CATEGORIES, CATEGORY_COLORS, ExerciseLibraryPage(), getCategoryStyle()

### Community 85 - "services.py"
Cohesion: 0.15
Nodes (21): atomic, booking_id_stub(), build_booking_success_url(), build_intake_url(), build_meeting_link(), create_booking_with_lock(), _ensure_start_is_bookable(), _format_booking_local() (+13 more)

### Community 86 - "progress/views.py"
Cohesion: 0.14
Nodes (8): ExercisesLoggedView, PrivatePhotoView, APIView, GET /api/progress/strength/?exercise=<id>[&client=<id>] Returns per-date max…, GET /api/progress/strength/exercises/[?client=<id>] Returns the list of…, Authenticated endpoint to serve private progress photos. Only the owning client…, StrengthDataView, WeightEntryViewSet

### Community 87 - "GenerateAvailableSlotsTimezoneTests"
Cohesion: 0.18
Nodes (7): Update user preferences (weight_unit etc.)., Convert a trainer/client wall-clock date+time in local_tz to UTC. DST-safe:…, _wall_time_to_utc(), GenerateAvailableSlotsTimezoneTests, Monday 06:00 IST = Sunday afternoon America/Los_Angeles. Asking for Sunday (LA)…, WallTimeConversionTests, override_settings

### Community 88 - "BookingService"
Cohesion: 0.19
Nodes (7): BookingService, ServiceType, BookingServiceSerializer, Meta, TrainerAvailabilitySerializer, BookingServiceListView, TrainerAvailabilityViewSet

### Community 89 - "0002_traineravailability_service_type.py"
Cohesion: 0.40
Nodes (3): forwards_assign_service_types(), Migration, Existing weekly rules were shared. Duplicate each rule onto both calendars so…

### Community 90 - "bookings/urls.py"
Cohesion: 0.30
Nodes (7): APIView, AssessmentReport, AssessmentReportSerializer, AssessmentReportCreateUpdateView, AssessmentReportPDFDownloadView, AssessmentReportReleaseView, AvailableSlotsView

### Community 91 - "evaluate_intake_risk_flags"
Cohesion: 0.25
Nodes (6): IntakeFormSubmissionSerializer, evaluate_intake_risk_flags(), Evaluates submitted intake responses against Phase 1 §5.6 PAR-Q and health risk…, IntakeRiskEvaluationTests, IntakeFormView, TestCase

### Community 92 - "bookings/tests.py"
Cohesion: 0.24
Nodes (6): generate_assessment_report_pdf(), Generates a branded PDF Goal & Assessment Report (§5.7) for a client booking.…, Phase 1 §5.7 — Emails the generated PDF Assessment Report to the client. Uses…, send_assessment_report_email(), AssessmentReportTests, Timezone / slot-boundary tests for Phase 1 Task 6.

## Knowledge Gaps
- **141 isolated node(s):** `Migration`, `Migration`, `ServiceType`, `Status`, `variants` (+136 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 468 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TrainerClientLink` connect `TrainerClientLink` to `WeeklyReviewViewSet`, `accounts/views.py`, `exercises/views.py`, `progress/views.py`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `UserSerializer` connect `accounts/views.py` to `TrainerClientLink`, `GenerateAvailableSlotsTimezoneTests`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `generate_available_slots()` connect `services.py` to `BookingService`, `bookings/views.py`, `bookings/tests.py`, `GenerateAvailableSlotsTimezoneTests`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `TrainerClientLink` (e.g. with `UserSerializer` and `ClientCreateSerializer`) actually correct?**
  _`TrainerClientLink` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Migration`, `Migration`, `ServiceType` to the rest of the system?**
  _141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workouts/serializers.py` be split into smaller, more focused modules?**
  _Cohesion score 0.052982456140350874 - nodes in this community are weakly interconnected._
- **Should `WeightEntry` be split into smaller, more focused modules?**
  _Cohesion score 0.08064516129032258 - nodes in this community are weakly interconnected._