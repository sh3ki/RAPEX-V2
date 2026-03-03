/**
 * useShopProducts
 * ===============
 * Master hook for the Shop Products management page.
 * Handles: data fetching, filtering, pagination, selection, bulk actions, modals.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  productsAPI,
  MerchandiseProduct,
  ProductPagination,
  ProductListParams,
  BulkAction,
  Category,
} from '@/lib/products-api'
import { useToast } from '@/hooks/useToast'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ViewMode = 'table' | 'grid'

export interface Filters {
  search: string
  category: number | ''
  status: 'all' | 'active' | 'inactive' | 'archived'
  stock: '' | 'empty' | 'in_stock'
  verified: '' | 'true' | 'false'
  order_by: string
}

export interface ConfirmModalState {
  open: boolean
  action: BulkAction | 'empty_stock' | null
  ids: number[]
  label: string
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  category: '',
  status: 'all',
  stock: '',
  verified: '',
  order_by: '-created_at',
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useShopProducts() {
  const router = useRouter()
  const { addToast } = useToast()

  // Data
  const [products, setProducts] = useState<MerchandiseProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<ProductPagination>({
    total_count: 0, total_pages: 1, current_page: 1, page_size: 20, has_next: false, has_previous: false,
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [pendingSearch, setPendingSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Modals
  const [viewProduct, setViewProduct] = useState<MerchandiseProduct | null>(null)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false, action: null, ids: [], label: '',
  })

  // Debounce ref
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Load categories on mount ───────────────────────────────────────────────

  useEffect(() => {
    productsAPI.getCategories().then(setCategories).catch(() => {})
  }, [])

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (params: ProductListParams) => {
    setLoading(true)
    try {
      const result = await productsAPI.getMerchantProducts(params)
      setProducts(result.data)
      setPagination(result.pagination)
      setSelectedIds(new Set())
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      addToast(error?.response?.data?.error ?? 'Failed to load products.', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // Re-fetch whenever filters, page, or pageSize change
  useEffect(() => {
    const params: ProductListParams = {
      ...filters,
      page: currentPage,
      page_size: pageSize,
    }
    fetchProducts(params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, pageSize])

  // ─── Search debounce ───────────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setPendingSearch(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }))
      setCurrentPage(1)
    }, 400)
  }

  // ─── Filter helpers ────────────────────────────────────────────────────────

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setPendingSearch('')
    setCurrentPage(1)
  }

  // ─── Pagination ────────────────────────────────────────────────────────────

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(page, pagination.total_pages))
    setCurrentPage(p)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  // ─── Selection ─────────────────────────────────────────────────────────────

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const isSelected = (id: number) => selectedIds.has(id)

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length && products.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map(p => p.id)))
    }
  }

  const allSelected = products.length > 0 && selectedIds.size === products.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < products.length

  const clearSelection = () => setSelectedIds(new Set())

  // ─── Single actions ────────────────────────────────────────────────────────

  const openViewModal = (product: MerchandiseProduct) => setViewProduct(product)
  const closeViewModal = () => setViewProduct(null)

  const handleEditProduct = (id: number) => router.push(`/merchant/shop/edit/${id}`)

  const openConfirm = (action: BulkAction | 'empty_stock', ids: number[], label: string) => {
    setConfirmModal({ open: true, action, ids, label })
  }

  const closeConfirm = () => {
    setConfirmModal({ open: false, action: null, ids: [], label: '' })
  }

  // Single product quick actions
  const handleArchiveOne = (product: MerchandiseProduct) => {
    const action = product.is_archived ? 'unarchive' : 'archive'
    const label = product.is_archived
      ? `Unarchive "${product.name}"`
      : `Archive "${product.name}"`
    openConfirm(action, [product.id], label)
  }

  const handleDeleteOne = (product: MerchandiseProduct) => {
    openConfirm('delete', [product.id], `Delete "${product.name}"`)
  }

  const handleEmptyStock = (product: MerchandiseProduct) => {
    openConfirm('empty_stock', [product.id], `Set "${product.name}" stock to 0`)
  }

  // ─── Confirm and Execute ───────────────────────────────────────────────────

  const executeConfirmedAction = async () => {
    const { action, ids } = confirmModal
    if (!action || ids.length === 0) return

    setActionLoading(true)
    closeConfirm()

    try {
      if (action === 'empty_stock') {
        // Patch each product to set stock = 0
        await Promise.all(ids.map(id => productsAPI.patchProduct(id, { stock: 0 })))
        addToast(`${ids.length} product(s) set to 0 stock.`, 'success')
      } else if (action === 'delete') {
        await productsAPI.bulkAction('delete', ids)
        addToast(`${ids.length} product(s) deleted.`, 'success')
      } else {
        await productsAPI.bulkAction(action, ids)
        const labelMap: Record<string, string> = {
          archive: 'archived',
          unarchive: 'unarchived',
          activate: 'activated',
          deactivate: 'deactivated',
        }
        addToast(`${ids.length} product(s) ${labelMap[action] ?? 'updated'}.`, 'success')
      }

      // Refresh data, clear selection
      clearSelection()
      const params: ProductListParams = {
        ...filters,
        page: currentPage,
        page_size: pageSize,
      }
      await fetchProducts(params)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      addToast(error?.response?.data?.error ?? 'Action failed. Please try again.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Bulk action from toolbar
  const handleBulkAction = (action: BulkAction) => {
    const ids = Array.from(selectedIds)
    const labelMap: Record<BulkAction, string> = {
      archive: `Archive ${ids.length} selected product(s)`,
      unarchive: `Unarchive ${ids.length} selected product(s)`,
      activate: `Activate ${ids.length} selected product(s)`,
      deactivate: `Deactivate ${ids.length} selected product(s)`,
      delete: `Delete ${ids.length} selected product(s)`,
    }
    openConfirm(action, ids, labelMap[action])
  }

  // ─── Return ────────────────────────────────────────────────────────────────

  return {
    // Data
    products,
    categories,
    pagination,
    loading,
    actionLoading,

    // View
    viewMode,
    setViewMode,

    // Filters
    filters,
    pendingSearch,
    updateFilter,
    handleSearchChange,
    resetFilters,

    // Pagination
    currentPage,
    pageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    goToPage,
    handlePageSizeChange,

    // Selection
    selectedIds,
    toggleSelect,
    isSelected,
    toggleSelectAll,
    allSelected,
    someSelected,
    clearSelection,

    // Actions
    openViewModal,
    closeViewModal,
    viewProduct,
    handleEditProduct,
    handleArchiveOne,
    handleDeleteOne,
    handleEmptyStock,

    // Confirm modal
    confirmModal,
    closeConfirm,
    executeConfirmedAction,

    // Bulk
    handleBulkAction,
  }
}
