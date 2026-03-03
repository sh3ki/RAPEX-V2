"""
Product Views
=============
Endpoints for merchant product management.

All product-write endpoints require a valid Merchant JWT.
(MerchantJWTAuthentication resolves the Merchant from the Bearer token.)

Endpoints:
  GET  /api/products/categories/           – public category list
  GET  /api/products/merchant/             – paginated, filtered product list
  POST /api/products/merchant/create/      – create product
  POST /api/products/merchant/bulk-action/ – bulk archive/delete/activate
  GET  /api/products/merchant/<pk>/        – single product
  PATCH /api/products/merchant/<pk>/       – partial update (status flags)
  DELETE /api/products/merchant/<pk>/      – soft-delete (archive)
"""

import math
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny

from apps.products.models import Category, MerchandiseProduct
from apps.products.serializers.product_serializers import (
    CategorySerializer,
    MerchandiseProductSerializer,
    MerchandiseProductCreateSerializer,
)
from apps.products.services.product_service import ProductService
from apps.products.selectors.product_selectors import ProductSelector
from apps.products.authentication import MerchantJWTAuthentication, IsMerchantAuthenticated


# ── Category ──────────────────────────────────────────────────────────────────


class CategoryListView(APIView):
    """
    GET /api/products/categories/
    Returns all active top-level categories (with nested children).
    Public endpoint – no authentication required.

    IMPORTANT: authentication_classes must be explicitly set to [] so DRF
    does NOT run the global JWTAuthentication backend.  If we leave the
    global backend active and a logged-in merchant (whose JWT references
    merchants.Merchant, not users.User) calls this endpoint, simplejwt
    raises AuthenticationFailed → 401 even though the view is AllowAny.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        categories = (
            Category.objects
            .filter(is_active=True, parent__isnull=True)
            .prefetch_related('children')
            .order_by('sort_order', 'name')
        )
        serializer = CategorySerializer(categories, many=True)
        return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)


# ── Product List (with search, filter, pagination) ────────────────────────────


class MerchandiseProductListView(APIView):
    """
    GET /api/products/merchant/

    Query params:
      search     – name/SKU search string
      category   – category id
      status     – all | active | inactive | archived  (default: all)
      stock      – '' | empty | in_stock
      verified   – '' | verified | unverified
      order_by   – name | -name | price | -price | stock | -stock | created_at | -created_at
      page       – page number (default: 1)
      page_size  – items per page (default: 20, max: 100)
    """
    authentication_classes = [MerchantJWTAuthentication]
    permission_classes = [IsMerchantAuthenticated]

    def get(self, request):
        merchant = request.user
        params = request.query_params

        # Build filtered queryset via selector
        qs = ProductSelector.build_filtered_qs(merchant, params)

        # ── Pagination ─────────────────────────────────────────────────────
        try:
            page = max(1, int(params.get('page', 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            page_size = min(100, max(1, int(params.get('page_size', 20))))
        except (ValueError, TypeError):
            page_size = 20

        total_count = qs.count()
        total_pages = max(1, math.ceil(total_count / page_size))
        page = min(page, total_pages)

        offset = (page - 1) * page_size
        products = qs[offset: offset + page_size]

        serializer = MerchandiseProductSerializer(products, many=True, context={'request': request})

        return Response({
            'success': True,
            'data': serializer.data,
            'pagination': {
                'total_count': total_count,
                'total_pages': total_pages,
                'current_page': page,
                'page_size': page_size,
                'has_next': page < total_pages,
                'has_previous': page > 1,
            },
        }, status=status.HTTP_200_OK)


# ── Bulk Actions ──────────────────────────────────────────────────────────────


class MerchandiseProductBulkActionView(APIView):
    """
    POST /api/products/merchant/bulk-action/

    Body (JSON):
      {
        "action": "archive" | "unarchive" | "activate" | "deactivate" | "delete",
        "ids": [1, 2, 3]
      }

    - archive    : sets is_archived=True, is_active=False
    - unarchive  : sets is_archived=False, is_active=True
    - activate   : sets is_active=True
    - deactivate : sets is_active=False
    - delete     : hard delete (permanent)
    """
    authentication_classes = [MerchantJWTAuthentication]
    permission_classes = [IsMerchantAuthenticated]
    parser_classes = [JSONParser]

    ALLOWED_ACTIONS = {'archive', 'unarchive', 'activate', 'deactivate', 'delete'}

    def post(self, request):
        merchant = request.user
        action = request.data.get('action', '')
        ids = request.data.get('ids', [])

        if action not in self.ALLOWED_ACTIONS:
            return Response(
                {'success': False, 'message': f"Invalid action. Allowed: {', '.join(self.ALLOWED_ACTIONS)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(ids, list) or not ids:
            return Response(
                {'success': False, 'message': 'Provide a non-empty list of product ids.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = MerchandiseProduct.objects.filter(merchant=merchant, id__in=ids)
        count = qs.count()

        if count == 0:
            return Response(
                {'success': False, 'message': 'No matching products found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if action == 'archive':
            qs.update(is_archived=True, is_active=False)
            msg = f'{count} product(s) archived.'
        elif action == 'unarchive':
            qs.update(is_archived=False, is_active=True)
            msg = f'{count} product(s) restored.'
        elif action == 'activate':
            qs.update(is_active=True)
            msg = f'{count} product(s) activated.'
        elif action == 'deactivate':
            qs.update(is_active=False)
            msg = f'{count} product(s) deactivated.'
        elif action == 'delete':
            qs.delete()
            msg = f'{count} product(s) permanently deleted.'

        return Response({'success': True, 'message': msg, 'affected': count})


# ── Product Detail (GET / PATCH / DELETE) ─────────────────────────────────────


class MerchandiseProductDetailView(APIView):
    """
    GET    /api/products/merchant/<int:pk>/   – retrieve single product
    PATCH  /api/products/merchant/<int:pk>/   – partial update status flags
    DELETE /api/products/merchant/<int:pk>/   – soft-delete (archive)
    """
    authentication_classes = [MerchantJWTAuthentication]
    permission_classes = [IsMerchantAuthenticated]

    def _get_product(self, merchant, pk):
        try:
            return (
                MerchandiseProduct.objects
                .select_related('category')
                .prefetch_related('images')
                .get(pk=pk, merchant=merchant)
            )
        except MerchandiseProduct.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self._get_product(request.user, pk)
        if not product:
            return Response({'success': False, 'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = MerchandiseProductSerializer(product, context={'request': request})
        return Response({'success': True, 'data': serializer.data})

    def patch(self, request, pk):
        """
        Partial update for status fields only:
          is_active, is_archived, stock
        """
        product = self._get_product(request.user, pk)
        if not product:
            return Response({'success': False, 'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        ALLOWED_PATCH_FIELDS = {'is_active', 'is_archived', 'stock'}
        updates = {k: v for k, v in request.data.items() if k in ALLOWED_PATCH_FIELDS}

        if not updates:
            return Response(
                {'success': False, 'message': f'No valid fields to update. Allowed: {ALLOWED_PATCH_FIELDS}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for field, value in updates.items():
            setattr(product, field, value)
        product.save(update_fields=list(updates.keys()))

        serializer = MerchandiseProductSerializer(product, context={'request': request})
        return Response({'success': True, 'message': 'Product updated.', 'data': serializer.data})

    def delete(self, request, pk):
        product = self._get_product(request.user, pk)
        if not product:
            return Response({'success': False, 'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        product.is_archived = True
        product.is_active = False
        product.save(update_fields=['is_archived', 'is_active'])
        return Response({'success': True, 'message': 'Product archived.'})


# ── Product Create ─────────────────────────────────────────────────────────────


class MerchandiseProductCreateView(APIView):
    """
    POST /api/products/merchant/create/
    Create a new merchandise product for the authenticated merchant.

    Expects multipart/form-data:
      - name, category, sku (opt), price, stock
      - description_text (opt) OR description_image (opt)
      - images   (3-10 files, JPG/PNG, ≤ 2 MB each)
      - video    (opt, MP4, ≤ 30 MB)
    """
    authentication_classes = [MerchantJWTAuthentication]
    permission_classes = [IsMerchantAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        merchant = request.user

        serializer = MerchandiseProductCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        images = request.FILES.getlist('images')
        video = request.FILES.get('video')

        try:
            product = ProductService.create_product(
                merchant=merchant,
                validated_data=serializer.validated_data,
                images=images,
                video=video,
            )
        except ValueError as exc:
            return Response(
                {'success': False, 'message': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        out_serializer = MerchandiseProductSerializer(product, context={'request': request})
        return Response(
            {'success': True, 'message': 'Product created successfully.', 'data': out_serializer.data},
            status=status.HTTP_201_CREATED,
        )

