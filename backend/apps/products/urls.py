from django.urls import path
from apps.products.views import (
    CategoryListView,
    MerchandiseProductListView,
    MerchandiseProductCreateView,
    MerchandiseProductBulkActionView,
    MerchandiseProductDetailView,
)

app_name = 'products'

urlpatterns = [
    # Categories (public)
    path('categories/', CategoryListView.as_view(), name='category-list'),

    # Merchant product endpoints (auth required)
    path('merchant/', MerchandiseProductListView.as_view(), name='product-list'),
    path('merchant/create/', MerchandiseProductCreateView.as_view(), name='product-create'),
    path('merchant/bulk-action/', MerchandiseProductBulkActionView.as_view(), name='product-bulk-action'),
    path('merchant/<int:pk>/', MerchandiseProductDetailView.as_view(), name='product-detail'),
]
