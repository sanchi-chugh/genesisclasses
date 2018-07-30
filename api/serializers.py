from rest_framework import serializers
from api.models import Student, Staff, SuperAdmin, Centre, Course

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

class CourseSerializer(serializers.ModelSerializer):
    centres = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('title', 'centres', 'id',)

    def get_centres(self, obj):
        return Course.objects.get(id = obj.id).centre.values('location')

class CentreSerializer(serializers.ModelSerializer):
    course_set = CourseSerializer(many=True, required=False)
    class Meta:
        model = Centre
        fields = '__all__'
