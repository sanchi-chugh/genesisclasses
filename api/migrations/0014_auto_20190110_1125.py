# Generated by Django 2.1.4 on 2019-01-10 05:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_test_course'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='test',
            name='category',
        ),
        migrations.AddField(
            model_name='test',
            name='category',
            field=models.ManyToManyField(to='api.Category'),
        ),
    ]
