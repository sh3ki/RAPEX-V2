"""
Products Models
==============
Defines Category and MerchandiseProduct for merchant product listings.

Category:
  - Hierarchical product categories with icon and status flags.

MerchandiseProduct:
  - Complete product entity owned by a Merchant.
  - Supports up to 10 images, 1 optional video, optional description image.
  - Validation is handled at the serializer/service layer;
    file-path fields are plain CharField so we stay flexible with
    client-driven multi-file uploads.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------

class Category(models.Model):
    """
    Merchandise product category.
    Supports a single level of parent/child nesting.
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text='Lucide / React-icon name used in the frontend.',
    )
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='children',
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'category'
        ordering = ['sort_order', 'name']
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self) -> str:  # pragma: no cover
        return self.name


# ---------------------------------------------------------------------------
# Upload helpers
# ---------------------------------------------------------------------------

def _product_image_upload_path(instance, filename: str) -> str:
    from pathlib import Path
    ext = Path(filename).suffix.lower()
    return f"products/{instance.merchant_id}/images/{filename}"


def _product_video_upload_path(instance, filename: str) -> str:
    from pathlib import Path
    ext = Path(filename).suffix.lower()
    return f"products/{instance.merchant_id}/videos/{filename}"


def _product_desc_image_upload_path(instance, filename: str) -> str:
    from pathlib import Path
    ext = Path(filename).suffix.lower()
    return f"products/{instance.merchant_id}/desc_images/{filename}"


# ---------------------------------------------------------------------------
# ProductImage (child table – each row is one image)
# ---------------------------------------------------------------------------

class ProductImage(models.Model):
    """
    One product image row.  Each MerchandiseProduct has 3-10 ProductImage rows.
    Images must be 1:1 ratio, JPG/PNG, ≤ 2 MB.  Validation is enforced in
    the serializer / service layer.
    """

    product = models.ForeignKey(
        'MerchandiseProduct',
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to=_product_image_upload_path)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'product_image'
        ordering = ['sort_order', 'id']

    def __str__(self) -> str:  # pragma: no cover
        return f"Image #{self.sort_order} for product {self.product_id}"


# ---------------------------------------------------------------------------
# MerchandiseProduct
# ---------------------------------------------------------------------------

class MerchandiseProduct(models.Model):
    """
    Core product entity for a merchant's merchandise listing.

    File constraints (enforced in service/serializer):
      images  : 3-10 files, JPG/PNG, each ≤ 2 MB, 1:1 aspect ratio
      video   : optional, MP4, ≤ 30 MB, resolution ≤ 1280×1280, duration 10-60 s
      desc_img: optional; used INSTEAD of text description, JPG/PNG portrait 4:3
    """

    # ── Ownership ────────────────────────────────────────────────────────────
    merchant = models.ForeignKey(
        'merchants.Merchant',
        on_delete=models.CASCADE,
        related_name='merchandise_products',
    )

    # ── Video (optional) ─────────────────────────────────────────────────────
    video = models.FileField(
        upload_to=_product_video_upload_path,
        null=True,
        blank=True,
        help_text='MP4, ≤ 30 MB, ≤ 1280×1280, 10-60 s',
    )

    # ── Core info ────────────────────────────────────────────────────────────
    name = models.CharField(max_length=100)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
    )
    sku = models.CharField(max_length=100, blank=True, default='')

    # ── Description: exactly one of text OR image ─────────────────────────
    description_text = models.TextField(
        max_length=3000,
        blank=True,
        default='',
        help_text='Long-text description (max 3 000 chars).',
    )
    description_image = models.ImageField(
        upload_to=_product_desc_image_upload_path,
        null=True,
        blank=True,
        help_text='Portrait 4:3 JPG/PNG used instead of text description.',
    )

    # ── Pricing & stock ───────────────────────────────────────────────────
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    stock = models.PositiveIntegerField(default=0)

    # ── Lifecycle flags ───────────────────────────────────────────────────
    is_verified = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # ── Timestamps ────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'merchandise_product'
        ordering = ['-created_at']
        verbose_name = 'Merchandise Product'
        verbose_name_plural = 'Merchandise Products'

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.name} (Merchant #{self.merchant_id})"

    # ── Helpers ───────────────────────────────────────────────────────────

    @property
    def primary_image(self):
        """Return the first ProductImage or None."""
        return self.images.first()

    @property
    def image_count(self) -> int:
        return self.images.count()
