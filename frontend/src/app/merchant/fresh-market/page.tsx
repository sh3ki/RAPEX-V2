import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Leaf } from 'lucide-react'

export default function FreshMarketPage() {
  return (
    <MerchantPageShell
      title="Fresh Market"
      description="Manage your fresh produce and market items available for customers."
      icon={<Leaf size={28} />}
    />
  )
}
