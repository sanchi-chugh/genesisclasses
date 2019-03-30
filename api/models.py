from django.db import models
from django.db.models import Count
from django.contrib.auth.models import AbstractUser, UserManager
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
    FileExtensionValidator,
)
import datetime

# -------------- Helper Functions ------------------
# If more than one correct ans, set ques type as mcq
def set_mcq_scq(questionObj):
    if questionObj.questionType not in ('mcq', 'scq'):
        return questionObj
    optionObjs = Option.objects.filter(question=questionObj)
    correctNum = 0
    for option in optionObjs:
        if option.correct:
            correctNum += 1
    if correctNum > 1:
        questionObj.questionType = 'mcq'
    return questionObj

# Set validity of a question
def set_validity_of_ques(questionObj):
    valid = True

    # mcq, scq and passage ques are valid iff they have at least one correct option
    options = Option.objects.filter(question=questionObj, correct=True)
    if len(options) == 0:
        valid = False

    # Passage question must have a passage
    if questionObj.questionType == 'passage' and not questionObj.passage:
        valid = False
    
    questionObj.valid = valid
    return questionObj

# See if the test can be active
def get_test_validity(testObj, active=False):
    # If test is already inactive, then no need to turn it to active mode
    if not active:
        return False

    # Not valid if the test does not have any sections
    sectionObjs = Section.objects.filter(test=testObj)
    if not sectionObjs.count():
        return False

    for section in sectionObjs:
        # Not valid if any section is empty
        questionObjs = Question.objects.filter(section=section)
        if not questionObjs.count():
            return False

        # Error if there is any invalid question in the test
        for ques in questionObjs:
            if not ques.valid:
                return False
    return True

# --------------------- MODELS ----------------------
class CustomUserManager(UserManager):
    def create_user(self, username, email, password=None):
        """
        Creates and saves a User.
        """
        user = self.model(
            username=username,
            email=email
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password):
        """
        Creates and saves a superuser.
        """
        user = self.create_user(
            username=username,
            email=email,
            password=password,
        )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class User(AbstractUser):
    TYPE_CHOICES = (
        ('staff', 'Staff'),
        ('student', 'Student'),
        ('superadmin', 'Super Admin')
    )

    objects = CustomUserManager()
    type_of_user = models.CharField(
        max_length=11,
        choices=TYPE_CHOICES,
        blank=False,
        null=False,
    )

# SuperAdmin - 1 for each institution
class SuperAdmin(models.Model):
    institution_name = models.CharField(max_length=200, blank=False, null=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
    )
    def __str__(self):
        return str(self.institution_name)

class Centre(models.Model):
    location = models.CharField(max_length=200)
    # super_admin is used to determine the institution
    super_admin = models.ForeignKey(
        SuperAdmin,
        on_delete=models.CASCADE,
    )
    def __str__(self):
        return self.super_admin.institution_name + " (" + self.location + ")"

# Course Model : Different Institutes may have different courses.
class Course(models.Model):
    title = models.CharField(max_length = 100)
    super_admin = models.ForeignKey(
        SuperAdmin,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.title + ' - ' + str(self.super_admin)

# Staff
class Staff(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=50)
    super_admin = models.ForeignKey(
        SuperAdmin,
        on_delete=models.CASCADE,
    )
    course = models.ManyToManyField(
        Course,
        blank=True,
    )
    centre = models.ForeignKey(
        Centre,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    def __str__(self):
        return self.name

# Students: Each student is associated to one centre & more than one courses
class Student(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
    )
    complete = models.BooleanField(default=False)   #Profile complete or not
    first_name = models.CharField(max_length=50, blank=False, null=True)
    last_name = models.CharField(max_length=50, blank=False, null=True)
    father_name = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pinCode = models.BigIntegerField(blank=True, null=True)
    gender = models.CharField(
        blank=True,
        null=True,
        max_length=7,
        choices = (('male', 'male'), ('female', 'female')),
    )
    dateOfBirth = models.DateField(blank=True, null=True)
    contact_number = models.BigIntegerField(blank=False, null=True)
    course = models.ManyToManyField(Course)
    image = models.ImageField(
        blank=True,
        null=True,
        upload_to='profileimgs/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
    )
    # Student under a super_admin = Student under the centre of a super_admin
    centre = models.ForeignKey(
        Centre,
        on_delete=models.CASCADE,
    )
    # Student will be able to access the app till end date only
    endAccessDate = models.DateField()
    # Student joining date
    joiningDate = models.DateField(default=timezone.now)

    def __str__(self):
        return str(self.first_name)

# BulkStudentsCSV: Contains initial information of the added bulk students
# This information is static. Changes to course, centre or endAccessDate
# done via edit student (in Student Model) will not be reflected here.
class BulkStudentsCSV(models.Model):
    csv_file = models.FileField(
        upload_to='studentCSVs/',
        validators=[FileExtensionValidator(['csv'])],
    )
    # Number of students created
    number = models.IntegerField()
    creationDateTime = models.DateTimeField(default=timezone.now)
    centre = models.ForeignKey(
        Centre,
        on_delete=models.CASCADE,
    )
    course = models.ManyToManyField(Course)
    # Bulk Students will be able to access the app till end date only
    endAccessDate = models.DateField()

    def __str__(self):
        return 'Created for ' + self.centre.location + ' at ' + str(self.creationDateTime)

# Categories : Each test will belong to a category OR a subj, unit and a category
class Category(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=False)
    image = models.ImageField(
        blank=True,
        null=True,
        upload_to='imgs/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
    )
    super_admin = models.ForeignKey(
        SuperAdmin,
        on_delete=models.CASCADE,
    )
    def __str__(self):
        return self.title + ' (' + self.super_admin.institution_name + ')'

# Subjects : Each institute, course will have its own subjects
# One subject can be associated to more than one course
class Subject(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=False)
    image = models.ImageField(
        blank=True,
        null=True,
        upload_to='imgs/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
    )
    course = models.ManyToManyField(Course)
    super_admin = models.ForeignKey(
        SuperAdmin,
        on_delete=models.CASCADE,
    )
    def __str__(self):
        return self.title + ' (' + self.super_admin.institution_name + ')'

# Unit : Each subject will have its units (if unit wise tests exist for that subject)
class Unit(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=False)
    image = models.ImageField(
        blank=True,
        null=True,
        upload_to='imgs/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='units',
    )
    def __str__(self):
        return self.title + ' (' + self.subject.title + ')'

# Test Model : Each test will correspond to a specific category 
# Each test will have atleast 1 section('Section 1' by default).
class Test(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    startTime = models.DateTimeField(default=timezone.now)
    endtime = models.DateTimeField(blank=True, null=True)
    typeOfTest = models.CharField(
        max_length = 8,
        choices = (('upcoming', 'upcoming'), ('practice', 'practice')),
    )
    duration = models.DurationField(blank=False, null=False, default=datetime.timedelta(hours=3))
    instructions = models.TextField(blank=True, null=True)
    totalMarks = models.FloatField(default=0.0, blank=True)
    totalQuestions = models.IntegerField(default=0, blank=True)
    # If unit, subject are defined then test will automatically be included
    # in unit wise category + categories added in many to many field
    category = models.ManyToManyField(Category)
    # If test belongs to a particular subject
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    # If test belongs to a particular unit of the subject
    unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    # This will define access of student to that test
    # Test is accessible only if test is within one of 
    # the courses for which student is enrolled
    course = models.ManyToManyField(Course)
    super_admin = models.ForeignKey(
        SuperAdmin,
        on_delete=models.CASCADE,
    )
    # If questions are to be parsed from the doc
    doc = models.FileField(
        blank=True,
        null=True,
        upload_to='docs/',
        validators=[FileExtensionValidator(['doc', 'docx'])],
    )
    # Test will be shown to students only if it is active
    # By default, test is inactive
    active = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.unit and not self.subject:
            self.subject = self.unit.subject
        super().save(*args, **kwargs)

    def __str__(self):
        if self.unit:
            return self.title + ' (' + self.unit.title + ')'
        elif self.subject:
            return self.title + ' (' + self.subject.title + ')'
        return self.title + ' (' + self.super_admin.institution_name + ')'

# SectionQuerySet : A query manager to Section Model
# Used for bulk deletion of Section model objs
class SectionQuerySet(models.QuerySet):

    def delete(self, *args, **kwargs):
        for sectionObj in self:
            # Auto arrange section number of all sections
            missingNum = sectionObj.sectionNumber
            nextSecObjs = Section.objects.filter(
                test=sectionObj.test, sectionNumber__gt=missingNum).order_by('sectionNumber')
            for secObj in nextSecObjs:
                secObj.sectionNumber = secObj.sectionNumber - 1
                secObj.save()
        super(SectionQuerySet, self).delete(*args, **kwargs)

        # Set test inactive if test has no sections left
        sectionObj.test.active = get_test_validity(sectionObj.test, sectionObj.test.active)
        sectionObj.test.save()

# Section Model : Each test will have one or more section
# section will contain questions.
class Section(models.Model):
    objects = SectionQuerySet.as_manager()
    title = models.CharField(max_length = 30)
    totalMarks = models.FloatField(default=0.0, blank=True)
    totalQuestions = models.IntegerField(default=0, blank=True)
    test = models.ForeignKey(
        Test,
        on_delete = models.CASCADE,
        related_name = 'sections',
    )
    sectionNumber = models.IntegerField(default=1)

    def save(self, *args, **kwargs):
        if self.pk:
            return super().save(*args, **kwargs)

        # Use default section number if test contains no sections
        testSectionObjs = Section.objects.filter(test=self.test)
        if len(testSectionObjs) == 0:
            super().save(*args, **kwargs)
            # Set test inactive if new section with no question added
            self.test.active = get_test_validity(self.test, self.test.active)
            self.test.save()
            return

        # Auto increment the section number before saving next section
        self.sectionNumber = testSectionObjs.order_by('-sectionNumber')[0].sectionNumber + 1
        super().save(*args, **kwargs)

        # Set test inactive if new section with no question added
        self.test.active = get_test_validity(self.test, self.test.active)
        self.test.save()

    def delete(self, *args, **kwargs):
        # Delete requested section
        missingNum = self.sectionNumber
        testObj = self.test
        super(Section, self).delete(*args,**kwargs)

        # Set test inactive if no section left in test
        testObj.active = get_test_validity(testObj, testObj.active)
        testObj.save()

        # Auto arrange section number of all sections after deleting a section
        nextSecObjs = Section.objects.filter(
            test=self.test, sectionNumber__gt=missingNum).order_by('sectionNumber')
        for secObj in nextSecObjs:
            secObj.sectionNumber = secObj.sectionNumber - 1
            secObj.save()

    def __str__(self):
        return self.title + ' (' + self.test.title + ')'

# Passage Model : Provides a unique id to every passage
class Passage(models.Model):
    paragraph = models.TextField()
    section = models.ForeignKey(
        Section,
        on_delete = models.CASCADE,
    )

    def __str__(self):
        return str(self.paragraph)[:50] + '.... (' + self.section.title + ')'

# QuestionQuerySet : A query manager to Question Model
# Used for bulk deletion of Question model objs
class QuestionQuerySet(models.QuerySet):

    def delete(self, *args, **kwargs):
        quesCount = 0
        quesMarks = 0
        for questionObj in self:
            quesCount += 1
            quesMarks += questionObj.marksPositive

            # Auto arrange ques number of all questions after deleting a ques
            missingNum = questionObj.quesNumber
            nextQuesObjs = Question.objects.filter(
                section=questionObj.section, quesNumber__gt=missingNum).order_by('quesNumber')
            for quesObj in nextQuesObjs:
                quesObj.quesNumber = quesObj.quesNumber - 1
                quesObj.save()

        # Set total marks and ques count in associated test and section obj
        testObj = questionObj.section.test
        testObj.totalMarks -= quesMarks
        testObj.totalQuestions -= quesCount
        testObj.save()
        sectionObj = questionObj.section
        sectionObj.totalMarks -= quesMarks
        sectionObj.totalQuestions -= quesCount
        sectionObj.save()
        super(QuestionQuerySet, self).delete(*args, **kwargs)

        # Set test inactive if section has no questions left
        testObj.active = get_test_validity(testObj, testObj.active)
        testObj.save()

# Test Question Model : Each Question will have maximum 6 options 
# with +ve & -ve marks along with a correct response and explanation(optional).
class Question(models.Model):
    objects = QuestionQuerySet.as_manager()
    section = models.ForeignKey(
        Section,
        on_delete = models.CASCADE,
        related_name = 'questions',
    )
    questionText = models.TextField(null=True, blank=True)
    questionType = models.CharField(
        max_length=10,
        choices=(('mcq', 'mcq'), ('scq', 'scq'), 
            ('integer', 'integer'), ('passage', 'passage')),
    )
    #For passage type questions only
    passage = models.ForeignKey(
        Passage,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    #For integer type questions only
    intAnswer = models.IntegerField(
        validators=[MaxValueValidator(9), MinValueValidator(0)],
        blank=True,
        null=True
    )
    explanation = models.TextField(blank=True, null=True)
    marksPositive = models.FloatField(default=4.0)
    marksNegative = models.FloatField(default=1.0)
    # Numbering done separately for every section
    quesNumber = models.IntegerField(default=1)
    # Checks validity of a question
    valid = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Maintain integrity of questions
        questionType = self.questionType
        if questionType == 'integer':
            self.passage = None
        elif questionType == 'passage':
            self.intAnswer = None
        elif questionType in ('mcq', 'scq'):
            self.passage = None
            self.intAnswer = None

        # Auto set mcq/scq to mcq if correct options > 1
        set_mcq_scq(self)

        if self.pk:
            return super().save(*args, **kwargs)

        # Return error if section of ques and passage are different
        if self.questionType == 'passage':
            if self.passage.section != self.section:
                raise ValidationError('Question section and passage section do not match.')

        # If object is created for the first time, increase question count
        # and total marks of the associated test and section
        testObj = self.section.test
        testObj.totalMarks += self.marksPositive
        testObj.totalQuestions += 1
        testObj.save()
        sectionObj = self.section
        sectionObj.totalMarks += self.marksPositive
        sectionObj.totalQuestions += 1
        sectionObj.save()

        # Use default ques number if section contains no question
        sectionQuesObjs = Question.objects.filter(section=self.section)
        if len(sectionQuesObjs) == 0:
            super().save(*args, **kwargs)
            # Set test inactive if new ques with no options added
            testObj.active = get_test_validity(testObj, testObj.active)
            testObj.save()
            return

        # Auto increment the question number before saving next question
        if self.questionType != 'passage':
            self.quesNumber = sectionQuesObjs.order_by('-quesNumber')[0].quesNumber + 1
        else:
            # Keep passage questions together
            passageQues = Question.objects.filter(section=self.section, passage=self.passage)
            if not passageQues:
                self.quesNumber = sectionQuesObjs.order_by('-quesNumber')[0].quesNumber + 1
                return super().save(*args, **kwargs)
            lastPassageQuesNum = passageQues.order_by('-quesNumber')[0].quesNumber
            nextQuesObjs = Question.objects.filter(
                section=self.section, quesNumber__gt=lastPassageQuesNum).order_by('quesNumber')
            for quesObj in nextQuesObjs:
                quesObj.quesNumber = quesObj.quesNumber + 1
                quesObj.save()
            self.quesNumber = lastPassageQuesNum + 1
        super().save(*args, **kwargs)

        # Set test inactive if new ques with no options added
        testObj.active = get_test_validity(testObj, testObj.active)
        testObj.save()

    def delete(self, *args, **kwargs):
        # Decrease question count and total marks of the 
        # associated test and section before deleting question
        testObj = self.section.test
        testObj.totalMarks -= self.marksPositive
        testObj.totalQuestions -= 1
        testObj.save()
        sectionObj = self.section
        sectionObj.totalMarks -= self.marksPositive
        sectionObj.totalQuestions -= 1
        sectionObj.save()

        # Delete requested question
        missingNum = self.quesNumber
        super(Question, self).delete(*args,**kwargs)

        # Set test inactive if section has no questions left
        testObj.active = get_test_validity(testObj, testObj.active)
        testObj.save()

        # Auto arrange ques number of all questions after deleting a ques
        nextQuesObjs = Question.objects.filter(
            section=self.section, quesNumber__gt=missingNum).order_by('quesNumber')
        for quesObj in nextQuesObjs:
            quesObj.quesNumber = quesObj.quesNumber - 1
            quesObj.save()

    def __str__(self):
        quesStr = str(self.questionText)[:20] + '.... '
        return quesStr + ' (' + self.section.title + ' - ' + self.section.test.title + ')'

# OptionQuerySet : A query manager to Option Model
# Used for bulk deletion of Option model objs
class OptionQuerySet(models.QuerySet):

    def delete(self, *args, **kwargs):
        questionObjs = set([option.question for option in self])
        super(OptionQuerySet, self).delete(*args, **kwargs)
        for questionObj in questionObjs:
            set_mcq_scq(questionObj).save()
            set_validity_of_ques(questionObj).save()

        # Set test inactive if ques becomes invalid
        testObj = questionObj.section.test
        testObj.active = get_test_validity(testObj, testObj.active)
        testObj.save()

# Every question (mcq, scq and passage) can have more than one option
class Option(models.Model):
    objects = OptionQuerySet.as_manager()
    optionText = models.TextField()
    correct = models.BooleanField(default=False)
    question = models.ForeignKey(
        Question,
        on_delete = models.CASCADE,
        related_name = 'options',
    )

    def save(self, *args, **kwargs):
        if self.question.questionType == 'integer':
            # Return error if option is added in integer type question
            raise ValidationError('Integer type questions do not require options.')
        elif self.question.questionType == 'passage' and self.correct == True:
            correctOptions = Option.objects.filter(question=self.question, correct=True)
            if self not in correctOptions and len(correctOptions):
                # Return error if more than one correct option is there in passage type question
                raise ValidationError('Passage type questions can\'t have more than one correct option.')

        super().save(*args, **kwargs)
        set_mcq_scq(self.question).save()
        set_validity_of_ques(self.question).save()

        # Set test inactive if ques becomes invalid
        testObj = self.question.section.test
        testObj.active = get_test_validity(testObj, testObj.active)
        testObj.save()

    def delete(self, *args, **kwargs):
        testObj = self.question.section.test
        super(Option, self).delete(*args, **kwargs)

        set_mcq_scq(self.question).save()
        set_validity_of_ques(self.question).save()

        # Set test inactive if ques becomes invalid
        testObj.active = get_test_validity(testObj, testObj.active)
        testObj.save()

    def __str__(self):
        return self.optionText + ' (' + str(self.question) + ')'

# Result of a particular student for a particular test
class UserTestResult(models.Model):
    test = models.ForeignKey(
        Test,
        on_delete = models.CASCADE,
    )
    student = models.ForeignKey(
        Student,
        on_delete = models.CASCADE,
    )
    marksObtained = models.FloatField(default=0.0)
    correct = models.IntegerField(default=0)    # Number of questions correctly answered
    unattempted = models.IntegerField(default=0)    # Number of questions unattempted
    incorrect = models.IntegerField(default=0)    # Number of questions incorrectly answered
    testAttemptDate = models.DateField(default=timezone.now)    # Date when student attempted this test

    # Find relative rank of the student in the specified time frame
    def get_rank(self, startDate=None, endDate=None, centreID=None, courseID=None):
		# Rank = (number of test results having marks greater than my result) + 1
        testResultsAhead = UserTestResult.objects.filter(test = self.test, marksObtained__gt=self.marksObtained)
        testResultsEqual = UserTestResult.objects.filter(test = self.test, marksObtained=self.marksObtained)
        if startDate:
            testResultsAhead = testResultsAhead.filter(testAttemptDate__gte=startDate)
            testResultsEqual = testResultsEqual.filter(testAttemptDate__gte=startDate)
        if endDate:
            testResultsAhead = testResultsAhead.filter(testAttemptDate__lte=endDate)
            testResultsEqual = testResultsEqual.filter(testAttemptDate__lte=endDate)
        if centreID:
            testResultsAhead = testResultsAhead.filter(student__centre__id=centreID)
            testResultsEqual = testResultsEqual.filter(student__centre__id=centreID)
        if courseID:
            testResultsAhead = testResultsAhead.filter(student__course__id=courseID)
            testResultsEqual = testResultsEqual.filter(student__course__id=courseID)
        aggregate = testResultsAhead.aggregate(rank=Count('marksObtained'))
        # If more than one person has the same rank, arrange them in increasing order of their username
        testResultsEqual = testResultsEqual.order_by('student__user__username')
        return aggregate['rank'] + list(testResultsEqual).index(self) + 1

    # Find relative percentile of the student in the specified time frame
    def get_percentile(self, startDate=None, endDate=None, centreID=None, courseID=None):
        # percentile = (number of test results behind me)/(total test results)*100
        testResultsBehind = UserTestResult.objects.filter(test=self.test, marksObtained__lt=self.marksObtained)
        totalResults = UserTestResult.objects.filter(test=self.test)
        if startDate:
            testResultsBehind = testResultsBehind.filter(testAttemptDate__gte=startDate)
            totalResults = totalResults.filter(testAttemptDate__gte=startDate)
        if endDate:
            testResultsBehind = testResultsBehind.filter(testAttemptDate__lte=endDate)
            totalResults = totalResults.filter(testAttemptDate__lte=endDate)
        if centreID:
            testResultsBehind = testResultsBehind.filter(student__centre__id=centreID)
            totalResults = totalResults.filter(student__centre__id=centreID)
        if courseID:
            testResultsBehind = testResultsBehind.filter(student__course__id=courseID)
            totalResults = totalResults.filter(student__course__id=courseID)
        testResultsBehind = testResultsBehind.count()
        totalResults = totalResults.count()
        percentile = (testResultsBehind/totalResults)*100
        return round(percentile, 2)

    # Find absolute percentage of the student's test result
    def get_percentage(self):
        # percentage = (getMyMarks/getTotalMarks)*100
        try:
            percentage = (self.marksObtained/self.test.totalMarks)*100
        except ZeroDivisionError:
            # If total marks are zero
            percentage = 100
        return round(percentage, 2)

    def __str__(self):
        return self.student.first_name + ' (' + self.student.user.username + ') - ' + self.test.title

# Result of a particular student for a particular section
class UserSectionWiseResult(models.Model):
    section = models.ForeignKey(
        Section,
        on_delete = models.CASCADE,
    )
    student = models.ForeignKey(
        Student,
        on_delete = models.CASCADE,
    )
    marksObtained = models.FloatField(default=0.0)
    correct = models.IntegerField(default=0)    # Number of questions correctly answered
    incorrect = models.IntegerField(default=0)    # Number of questions incorrectly answered
    unattempted = models.IntegerField(default=0)    # Number of questions not attempted by the user

    def get_percentage(self):
        # percentage = (getMyMarks/getTotalMarks)*100
        try:
            percentage = (self.marksObtained/self.section.totalMarks)*100
        except ZeroDivisionError:
            # If total marks are zero
            percentage = 100
        return round(percentage, 2)

    def __str__(self):
        student = self.student.first_name + ' (' + self.student.user.username + ')'
        section = self.section.title + ' (' + self.section.test.title + ')'
        return student + ' - ' + section

# Store response of each student for each question
class UserQuestionWiseResponse(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete = models.CASCADE,
    )
    student = models.ForeignKey(
        Student,
        on_delete = models.CASCADE,
    )
    # For integer type questions
    userIntAnswer = models.IntegerField(
        validators=[MaxValueValidator(9), MinValueValidator(0)],
        blank=True,
        null=True,
    )
    # For mcq, scq and passage type questions
    userChoices = models.ManyToManyField(
        Option,
        blank=True,
    )
    isMarkedForReview = models.BooleanField(default=False)
    status = models.CharField(
        max_length = 100,
        default='unattempted',
        choices=(('correct','correct'),('incorrect','incorrect'),('unattempted','unattempted')),
    )

    def save(self, *args, **kwargs):
        # Do not change anything if the object already exists
        if self.pk:
            return super().save(*args, **kwargs)

        # Take already existing section result obj or add a new one
        sectionResultObjs = UserSectionWiseResult.objects.filter(student=self.student, section=self.question.section)
        if len(sectionResultObjs) == 0:
            sectionResultObj = UserSectionWiseResult.objects.create(
                student=self.student,
                section=self.question.section,
            )
        else:
            sectionResultObj = sectionResultObjs[0]

        # Take already existing test result obj or add a new one
        testResultObjs = UserTestResult.objects.filter(student=self.student, test=self.question.section.test)
        if len(testResultObjs) == 0:
            testResultObj = UserTestResult.objects.create(
                student=self.student,
                test=self.question.section.test,
            )
        else:
            testResultObj = testResultObjs[0]

        # Change marks obtained and number of correct, incorrect and unattempted questions
        if self.status == 'incorrect':
            sectionResultObj.incorrect += 1
            sectionResultObj.marksObtained -= self.question.marksNegative
            testResultObj.incorrect += 1
            testResultObj.marksObtained -= self.question.marksNegative
        elif self.status == 'correct':
            sectionResultObj.correct += 1
            sectionResultObj.marksObtained += self.question.marksPositive
            testResultObj.correct += 1
            testResultObj.marksObtained += self.question.marksPositive
        else:
            sectionResultObj.unattempted += 1
            testResultObj.unattempted += 1

        sectionResultObj.save()
        testResultObj.save()

        return super().save(*args, **kwargs)

    def __str__(self):
        student = self.student.first_name + ' (' + self.student.user.username + ')'
        section = self.question.section.title + ' - ' + self.question.section.test.title
        return student + ' - ' + self.question.questionText[:20] + ' (' + section + ')'