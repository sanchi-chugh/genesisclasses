from rest_auth.views import UserDetailsView as user_details_view
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from api.permissions import IsStudent
from api.models import User
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from api.serializers import (
    StaffSerializer,
    SuperAdminSerializer,
    StudentSerializer
)

# Send profile details of the user
class UserDetailsView(user_details_view):
    def get(self, request, *args, **kwargs):
        response = super(UserDetailsView, self).get(request, *args, **kwargs)
        if request.user.type_of_user == 'superadmin':
            profile_serializer = SuperAdminSerializer(request.user.superadmin)
        elif request.user.type_of_user == 'staff':
            profile_serializer = StaffSerializer(request.user.staff)
        else:
            profile_serializer = StudentSerializer(request.user.student, context={'request': request})
        response.data['profile'] = profile_serializer.data
        response.data['profile']['type'] = request.user.type_of_user
        return response

# Custom login function, delete the previous token if student user
@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if username is None or password is None:
        return Response({'error': 'Please provide both username and password.'},
                        status=HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid Credentials.'},
                        status=HTTP_404_NOT_FOUND)

    #Delete previous token if student user
    if user.type_of_user == 'student':
        try:
            token = Token.objects.get(user=user)
            token.delete()
        except Token.DoesNotExist:
            pass

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'key': token.key},
                        status=HTTP_200_OK)

# Delete token of a student on logout
# Do not delete token of a superadmin bcz multiple staff 
# members may be operating it at the same time.
@api_view(['POST'])
@permission_classes((AllowAny,))
def logout(request):
    user = request.user
    if user.type_of_user == 'student':
        try:
            token = Token.objects.get(user=user)
            token.delete()
        except Token.DoesNotExist:
            pass
    return Response({'status': 'successful'})