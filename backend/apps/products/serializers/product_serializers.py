"""
Product Serializers
===================
Handles validation for:
  - Category (read)
  - MerchandiseProduct (create / update)
  - ProductImage (nested)

Validation rules mirrored from product spec:
  images        : 3-10 files, each JPG/PNG ≤ 2 MB, will validate 1:1 ratio in service
  video         : optional MP4 ≤ 30 MB
  description   : either description_text (≤ 3000 chars) OR description_image (JPG/PNG)
  price         : ≥ 0
  name          : ≤ 100 chars
"""

from rest_framework import serializers
from apps.products.models import Category, MerchandiseProduct, ProductImage

ALLOWED_IMAGE_TYPES = ('image/jpeg', 'image/png')
ALLOWED_IMAGE_EXTS = ('.jpg', '.jpeg', '.png')
MAX_IMAGE_SIZE = 2 * 1024 * 1024        # 2 MB
MAX_VIDEO_SIZE = 30 * 1024 * 1024       # 30 MB
ALLOWED_VIDEO_TYPES = ('video/mp4',)
ALLOWED_VIDEO_EXTS = ('.mp4',)


# ── Category ─────────────────────────────────────────────────────────────────


class CategorySerializer(serializers.ModelSerializer):
    """Read-only serializer for category dropdown population."""

    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'icon', 'parent', 'children', 'sort_order')

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []


# ── ProductImage ──────────────────────────────────────────────────────────────


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'sort_order')


# ── MerchandiseProduct ────────────────────────────────────────────────────────


class MerchandiseProductSerializer(serializers.ModelSerializer):
    """
    Read serializer that includes nested images and category name.
    """
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image_url = serializers.SerializerMethodField()

    class Meta:
        model = MerchandiseProduct
        fields = (
            'id', 'merchant', 'name', 'category', 'category_name',
            'sku', 'description_text', 'description_image',
            'price', 'stock',
            'is_verified', 'is_archived', 'is_active',
            'video', 'images', 'primary_image_url',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'merchant', 'is_verified', 'created_at', 'updated_at')

    def get_primary_image_url(self, obj):
        img = obj.primary_image
        if img and img.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(img.image.url)
        return None


class MerchandiseProductCreateSerializer(serializers.Serializer):
    """
    Write serializer for product creation via multipart/form-data.
    Images are received as a list of uploaded files.
    """

    # Core text fields
    name = serializers.CharField(max_length=100)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.filter(is_active=True))
    sku = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    stock = serializers.IntegerField(min_value=0, default=0)

    # Description: one of text OR image
    description_text = serializers.CharField(max_length=3000, required=False, allow_blank=True, default='')
    description_image = serializers.ImageField(required=False, allow_null=True)

    # Video
    video = serializers.FileField(required=False, allow_null=True)

    def validate_video(self, value):
        if value is None:
            return value
        # Extension check
        import os
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ALLOWED_VIDEO_EXTS:
            raise serializers.ValidationError("Video must be in MP4 format.")
        # Size check
        if value.size > MAX_VIDEO_SIZE:
            raise serializers.ValidationError("Video must not exceed 30 MB.")
        return value

    def validate_description_image(self, value):
        if value is None:
            return value
        import os
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ALLOWED_IMAGE_EXTS:
            raise serializers.ValidationError("Description image must be JPG or PNG.")
        return value

    def validate(self, data):
        desc_text = data.get('description_text', '').strip()
        desc_image = data.get('description_image')
        if desc_text and desc_image:
            raise serializers.ValidationError(
                "Provide either a description text OR a description image, not both."
            )
        return data
