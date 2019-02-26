from rest_framework import serializers
from api.models import *
from django.utils.timezone import localtime
from django.shortcuts import get_object_or_404
from test_series.settings import DOMAIN
import datetime

# ---------SUPERADMIN VIEW SERIALIZERS-----------

# -------------- Helper Functions ---------------
# Get absolute question number according to test (ques numbers are saved section wise)
def get_test_ques_number(obj):
    # Ques number = Questions of all sections (of the same test) before this ques's sec + quesNumber
    prevSections = Section.objects.filter(sectionNumber__lt=obj.section.sectionNumber, test=obj.section.test)
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

class NestedTestSerializer(serializers.ModelSerializer):
    course = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='title',
    )
    category = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='title',
    )
    subject = serializers.SlugRelatedField(
        read_only=True,
        slug_field='title',
    )
    unit = serializers.SlugRelatedField(
        read_only=True,
        slug_field='title',
    )
    class Meta:
        model = Test
        fields = ('id', 'title', 'totalMarks', 'totalQuestions', 
                  'category', 'course', 'subject', 'unit')

class NestedSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ('id', 'title', 'totalQuestions', 'totalMarks', 'sectionNumber')

class NestedQuestionSerializer(serializers.ModelSerializer):
    correctAnswers = serializers.SerializerMethodField()
    class Meta:
        model = Question
        fields = ('id', 'questionText', 'questionType',
                  'correctAnswers', 'quesNumber', 'marksPositive')

    def get_correctAnswers(self, obj):
        if obj.questionType == 'integer':
            return [str(obj.intAnswer)]
        correctOptions = Option.objects.filter(question=obj, correct=True).order_by('pk')
        return [option.optionText for option in correctOptions]

# Used as both a nested serializer and a main serializer in TopperDetailsView
class NestedStudentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    course = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='title',
    )
    centre = serializers.SlugRelatedField(
        read_only=True,
        slug_field='location',
    )
    email = serializers.SerializerMethodField()
    class Meta:
        model = Student
        fields = ('id', 'course', 'centre', 'name', 'contact_number', 'email')

    def get_name(self, obj):
        name = ''
        if obj.first_name:
            name += obj.first_name
        if obj.last_name:
            name += ' ' + obj.last_name
        if name == '':
            name = obj.user.username
        return name

    def get_email(self, obj):
        return obj.user.email

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

# -------------Serializers for views------------------
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
    dateOfBirth = serializers.SerializerMethodField()
    endAccessDate = serializers.DateField(format='%b %d, %Y')
    joiningDate = serializers.DateField(format='%b %d, %Y')
    email = serializers.SerializerMethodField()
    viewResults = serializers.SerializerMethodField()
    class Meta:
        model = Student
        exclude = ['user', 'complete']

    def get_email(self, obj):
        return obj.user.email

    def get_viewResults(self, obj):
        return DOMAIN + 'api/results/students/' + str(obj.pk) + '/'

    def get_dateOfBirth(self, obj):
        if self.context['request'].method == 'PUT' and 'dateOfBirth' in self.context['request'].data:
            # If request is PUT, then accept empty string as null value for date field
            if self.context['request'].data['dateOfBirth'] == '':
                obj.dateOfBirth = None
                obj.save()
                return obj.dateOfBirth
            obj.dateOfBirth = self.context['request'].data['dateOfBirth']
            obj.save()
            return obj.dateOfBirth
        # In other requests, do default behaviour
        dateOfBirth = obj.dateOfBirth
        if dateOfBirth is None:
            return None
        return datetime.datetime.strptime(str(dateOfBirth), '%Y-%m-%d').strftime('%b %d, %Y')

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
    endAccessDate = serializers.DateField(format='%b %d, %Y')
    class Meta:
        model = BulkStudentsCSV
        exclude = []

# Staff user serializer (not being used yet)
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
        return DOMAIN + 'api/tests/sections/' + str(obj.pk) + '/'

class TestSectionSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    class Meta:
        model = Section
        exclude = ['test']

    def get_questions(self, obj):
        return DOMAIN + 'api/tests/sections/questions/' + str(obj.pk) + '/'

class TestQuestionSerializer(serializers.ModelSerializer):
    questionDetail = serializers.SerializerMethodField()
    passage = serializers.SerializerMethodField()
    quesNumber = serializers.SerializerMethodField()
    class Meta:
        model = Question
        exclude = ['section', 'intAnswer']

    def get_questionDetail(self, obj):
        return DOMAIN + 'api/tests/sections/questions/detail/' + str(obj.pk) + '/'

    def get_passage(self, obj):
        if obj.passage and obj.questionType == 'passage':
            return DOMAIN + 'api/tests/sections/questions/passages/' + str(obj.passage.pk) + '/'
        return None

    def get_quesNumber(self, obj):
        return get_test_ques_number(obj)

class TestQuestionDetailsSerializer(serializers.ModelSerializer):
    section = serializers.SlugRelatedField(
        read_only=True,
        slug_field='title',
    )
    options = NestedOptionSerializer(many=True)
    passage = serializers.SerializerMethodField()
    quesNumber = serializers.SerializerMethodField()
    class Meta:
        model = Question
        exclude = []
    
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

class StudentTestResultSerializer(serializers.ModelSerializer):
    test = serializers.SerializerMethodField()
    percentage = serializers.FloatField(source='get_percentage')
    sectionalResult = serializers.SerializerMethodField()
    testAttemptDate = serializers.DateField(format='%b %d, %Y')
    class Meta:
        model = UserTestResult
        exclude = ['student', 'id']

    def get_sectionalResult(self, obj):
        return DOMAIN + 'api/results/students/{}/tests/{}/'.format(obj.student.id, obj.test.id)

    def get_test(self, obj):
        # Get test info details and append unit wise tests in
        # category if test belongs to both unit and subject
        testObjData = NestedTestSerializer(obj.test).data
        if testObjData['subject'] and testObjData['unit']:
            testObjData['category'].append('Unit Wise Tests')
            # show subject and unit in frontend only if showSubjUnit is True
            testObjData['showSubjUnit'] = True
        else:
            testObjData['subject'] = None
            testObjData['unit'] = None
            testObjData['showSubjUnit'] = False
        return testObjData

class StudentSectionResultSerializer(serializers.ModelSerializer):
    section = NestedSectionSerializer()
    percentage = serializers.FloatField(source='get_percentage')
    questionWiseResponse = serializers.SerializerMethodField()
    class Meta:
        model = UserSectionWiseResult
        exclude = ['id']

    def get_questionWiseResponse(self, obj):
        return DOMAIN + 'api/results/students/{}/tests/sections/{}/'.format(obj.student.id, obj.section.id)

class StudentQuestionResponseSerializer(serializers.ModelSerializer):
    userAnswers = serializers.SerializerMethodField()
    question = NestedQuestionSerializer()
    marksAwarded = serializers.SerializerMethodField()
    class Meta:
        model = UserQuestionWiseResponse
        exclude = ['id', 'userIntAnswer', 'userChoices', 'student']

    def get_userAnswers(self, obj):
        if obj.question.questionType == 'integer':
            return [str(obj.userIntAnswer)]
        return [choice.optionText for choice in obj.userChoices.all().order_by('pk')]

    def get_marksAwarded(self, obj):
        if obj.status == 'correct':
            return obj.question.marksPositive
        elif obj.status == 'incorrect':
            return (-1)*obj.question.marksNegative
        else:
            return 0

# Get result filtered by percentage for each centre
class CentreWiseResultSerializer(serializers.ModelSerializer):
    parts = serializers.SerializerMethodField()
    class Meta:
        model = Centre
        fields = ('location', 'parts')

    def get_parts(self, obj):
        # Get test result objs of this centre
        centre_id = obj.id
        testResultObjs = self.context['testResultObjs']
        testResultObjs = testResultObjs.filter(student__centre__id=centre_id)

        # Get percentage wise test attempts
        totalMarks = get_object_or_404(Test, pk=self.context['test_id']).totalMarks
        redAttempts = testResultObjs.filter(marksObtained__lt=(totalMarks/2)).count()
        yellowAttempts = testResultObjs.filter(marksObtained__gte=(totalMarks/2), marksObtained__lt=(totalMarks*(4/5))).count()
        greenAttempts = testResultObjs.filter(marksObtained__gte=(totalMarks*(4/5))).count()
        parts = [
            {'colour': 'red', 'representation': 'score < 50%', 'attempts': redAttempts, 'mark': redAttempts},
            {'colour': 'yellow', 'representation': '50% <= score < 80%', 'attempts': yellowAttempts,
             'mark': redAttempts + yellowAttempts},
            {'colour': 'green', 'representation': '80% <= score', 'attempts': greenAttempts,
             'mark': redAttempts + yellowAttempts + greenAttempts},
        ]
        return parts

class CentreSpecificStudentResultSerializer(serializers.ModelSerializer):
    student = NestedStudentSerializer()
    percentile = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()
    testAttemptDate = serializers.DateField(format='%b %d, %Y')
    sectionalResult = serializers.SerializerMethodField()
    percentage = serializers.FloatField(source='get_percentage')
    class Meta:
        model = UserTestResult
        exclude = ['id']

    def get_percentile(self, obj):
        context = self.context
        if context['centre_id'] == 0:
            return obj.get_percentile(startDate=context['start_date'], endDate=context['end_date'])
        return obj.get_percentile(startDate=context['start_date'], endDate=context['end_date'], centreID=context['centre_id'])

    def get_rank(self, obj):
        context = self.context
        if context['centre_id'] == 0:
            return obj.get_rank(startDate=context['start_date'], endDate=context['end_date'])
        return obj.get_rank(startDate=context['start_date'], endDate=context['end_date'], centreID=context['centre_id'])

    def get_sectionalResult(self, obj):
        return DOMAIN + 'api/results/students/{}/tests/{}/'.format(obj.student.id, obj.test.id)

class CoursePieChartSerializer(serializers.ModelSerializer):
    subjects = serializers.SerializerMethodField()
    class Meta:
        model = Course
        exclude = ['id', 'super_admin']

    def get_subjects(self, obj):
        course_subjs = []
        subjects = Subject.objects.filter(super_admin=obj.super_admin)
        for subj in subjects:
            if obj in subj.course.all():
                course_subjs.append(subj.title)
        return course_subjs

class CentrePieChartSerializer(serializers.ModelSerializer):
    students_number = serializers.SerializerMethodField()
    percentage_area = serializers.SerializerMethodField()
    class Meta:
        model = Centre
        exclude = ['id', 'super_admin']

    def get_students_number(self, obj):
        context = self.context
        studentObjs = Student.objects.filter(
            centre=obj, joiningDate__gte=context['start_date'], joiningDate__lte=context['end_date'])
        return studentObjs.count()

    def get_percentage_area(self, obj):
        context = self.context
        all_students = Student.objects.filter(
            centre__super_admin=obj.super_admin, joiningDate__gte=context['start_date'],
            joiningDate__lte=context['end_date']).count()
        centre_students = Student.objects.filter(
            centre=obj, joiningDate__gte=context['start_date'], joiningDate__lte=context['end_date']).count()
        return round((centre_students/all_students)*100, 2)

# -----------STUDENT VIEW SERIALIZERS-------------

# Being used in complete profile view
class StudentSerializer(serializers.ModelSerializer):
    endAccessDate = serializers.DateField(format='%b %d, %Y')
    joiningDate = serializers.DateField(format='%b %d, %Y')
    dateOfBirth = serializers.DateField(format='%b %d, %Y')
    course = NestedCourseSerializer(many=True)
    centre = serializers.SlugRelatedField(
        read_only=True,
        slug_field='location',
    )
    class Meta:
        model = Student
        exclude = ['user']

# For listing upcoming tests
class UpcomingTestsListSerializer(serializers.ModelSerializer):
    startTime = serializers.DateTimeField(format='%b %d, %Y (%H:%M)')
    endtime = serializers.DateTimeField(format='%b %d, %Y (%H:%M)')
    detail = serializers.SerializerMethodField()
    course = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='title',
    )
    class Meta:
        model = Test
        exclude = ['instructions', 'typeOfTest', 'doc', 'active', 'super_admin', 'subject', 'unit', 'category']

    def get_detail(self, obj):
        return DOMAIN + 'api/app/tests/' + str(obj.pk) + '/detail/'

# For listing Categories
class TestCategoriesListSerializer(serializers.ModelSerializer):
    tests = serializers.SerializerMethodField()
    class Meta:
        model = Category
        exclude = ['super_admin']

    def get_tests(self, obj):
        return DOMAIN + 'api/app/tests/practice/category/' + str(obj.pk) + '/'

# For listing practice tests
class PracticeTestsListSerializer(serializers.ModelSerializer):
    detail = serializers.SerializerMethodField()
    startTime = serializers.DateTimeField(format='%b %d, %Y (%H:%M)')
    endtime = serializers.DateTimeField(format='%b %d, %Y (%H:%M)')
    course = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='title',
    )
    attempted = serializers.SerializerMethodField()
    class Meta:
        model = Test
        exclude = ['typeOfTest', 'instructions', 'doc', 'active', 'super_admin', 'subject', 'unit', 'category']

    def get_detail(self, obj):
        return DOMAIN + 'api/app/tests/' + str(obj.pk) + '/detail/'

    def get_attempted(self, obj):
        studentObj = self.context['studentObj']
        result = UserTestResult.objects.filter(student=studentObj, test=obj)
        if len(result) == 0:
            return False
        return True

# For listing units of a particular subject
class SubjectListSerializer(serializers.ModelSerializer):
    units = serializers.SerializerMethodField()
    class Meta:
        model = Subject
        exclude = ['course', 'super_admin']

    def get_units(self, obj):
        return DOMAIN + 'api/app/units/' + str(obj.id) + '/'

# For lisitng tests of a particular unit
class UnitListSerializer(serializers.ModelSerializer):
    tests = serializers.SerializerMethodField()
    class Meta:
        model = Unit
        exclude = ['subject']

    def get_tests(self, obj):
        return DOMAIN + 'api/app/tests/practice/category/unitWise/' + str(obj.pk) + '/'