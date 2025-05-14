from django.db import models

class Fridge(models.Model):
    fridgeID = models.AutoField(primary_key=True)
    fridgeName = models.CharField(max_length=255)

    def __str__(self):
        return self.fridgeName
