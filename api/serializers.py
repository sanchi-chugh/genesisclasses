from rest_framework import serializers
from api.models import *
from django.utils.timezone import localtime

# -----------Nested Helper Serializers-----------
class NestedCentreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centre
        fields = ('id', 'location')

class NestedCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ('id', 'title')

class NestedCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'title')
    
class NestedSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('id', 'title')

class NestedUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ('id', 'title')

# ------------Serializers for Choices-----------------
# Gives choices of subjects along with the names of courses
class SubjectChoiceSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    class Meta:
        model = Subject
        fields = ('id', 'title')

    def get_title(self, obj):
        courses = obj.course.all()
        course_names = [course.title for course in courses]
        courses = ' + '.join(course_names)
        title = obj.title + ' (' + courses + ')'
        return title

# Gives choices of units
class UnitChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ('id', 'title')

# -----------------------------------------------------
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
        exclude = ['super_admin']

class StudentUserSerializer(serializers.ModelSerializer):
    centre = NestedCentreSerializer()
    course = NestedCourseSerializer(many=True)
    dateOfBirth = serializers.DateField(format='%b %d, %Y')
    email = serializers.SerializerMethodField()
    class Meta:
        model = Student
        exclude = ['user', 'complete']

    def get_email(self, obj):
        return obj.user.email

class BulkStudentsSerializer(serializers.ModelSerializer):
    course = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='title',
    )
    centre = serializers.SlugRelatedField(
        read_only=True,
        slug_field='location',
    )
    creationDateTime = serializers.DateTimeField(format='%b %d, %Y (%H:%M)')
    class Meta:
        model = BulkStudentsCSV
        exclude = []

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

# Currently being used in complete profile view
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

class SubjectSerializer(serializers.ModelSerializer):
    course = CourseSerializer(many=True, read_only=True)
    class Meta:
        model = Subject
        fields = ['title', 'id', 'course']

class UnitSerializer(serializers.ModelSerializer):
    subject = NestedSubjectSerializer()
    course = serializers.SerializerMethodField()
    class Meta:
        model = Unit
        exclude = []

    def get_course(self, obj):
        courses = obj.subject.course.all()
        return [course.title for course in courses]

class UnitSerializerExcludingSubject(serializers.ModelSerializer):
    class Meta:
        model = Unit
        exclude = ['subject']

class SubjectWiseUnitSerializer(serializers.ModelSerializer):
    units = UnitSerializerExcludingSubject(many=True, read_only=True)
    course = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='title',
        )
    class Meta:
        model = Subject
        fields = ['title', 'id', 'units', 'course']

class TestCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        exclude = ['super_admin']

# To be used for displaying list of all tests to superadmin
class TestInfoSerializer(serializers.ModelSerializer):
    startTime = serializers.DateTimeField(format='%b %d, %Y (%H:%M)')
    endtime = serializers.DateTimeField(format='%b %d, %Y (%H:%M)')
    category = NestedCategorySerializer(many=True)
    subject = NestedSubjectSerializer()
    unit = NestedUnitSerializer()
    course = NestedCourseSerializer(many=True)
    class Meta:
        model = Test
        exclude = ['super_admin']

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
