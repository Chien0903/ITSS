# Generated by Django 5.2.1 on 2025-05-25 06:54

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_productcatalog_original_price'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='fridge',
            name='fridgeName',
        ),
        migrations.AddField(
            model_name='fridge',
            name='group',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='fridge', to='api.group'),
        ),
        migrations.AlterField(
            model_name='addtofridge',
            name='location',
            field=models.CharField(choices=[('cool', 'Ngăn lạnh'), ('freeze', 'Ngăn đông')], default='cool', max_length=10),
        ),
    ]
