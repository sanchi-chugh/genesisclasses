from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager

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
    institution_name = models.CharField(max_length=99, blank=False, null=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        blank=False,
        null=False
    )
    def __str__(self):
        return str(self.institution_name)

class Centre(models.Model):
    location = models.CharField(max_length=100)
    # super_admin is used to determine the institution
    super_admin = models.ForeignKey(
        SuperAdmin,
        on_delete=models.CASCADE,
        blank=False,
        null=False
    )
    def __str__(self):
        return self.super_admin.institution_name + " (" + self.location + ")"

# Course Model : Different Institutes may have different courses.
class Course(models.Model):
    title = models.CharField(max_length = 100)
    centre = models.ManyToManyField(Centre)

    def __str__(self):
        centre = Centre.objects.get(id = self.id)
        return self.title + ' - ' + str(centre)

# Staff
class Staff(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        blank=False,
        null=True,
    )
    name = models.CharField(max_length=50)
    super_admin = models.ForeignKey(
        SuperAdmin,
        on_delete=models.CASCADE,
        blank=False,
        null=True
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        blank=False,
        null=True
    )
    centre = models.ForeignKey(
        Centre,
        on_delete=models.CASCADE,
        blank=False,
        null=True
    )
    def __str__(self):
        return str(self.name)

# Test Model : Each test will correspond to a specific course and each test will have atleast 1 section('Section 1' by default).
class Test(models.Model):
    title = models.CharField(max_length=30)
    course = models.ForeignKey(
        Course,
        on_delete = models.CASCADE,
        related_name = "tests"
        )
    description = models.TextField(blank=True)
    # TODO: total marks will be calculated dynamically based on marks of each question.
    # TODO: total duration will be calculated dynamically based on duration of each section.

    def __str__(self):
        return self.title + '(' + self.course.title + ')'

# Section Model : Each section will contain questions along with its duration.
class Section(models.Model):
    title = models.CharField(max_length = 30)
    test = models.ForeignKey(
        Test,
        on_delete = models.CASCADE,
        related_name = 'sections')
    duration = models.FloatField(null = True, blank = True)

    def __str__(self):
        return self.title + '(' + self.test.title + ')'


#Test Question Model : Each Question will have maximum 6 options with +ve & -ve marks along with a correct response and explanation(optional).
class TestQuestion(models.Model):
    section = models.ForeignKey(
        Section,
        on_delete = models.CASCADE,
        related_name = 'sections')
    question = models.TextField( null = True, blank = True)
    explanation = models.TextField( blank = True, null = True)
    correctAnswer = models.TextField( null = True, blank = True)
    marksPostive = models.FloatField(default = 4.0)
    marksNegative = models.FloatField(default = 1.0)

    def __str__(self):
        return self.question + '(' + self.section.title + ')'

class Option(models.Model):
    title = models.TextField()
    test = models.ForeignKey(
        Test,
        on_delete = models.CASCADE,
        related_name = "options"
        )

    def __str__(self):
        return self.title + '(' + self.test.title + ')'

# Students
class Student(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        blank=False,
        null=False
    )
    complete = models.BooleanField(default=False)
    # super_admin is used to determine the institution
    first_name = models.CharField(max_length=50, blank=False, null=True)
    last_name = models.CharField(max_length=50, blank=False, null=True)
    father_name = models.CharField(max_length=50, blank=False, null=True)
    contact_number = models.IntegerField(blank=False, null=True)
    email = models.EmailField(blank=False, null=True)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        blank=False,
        null=True
    )
    image = models.ImageField(
        upload_to = 'profileimgs/',
        blank=False,
        null=True
    )
    super_admin = models.ForeignKey(
        SuperAdmin,
        on_delete=models.CASCADE,
        blank=False,
        null=True
    )
    centre = models.ForeignKey(
        Centre,
        on_delete=models.CASCADE,
        blank=False,
        null=True
    )
    def __str__(self):
        return str(self.first_name)
