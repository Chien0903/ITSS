from django.db import models
from .categories import Categories

class ProductCatalog(models.Model):
    productID = models.AutoField(primary_key=True)
    productName = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    shelfLife = models.IntegerField()  # Shelf life in days
    isCustom = models.BooleanField(default=False)
    category = models.ForeignKey(Categories, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.productName
