/**
 * ProductSuccessModal
 * ===================
 * Shown after a product is successfully created.
 * Gives the merchant options to add another or view their products.
 */

'use client'

import React from 'react'
import { CheckCircle, PlusCircle, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProductSuccessModalProps {
  onAddAnother: () => void
}

const ProductSuccessModal: React.FC<ProductSuccessModalProps> = ({ onAddAnother }) => {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-50">
          <CheckCircle size={36} className="text-green-500" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Published!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Your product has been saved and submitted for verification. It will be visible to customers once approved.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onAddAnother}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle size={16} />
            Add Another Product
          </button>
          <button
            onClick={() => router.push('/merchant/shop/products')}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            View My Products
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductSuccessModal
