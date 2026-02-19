'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  return (
    <MerchantPageShell
      title="Messages"
      description="Communicate with your customers and resolve their queries in real time."
      icon={<MessageSquare size={28} />}
    />
  )
}
