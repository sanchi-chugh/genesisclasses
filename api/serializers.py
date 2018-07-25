from rest_framework import serializers
from api.models import Profile, SuperAdmin

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class SuperAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperAdmin
        fields = '__all__'
