# Generated by Django 2.1 on 2019-01-03 14:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_auto_20181229_0620'),
    ]

    operations = [
        migrations.AlterField(
            model_name='unit',
            name='subject',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='units', to='api.Subject'),
        ),
    ]
