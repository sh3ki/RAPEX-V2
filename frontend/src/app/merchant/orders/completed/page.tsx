'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { CheckCircle2 } from 'lucide-react'

export default function CompletedOrdersPage() {
  return (
    <MerchantPageShell
      title="Completed Orders"
      description="Browse your order history and completed transactions."
      icon={<CheckCircle2 size={28} />}
    />
  )
}
