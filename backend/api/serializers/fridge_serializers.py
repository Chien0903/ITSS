from rest_framework import serializers
from ..models.fridge import Fridge

class FridgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fridge
        fields = ['fridgeID', 'fridgeName']
        read_only_fields = ['fridgeID']
        