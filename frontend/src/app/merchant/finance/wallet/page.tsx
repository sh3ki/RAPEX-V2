'use client'

import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Wallet } from 'lucide-react'

export default function WalletPage() {
  return (
    <MerchantPageShell
      title="Wallet"
      description="Monitor your store balance, transaction history and available funds."
      icon={<Wallet size={28} />}
    />
  )
}
