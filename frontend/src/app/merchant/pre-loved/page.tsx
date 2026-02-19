'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Tag } from 'lucide-react'

export default function PreLovedPage() {
  return (
    <MerchantPageShell
      title="Pre-Loved Products"
      description="List and manage your second-hand and pre-loved items for sale."
      icon={<Tag size={28} />}
    />
  )
}
