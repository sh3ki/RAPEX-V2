'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Layers } from 'lucide-react'

export default function BulkFreshProductsPage() {
  return (
    <MerchantPageShell
      title="Bulk Fresh Products"
      description="Upload and manage multiple fresh products at once via bulk import."
      icon={<Layers size={28} />}
    />
  )
}
