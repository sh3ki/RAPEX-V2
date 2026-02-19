import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Landmark } from 'lucide-react'

export default function BankAccountPage() {
  return (
    <MerchantPageShell
      title="Bank Account Settings"
      description="Add or update your linked bank account details for payouts."
      icon={<Landmark size={28} />}
    />
  )
}
