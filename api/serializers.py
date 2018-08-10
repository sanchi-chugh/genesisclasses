from rest_framework import serializers
from api.models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'id']

class SuperAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperAdmin
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ('title', 'id',)

class CentreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centre
        fields = '__all__'

class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    centre = CentreSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source='course', write_only=True)
    centre_id = serializers.PrimaryKeyRelatedField(
        queryset=Centre.objects.all(), source='centre', write_only=True)
    
    class Meta:
        model = Staff
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    centre = CentreSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source='course', write_only=True)
    centre_id = serializers.PrimaryKeyRelatedField(
        queryset=Centre.objects.all(), source='centre', write_only=True)

    class Meta:
        model = Student
        fields = '__all__'

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = '__all__'

class SectionSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = '__all__'

    def get_questions(self, instance):
        questions =  instance.questions.all().order_by('pk')
        return QuestionSerializer(questions, many=True).data

class TestSerializerFull(serializers.ModelSerializer):
    sections = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = '__all__'

    def get_sections(self, instance):
        sections =  instance.sections.all().order_by('pk')
        return SectionSerializer(sections, many=True).data

class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = '__all__'
