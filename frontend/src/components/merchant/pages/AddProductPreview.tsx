/**
 * AddProductPreview
 * =================
 * Right-side live preview — mimics how the product looks to customers (Shopee-style).
 * Pure presentational component; receives data from the useAddProduct hook.
 */

'use client'

import React, { useState } from 'react'
import { ShoppingCart, MessageCircle, Store, Star, Shield, ChevronLeft, ChevronRight, Heart, Share2, Package } from 'lucide-react'
import { useAddProduct } from '@/hooks/useAddProduct'

interface AddProductPreviewProps {
  hook: ReturnType<typeof useAddProduct>
}

const AddProductPreview: React.FC<AddProductPreviewProps> = ({ hook }) => {
  const { form, images, flatCategories } = hook
  const [activeImg, setActiveImg] = useState(0)

  const selectedCategory = flatCategories.find(c => String(c.id) === form.categoryId)
  const price = form.price ? parseFloat(form.price) : null
  const stock = form.stock ? parseInt(form.stock) : 0
  const hasImages = images.length > 0

  // Sync active index when images change
  React.useEffect(() => {
    if (activeImg >= images.length && images.length > 0) {
      setActiveImg(images.length - 1)
    }
  }, [images.length, activeImg])

  const currentImageUrl = hasImages ? images[Math.min(activeImg, images.length - 1)]?.previewUrl : null

  const prevImg = () => setActiveImg(i => Math.max(0, i - 1))
  const nextImg = () => setActiveImg(i => Math.min(images.length - 1, i + 1))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center gap-2">
        <span className="text-white text-sm font-semibold">Customer Preview</span>
        <span className="ml-auto text-orange-200 text-xs">Live</span>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>

      {/* ── Shopee-style product page ─────────────────────────────────── */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">

        {/* Image carousel */}
        <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square w-full">
          {currentImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImageUrl}
                alt="product preview"
                className="w-full h-full object-cover transition-all duration-300"
              />
              {/* Prev / Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    disabled={activeImg === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/60"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={nextImg}
                    disabled={activeImg === images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/60"
                  >
                    <ChevronRight size={14} />
                  </button>
                </>
              )}
              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === activeImg ? 'bg-orange-500' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <Package size={22} className="text-gray-400" />
              </div>
              <span className="text-xs">Add images to preview</span>
            </div>
          )}

          {/* Wishlist & share shortcuts */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
            <button className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white">
              <Heart size={13} className="text-gray-500" />
            </button>
            <button className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white">
              <Share2 size={13} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === activeImg ? 'border-orange-500' : 'border-transparent'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Product title & price */}
        <div className="space-y-1">
          {/* Category badge */}
          {selectedCategory && (
            <span className="inline-block text-[10px] bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">
              {selectedCategory.name}
            </span>
          )}
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {form.name || <span className="text-gray-400 font-normal italic">Product name will appear here</span>}
          </h3>
          {/* Price */}
          {price !== null ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-orange-500">
                ₱{price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400 italic">Price will appear here</span>
          )}
        </div>

        {/* Ratings placeholder */}
        <div className="flex items-center gap-3 py-2 border-t border-b border-gray-100">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} className={s <= 4 ? 'text-orange-400 fill-orange-400' : 'text-gray-300'} />
            ))}
          </div>
          <span className="text-xs text-gray-500">4.0 · 0 ratings</span>
          <span className="text-xs text-gray-400 ml-auto">{stock > 0 ? `${stock} in stock` : 'Out of Stock'}</span>
        </div>

        {/* SKU */}
        {form.sku && (
          <p className="text-xs text-gray-400">SKU: <span className="text-gray-600 font-mono">{form.sku}</span></p>
        )}

        {/* Description */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-700">Product Description</p>
          {form.descriptionType === 'text' ? (
            form.descriptionText ? (
              <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{form.descriptionText}</p>
            ) : (
              <p className="text-xs text-gray-400 italic">Description will appear here</p>
            )
          ) : (
            form.descriptionImagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.descriptionImagePreview}
                alt="description"
                className="w-full rounded-xl object-contain border border-gray-100"
              />
            ) : (
              <p className="text-xs text-gray-400 italic">Upload a description image (4:3)</p>
            )
          )}
        </div>

        {/* Store info placeholder */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Your Store</p>
            <p className="text-[10px] text-gray-400">Active</p>
          </div>
          <button className="text-xs text-orange-500 font-medium whitespace-nowrap">Visit</button>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-2 pt-1 pb-2">
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl border-2 border-orange-500 text-orange-500 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-orange-50">
              <ShoppingCart size={14} />
              Add to Cart
            </button>
            <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold hover:from-orange-600 hover:to-orange-700">
              Buy Now
            </button>
          </div>
          <button className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs flex items-center justify-center gap-1.5 hover:bg-gray-50">
            <MessageCircle size={13} />
            Chat with Seller
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <Shield size={11} className="text-green-500" />
          <span>RAPEX Buyer Protection</span>
        </div>
      </div>
    </div>
  )
}

export default AddProductPreview
