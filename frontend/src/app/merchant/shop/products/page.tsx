'use client'

import { Package } from 'lucide-react'
import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { useShopProducts } from '@/hooks/useShopProducts'
import ProductFilters from '@/components/merchant/pages/ShopProducts/ProductFilters'
import ProductBulkToolbar from '@/components/merchant/pages/ShopProducts/ProductBulkToolbar'
import ProductTableView from '@/components/merchant/pages/ShopProducts/ProductTableView'
import ProductGridView from '@/components/merchant/pages/ShopProducts/ProductGridView'
import ProductPagination from '@/components/merchant/pages/ShopProducts/ProductPagination'
import ProductViewModal from '@/components/merchant/pages/ShopProducts/ProductViewModal'
import ProductConfirmModal from '@/components/merchant/pages/ShopProducts/ProductConfirmModal'

export default function ShopProductsPage() {
  const shop = useShopProducts()

  return (
    <MerchantPageShell
      title="Shop Products"
      description="View, edit, and manage all the products in your shop."
      icon={<Package size={28} />}
    >
      <div className="space-y-4">
        {/* ── Filters bar ────────────────────────────────────────────── */}
        <ProductFilters
          filters={shop.filters}
          pendingSearch={shop.pendingSearch}
          categories={shop.categories}
          viewMode={shop.viewMode}
          onSearchChange={shop.handleSearchChange}
          onFilterChange={shop.updateFilter}
          onReset={shop.resetFilters}
          onViewModeChange={shop.setViewMode}
        />

        {/* ── Bulk toolbar (animated, only when items selected) ──────── */}
        <ProductBulkToolbar
          selectedCount={shop.selectedIds.size}
          onBulkAction={shop.handleBulkAction}
          onClear={shop.clearSelection}
          loading={shop.actionLoading}
        />

        {/* ── Product list ────────────────────────────────────────────── */}
        {shop.viewMode === 'table' ? (
          <ProductTableView
            products={shop.products}
            loading={shop.loading}
            allSelected={shop.allSelected}
            someSelected={shop.someSelected}
            isSelected={shop.isSelected}
            onToggleSelectAll={shop.toggleSelectAll}
            onToggleSelect={shop.toggleSelect}
            onView={shop.openViewModal}
            onEdit={shop.handleEditProduct}
            onArchiveToggle={shop.handleArchiveOne}
            onDelete={shop.handleDeleteOne}
            onEmptyStock={shop.handleEmptyStock}
          />
        ) : (
          <ProductGridView
            products={shop.products}
            loading={shop.loading}
            isSelected={shop.isSelected}
            onToggleSelect={shop.toggleSelect}
            onView={shop.openViewModal}
            onEdit={shop.handleEditProduct}
            onArchiveToggle={shop.handleArchiveOne}
            onDelete={shop.handleDeleteOne}
            onEmptyStock={shop.handleEmptyStock}
          />
        )}

        {/* ── Pagination ──────────────────────────────────────────────── */}
        <ProductPagination
          pagination={shop.pagination}
          pageSize={shop.pageSize}
          pageSizeOptions={shop.pageSizeOptions}
          onPageChange={shop.goToPage}
          onPageSizeChange={shop.handlePageSizeChange}
        />
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <ProductViewModal
        product={shop.viewProduct}
        onClose={shop.closeViewModal}
        onEdit={shop.handleEditProduct}
      />

      <ProductConfirmModal
        state={shop.confirmModal}
        onConfirm={shop.executeConfirmedAction}
        onCancel={shop.closeConfirm}
        loading={shop.actionLoading}
      />
    </MerchantPageShell>
  )
}

