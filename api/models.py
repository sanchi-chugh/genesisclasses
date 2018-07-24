from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
	pass

# SuperAdmin
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
	TYPE_CHOICES = (
		('staff', 'Staff'),
		('student', 'Student'),
	)
	user = models.OneToOneField(
		User, 
		on_delete=models.CASCADE,
		blank=False,
		null=False,
	)
	type_of_user = models.CharField(
		max_length=11,
		choices=TYPE_CHOICES,
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
