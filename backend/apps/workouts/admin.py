from django.contrib import admin
from .models import WorkoutPlan, WorkoutPlanExercise, WorkoutTemplate, WorkoutTemplateExercise


class WorkoutPlanExerciseInline(admin.TabularInline):
    model = WorkoutPlanExercise
    extra = 0
    fields = ('exercise', 'sets', 'reps', 'weight_kg', 'rest_seconds', 'order', 'notes')


@admin.register(WorkoutPlan)
class WorkoutPlanAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'trainer', 'scheduled_date', 'created_at')
    list_filter = ('trainer', 'scheduled_date')
    search_fields = ('title', 'client__name', 'trainer__name')
    ordering = ('-scheduled_date',)
    inlines = [WorkoutPlanExerciseInline]


class WorkoutTemplateExerciseInline(admin.TabularInline):
    model = WorkoutTemplateExercise
    extra = 0
    fields = ('exercise', 'sets', 'reps', 'weight_kg', 'rest_seconds', 'order', 'notes')


@admin.register(WorkoutTemplate)
class WorkoutTemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'trainer', 'created_at')
    list_filter = ('trainer',)
    search_fields = ('title', 'trainer__name')
    ordering = ('-created_at',)
    inlines = [WorkoutTemplateExerciseInline]


from .models import WorkoutLog, WorkoutLogEntry, WorkoutLogSet

class WorkoutLogSetInline(admin.TabularInline):
    model = WorkoutLogSet
    extra = 0

class WorkoutLogEntryInline(admin.TabularInline):
    model = WorkoutLogEntry
    extra = 0

@admin.register(WorkoutLog)
class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ('client', 'date', 'completed', 'duration_seconds', 'logged_at')
    list_filter = ('completed', 'date')
    search_fields = ('client__name',)
    inlines = [WorkoutLogEntryInline]

