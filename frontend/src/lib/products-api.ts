/**
 * Products API
 * ============
 * All API calls related to merchandise products and categories.
 * Follows the RAPEX architecture: no business logic in API layer.
 */

import apiClient from './api'

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  parent: number | null
  children: Category[]
  sort_order: number
}

export interface ProductImage {
  id: number
  image: string
  sort_order: number
}

export interface MerchandiseProduct {
  id: number
  merchant: number
  name: string
  category: number
  category_name: string
  sku: string
  description_text: string
  description_image: string | null
  price: string
  stock: number
  is_verified: boolean
  is_archived: boolean
  is_active: boolean
  video: string | null
  images: ProductImage[]
  primary_image_url: string | null
  created_at: string
  updated_at: string
}

export interface ProductPagination {
  total_count: number
  total_pages: number
  current_page: number
  page_size: number
  has_next: boolean
  has_previous: boolean
}

export interface ProductListParams {
  search?: string
  category?: number | ''
  status?: 'all' | 'active' | 'inactive' | 'archived'
  stock?: '' | 'empty' | 'in_stock'
  verified?: '' | 'true' | 'false'
  order_by?: string
  page?: number
  page_size?: number
}

export interface ProductListResponse {
  data: MerchandiseProduct[]
  pagination: ProductPagination
}

export type BulkAction = 'archive' | 'unarchive' | 'activate' | 'deactivate' | 'delete'

export interface ProductPatchData {
  is_active?: boolean
  is_archived?: boolean
  stock?: number
}

export const productsAPI = {
  /** Fetch all active categories */
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get('/products/categories/')
    return res.data.data
  },

  /** List merchant's own products with full filtering, search, and pagination */
  getMerchantProducts: async (params: ProductListParams = {}): Promise<ProductListResponse> => {
    const cleanParams: Record<string, string | number> = {}
    if (params.search) cleanParams.search = params.search
    if (params.category) cleanParams.category = params.category
    if (params.status && params.status !== 'all') cleanParams.status = params.status
    if (params.stock) cleanParams.stock = params.stock
    if (params.verified) cleanParams.verified = params.verified
    if (params.order_by) cleanParams.order_by = params.order_by
    if (params.page) cleanParams.page = params.page
    if (params.page_size) cleanParams.page_size = params.page_size
    const res = await apiClient.get('/products/merchant/', { params: cleanParams })
    return { data: res.data.data, pagination: res.data.pagination }
  },

  /** Legacy: List merchant's own products (kept for backward compatibility) */
  getMyProducts: async (includeArchived = false): Promise<MerchandiseProduct[]> => {
    const res = await apiClient.get('/products/merchant/', {
      params: { archived: includeArchived ? 'true' : 'false' },
    })
    return res.data.data
  },

  /** Create a new product (multipart/form-data) */
  createProduct: async (formData: FormData): Promise<MerchandiseProduct> => {
    const res = await apiClient.post('/products/merchant/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  /** Perform a bulk action on multiple products */
  bulkAction: async (action: BulkAction, ids: number[]): Promise<{ updated_count: number }> => {
    const res = await apiClient.post('/products/merchant/bulk-action/', { action, ids })
    return res.data
  },

  /** Patch a single product's status flags or stock */
  patchProduct: async (productId: number, data: ProductPatchData): Promise<MerchandiseProduct> => {
    const res = await apiClient.patch(`/products/merchant/${productId}/`, data)
    return res.data.data
  },

  /** Archive (soft-delete) a product */
  archiveProduct: async (productId: number): Promise<void> => {
    await apiClient.delete(`/products/merchant/${productId}/`)
  },

  /** Get a single product */
  getProduct: async (productId: number): Promise<MerchandiseProduct> => {
    const res = await apiClient.get(`/products/merchant/${productId}/`)
    return res.data.data
  },
}
