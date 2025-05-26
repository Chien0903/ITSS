from rest_framework import serializers
from ..models.recipe import Recipe
from ..models.is_ingredient import IsIngredient
from .product_catalog_serializer import ProductCatalogSerializer
from ..models.product_catalog import ProductCatalog
import cloudinary.uploader

class IsIngredientSerializer(serializers.ModelSerializer):
    product = ProductCatalogSerializer(read_only=True) # To get product details

    class Meta:
        model = IsIngredient
        fields = ['product', 'quantity']


class RecipeSerializer(serializers.ModelSerializer):
    ingredient_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    isingredient_set = IsIngredientSerializer(many=True, read_only=True)

    # This field is for accepting the file upload from the frontend
    # It's 'write_only' because you don't read it back from the database
    image_upload = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Recipe
        # 'image' is read-only because it will be the URL stored in the model.
        # 'image_upload' is for receiving the file from the request.
        fields = ['recipeID', 'recipeName', 'description', 'instruction', 'isCustom', 'image', 'ingredient_ids', 'isingredient_set', 'image_upload']
        read_only_fields = ['recipeID', 'image'] # 'image' is set internally after Cloudinary upload

    def create(self, validated_data):
        ingredient_ids = validated_data.pop('ingredient_ids', [])
        image_file = validated_data.pop('image_upload', None) # Get the uploaded file

        if image_file:
            try:
                upload_result = cloudinary.uploader.upload(image_file)
                validated_data['image'] = upload_result['secure_url'] # Store the Cloudinary URL in the actual 'image' field
            except Exception as e:
                raise serializers.ValidationError(f"Cloudinary upload failed: {e}")
        else:
            validated_data['image'] = None # Ensure image is null if no file uploaded

        recipe = Recipe.objects.create(**validated_data)

        for product_id in ingredient_ids:
            # Ensure Product exists, handle gracefully if not
            try:
                product = ProductCatalog.objects.get(productID=product_id)
                IsIngredient.objects.create(recipe=recipe, product=product)
            except ProductCatalog.DoesNotExist:
                raise serializers.ValidationError(f"Product with ID {product_id} does not exist.")
        return recipe

    def update(self, instance, validated_data):
        ingredient_ids = validated_data.pop('ingredient_ids', None)
        image_file = validated_data.pop('image_upload', None) # Get the uploaded file

        if image_file:
            try:
                upload_result = cloudinary.uploader.upload(image_file)
                instance.image = upload_result['secure_url'] # Update with new Cloudinary URL
            except Exception as e:
                raise serializers.ValidationError(f"Cloudinary upload failed: {e}")
        elif 'image_upload' in validated_data and image_file is None:
            # This handles cases where the user explicitly removes the image
            instance.image = None


        # Update other fields
        instance.recipeName = validated_data.get('recipeName', instance.recipeName)
        instance.description = validated_data.get('description', instance.description)
        instance.instruction = validated_data.get('instruction', instance.instruction)
        instance.isCustom = validated_data.get('isCustom', instance.isCustom)
        # instance.image is already handled above

        instance.save()

        if ingredient_ids is not None:
            instance.isingredient_set.all().delete() # Clear existing
            for product_id in ingredient_ids:
                try:
                    product = ProductCatalog.objects.get(productID=product_id)
                    IsIngredient.objects.create(recipe=instance, product=product)
                except ProductCatalog.DoesNotExist:
                    raise serializers.ValidationError(f"Product with ID {product_id} does not exist for update.")
        return instance
    