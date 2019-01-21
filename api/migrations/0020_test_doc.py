# Generated by Django 2.1.4 on 2019-01-18 09:36

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_passage_section'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='doc',
            field=models.FileField(blank=True, null=True, upload_to='docs/', validators=[django.core.validators.FileExtensionValidator(['doc', 'docx'])]),
        ),
    ]
