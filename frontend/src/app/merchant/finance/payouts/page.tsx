'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { CreditCard } from 'lucide-react'

export default function PayoutsPage() {
  return (
    <MerchantPageShell
      title="Settlement / Payouts"
      description="Track settlement schedules, request payouts, and view payout history."
      icon={<CreditCard size={28} />}
    />
  )
}
