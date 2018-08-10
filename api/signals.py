from django.db.models.signals import post_save
from django.dispatch import receiver

from api.models import SuperAdmin, Staff, Student, User

print("klsdjfkljskdlfjklsdjfklsdjf")

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, **kwargs):
    profile = None
    if instance.type_of_user == 'superadmin':
        profile = SuperAdmin.objects.get_or_create(user=instance)
        if(profile[1]):
            profile[0].institution_name = instance.username
    elif instance.type_of_user == 'staff':
        profile = Staff.objects.get_or_create(user=instance)
        if(profile[1]):
            profile[0].name = instance.username
    elif instance.type_of_user == 'student':
        profile = Student.objects.get_or_create(user=instance)
        if(profile[1]):
            profile[0].first_name = instance.username
    else:
        pass
    if profile:
        profile[0].save()
