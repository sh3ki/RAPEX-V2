'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { PlusCircle } from 'lucide-react'

export default function AddFreshProductPage() {
  return (
    <MerchantPageShell
      title="Add Fresh Products"
      description="Create and publish a new fresh product listing for your market."
      icon={<PlusCircle size={28} />}
    />
  )
}
