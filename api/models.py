from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.utils import timezone
from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
    FileExtensionValidator,
)
import datetime

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
    father_name = models.CharField(max_length=50, blank=False, null=True)
    address = models.CharField(max_length=100, blank=False, null=True)
    city = models.CharField(max_length=100, blank=False, null=True)
    state = models.CharField(max_length=100, blank=False, null=True)
    pinCode = models.BigIntegerField(blank=False, null=True)
    gender = models.CharField(
        max_length = 7,
        choices = (('male', 'male'), ('female', 'female')),
    )
    dateOfBirth = models.DateField(blank=False, null=True)
    contact_number = models.BigIntegerField(blank=False, null=True)
    course = models.ManyToManyField(Course)
    image = models.ImageField(
        blank=False,
        null=True,
        upload_to = 'profileimgs/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
    )
    centre = models.ForeignKey(
        Centre,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return str(self.first_name)

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
    # In case of upcoming test, start time and end time is compulsory
    startTime = models.DateTimeField(default = timezone.now)
    endtime = models.DateTimeField(blank=True, null=True)
    typeOfTest = models.CharField(
        max_length = 8,
        choices = (('upcoming', 'upcoming'), ('practice', 'practice')),
    )
    duration = models.DurationField(blank=False, null=False, default=datetime.timedelta(hours=3))
    instructions = models.TextField(blank=True, null=True)
    totalMarks = models.FloatField(default=0.0, blank=True)
    totalQuestions = models.IntegerField(default=0, blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
    )
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

    def save(self, *args, **kwargs):
        if self.unit and not self.subject:
            self.subject = self.unit.subject
        super().save(*args, **kwargs)

    def __str__(self):
        if self.unit:
            return self.title + ' (' + self.unit.title + ')'
        elif self.subject:
            return self.title + ' (' + self.subject.title + ')'
        return self.title + ' (' + self.category.title + ')'

# Section Model : Each test will have one or more section
# section will contain questions.
class Section(models.Model):
    title = models.CharField(max_length = 30)
    totalMarks = models.FloatField(default=0.0, blank=True)
    totalQuestions = models.IntegerField(default=0, blank=True)
    test = models.ForeignKey(
        Test,
        on_delete = models.CASCADE,
        related_name = 'sections',
    )

    def __str__(self):
        return self.title + ' (' + self.test.title + ')'


# Test Question Model : Each Question will have maximum 6 options 
# with +ve & -ve marks along with a correct response and explanation(optional).
class Question(models.Model):
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
    passage = models.TextField(blank=True, null=True)   #For passage type questions only
    intAnswer = models.IntegerField(     #For integer type questions only
        validators=[MaxValueValidator(9), MinValueValidator(0)],
        blank=True,
        null=True
    )
    explanation = models.TextField(blank=True, null=True)
    marksPostive = models.FloatField(default=4.0)
    marksNegative = models.FloatField(default=1.0)

    # Increase/decrease question count and total marks of 
    # respective test and respective section on adding/deleting question
    def save(self, *args, **kwargs):
        testObj = self.section.test
        testObj.totalMarks += self.marksPostive
        testObj.totalQuestions += 1
        testObj.save()
        sectionObj = self.section
        sectionObj.totalMarks += self.marksPostive
        sectionObj.totalQuestions += 1
        sectionObj.save()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        testObj = self.section.test
        testObj.totalMarks -= self.marksPostive
        testObj.totalQuestions -= 1
        testObj.save()
        sectionObj = self.section
        sectionObj.totalMarks -= self.marksPostive
        sectionObj.totalQuestions -= 1
        sectionObj.save()
        return super(Question, self).delete(*args,**kwargs)

    def __str__(self):
        return self.questionText + ' (' + self.section.title + ')'

# Every question (mcq, scq and passage) can have more than one option
class Option(models.Model):
    optionText = models.TextField()
    correct = models.BooleanField(default=False)
    question = models.ForeignKey(
        Question,
        on_delete = models.CASCADE,
        related_name = 'options',
    )

    def __str__(self):
        return self.optionText + '(' + str(self.question) + ')'

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

    def get_rank(self):
		# Rank of a student = (number of users having marks greater than this user) + 1
        aggregate = TestResult.objects.filter(test = self.test, marksObtained__gt=self.marksObtained).aggregate(rank=Count('marksObtained'))
        return aggregate['rank'] + 1

    def get_percentile(self):
        # percentile = (getMyMarks/getTopperMarks)*100
        topperMarks = TestResult.objects.filter(test = self.test).order_by('-marksObtained').first().marksObtained
        try:
            percentile = (self.marksObtained/topperMarks)*100
        except ZeroDivisionError:
            percentile = 0
        return percentile

    def __str__(self):
        return self.user + ' - ' + self.test

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

    def __str__(self):
        return self.user + ' - ' + self.section + ' - ' + self.section.test

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
    # For mcq and scq questions
    userChoices = models.ManyToManyField(Option)
    isMarkedForReview = models.BooleanField(default=False)
    status = models.CharField(
        max_length = 100,
        default='unattempted',
        choices=(('correct','correct'),('incorrect','incorrect'),('unattempted','unattempted')),
    )

    def __str__(self):
        return self.user + ' - ' + self.question + ' - ' + self.question.section.test