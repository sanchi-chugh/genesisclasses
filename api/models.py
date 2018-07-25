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
	institution_name = models.CharField(max_length=99, blank=False, null=False)
	user = models.OneToOneField(
		User,
		on_delete=models.CASCADE,
		blank=False,
		null=False
	)

	class Meta:
		def __str__(self):
			return self.institution_name

class Centre(models.Model):
	location = models.CharField(max_length=100)
	# super_admin is used to determine the institution
	super_admin = models.OneToOneField(
		SuperAdmin,
		on_delete=models.CASCADE,
		blank=False,
		null=False
	)
	class Meta:
		def __str__(self):
			return self.institution_name + " (" + self.location + ")"

# Admins and Students
class Profile(models.Model):
	user = models.OneToOneField(
		User, 
		on_delete=models.CASCADE,
		blank=False,
		null=False,
	)
	# super_admin is used to determine the institution
	super_admin = models.OneToOneField(
		SuperAdmin,
		on_delete=models.CASCADE,
		blank=False,
		null=False
	)
