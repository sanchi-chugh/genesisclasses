from rest_framework import serializers
from api.models import Student, Staff, SuperAdmin, Centre, Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class CentreSerializer(serializers.ModelSerializer):
    course_set = CourseSerializer(many=True, required=False)
    class Meta:
        model = Centre
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'

class SuperAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperAdmin
        fields = '__all__'
