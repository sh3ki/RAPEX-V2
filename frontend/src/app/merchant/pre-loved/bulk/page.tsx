'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Layers } from 'lucide-react'

export default function BulkPreLovedProductsPage() {
  return (
    <MerchantPageShell
      title="Bulk Pre-Loved Products"
      description="Upload and manage multiple pre-loved items at once via bulk import."
      icon={<Layers size={28} />}
    />
  )
}
