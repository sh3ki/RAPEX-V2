'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import AddProductForm from '@/components/merchant/pages/AddProductForm'
import AddProductPreview from '@/components/merchant/pages/AddProductPreview'
import ProductSuccessModal from '@/components/merchant/pages/ProductSuccessModal'
import { useAddProduct } from '@/hooks/useAddProduct'
import { PlusCircle } from 'lucide-react'

export default function AddProductPage() {
  const hook = useAddProduct()

  return (
    <MerchantPageShell
      title="Add Product"
      description="Create and publish a new product listing in your shop."
      icon={<PlusCircle size={28} />}
    >
      {/* ── Success modal ────────────────────────────────────────────────── */}
      {hook.submitSuccess && (
        <ProductSuccessModal onAddAnother={hook.reset} />
      )}

      {/* ── Two-column layout ─────────────────────────────────────────────
          Left  : Form (scrollable)
          Right : Live customer preview (sticky)
        ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 min-h-full items-start">

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <div className="w-full">
          <AddProductForm hook={hook} />
        </div>

        {/* ── Preview (sticky on large screens) ─────────────────────────── */}
        <div className="hidden xl:block xl:sticky xl:top-6">
          <AddProductPreview hook={hook} />
        </div>
      </div>

      {/* ── Mobile preview toggle button (shows below form on small screens) ── */}
      <div className="xl:hidden px-4 pb-6">
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-medium text-orange-600 select-none">
            <span className="group-open:hidden flex items-center gap-1.5">
              <PlusCircle size={15} /> Show Customer Preview
            </span>
            <span className="hidden group-open:flex items-center gap-1.5">
              <PlusCircle size={15} /> Hide Preview
            </span>
          </summary>
          <div className="mt-4">
            <AddProductPreview hook={hook} />
          </div>
        </details>
      </div>
    </MerchantPageShell>
  )
}
