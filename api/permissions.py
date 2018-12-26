from rest_framework import permissions
from django.shortcuts import get_object_or_404
from .models import *

#Allow only superadmin to access content
class IsSuperadmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.type_of_user == 'superadmin'

#Allow only student to access content
class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.type_of_user == 'student'