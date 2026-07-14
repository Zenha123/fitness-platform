from django.contrib import admin
from .models import TrainerClientLink

@admin.register(TrainerClientLink)
class TrainerClientLinkAdmin(admin.ModelAdmin):
    list_display = ('trainer', 'client', 'created_at')
    list_filter = ('trainer',)
    search_fields = ('trainer__name', 'client__name', 'trainer__email', 'client__email')
    ordering = ('-created_at',)
