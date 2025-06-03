from rest_framework import serializers
from ..models.recipe import Recipe
from ..models.ingredient import Ingredient
from .product_catalog_serializer import ProductCatalogSerializer
from ..models.product_catalog import ProductCatalog
import cloudinary.uploader


class IngredientSerializer(serializers.ModelSerializer):
    pass

class RecipeSerializer(serializers.ModelSerializer):
    pass