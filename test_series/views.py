from rest_auth.views import LoginView as login_view
from api.serializers import ProfileSerializer, SuperAdminSerializer


class LoginView(login_view):

    def post(self, request, *args, **kwargs):
        response = super(LoginView, self).post(request, *args, **kwargs)
        print(self.user.type_of_user)
        if self.user.type_of_user == 'superadmin':
            profile_serializer = SuperAdminSerializer(self.user.superadmin)
        else:
            profile_serializer = ProfileSerializer(self.user.profile)
        response.data['profile'] = profile_serializer.data
        response.data['profile']['type'] = self.user.type_of_user
        return response
