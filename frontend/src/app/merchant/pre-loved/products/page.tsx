import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Package } from 'lucide-react'

export default function MyPreLovedProductsPage() {
  return (
    <MerchantPageShell
      title="My Pre-Loved Products"
      description="View and manage all your second-hand and pre-loved item listings."
      icon={<Package size={28} />}
    />
  )
}
