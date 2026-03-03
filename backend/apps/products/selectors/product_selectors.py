"""
Product Selectors
=================
All database access logic for merchandise products lives here.
Views and services call selectors — they never build querysets themselves.

Follows RAPEX blueprint:
  Selectors = database access logic (no business logic)
"""

from django.db.models import QuerySet, Q
from apps.products.models import MerchandiseProduct


class ProductSelector:
    """
    Centralised queryset factory for MerchandiseProduct.
    Every method returns a queryset that callers can further chain.
    """

    # ── Base querysets ────────────────────────────────────────────────────

    @staticmethod
    def for_merchant(merchant) -> QuerySet:
        """All products that belong to this merchant (no status filter)."""
        return (
            MerchandiseProduct.objects
            .filter(merchant=merchant)
            .select_related('category')
            .prefetch_related('images')
        )

    # ── Filtering helpers ─────────────────────────────────────────────────

    @staticmethod
    def apply_search(qs: QuerySet, query: str) -> QuerySet:
        """Full-text search on name and SKU (case-insensitive)."""
        if not query:
            return qs
        q = query.strip()
        return qs.filter(Q(name__icontains=q) | Q(sku__icontains=q))

    @staticmethod
    def apply_category_filter(qs: QuerySet, category_id: str | None) -> QuerySet:
        if not category_id:
            return qs
        try:
            return qs.filter(category_id=int(category_id))
        except (ValueError, TypeError):
            return qs

    @staticmethod
    def apply_status_filter(qs: QuerySet, status: str | None) -> QuerySet:
        """
        status values:
          'active'   → is_active=True,  is_archived=False
          'inactive' → is_active=False, is_archived=False
          'archived' → is_archived=True
          'all'      → no filter (show everything)
        """
        if status == 'active':
            return qs.filter(is_active=True, is_archived=False)
        if status == 'inactive':
            return qs.filter(is_active=False, is_archived=False)
        if status == 'archived':
            return qs.filter(is_archived=True)
        # 'all' or None → no filter
        return qs

    @staticmethod
    def apply_stock_filter(qs: QuerySet, stock: str | None) -> QuerySet:
        """
        stock values:
          'empty'    → stock == 0
          'in_stock' → stock > 0
          None / ''  → no filter
        """
        if stock == 'empty':
            return qs.filter(stock=0)
        if stock == 'in_stock':
            return qs.filter(stock__gt=0)
        return qs

    @staticmethod
    def apply_verified_filter(qs: QuerySet, verified: str | None) -> QuerySet:
        if verified == 'verified':
            return qs.filter(is_verified=True)
        if verified == 'unverified':
            return qs.filter(is_verified=False)
        return qs

    @staticmethod
    def apply_ordering(qs: QuerySet, order_by: str | None) -> QuerySet:
        ALLOWED = {
            'name': 'name',
            '-name': '-name',
            'price': 'price',
            '-price': '-price',
            'stock': 'stock',
            '-stock': '-stock',
            'created_at': 'created_at',
            '-created_at': '-created_at',
        }
        field = ALLOWED.get(order_by, '-created_at')
        return qs.order_by(field)

    # ── Composite: build full filtered queryset from request params ────────

    @classmethod
    def build_filtered_qs(cls, merchant, params: dict) -> QuerySet:
        """
        Applies all filters in one call.
        Expected param keys: search, category, status, stock, verified, order_by.
        """
        qs = cls.for_merchant(merchant)
        qs = cls.apply_search(qs, params.get('search', ''))
        qs = cls.apply_category_filter(qs, params.get('category'))
        qs = cls.apply_status_filter(qs, params.get('status', 'all'))
        qs = cls.apply_stock_filter(qs, params.get('stock'))
        qs = cls.apply_verified_filter(qs, params.get('verified'))
        qs = cls.apply_ordering(qs, params.get('order_by', '-created_at'))
        return qs
