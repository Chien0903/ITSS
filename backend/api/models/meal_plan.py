from django.db import models
from .group import Group
from .user import User

class MealPlan(models.Model):
    planID = models.AutoField(primary_key=True)
    mealType = models.CharField(max_length=50)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.mealType} Plan for {self.group.groupName}'
