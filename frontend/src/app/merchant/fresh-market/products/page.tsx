import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Package } from 'lucide-react'

export default function MyFreshMarketPage() {
  return (
    <MerchantPageShell
      title="My Fresh Market"
      description="View and manage all your fresh produce and market listings."
      icon={<Package size={28} />}
    />
  )
}
