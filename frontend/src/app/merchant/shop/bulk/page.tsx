'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Layers } from 'lucide-react'

export default function BulkProductsPage() {
  return (
    <MerchantPageShell
      title="Bulk Products"
      description="Upload and manage multiple products at once via bulk import."
      icon={<Layers size={28} />}
    />
  )
}
