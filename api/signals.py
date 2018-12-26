from django.db.models.signals import post_save
from django.dispatch import receiver

from api.models import SuperAdmin, Staff, Student, User, Centre

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, **kwargs):
    profile = None
    if instance.type_of_user == 'superadmin':
        profile = SuperAdmin.objects.get_or_create(user=instance)
        if(profile[1]):
            profile[0].institution_name = instance.username
    elif instance.type_of_user == 'staff':
        # Set a default superadmin, so that creation of obj from django admin dashboard is possible
        super_admin = SuperAdmin.objects.all().order_by('pk')[0]
        profile = Staff.objects.get_or_create(user=instance, super_admin=super_admin)
        if(profile[1]):
            profile[0].name = instance.username
    elif instance.type_of_user == 'student':
        # Set a default centre, so that creation of obj from django admin dashboard is possible
        centre = Centre.objects.all().order_by('pk')[0]
        profile = Student.objects.get_or_create(user=instance, centre=centre)
        if(profile[1]):
            profile[0].first_name = instance.username
    else:
        pass
    if profile:
        profile[0].save()
