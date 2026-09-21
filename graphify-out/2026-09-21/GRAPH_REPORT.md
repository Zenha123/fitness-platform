# Graph Report - fitness-platform  (2026-09-21)

## Corpus Check
- 155 files · ~126,352 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 819 nodes · 1520 edges · 92 communities (31 shown, 33 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 128 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `26e432b2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- workouts/serializers.py
- bookings/views.py
- WeightEntryViewSet
- reviews/views.py
- UserSerializer
- ClientProfileShell.jsx
- devDependencies
- dependencies
- App.jsx
- PortfolioPage.jsx
- TrainerAvailabilityPage.jsx
- LogWorkoutPage.jsx
- TrainerDashboard.jsx
- exercises/views.py
- Haqq Athlete — Master Implementation Plan (v2.0.0)
- StrengthChartsPage.jsx
- TrainerLayout.jsx
- 4. Functional Requirements
- Alert.jsx
- progress/views.py
- PageContainer.jsx
- tokens.js
- package.json
- clients/views.py
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
- AuthContext.jsx
- TrainerClientLink
- ScheduleWorkoutPage.jsx
- WeeklyReviewViewSet
- IntakeFormPage.jsx
- 0002_traineravailability_service_type.py
- UserManager
- IsClientOwnerOrTrainer

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 29 edges
2. `Button()` - 28 edges
3. `TrainerClientLink` - 25 edges
4. `PageContainer()` - 24 edges
5. `Alert()` - 23 edges
6. `Spinner()` - 17 edges
7. `WorkoutLog` - 15 edges
8. `User` - 14 edges
9. `Booking` - 13 edges
10. `WorkoutPlan` - 13 edges

## Surprising Connections (you probably didn't know these)
- `TrainerRegistrationSerializer` --uses--> `User`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/accounts/models.py
- `UserPreferenceSerializer` --uses--> `User`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/accounts/models.py
- `UserSerializer` --uses--> `User`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/accounts/models.py
- `UserSerializer` --uses--> `TrainerClientLink`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/clients/models.py
- `BookingSerializer` --uses--> `UserSerializer`  [INFERRED]
  backend/apps/bookings/serializers.py → backend/apps/accounts/serializers.py

## Import Cycles
- None detected.

## Communities (92 total, 33 thin omitted)

### Community 0 - "workouts/serializers.py"
Cohesion: 0.05
Nodes (40): register, WorkoutLogAdmin, WorkoutLogEntryInline, WorkoutLogSetInline, WorkoutPlanAdmin, WorkoutPlanExerciseInline, WorkoutTemplateAdmin, WorkoutTemplateExerciseInline (+32 more)

### Community 1 - "bookings/views.py"
Cohesion: 0.07
Nodes (46): AbstractUser, atomic, register, UserAdmin, Role, User, Booking, BookingService (+38 more)

### Community 2 - "WeightEntryViewSet"
Cohesion: 0.07
Nodes (17): register, WeightEntryAdmin, Migration, Meta, A client's weight check-in, with an optional progress photo., Store photos privately under MEDIA_ROOT/progress_photos/<client_id>/<filename>.…, weight_photo_upload_path(), WeightEntry (+9 more)

### Community 3 - "reviews/views.py"
Cohesion: 0.22
Nodes (9): register, WeeklyReviewAdmin, Meta, Freeform trainer feedback note posted to a client at any time. Despite the name…, WeeklyReview, Meta, Compact serializer for list views — truncates long text., WeeklyReviewListSerializer (+1 more)

### Community 4 - "UserSerializer"
Cohesion: 0.12
Nodes (16): ChangePasswordSerializer, Meta, MyTokenObtainPairSerializer, Allows clients/trainers to update their own preferences., TrainerRegistrationSerializer, UserPreferenceSerializer, UserSerializer, ChangePasswordView (+8 more)

### Community 5 - "ClientProfileShell.jsx"
Cohesion: 0.15
Nodes (11): ReviewCard(), ReviewForm(), Button(), sizes, variants, CalendarIcon(), ChatIcon(), ClientProfileShell() (+3 more)

### Community 6 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+9 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (17): axios, chart.js, dependencies, axios, chart.js, react, react-chartjs-2, react-dom (+9 more)

### Community 8 - "App.jsx"
Cohesion: 0.23
Nodes (14): getClientBookings(), App(), ChangePasswordRoute(), ProtectedRoute(), PublicRoute(), WorkoutCalendar(), useAuth(), ChangePasswordPage() (+6 more)

### Community 9 - "PortfolioPage.jsx"
Cohesion: 0.12
Nodes (13): DualBookingCta(), MarketingLayout(), AboutPage(), certificationPlaceholders, credentialPlaceholders, specializations, HomePage(), caseStudies (+5 more)

### Community 10 - "TrainerAvailabilityPage.jsx"
Cohesion: 0.23
Nodes (15): createBooking(), createTrainerAvailability(), createTrainerBlackout(), deleteTrainerAvailability(), deleteTrainerBlackout(), getAvailableSlots(), getBookingServices(), getTrainerAvailability() (+7 more)

### Community 12 - "TrainerDashboard.jsx"
Cohesion: 0.13
Nodes (4): clientsApi, AddClientModal(), EditClientModal(), Input()

### Community 13 - "exercises/views.py"
Cohesion: 0.20
Nodes (8): ExerciseAdmin, register, Exercise, Meta, ExerciseSerializer, Meta, ExerciseViewSet, IsTrainerOrReadOnlyForClient

### Community 14 - "Haqq Athlete — Master Implementation Plan (v2.0.0)"
Cohesion: 0.06
Nodes (33): 10. Browser Verification Checklists, 11. Final MVP Completion Checklist, 1. Project Overview, 2.1 Strengths, 2.2 Technical Debt, 2.3 Areas Needing Attention, 2. Architecture Review, 3. Current Project Status & Completion Calculation (+25 more)

### Community 15 - "StrengthChartsPage.jsx"
Cohesion: 0.21
Nodes (4): progressApi, StrengthChart(), PageLoader(), ReviewsFeedPage()

### Community 16 - "TrainerLayout.jsx"
Cohesion: 0.06
Nodes (12): getTrainerBookings(), BottomTabBar(), ClientLayout(), isLinkActive(), navLinks, isLinkActive(), navLinks, TrainerLayout() (+4 more)

### Community 17 - "4. Functional Requirements"
Cohesion: 0.06
Nodes (32): 1.1 Goals, 1.2 Out of Scope (v1), 1. Project Overview, 2.1 Data Isolation Rules (must be enforced at the data layer, not just UI), 2. User Roles & Permissions, 3.1 User, 3.2 TrainerClientLink, 3.3 Exercise (+24 more)

### Community 18 - "Alert.jsx"
Cohesion: 0.15
Nodes (3): Alert(), variants, variants

### Community 19 - "progress/views.py"
Cohesion: 0.20
Nodes (8): IsTrainer, ExercisesLoggedView, PrivatePhotoView, APIView, GET /api/progress/strength/?exercise=<id>[&client=<id>] Returns per-date max…, GET /api/progress/strength/exercises/[?client=<id>] Returns the list of…, Authenticated endpoint to serve private progress photos. Only the owning client…, StrengthDataView

### Community 20 - "PageContainer.jsx"
Cohesion: 0.18
Nodes (3): PageContainer(), BookingSuccessPage(), REQUIREMENTS

### Community 21 - "tokens.js"
Cohesion: 0.17
Nodes (11): chartPalette, colors, fontFamilies, fontSizes, fontWeights, lineHeights, motion, radius (+3 more)

### Community 22 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 23 - "clients/views.py"
Cohesion: 0.22
Nodes (6): ClientListSerializer, ClientUpdateSerializer, Meta, Serializer for listing clients on the trainer dashboard, Serializer for updating client details (e.g. name, is_active), ClientViewSet

### Community 24 - "WeightJourneyPage.jsx"
Cohesion: 0.17
Nodes (4): getDateDifference(), PhotoTimeline(), WeightChart(), AuthenticatedImage()

### Community 76 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 77 - "ExerciseLibraryPage.jsx"
Cohesion: 0.12
Nodes (9): exercisesApi, CATEGORIES, ExerciseModal(), Modal(), ExercisePicker(), CATEGORIES, CATEGORY_COLORS, ExerciseLibraryPage() (+1 more)

### Community 83 - "AuthContext.jsx"
Cohesion: 0.20
Nodes (8): axiosClient, clearTokens(), getAccessToken(), setTokens(), AuthContext, AuthProvider(), parseJwt(), RegisterPage()

### Community 84 - "TrainerClientLink"
Cohesion: 0.21
Nodes (6): register, TrainerClientLinkAdmin, Meta, TrainerClientLink, ClientCreateSerializer, Serializer for trainer to register a new client

### Community 85 - "ScheduleWorkoutPage.jsx"
Cohesion: 0.16
Nodes (5): workoutsApi, Spinner(), TemplatePicker(), ScheduleWorkoutPage(), TrainerReportsPage()

### Community 87 - "IntakeFormPage.jsx"
Cohesion: 0.31
Nodes (7): getIntakeForm(), submitIntakeForm(), bookingNav, Navbar(), primaryNav, IntakeFormPage(), fetchForm()

### Community 89 - "0002_traineravailability_service_type.py"
Cohesion: 0.40
Nodes (3): forwards_assign_service_types(), Migration, Existing weekly rules were shared. Duplicate each rule onto both calendars so…

## Knowledge Gaps
- **137 isolated node(s):** `Migration`, `Migration`, `Role`, `Migration`, `Migration` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 441 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TrainerClientLink` connect `TrainerClientLink` to `workouts/serializers.py`, `bookings/views.py`, `WeightEntryViewSet`, `reviews/views.py`, `UserSerializer`, `exercises/views.py`, `progress/views.py`, `IsClientOwnerOrTrainer`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `UserSerializer` connect `UserSerializer` to `bookings/views.py`, `TrainerClientLink`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `create_booking_with_lock()` connect `bookings/views.py` to `TrainerClientLink`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `TrainerClientLink` (e.g. with `UserSerializer` and `create_booking_with_lock()`) actually correct?**
  _`TrainerClientLink` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Migration`, `Migration`, `Role` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workouts/serializers.py` be split into smaller, more focused modules?**
  _Cohesion score 0.052982456140350874 - nodes in this community are weakly interconnected._
- **Should `bookings/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.0661189358372457 - nodes in this community are weakly interconnected._