from rest_framework import serializers
from ..models.recipe import Recipe
from ..models.is_ingredient import IsIngredient
from .product_catalog import ProductCatalogSerializer


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['recipeID', 'recipeName', 'description', 'instruction', 'isCustom']
        read_only_fields = ['recipeID']

class RecipeDetailSerializer(serializers.ModelSerializer):
    ingredients = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = ['recipeID', 'recipeName', 'description', 'instruction', 'isCustom', 'ingredients']
        read_only_fields = ['recipeID']
    
    def get_ingredients(self, obj):
        ingredient_relations = IsIngredient.objects.filter(recipeID=obj.recipeID)
        products = [relation.productID for relation in ingredient_relations]
        return ProductCatalogSerializer(products, many=True).data

class IsIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = IsIngredient
        fields = ['productID', 'recipeID']
