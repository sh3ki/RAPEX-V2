import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Package } from 'lucide-react'

export default function InventoryPage() {
  return (
    <MerchantPageShell
      title="Inventory"
      description="Track stock levels, manage warehouse items and get low-stock alerts."
      icon={<Package size={28} />}
    />
  )
}
