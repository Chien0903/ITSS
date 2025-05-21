from rest_framework import serializers
from ..models.meal_plan import MealPlan
from .have import Have
from .recipe import RecipeSerializer

class MealPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPlan
        fields = ['planID', 'mealType', 'groupID', 'userID']
        read_only_fields = ['planID']

class MealPlanDetailSerializer(serializers.ModelSerializer):
    recipes = serializers.SerializerMethodField()
    
    class Meta:
        model = MealPlan
        fields = ['planID', 'mealType', 'groupID', 'userID', 'recipes']
        read_only_fields = ['planID']
    
    def get_recipes(self, obj):
        have_relations = Have.objects.filter(planID=obj.planID)
        recipes = [relation.recipeID for relation in have_relations]
        return RecipeSerializer(recipes, many=True).data