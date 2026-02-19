'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <MerchantPageShell
      title="Notifications"
      description="Stay updated with alerts, announcements and system notifications."
      icon={<Bell size={28} />}
    />
  )
}
