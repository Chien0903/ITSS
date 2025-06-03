from django.db import models
from .product_catalog import ProductCatalog
from .recipe import Recipe

#IsIngredient hong roi ma tao d xoa tren database dc nen lam tam
class Ingredient(models.Model):
    product = models.ForeignKey(ProductCatalog, on_delete=models.CASCADE, null=True, blank=True)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('recipe', 'product')  

    def __str__(self):
        return f'{self.product.productName} in {self.recipe.recipeName}'