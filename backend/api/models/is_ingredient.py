from django.db import models
from .product_catalog import ProductCatalog
from .recipe import Recipe

class IsIngredient(models.Model):
    product = models.ForeignKey(ProductCatalog, on_delete=models.CASCADE, null=True, blank=True)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    ingredientName = models.CharField(max_length=255, null=True, blank=True)  #CCustom ingredients

    class Meta:
        unique_together = ('recipe', 'product', 'ingredientName')  

    def __str__(self):
        if self.product:
            return f'{self.product.productName} in {self.recipe.recipeName}'
        return f'{self.ingredientName} (Custom) in {self.recipe.recipeName}'