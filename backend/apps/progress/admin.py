from django.contrib import admin
from .models import WeightEntry


@admin.register(WeightEntry)
class WeightEntryAdmin(admin.ModelAdmin):
    list_display = ('client', 'date', 'weight_kg', 'has_photo', 'created_at')
    list_filter = ('client__name',)
    ordering = ('-date',)
    search_fields = ('client__name', 'client__email')

    def has_photo(self, obj):
        return bool(obj.photo)
    has_photo.boolean = True
    has_photo.short_description = 'Photo'
