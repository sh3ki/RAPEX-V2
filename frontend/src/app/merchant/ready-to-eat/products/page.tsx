'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Package } from 'lucide-react'

export default function MyFoodProductsPage() {
  return (
    <MerchantPageShell
      title="My Food Products"
      description="View and manage all your ready-to-eat food listings."
      icon={<Package size={28} />}
    />
  )
}
