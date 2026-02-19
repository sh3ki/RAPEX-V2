'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Settings } from 'lucide-react'

export default function StoreSettingsPage() {
  return (
    <MerchantPageShell
      title="Store Settings"
      description="Customize your store profile, operating hours, policies and preferences."
      icon={<Settings size={28} />}
    />
  )
}
