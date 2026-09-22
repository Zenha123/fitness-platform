# Graph Report - fitness-platform  (2026-09-21)

## Corpus Check
- 156 files · ~127,023 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 838 nodes · 1567 edges · 88 communities (28 shown, 32 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 133 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `26e432b2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- workouts/serializers.py
- bookings/views.py
- progress/views.py
- TrainerClientLink
- UserSerializer
- ClientProfileShell.jsx
- devDependencies
- dependencies
- App.jsx
- Button
- TrainerAvailabilityPage.jsx
- AddClientModal.jsx
- exercises/views.py
- Haqq Athlete — Master Implementation Plan (v2.0.0)
- StrengthChartsPage.jsx
- TrainerLayout.jsx
- 4. Functional Requirements
- Alert.jsx
- PortfolioPage.jsx
- Button.jsx
- tokens.js
- package.json
- PublicBookingPage.jsx
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
- TrainerBookingsPage.jsx
- IntakeFormPage.jsx
- index.js
- 0002_traineravailability_service_type.py
- UserManager

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 29 edges
2. `Button()` - 28 edges
3. `TrainerClientLink` - 25 edges
4. `PageContainer()` - 24 edges
5. `Alert()` - 23 edges
6. `generate_available_slots()` - 17 edges
7. `Spinner()` - 17 edges
8. `WorkoutLog` - 15 edges
9. `User` - 14 edges
10. `BookingService` - 14 edges

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

## Communities (88 total, 32 thin omitted)

### Community 0 - "workouts/serializers.py"
Cohesion: 0.05
Nodes (41): IsTrainer, register, WorkoutLogAdmin, WorkoutLogEntryInline, WorkoutLogSetInline, WorkoutPlanAdmin, WorkoutPlanExerciseInline, WorkoutTemplateAdmin (+33 more)

### Community 1 - "bookings/views.py"
Cohesion: 0.05
Nodes (57): AbstractUser, atomic, register, UserAdmin, Role, User, Update user preferences (weight_unit etc.)., Booking (+49 more)

### Community 2 - "progress/views.py"
Cohesion: 0.05
Nodes (26): register, WeightEntryAdmin, Migration, Meta, A client's weight check-in, with an optional progress photo., Store photos privately under MEDIA_ROOT/progress_photos/<client_id>/<filename>.…, weight_photo_upload_path(), WeightEntry (+18 more)

### Community 3 - "TrainerClientLink"
Cohesion: 0.07
Nodes (23): register, TrainerClientLinkAdmin, Meta, TrainerClientLink, ClientCreateSerializer, ClientListSerializer, ClientUpdateSerializer, Meta (+15 more)

### Community 4 - "UserSerializer"
Cohesion: 0.13
Nodes (15): ChangePasswordSerializer, Meta, MyTokenObtainPairSerializer, Allows clients/trainers to update their own preferences., TrainerRegistrationSerializer, UserPreferenceSerializer, UserSerializer, ChangePasswordView (+7 more)

### Community 5 - "ClientProfileShell.jsx"
Cohesion: 0.22
Nodes (6): CalendarIcon(), ChatIcon(), ClientProfileShell(), OverviewIcon(), ProgressIcon(), ReviewIcon()

### Community 6 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+9 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (17): axios, chart.js, dependencies, axios, chart.js, react, react-chartjs-2, react-dom (+9 more)

### Community 8 - "App.jsx"
Cohesion: 0.27
Nodes (12): App(), ChangePasswordRoute(), ProtectedRoute(), PublicRoute(), useAuth(), ChangePasswordPage(), ClientDashboard(), LoginPage() (+4 more)

### Community 9 - "Button"
Cohesion: 0.17
Nodes (10): DualBookingCta(), MarketingLayout(), Button(), AboutPage(), certificationPlaceholders, credentialPlaceholders, specializations, HomePage() (+2 more)

### Community 10 - "TrainerAvailabilityPage.jsx"
Cohesion: 0.35
Nodes (10): createTrainerAvailability(), createTrainerBlackout(), deleteTrainerAvailability(), deleteTrainerBlackout(), getClientBookings(), getTrainerAvailability(), getTrainerBlackouts(), daysList (+2 more)

### Community 12 - "AddClientModal.jsx"
Cohesion: 0.27
Nodes (4): clientsApi, AddClientModal(), EditClientModal(), Input()

### Community 13 - "exercises/views.py"
Cohesion: 0.20
Nodes (8): ExerciseAdmin, register, Exercise, Meta, ExerciseSerializer, Meta, ExerciseViewSet, IsTrainerOrReadOnlyForClient

### Community 14 - "Haqq Athlete — Master Implementation Plan (v2.0.0)"
Cohesion: 0.06
Nodes (33): 10. Browser Verification Checklists, 11. Final MVP Completion Checklist, 1. Project Overview, 2.1 Strengths, 2.2 Technical Debt, 2.3 Areas Needing Attention, 2. Architecture Review, 3. Current Project Status & Completion Calculation (+25 more)

### Community 15 - "StrengthChartsPage.jsx"
Cohesion: 0.18
Nodes (5): progressApi, StrengthChart(), ReviewCard(), PageLoader(), ReviewsFeedPage()

### Community 16 - "TrainerLayout.jsx"
Cohesion: 0.07
Nodes (7): BottomTabBar(), ClientLayout(), isLinkActive(), navLinks, isLinkActive(), navLinks, TrainerLayout()

### Community 17 - "4. Functional Requirements"
Cohesion: 0.06
Nodes (32): 1.1 Goals, 1.2 Out of Scope (v1), 1. Project Overview, 2.1 Data Isolation Rules (must be enforced at the data layer, not just UI), 2. User Roles & Permissions, 3.1 User, 3.2 TrainerClientLink, 3.3 Exercise (+24 more)

### Community 18 - "Alert.jsx"
Cohesion: 0.22
Nodes (3): ReviewForm(), Alert(), variants

### Community 19 - "PortfolioPage.jsx"
Cohesion: 0.22
Nodes (4): caseStudies, PortfolioPage(), testimonials, transformationStories

### Community 20 - "Button.jsx"
Cohesion: 0.11
Nodes (6): PageContainer(), sizes, variants, BookingSuccessPage(), REQUIREMENTS, RegisterPage()

### Community 21 - "tokens.js"
Cohesion: 0.17
Nodes (11): chartPalette, colors, fontFamilies, fontSizes, fontWeights, lineHeights, motion, radius (+3 more)

### Community 22 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 23 - "PublicBookingPage.jsx"
Cohesion: 0.39
Nodes (7): createBooking(), getAvailableSlots(), getBookingServices(), PublicBookingPage(), fetchServices(), fetchSlots(), toLocalDateISO()

### Community 76 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 77 - "ScheduleWorkoutPage.jsx"
Cohesion: 0.05
Nodes (26): axiosClient, clearTokens(), getAccessToken(), setTokens(), exercisesApi, workoutsApi, CATEGORIES, ExerciseModal() (+18 more)

### Community 83 - "TrainerBookingsPage.jsx"
Cohesion: 0.53
Nodes (5): getTrainerBookings(), BookingCard(), statusBadgeClass(), TrainerBookingsPage(), fetchBookings()

### Community 87 - "IntakeFormPage.jsx"
Cohesion: 0.29
Nodes (7): getIntakeForm(), submitIntakeForm(), bookingNav, Navbar(), primaryNav, IntakeFormPage(), fetchForm()

### Community 89 - "0002_traineravailability_service_type.py"
Cohesion: 0.40
Nodes (3): forwards_assign_service_types(), Migration, Existing weekly rules were shared. Duplicate each rule onto both calendars so…

## Knowledge Gaps
- **137 isolated node(s):** `Migration`, `Migration`, `Role`, `Migration`, `Migration` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 446 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TrainerClientLink` connect `TrainerClientLink` to `workouts/serializers.py`, `bookings/views.py`, `progress/views.py`, `UserSerializer`, `exercises/views.py`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `UserSerializer` connect `UserSerializer` to `bookings/views.py`, `TrainerClientLink`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `create_booking_with_lock()` connect `bookings/views.py` to `TrainerClientLink`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `TrainerClientLink` (e.g. with `UserSerializer` and `create_booking_with_lock()`) actually correct?**
  _`TrainerClientLink` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Migration`, `Migration`, `Role` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workouts/serializers.py` be split into smaller, more focused modules?**
  _Cohesion score 0.051615051615051616 - nodes in this community are weakly interconnected._
- **Should `bookings/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05136168179646441 - nodes in this community are weakly interconnected._