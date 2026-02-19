'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { RefreshCcw } from 'lucide-react'

export default function ReturnsRefundsPage() {
  return (
    <MerchantPageShell
      title="Return / Refunds"
      description="Handle return requests and manage refunds for your customers."
      icon={<RefreshCcw size={28} />}
    />
  )
}
