from django.contrib import admin
from .models import Exercise

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'trainer', 'created_at')
    list_filter = ('category', 'trainer')
    search_fields = ('name', 'trainer__email', 'trainer__name')
    ordering = ('name',)
