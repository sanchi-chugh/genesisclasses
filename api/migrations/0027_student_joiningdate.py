# Generated by Django 2.1.4 on 2019-02-15 06:56

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0026_usertestresult_testattemptdate'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='joiningDate',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
