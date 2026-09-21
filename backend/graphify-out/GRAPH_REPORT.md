# Graph Report - backend  (2026-09-20)

## Corpus Check
- 82 files · ~14,025 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 372 nodes · 621 edges · 54 communities (7 shown, 23 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 107 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `26e432b2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- workouts/serializers.py
- bookings/views.py
- progress/views.py
- User
- TrainerClientLink
- WeeklyReviewViewSet
- clients/views.py
- UserManager
- AccountsConfig
- BookingsConfig
- ClientsConfig
- ExercisesConfig
- ProgressConfig
- ReviewsConfig
- WorkoutsConfig
- main
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

## God Nodes (most connected - your core abstractions)
1. `TrainerClientLink` - 25 edges
2. `WorkoutLog` - 15 edges
3. `User` - 14 edges
4. `Booking` - 13 edges
5. `WorkoutPlan` - 13 edges
6. `create_booking_with_lock()` - 12 edges
7. `WeightEntryViewSet` - 12 edges
8. `WeeklyReviewViewSet` - 12 edges
9. `WorkoutLogEntry` - 12 edges
10. `WorkoutPlanViewSet` - 12 edges

## Surprising Connections (you probably didn't know these)
- `create_booking_with_lock()` --uses--> `User`  [INFERRED]
  apps/bookings/services.py → apps/accounts/models.py
- `generate_available_slots()` --uses--> `User`  [INFERRED]
  apps/bookings/services.py → apps/accounts/models.py
- `BookingServiceListView` --uses--> `User`  [INFERRED]
  apps/bookings/views.py → apps/accounts/models.py
- `UserSerializer` --uses--> `TrainerClientLink`  [INFERRED]
  apps/accounts/serializers.py → apps/clients/models.py
- `BookingSerializer` --uses--> `UserSerializer`  [INFERRED]
  apps/bookings/serializers.py → apps/accounts/serializers.py

## Import Cycles
- None detected.

## Communities (54 total, 23 thin omitted)

### Community 0 - "workouts/serializers.py"
Cohesion: 0.05
Nodes (40): register, WorkoutLogAdmin, WorkoutLogEntryInline, WorkoutLogSetInline, WorkoutPlanAdmin, WorkoutPlanExerciseInline, WorkoutTemplateAdmin, WorkoutTemplateExerciseInline (+32 more)

### Community 1 - "bookings/views.py"
Cohesion: 0.09
Nodes (35): Booking, BookingService, IntakeFormSubmission, Meta, ServiceType, Status, TrainerAvailability, TrainerBlackout (+27 more)

### Community 2 - "progress/views.py"
Cohesion: 0.06
Nodes (24): register, WeightEntryAdmin, Migration, Meta, A client's weight check-in, with an optional progress photo., Store photos privately under MEDIA_ROOT/progress_photos/<client_id>/<filename>.…, weight_photo_upload_path(), WeightEntry (+16 more)

### Community 3 - "User"
Cohesion: 0.09
Nodes (21): AbstractUser, register, UserAdmin, Role, User, ChangePasswordSerializer, Meta, MyTokenObtainPairSerializer (+13 more)

### Community 4 - "TrainerClientLink"
Cohesion: 0.11
Nodes (14): register, TrainerClientLinkAdmin, Meta, TrainerClientLink, ExerciseAdmin, register, Exercise, Meta (+6 more)

### Community 5 - "WeeklyReviewViewSet"
Cohesion: 0.13
Nodes (11): register, WeeklyReviewAdmin, Meta, Freeform trainer feedback note posted to a client at any time. Despite the name…, WeeklyReview, Meta, Compact serializer for list views — truncates long text., WeeklyReviewListSerializer (+3 more)

### Community 6 - "clients/views.py"
Cohesion: 0.15
Nodes (9): ClientCreateSerializer, ClientListSerializer, ClientUpdateSerializer, Meta, Serializer for listing clients on the trainer dashboard, Serializer for trainer to register a new client, Serializer for updating client details (e.g. name, is_active), ClientViewSet (+1 more)

## Knowledge Gaps
- **21 isolated node(s):** `Migration`, `Migration`, `Role`, `Migration`, `ServiceType` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 199 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TrainerClientLink` connect `TrainerClientLink` to `workouts/serializers.py`, `bookings/views.py`, `progress/views.py`, `User`, `WeeklyReviewViewSet`, `clients/views.py`?**
  _High betweenness centrality (0.347) - this node is a cross-community bridge._
- **Why does `UserSerializer` connect `User` to `bookings/views.py`, `TrainerClientLink`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `create_booking_with_lock()` connect `bookings/views.py` to `User`, `TrainerClientLink`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `TrainerClientLink` (e.g. with `UserSerializer` and `create_booking_with_lock()`) actually correct?**
  _`TrainerClientLink` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `WorkoutLog` (e.g. with `ClientListSerializer` and `WorkoutLogCreateUpdateSerializer`) actually correct?**
  _`WorkoutLog` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `User` (e.g. with `TrainerRegistrationSerializer` and `UserPreferenceSerializer`) actually correct?**
  _`User` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Booking` (e.g. with `BookingSerializer` and `create_booking_with_lock()`) actually correct?**
  _`Booking` has 6 INFERRED edges - model-reasoned connections that need verification._