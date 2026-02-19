'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { HelpCircle } from 'lucide-react'

export default function HelpSupportPage() {
  return (
    <MerchantPageShell
      title="Help & Support"
      description="Find answers, contact support, and access documentation for your store."
      icon={<HelpCircle size={28} />}
    />
  )
}
