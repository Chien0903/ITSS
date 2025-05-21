from rest_framework import serializers
from ..models.group import Group

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['groupID', 'groupName', 'user']
        read_only_fields = ['groupID']

        