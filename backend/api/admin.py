from django.contrib import admin
from .models.user import User
from .models.group import Group
from .models.fridge import Fridge
from .models.categories import Categories
from .models.product_catalog import ProductCatalog
from .models.shopping_list import ShoppingList
from .models.add_to_list import AddToList
from .models.recipe import Recipe
from .models.is_ingredient import IsIngredient
from .models.add_to_fridge import AddToFridge
from .models.meal_plan import MealPlan
from .models.have import Have
from .models.in_model import In
from .models.cart import Cart, CartItem


# Đăng ký User model
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'username', 'name', 'role')
    search_fields = ('email', 'name', 'username')

# Đăng ký Group model
@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('groupID', 'groupName', 'createdBy', 'createdAt')
    search_fields = ('groupName',)
    list_filter = ('createdAt',)

# Đăng ký Fridge model
@admin.register(Fridge)
class FridgeAdmin(admin.ModelAdmin):
    list_display = ('fridgeID', 'fridgeName')
    search_fields = ('fridgeName',)

# Đăng ký Categories model
@admin.register(Categories)
class CategoriesAdmin(admin.ModelAdmin):
    list_display = ('categoryID', 'categoryName')
    search_fields = ('categoryName',)

# Đăng ký ProductCatalog model
@admin.register(ProductCatalog)
class ProductCatalogAdmin(admin.ModelAdmin):
    list_display = ('productID', 'productName', 'price', 'unit', 'shelfLife', 'isCustom', 'category')
    search_fields = ('productName',)
    list_filter = ('category', 'isCustom')

# Đăng ký ShoppingList model
@admin.register(ShoppingList)
class ShoppingListAdmin(admin.ModelAdmin):
    list_display = ('listID', 'listName', 'createdAt', 'type', 'group', 'user')
    search_fields = ('listName', 'type')
    list_filter = ('type',)

# Đăng ký AddToList model
@admin.register(AddToList)
class AddToListAdmin(admin.ModelAdmin):
    list_display = ('list', 'product', 'quantity', 'status')
    list_filter = ('status',)

# Đăng ký Recipe model
@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('recipeID', 'recipeName', 'isCustom')
    search_fields = ('recipeName',)

# Đăng ký IsIngredient model
@admin.register(IsIngredient)
class IsIngredientAdmin(admin.ModelAdmin):
    list_display = ('product', 'recipe')

# Đăng ký AddToFridge model
@admin.register(AddToFridge)
class AddToFridgeAdmin(admin.ModelAdmin):
    list_display = ('fridge', 'product', 'quantity', 'dateAdded', 'expiredDate', 'location')
    list_filter = ('fridge',)

# Đăng ký MealPlan model
@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = ('planID', 'mealType', 'group', 'user')
    search_fields = ('mealType',)

# Đăng ký Have model
@admin.register(Have)
class HaveAdmin(admin.ModelAdmin):
    list_display = ('plan', 'recipe')

# Đăng ký In model
@admin.register(In)
class InAdmin(admin.ModelAdmin):
    list_display = ('user', 'group')

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('product', 'quantity')

class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_checked_out', 'created_at', 'updated_at')
    list_filter = ('is_checked_out', 'created_at')
    search_fields = ('user__username',)
    inlines = [CartItemInline]
    readonly_fields = ('created_at', 'updated_at')

admin.site.register(Cart, CartAdmin)
