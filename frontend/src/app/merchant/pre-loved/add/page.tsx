'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { PlusCircle } from 'lucide-react'

export default function AddPreLovedProductPage() {
  return (
    <MerchantPageShell
      title="Add Pre-Loved Products"
      description="Create and publish a new pre-loved item listing for your shop."
      icon={<PlusCircle size={28} />}
    />
  )
}
