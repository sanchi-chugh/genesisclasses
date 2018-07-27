from rest_auth.views import UserDetailsView as user_details_view
from api.serializers import (
    StaffSerializer,
    SuperAdminSerializer,
    StudentSerializer
)

class UserDetailsView(user_details_view):
    def get(self, request, *args, **kwargs):
        response = super(UserDetailsView, self).get(request, *args, **kwargs)
        if request.user.type_of_user == 'superadmin':
            profile_serializer = SuperAdminSerializer(request.user.superadmin)
        elif request.user.type_of_user == 'staff':
            profile_serializer = StaffSerializer(request.user.staff)
        else:
            profile_serializer = StudentSerializer(request.user.student)
        response.data['profile'] = profile_serializer.data
        response.data['profile']['type'] = request.user.type_of_user
        return response
