# Generated by Django 2.1.4 on 2019-01-18 06:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_auto_20190117_1612'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='quesNumber',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]
