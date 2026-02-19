import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { PlusCircle } from 'lucide-react'

export default function AddProductPage() {
  return (
    <MerchantPageShell
      title="Add Product"
      description="Create and publish a new product listing in your shop."
      icon={<PlusCircle size={28} />}
    />
  )
}
