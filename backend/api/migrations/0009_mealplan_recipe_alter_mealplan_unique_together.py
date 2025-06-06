# Generated by Django 5.2.1 on 2025-05-27 07:40

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_mealplan_created_at_mealplan_day_of_week_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='mealplan',
            name='recipe',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.recipe'),
        ),
        migrations.AlterUniqueTogether(
            name='mealplan',
            unique_together={('plan_name', 'day_of_week', 'mealType', 'group', 'start_date')},
        ),
    ]
