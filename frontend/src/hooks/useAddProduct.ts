/**
 * useAddProduct Hook
 * ==================
 * Manages all state and logic for the Add Product form.
 * Keeps business logic out of UI components (RAPEX blueprint).
 *
 * Responsibilities:
 *  - Category fetching
 *  - Form field state
 *  - Image & video file management + client-side validation
 *  - Submission to backend
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { productsAPI } from '@/lib/products-api'
import type { Category } from '@/lib/products-api'

// ── Constraints (must mirror backend) ──────────────────────────────────────
export const IMAGE_CONSTRAINTS = {
  min: 3,
  max: 10,
  maxSizeMB: 2,
  maxSizeBytes: 2 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png'],
  allowedExts: ['.jpg', '.jpeg', '.png'],
} as const

export const VIDEO_CONSTRAINTS = {
  maxSizeMB: 30,
  maxSizeBytes: 30 * 1024 * 1024,
  allowedTypes: ['video/mp4'],
  allowedExts: ['.mp4'],
  minDurationSec: 10,
  maxDurationSec: 60,
} as const

// ── Types ─────────────────────────────────────────────────────────────────

export interface ImagePreview {
  file: File
  previewUrl: string
}

export interface AddProductForm {
  name: string
  categoryId: string
  sku: string
  descriptionType: 'text' | 'image'
  descriptionText: string
  descriptionImageFile: File | null
  descriptionImagePreview: string | null
  price: string
  stock: string
}

export interface FormErrors {
  [key: string]: string
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useAddProduct() {
  // Categories
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Form
  const [form, setForm] = useState<AddProductForm>({
    name: '',
    categoryId: '',
    sku: '',
    descriptionType: 'text',
    descriptionText: '',
    descriptionImageFile: null,
    descriptionImagePreview: null,
    price: '',
    stock: '',
  })

  // Files
  const [images, setImages] = useState<ImagePreview[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)

  // UI state
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // ── Fetch categories ───────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await productsAPI.getCategories()
        if (mounted) setCategories(data)
      } catch {
        // silent – user can retry
      } finally {
        if (mounted) setCategoriesLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // ── Field updater ──────────────────────────────────────────────────────
  const updateField = useCallback(<K extends keyof AddProductForm>(key: K, value: AddProductForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => { const next = { ...prev }; delete next[key]; return next })
  }, [])

  // ── Image handling ─────────────────────────────────────────────────────
  const addImages = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files)
    const newPreviews: ImagePreview[] = []
    const localErrors: string[] = []

    for (const file of arr) {
      if (images.length + newPreviews.length >= IMAGE_CONSTRAINTS.max) {
        localErrors.push(`Maximum ${IMAGE_CONSTRAINTS.max} images allowed.`)
        break
      }
      if (!IMAGE_CONSTRAINTS.allowedTypes.includes(file.type as any)) {
        localErrors.push(`${file.name}: only JPG / PNG allowed.`)
        continue
      }
      if (file.size > IMAGE_CONSTRAINTS.maxSizeBytes) {
        localErrors.push(`${file.name}: must be ≤ ${IMAGE_CONSTRAINTS.maxSizeMB} MB.`)
        continue
      }
      newPreviews.push({ file, previewUrl: URL.createObjectURL(file) })
    }

    if (localErrors.length) {
      setErrors(prev => ({ ...prev, images: localErrors.join(' ') }))
    } else {
      setErrors(prev => { const n = { ...prev }; delete n.images; return n })
    }

    setImages(prev => [...prev, ...newPreviews])
  }, [images])

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const reorderImages = useCallback((from: number, to: number) => {
    setImages(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  // ── Video handling ─────────────────────────────────────────────────────
  const setVideo = useCallback((file: File | null) => {
    if (!file) {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
      setVideoFile(null)
      setVideoPreviewUrl(null)
      return
    }
    if (!VIDEO_CONSTRAINTS.allowedTypes.includes(file.type as any)) {
      setErrors(prev => ({ ...prev, video: 'Video must be MP4 format.' }))
      return
    }
    if (file.size > VIDEO_CONSTRAINTS.maxSizeBytes) {
      setErrors(prev => ({ ...prev, video: `Video must be ≤ ${VIDEO_CONSTRAINTS.maxSizeMB} MB.` }))
      return
    }
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setErrors(prev => { const n = { ...prev }; delete n.video; return n })
    setVideoFile(file)
    setVideoPreviewUrl(URL.createObjectURL(file))
  }, [videoPreviewUrl])

  // ── Description image ──────────────────────────────────────────────────
  const setDescriptionImage = useCallback((file: File | null) => {
    if (!file) {
      if (form.descriptionImagePreview) URL.revokeObjectURL(form.descriptionImagePreview)
      setForm(prev => ({ ...prev, descriptionImageFile: null, descriptionImagePreview: null }))
      return
    }
    if (!IMAGE_CONSTRAINTS.allowedTypes.includes(file.type as any)) {
      setErrors(prev => ({ ...prev, descriptionImage: 'Description image must be JPG or PNG.' }))
      return
    }
    const url = URL.createObjectURL(file)
    setErrors(prev => { const n = { ...prev }; delete n.descriptionImage; return n })
    setForm(prev => ({ ...prev, descriptionImageFile: file, descriptionImagePreview: url }))
  }, [form.descriptionImagePreview])

  // ── Client validation ──────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = 'Product name is required.'
    else if (form.name.length > 100) errs.name = 'Max 100 characters.'
    if (!form.categoryId) errs.categoryId = 'Please select a category.'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = 'Enter a valid price (≥ 0).'
    if (form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      errs.stock = 'Enter a valid stock quantity (≥ 0).'
    if (images.length < IMAGE_CONSTRAINTS.min)
      errs.images = `Upload at least ${IMAGE_CONSTRAINTS.min} images.`
    if (form.descriptionType === 'text' && form.descriptionText.length > 3000)
      errs.descriptionText = 'Description must be ≤ 3 000 characters.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [form, images])

  // ── Submit ─────────────────────────────────────────────────────────────
  const submit = useCallback(async (): Promise<boolean> => {
    if (!validate()) return false
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('category', form.categoryId)
      fd.append('sku', form.sku.trim())
      fd.append('price', form.price)
      fd.append('stock', form.stock)

      if (form.descriptionType === 'text') {
        fd.append('description_text', form.descriptionText.trim())
      } else if (form.descriptionImageFile) {
        fd.append('description_image', form.descriptionImageFile)
      }

      images.forEach(img => fd.append('images', img.file))

      if (videoFile) fd.append('video', videoFile)

      await productsAPI.createProduct(fd)
      setSubmitSuccess(true)
      return true
    } catch (err: any) {
      const detail = err?.response?.data
      if (detail?.errors) {
        const mapped: FormErrors = {}
        for (const [k, v] of Object.entries(detail.errors)) {
          mapped[k] = Array.isArray(v) ? (v as string[]).join(' ') : String(v)
        }
        setErrors(mapped)
      } else {
        setErrors({ general: detail?.message || 'Failed to create product. Please try again.' })
      }
      return false
    } finally {
      setSubmitting(false)
    }
  }, [form, images, videoFile, validate])

  // ── Reset ──────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl))
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    if (form.descriptionImagePreview) URL.revokeObjectURL(form.descriptionImagePreview)
    setImages([])
    setVideoFile(null)
    setVideoPreviewUrl(null)
    setForm({
      name: '', categoryId: '', sku: '', descriptionType: 'text',
      descriptionText: '', descriptionImageFile: null, descriptionImagePreview: null,
      price: '', stock: '',
    })
    setErrors({})
    setSubmitSuccess(false)
  }, [images, videoPreviewUrl, form.descriptionImagePreview])

  // ── Flat category list for dropdown (parent + children) ───────────────
  const flatCategories = categories.flatMap(cat => [
    { ...cat, isChild: false },
    ...cat.children.map(child => ({ ...child, isChild: true })),
  ])

  return {
    // Data
    categories, flatCategories, categoriesLoading,
    // Form
    form, updateField,
    // Files
    images, addImages, removeImage, reorderImages,
    videoFile, videoPreviewUrl, setVideo,
    setDescriptionImage,
    // State
    errors, submitting, submitSuccess,
    // Actions
    submit, reset,
  }
}
