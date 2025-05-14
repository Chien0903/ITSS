from django.db import models
from .fridge import Fridge
from .product_catalog import ProductCatalog

class AddToFridge(models.Model):
    fridge = models.ForeignKey(Fridge, on_delete=models.CASCADE)
    product = models.ForeignKey(ProductCatalog, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    dateAdded = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    expiredDate = models.DateField()

    class Meta:
        unique_together = ('fridge', 'product')

    def __str__(self):
        return f'{self.product.productName} in {self.fridge.fridgeName}'
