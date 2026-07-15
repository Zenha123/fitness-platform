from django.contrib import admin
from .models import WeeklyReview


@admin.register(WeeklyReview)
class WeeklyReviewAdmin(admin.ModelAdmin):
    list_display = ('trainer', 'client', 'created_at', 'updated_at')
    list_filter = ('trainer',)
    ordering = ('-created_at',)
    search_fields = ('trainer__name', 'client__name', 'summary')
