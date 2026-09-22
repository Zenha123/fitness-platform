# Graph Report - fitness-platform  (2026-09-21)

## Corpus Check
- 156 files · ~127,023 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 840 nodes · 1524 edges · 87 communities (27 shown, 33 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 122 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2cfd7b9d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- workouts/serializers.py
- bookings/views.py
- progress/views.py
- reviews/views.py
- accounts/views.py
- ClientProfileShell.jsx
- devDependencies
- dependencies
- useAuth
- App.jsx
- ViewLogPage.jsx
- TrainerDashboard.jsx
- ClientListSerializer
- exercises/views.py
- Haqq Athlete — Master Implementation Plan (v2.0.0)
- StrengthChartsPage.jsx
- ClientLayout.jsx
- 4. Functional Requirements
- Alert.jsx
- TrainerClientLink
- AuthContext.jsx
- tokens.js
- package.json
- WeeklyReviewViewSet
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
- ScheduleWorkoutPage.jsx
- eslint
- @eslint/js
- postcss
- tailwindcss
- @types/react-dom
- AppConfig
- register
- index.js
- 0002_traineravailability_service_type.py

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 29 edges
2. `Button()` - 28 edges
3. `PageContainer()` - 24 edges
4. `Alert()` - 23 edges
5. `TrainerClientLink` - 19 edges
6. `Spinner()` - 17 edges
7. `generate_available_slots()` - 16 edges
8. `WorkoutLog` - 15 edges
9. `BookingService` - 14 edges
10. `Booking` - 13 edges

## Surprising Connections (you probably didn't know these)
- `WorkoutPlanExerciseInline` --uses--> `WorkoutPlanExercise`  [INFERRED]
  backend/apps/workouts/admin.py → backend/apps/workouts/models.py
- `WorkoutTemplateExerciseInline` --uses--> `WorkoutTemplateExercise`  [INFERRED]
  backend/apps/workouts/admin.py → backend/apps/workouts/models.py
- `WorkoutLogSetInline` --uses--> `WorkoutLogSet`  [INFERRED]
  backend/apps/workouts/admin.py → backend/apps/workouts/models.py
- `WorkoutLogEntryInline` --uses--> `WorkoutLogEntry`  [INFERRED]
  backend/apps/workouts/admin.py → backend/apps/workouts/models.py
- `ClientListSerializer` --uses--> `WorkoutPlan`  [INFERRED]
  backend/apps/clients/serializers.py → backend/apps/workouts/models.py

## Import Cycles
- None detected.

## Communities (87 total, 33 thin omitted)

### Community 0 - "workouts/serializers.py"
Cohesion: 0.05
Nodes (40): WorkoutLogAdmin, WorkoutLogEntryInline, WorkoutLogSetInline, WorkoutPlanAdmin, WorkoutPlanExerciseInline, WorkoutTemplateAdmin, WorkoutTemplateExerciseInline, Meta (+32 more)

### Community 1 - "bookings/views.py"
Cohesion: 0.06
Nodes (52): atomic, Update user preferences (weight_unit etc.)., Booking, BookingService, IntakeFormSubmission, Meta, ServiceType, Status (+44 more)

### Community 2 - "progress/views.py"
Cohesion: 0.05
Nodes (26): register, WeightEntryAdmin, Migration, Meta, A client's weight check-in, with an optional progress photo., Store photos privately under MEDIA_ROOT/progress_photos/<client_id>/<filename>.…, weight_photo_upload_path(), WeightEntry (+18 more)

### Community 3 - "reviews/views.py"
Cohesion: 0.22
Nodes (9): register, WeeklyReviewAdmin, Meta, Freeform trainer feedback note posted to a client at any time. Despite the name…, WeeklyReview, Meta, Compact serializer for list views — truncates long text., WeeklyReviewListSerializer (+1 more)

### Community 4 - "accounts/views.py"
Cohesion: 0.09
Nodes (22): AbstractUser, register, UserAdmin, Role, User, UserManager, ChangePasswordSerializer, Meta (+14 more)

### Community 5 - "ClientProfileShell.jsx"
Cohesion: 0.22
Nodes (6): CalendarIcon(), ChatIcon(), ClientProfileShell(), OverviewIcon(), ProgressIcon(), ReviewIcon()

### Community 6 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+9 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (17): axios, chart.js, dependencies, axios, chart.js, react, react-chartjs-2, react-dom (+9 more)

### Community 8 - "useAuth"
Cohesion: 0.25
Nodes (5): ChangePasswordRoute(), ProtectedRoute(), PublicRoute(), useAuth(), LoginPage()

### Community 9 - "App.jsx"
Cohesion: 0.06
Nodes (51): createBooking(), createTrainerAvailability(), createTrainerBlackout(), deleteTrainerAvailability(), deleteTrainerBlackout(), getAvailableSlots(), getBookingServices(), getClientBookings() (+43 more)

### Community 10 - "ViewLogPage.jsx"
Cohesion: 0.13
Nodes (3): workoutsApi, WorkoutCalendar(), ViewLogPage()

### Community 11 - "TrainerDashboard.jsx"
Cohesion: 0.15
Nodes (3): clientsApi, AddClientModal(), TrainerDashboard()

### Community 12 - "ClientListSerializer"
Cohesion: 0.18
Nodes (7): ClientListSerializer, ClientUpdateSerializer, Meta, Serializer for listing clients on the trainer dashboard, Serializer for updating client details (e.g. name, is_active), ClientViewSet, IsTrainer

### Community 13 - "exercises/views.py"
Cohesion: 0.20
Nodes (8): ExerciseAdmin, register, Exercise, Meta, ExerciseSerializer, Meta, ExerciseViewSet, IsTrainerOrReadOnlyForClient

### Community 14 - "Haqq Athlete — Master Implementation Plan (v2.0.0)"
Cohesion: 0.06
Nodes (33): 10. Browser Verification Checklists, 11. Final MVP Completion Checklist, 1. Project Overview, 2.1 Strengths, 2.2 Technical Debt, 2.3 Areas Needing Attention, 2. Architecture Review, 3. Current Project Status & Completion Calculation (+25 more)

### Community 15 - "StrengthChartsPage.jsx"
Cohesion: 0.17
Nodes (5): progressApi, StrengthChart(), ReviewCard(), PageLoader(), StrengthChartsPage()

### Community 16 - "ClientLayout.jsx"
Cohesion: 0.18
Nodes (4): BottomTabBar(), ClientLayout(), isLinkActive(), navLinks

### Community 17 - "4. Functional Requirements"
Cohesion: 0.06
Nodes (32): 1.1 Goals, 1.2 Out of Scope (v1), 1. Project Overview, 2.1 Data Isolation Rules (must be enforced at the data layer, not just UI), 2. User Roles & Permissions, 3.1 User, 3.2 TrainerClientLink, 3.3 Exercise (+24 more)

### Community 18 - "Alert.jsx"
Cohesion: 0.09
Nodes (7): EditClientModal(), ReviewForm(), Alert(), variants, Input(), ChangePasswordPage(), REQUIREMENTS

### Community 19 - "TrainerClientLink"
Cohesion: 0.21
Nodes (6): register, TrainerClientLinkAdmin, Meta, TrainerClientLink, ClientCreateSerializer, Serializer for trainer to register a new client

### Community 20 - "AuthContext.jsx"
Cohesion: 0.38
Nodes (7): axiosClient, clearTokens(), getAccessToken(), setTokens(), AuthContext, AuthProvider(), parseJwt()

### Community 21 - "tokens.js"
Cohesion: 0.17
Nodes (11): chartPalette, colors, fontFamilies, fontSizes, fontWeights, lineHeights, motion, radius (+3 more)

### Community 22 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 24 - "WeightJourneyPage.jsx"
Cohesion: 0.16
Nodes (5): getDateDifference(), PhotoTimeline(), WeightChart(), AuthenticatedImage(), WeightJourneyPage()

### Community 76 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 77 - "ScheduleWorkoutPage.jsx"
Cohesion: 0.06
Nodes (13): exercisesApi, CATEGORIES, ExerciseModal(), isLinkActive(), navLinks, TrainerLayout(), Modal(), ExercisePicker() (+5 more)

### Community 89 - "0002_traineravailability_service_type.py"
Cohesion: 0.40
Nodes (3): forwards_assign_service_types(), Migration, Existing weekly rules were shared. Duplicate each rule onto both calendars so…

## Knowledge Gaps
- **137 isolated node(s):** `Migration`, `Migration`, `ServiceType`, `Status`, `Migration` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 452 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TrainerClientLink` connect `TrainerClientLink` to `progress/views.py`, `reviews/views.py`, `accounts/views.py`, `exercises/views.py`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `UserSerializer` connect `accounts/views.py` to `bookings/views.py`, `TrainerClientLink`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `TrainerClientLink` (e.g. with `UserSerializer` and `ClientCreateSerializer`) actually correct?**
  _`TrainerClientLink` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Migration`, `Migration`, `ServiceType` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workouts/serializers.py` be split into smaller, more focused modules?**
  _Cohesion score 0.052982456140350874 - nodes in this community are weakly interconnected._
- **Should `bookings/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05708548479632817 - nodes in this community are weakly interconnected._
- **Should `progress/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05185185185185185 - nodes in this community are weakly interconnected._