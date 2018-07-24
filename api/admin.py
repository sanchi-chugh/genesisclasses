from django.contrib import admin
from .models import Profile, User, SuperAdmin, Centre

admin.site.register(User)
admin.site.register(SuperAdmin)
admin.site.register(Centre)
admin.site.register(Profile)
