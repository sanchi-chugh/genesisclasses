from django.contrib import admin
from .models import Profile, User, SuperAdmin, Centre
from django.contrib.auth.admin import UserAdmin

class CustomUserAdmin(UserAdmin):
	pass

admin.site.register(User, CustomUserAdmin)
admin.site.register(SuperAdmin)
admin.site.register(Centre)
admin.site.register(Profile)
