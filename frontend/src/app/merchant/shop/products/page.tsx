import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Package } from 'lucide-react'

export default function ShopProductsPage() {
  return (
    <MerchantPageShell
      title="Shop Products"
      description="View, edit and manage all the products in your shop."
      icon={<Package size={28} />}
    />
  )
}
