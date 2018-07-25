from rest_auth.views import UserDetailsView as user_details_view
from api.serializers import ProfileSerializer, SuperAdminSerializer

class UserDetailsView(user_details_view):
    def get(self, request, *args, **kwargs):
        response = super(UserDetailsView, self).get(request, *args, **kwargs)
        print(request.user.type_of_user)
        if request.user.type_of_user == 'superadmin':
            profile_serializer = SuperAdminSerializer(request.user.superadmin)
        else:
            profile_serializer = ProfileSerializer(self.user.profile)
        response.data['profile'] = profile_serializer.data
        response.data['profile']['type'] = request.user.type_of_user
        print(response.data)
        return response
