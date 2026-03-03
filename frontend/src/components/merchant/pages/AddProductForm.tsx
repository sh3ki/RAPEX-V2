/**
 * AddProductForm
 * ==============
 * Left-side form for adding a new merchandise product.
 * All business logic delegated to useAddProduct hook.
 * Follows RAPEX: components = presentation only.
 */

'use client'

import React, { useRef } from 'react'
import {
  PlusCircle, Trash2, Image as ImageIcon, Video, ChevronUp, ChevronDown,
  Tag, DollarSign, Package, FileText, Hash, Info, Upload
} from 'lucide-react'
import { useAddProduct, IMAGE_CONSTRAINTS, VIDEO_CONSTRAINTS } from '@/hooks/useAddProduct'

interface AddProductFormProps {
  hook: ReturnType<typeof useAddProduct>
}

const AddProductForm: React.FC<AddProductFormProps> = ({ hook }) => {
  const {
    flatCategories, categoriesLoading,
    form, updateField,
    images, addImages, removeImage, reorderImages,
    videoFile, videoPreviewUrl, setVideo,
    setDescriptionImage,
    errors, submitting,
    submit, reset,
  } = hook

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const descImageInputRef = useRef<HTMLInputElement>(null)

  // ── Image drag-over state ──────────────────────────────────────────────
  const [dragOver, setDragOver] = React.useState(false)

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) addImages(e.dataTransfer.files)
  }

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addImages(e.target.files)
    e.target.value = ''
  }

  const handleVideoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideo(e.target.files?.[0] ?? null)
    e.target.value = ''
  }

  const handleDescImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionImage(e.target.files?.[0] ?? null)
    e.target.value = ''
  }

  return (
    <div className="space-y-6">

      {/* ── General error ──────────────────────────────────────────────── */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* ── IMAGES UPLOAD ───────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <ImageIcon size={15} className="text-orange-500" />
          Product Images
          <span className="text-xs font-normal text-gray-400">(min {IMAGE_CONSTRAINTS.min}, max {IMAGE_CONSTRAINTS.max})</span>
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          JPG / PNG only · 1:1 ratio · ≤ {IMAGE_CONSTRAINTS.maxSizeMB} MB each
        </p>

        {/* Grid of uploaded images */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.previewUrl} alt={`product-img-${i}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                    title="Remove"
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => reorderImages(i, i - 1)}
                      className="p-1 bg-white/80 rounded-full text-gray-700 disabled:opacity-30 hover:bg-white"
                      title="Move left"
                    >
                      <ChevronUp size={10} />
                    </button>
                    <button
                      type="button"
                      disabled={i === images.length - 1}
                      onClick={() => reorderImages(i, i + 1)}
                      className="p-1 bg-white/80 rounded-full text-gray-700 disabled:opacity-30 hover:bg-white"
                      title="Move right"
                    >
                      <ChevronDown size={10} />
                    </button>
                  </div>
                </div>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-orange-500 text-white py-0.5">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Drop zone */}
        {images.length < IMAGE_CONSTRAINTS.max && (
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleImageDrop}
            className={`w-full border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-2 transition-colors cursor-pointer
              ${dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50/30'}`}
          >
            <Upload size={24} className="text-orange-400" />
            <span className="text-sm text-gray-500">
              Click or drag images here
              <span className="ml-1 text-orange-500 font-medium">
                ( {images.length}/{IMAGE_CONSTRAINTS.max} )
              </span>
            </span>
          </button>
        )}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="hidden"
          onChange={handleImageInput}
        />
        {errors.images && <p className="mt-1.5 text-xs text-red-500">{errors.images}</p>}
      </section>

      {/* ── VIDEO UPLOAD ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <Video size={15} className="text-orange-500" />
          Product Video
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          MP4 only · ≤ {VIDEO_CONSTRAINTS.maxSizeMB} MB · max 1280×1280 px · 10–60 s duration
        </p>

        {videoPreviewUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <video src={videoPreviewUrl} controls className="w-full max-h-48 bg-black" />
            <button
              type="button"
              onClick={() => setVideo(null)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"
              title="Remove video"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-orange-300 hover:bg-orange-50/30 transition-colors cursor-pointer"
          >
            <Video size={24} className="text-orange-400" />
            <span className="text-sm text-gray-500">Click to upload video</span>
          </button>
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4"
          className="hidden"
          onChange={handleVideoInput}
        />
        {errors.video && <p className="mt-1.5 text-xs text-red-500">{errors.video}</p>}
      </section>

      {/* ── PRODUCT INFO ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Tag size={15} className="text-orange-500" /> Product Information
        </h2>

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => updateField('name', e.target.value)}
            maxLength={100}
            placeholder="Enter product name"
            className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors
              ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-orange-400'}`}
          />
          <div className="flex justify-between mt-0.5">
            {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : <span />}
            <span className="text-xs text-gray-400">{form.name.length}/100</span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={form.categoryId}
            onChange={e => updateField('categoryId', e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors bg-white
              ${errors.categoryId ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'}`}
            disabled={categoriesLoading}
          >
            <option value="">
              {categoriesLoading ? 'Loading categories...' : '— Select category —'}
            </option>
            {flatCategories.map(cat => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.isChild ? `    ↳ ${cat.name}` : cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-0.5 text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        {/* SKU */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
            <Hash size={11} /> SKU
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.sku}
            onChange={e => updateField('sku', e.target.value)}
            placeholder="e.g. SKU-001"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-400 text-sm outline-none"
          />
        </div>
      </section>

      {/* ── DESCRIPTION ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FileText size={15} className="text-orange-500" /> Description
        </h2>

        {/* Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-medium">
          {(['text', 'image'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => updateField('descriptionType', t)}
              className={`flex-1 py-2 transition-colors ${
                form.descriptionType === t
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {t === 'text' ? 'Text' : 'Image (4:3)'}
            </button>
          ))}
        </div>

        {form.descriptionType === 'text' ? (
          <div>
            <textarea
              value={form.descriptionText}
              onChange={e => updateField('descriptionText', e.target.value)}
              maxLength={3000}
              rows={6}
              placeholder="Describe your product…"
              className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none transition-colors
                ${errors.descriptionText ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'}`}
            />
            <div className="flex justify-between mt-0.5">
              {errors.descriptionText
                ? <p className="text-xs text-red-500">{errors.descriptionText}</p>
                : <span />}
              <span className="text-xs text-gray-400">{form.descriptionText.length}/3000</span>
            </div>
          </div>
        ) : (
          <div>
            {form.descriptionImagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.descriptionImagePreview}
                  alt="description"
                  className="w-full max-h-64 object-contain bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setDescriptionImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => descImageInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-orange-300 hover:bg-orange-50/30 transition-colors cursor-pointer"
              >
                <ImageIcon size={24} className="text-orange-400" />
                <span className="text-sm text-gray-500">Upload portrait image (4:3)</span>
                <span className="text-xs text-gray-400">JPG / PNG only</span>
              </button>
            )}
            {errors.descriptionImage && (
              <p className="mt-1 text-xs text-red-500">{errors.descriptionImage}</p>
            )}
          </div>
        )}
        <input
          ref={descImageInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleDescImageInput}
        />
      </section>

      {/* ── PRICE & STOCK ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <DollarSign size={15} className="text-orange-500" /> Pricing & Stock
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Price (₱) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={e => updateField('price', e.target.value)}
                placeholder="0.00"
                className={`w-full pl-7 pr-3 py-2 rounded-xl border text-sm outline-none transition-colors
                  ${errors.price ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'}`}
              />
            </div>
            {errors.price && <p className="mt-0.5 text-xs text-red-500">{errors.price}</p>}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Stock <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                min={0}
                step={1}
                value={form.stock}
                onChange={e => updateField('stock', e.target.value)}
                placeholder="0"
                className={`w-full pl-8 pr-3 py-2 rounded-xl border text-sm outline-none transition-colors
                  ${errors.stock ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'}`}
              />
            </div>
            {errors.stock && <p className="mt-0.5 text-xs text-red-500">{errors.stock}</p>}
          </div>
        </div>
      </section>

      {/* ── ACTIONS ──────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pb-4">
        <button
          type="button"
          onClick={reset}
          disabled={submitting}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing…
            </>
          ) : (
            <>
              <PlusCircle size={16} />
              Publish Product
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default AddProductForm
