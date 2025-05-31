from rest_framework import serializers
from ..models.recipe import Recipe
from ..models.is_ingredient import IsIngredient
from .product_catalog_serializer import ProductCatalogSerializer
from ..models.product_catalog import ProductCatalog
import cloudinary.uploader

class IsIngredientSerializer(serializers.ModelSerializer):
    product = ProductCatalogSerializer(read_only=True)  # To get product details

    class Meta:
        model = IsIngredient
        fields = ['product', 'quantity']

class IngredientDataSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(allow_null=True, required=False)
    ingredientName = serializers.CharField(allow_null=True, allow_blank=True, required=False)

class RecipeSerializer(serializers.ModelSerializer):
    ingredient_data = serializers.ListField(
        child=IngredientDataSerializer(), write_only=True, required=False
    )
    isingredient_set = IsIngredientSerializer(many=True, read_only=True)
    image_upload = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Recipe
        fields = ['recipeID', 'recipeName', 'description', 'instruction', 'isCustom', 'image', 'ingredient_data', 'isingredient_set', 'image_upload']
        read_only_fields = ['recipeID', 'image']

    def create(self, validated_data):
        ingredient_data = validated_data.pop('ingredient_data', [])
        image_file = validated_data.pop('image_upload', None)

        if image_file:
            try:
                upload_result = cloudinary.uploader.upload(image_file)
                validated_data['image'] = upload_result['secure_url']
            except Exception as e:
                raise serializers.ValidationError(f"Cloudinary upload failed: {e}")
        else:
            validated_data['image'] = None

        recipe = Recipe.objects.create(**validated_data)

        for item in ingredient_data:
            product_id = item.get('product_id')
            # ingredientName = item.get('ingredientName')  # Not used in IsIngredient model
            if product_id:  # Only create IsIngredient if product_id is provided
                try:
                    product = ProductCatalog.objects.get(productID=product_id)
                    IsIngredient.objects.create(recipe=recipe, product=product)
                except ProductCatalog.DoesNotExist:
                    raise serializers.ValidationError(f"Product with ID {product_id} does not exist.")
        
        return recipe

    def update(self, instance, validated_data):
        ingredient_data = validated_data.pop('ingredient_data', None)
        image_file = validated_data.pop('image_upload', None)

        if image_file:
            try:
                upload_result = cloudinary.uploader.upload(image_file)
                instance.image = upload_result['secure_url']
            except Exception as e:
                raise serializers.ValidationError(f"Cloudinary upload failed: {e}")
        elif 'image_upload' in validated_data and image_file is None:
            instance.image = None

        # Update other fields
        instance.recipeName = validated_data.get('recipeName', instance.recipeName)
        instance.description = validated_data.get('description', instance.description)
        instance.instruction = validated_data.get('instruction', instance.instruction)
        instance.isCustom = validated_data.get('isCustom', instance.isCustom)
        instance.save()

        if ingredient_data is not None:
            instance.isingredient_set.all().delete()  # Clear existing
            for item in ingredient_data:
                product_id = item.get('product_id')
                # ingredientName = item.get('ingredientName')  # Not used in IsIngredient model
                if product_id:
                    try:
                        product = ProductCatalog.objects.get(productID=product_id)
                        IsIngredient.objects.create(recipe=instance, product=product)
                    except ProductCatalog.DoesNotExist:
                        raise serializers.ValidationError(f"Product with ID {product_id} does not exist for update.")
        
        return instance