from rest_framework import permissions
from django.shortcuts import get_object_or_404
import datetime
from .models import *

# Allow only superadmin to access content
class IsSuperadmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.type_of_user == 'superadmin'

# Allow only permissible student to access content
class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.type_of_user == 'student':
            return False
        studentObj = get_object_or_404(Student, user=request.user)
        today = datetime.datetime.today().strftime('%Y-%m-%d')
        return (str(studentObj.joiningDate) <= today and str(studentObj.endAccessDate) > today)