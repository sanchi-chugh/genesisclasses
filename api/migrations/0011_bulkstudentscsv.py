# Generated by Django 2.1.4 on 2019-01-07 04:47

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_auto_20190104_0925'),
    ]

    operations = [
        migrations.CreateModel(
            name='BulkStudentsCSV',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('csv_file', models.FileField(upload_to='studentCSVs/', validators=[django.core.validators.FileExtensionValidator(['csv'])])),
                ('creationDateTime', models.DateTimeField(default=django.utils.timezone.now)),
                ('centre', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.Centre')),
                ('course', models.ManyToManyField(to='api.Course')),
            ],
        ),
    ]
