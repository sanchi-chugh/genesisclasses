from rest_framework import serializers
from api.models import *
from django.utils.timezone import localtime
from django.shortcuts import get_object_or_404

# -------------- Helper Functions ---------------
# Helper function to get validity of a question
def get_validity_of_ques(obj):
    # Int ques is valid iff it has a valid ans in range 0-9
    if obj.questionType == 'integer':
        if obj.intAnswer:
            return True
        else:
            return False
    
    # mcq, scq and passage ques are valid iff they have at least one correct option
    options = Option.objects.filter(question=obj, correct=True)
    if len(options) == 0:
        return False
    # Passage question must have a passage
    if obj.questionType == 'passage' and not obj.passage:
        return False
    return True

# Get absolute question number according to test (ques numbers are saved section wise)
def get_test_ques_number(obj):
    # Ques number = Questions of all sections before this ques's sec + quesNumber
    prevSections = Section.objects.filter(sectionNumber__lt=obj.section.sectionNumber)
    prev_ques = Question.objects.filter(section__in=prevSections).count()
    return prev_ques + obj.quesNumber

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

class NestedOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ('id', 'optionText', 'correct')

class NestedPassageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passage
        fields = ('id', 'paragraph')

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
    course = NestedCourseSerializer(read_only=True)
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
    course = NestedCourseSerializer(read_only=True)
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
    course = NestedCourseSerializer(many=True, read_only=True)
    class Meta:
        model = Subject
        exclude = ['super_admin']

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
    sections = serializers.SerializerMethodField()
    class Meta:
        model = Test
        exclude = ['super_admin']

    def get_sections(self, obj):
        return 'http://localhost:8000/api/tests/sections/' + str(obj.pk) + '/'

class TestSectionSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    class Meta:
        model = Section
        exclude = ['test']

    def get_questions(self, obj):
        return 'http://localhost:8000/api/tests/sections/questions/' + str(obj.pk) + '/'

class TestQuestionSerializer(serializers.ModelSerializer):
    questionDetail = serializers.SerializerMethodField()
    passage = serializers.SerializerMethodField()
    valid = serializers.SerializerMethodField()
    quesNumber = serializers.SerializerMethodField()
    class Meta:
        model = Question
        exclude = ['section', 'intAnswer']

    def get_questionDetail(self, obj):
        return 'http://localhost:8000/api/tests/sections/questions/detail/' + str(obj.pk) + '/'

    def get_passage(self, obj):
        if obj.passage and obj.questionType == 'passage':
            return 'http://localhost:8000/api/tests/sections/questions/passages/' + str(obj.passage.pk) + '/'
        return None

    def get_valid(self, obj):
        return get_validity_of_ques(obj)

    def get_quesNumber(self, obj):
        return get_test_ques_number(obj)

class TestQuestionDetailsSerializer(serializers.ModelSerializer):
    section = serializers.SlugRelatedField(
        read_only=True,
        slug_field='title',
    )
    valid = serializers.SerializerMethodField()
    options = NestedOptionSerializer(many=True)
    passage = serializers.SerializerMethodField()
    quesNumber = serializers.SerializerMethodField()
    class Meta:
        model = Question
        exclude = []

    def get_valid(self, obj):
        return get_validity_of_ques(obj)
    
    def get_passage(self, obj):
        if obj.passage and obj.questionType == 'passage':
            passageObj = get_object_or_404(Passage, pk=obj.passage.pk)
            passageData = NestedPassageSerializer(passageObj).data
            return passageData
        return None

    def get_quesNumber(self, obj):
        return get_test_ques_number(obj)

class PassageDetailsSerializer(serializers.ModelSerializer):
    section = serializers.SlugRelatedField(
        read_only=True,
        slug_field='title',
    )
    questions = serializers.SerializerMethodField()
    class Meta:
        model = Passage
        exclude = []
    
    def get_questions(self, obj):
        questions = Question.objects.filter(passage=obj).order_by('quesNumber')
        quesData = TestQuestionSerializer(questions, many=True).data
        for ques in quesData:
            ques.pop('passage', None)
            ques.pop('questionType', None)
        return quesData

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
