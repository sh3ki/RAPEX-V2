from django.contrib import admin
from apps.products.models import Category, MerchandiseProduct, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'is_active', 'sort_order')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ('image', 'sort_order')


@admin.register(MerchandiseProduct)
class MerchandiseProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'merchant', 'category', 'price', 'stock', 'is_active', 'is_verified', 'is_archived', 'created_at')
    list_filter = ('is_active', 'is_verified', 'is_archived', 'category')
    search_fields = ('name', 'sku', 'merchant__business_name')
    inlines = [ProductImageInline]
    readonly_fields = ('created_at', 'updated_at')
