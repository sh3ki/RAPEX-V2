"""
Product Service
===============
Business logic for creating and managing merchandise products.

Responsibilities:
  - Validate and persist MerchandiseProduct + ProductImage rows
  - Enforce image count (3-10), size, and type constraints
  - Enforce video constraints (size, format)
  - Atomic transactions for product + image creation
"""

import os
from django.db import transaction
from apps.products.models import MerchandiseProduct, ProductImage

ALLOWED_IMAGE_EXTS = {'.jpg', '.jpeg', '.png'}
ALLOWED_VIDEO_EXTS = {'.mp4'}
MAX_IMAGE_SIZE = 2 * 1024 * 1024     # 2 MB
MAX_VIDEO_SIZE = 30 * 1024 * 1024    # 30 MB
MIN_IMAGES = 3
MAX_IMAGES = 10


class ProductService:
    """
    Stateless service class that handles all product-related business operations.
    All public methods are classmethods — no instantiation needed.
    """

    # ── Validation helpers ────────────────────────────────────────────────

    @classmethod
    def validate_images(cls, images: list) -> None:
        """
        Validate a list of uploaded image files.
        Raises ValueError if any constraint is violated.
        """
        count = len(images)
        if count < MIN_IMAGES:
            raise ValueError(f"A minimum of {MIN_IMAGES} images is required.")
        if count > MAX_IMAGES:
            raise ValueError(f"A maximum of {MAX_IMAGES} images is allowed.")

        for i, img in enumerate(images, start=1):
            ext = os.path.splitext(img.name)[1].lower()
            if ext not in ALLOWED_IMAGE_EXTS:
                raise ValueError(f"Image {i}: only JPG and PNG formats are allowed.")
            if img.size > MAX_IMAGE_SIZE:
                raise ValueError(f"Image {i}: file size must not exceed 2 MB.")

    @classmethod
    def validate_video(cls, video) -> None:
        """Validate optional video file. Raises ValueError on violation."""
        if video is None:
            return
        ext = os.path.splitext(video.name)[1].lower()
        if ext not in ALLOWED_VIDEO_EXTS:
            raise ValueError("Video must be in MP4 format.")
        if video.size > MAX_VIDEO_SIZE:
            raise ValueError("Video must not exceed 30 MB.")

    # ── Core CRUD ─────────────────────────────────────────────────────────

    @classmethod
    @transaction.atomic
    def create_product(cls, merchant, validated_data: dict, images: list, video=None) -> MerchandiseProduct:
        """
        Create a MerchandiseProduct and its related ProductImage rows atomically.

        Args:
            merchant     : Merchant instance (authenticated user).
            validated_data: Cleaned data from MerchandiseProductCreateSerializer.
            images       : List of InMemoryUploadedFile objects (3-10).
            video        : Optional InMemoryUploadedFile for video.

        Returns:
            The newly created MerchandiseProduct instance.

        Raises:
            ValueError: On any business rule violation.
        """
        # ── Validate files ────────────────────────────────────────────────
        cls.validate_images(images)
        cls.validate_video(video)

        # ── Create product ────────────────────────────────────────────────
        product = MerchandiseProduct.objects.create(
            merchant=merchant,
            name=validated_data['name'],
            category=validated_data['category'],
            sku=validated_data.get('sku', ''),
            description_text=validated_data.get('description_text', ''),
            description_image=validated_data.get('description_image'),
            price=validated_data['price'],
            stock=validated_data.get('stock', 0),
            video=video,
            is_active=True,
            is_verified=False,
            is_archived=False,
        )

        # ── Create image rows ─────────────────────────────────────────────
        image_objects = [
            ProductImage(product=product, image=img, sort_order=idx)
            for idx, img in enumerate(images)
        ]
        ProductImage.objects.bulk_create(image_objects)

        return product

    @classmethod
    def get_merchant_products(cls, merchant, include_archived: bool = False):
        """Return all active products for a given merchant."""
        qs = MerchandiseProduct.objects.filter(merchant=merchant).select_related('category').prefetch_related('images')
        if not include_archived:
            qs = qs.filter(is_archived=False)
        return qs
