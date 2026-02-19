import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Layers } from 'lucide-react'

export default function BulkFoodProductsPage() {
  return (
    <MerchantPageShell
      title="Bulk Food Products"
      description="Upload and manage multiple ready-to-eat food items at once via bulk import."
      icon={<Layers size={28} />}
    />
  )
}
