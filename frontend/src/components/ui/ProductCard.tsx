import React from 'react'
import Image from 'next/image'

interface ProductCardProps {
  id: string | number
  name: string
  price: number
  image: string
  description?: string
  rating?: number
  inStock?: boolean
  discount?: number
  onAddToCart?: (id: string | number) => void
  onClick?: (id: string | number) => void
  className?: string
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  image,
  description,
  rating,
  inStock = true,
  discount,
  onAddToCart,
  onClick,
  className = '',
}) => {
  const discountedPrice = discount ? price - (price * discount / 100) : price
  
  return (
    <div
      onClick={() => onClick && onClick(id)}
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {!inStock && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
          {discount && (
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
          {name}
        </h3>
        
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-gray-600 text-sm ml-1">({rating})</span>
          </div>
        )}
        
        {/* Price & Action */}
        <div className="flex items-center justify-between mt-4">
          <div>
            {discount ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-800">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-800">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
          
          {onAddToCart && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart(id)
              }}
              disabled={!inStock}
              className={`p-3 rounded-lg transition-all duration-200 ${
                inStock
                  ? 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
