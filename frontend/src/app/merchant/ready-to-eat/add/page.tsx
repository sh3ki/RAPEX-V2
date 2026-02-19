import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { PlusCircle } from 'lucide-react'

export default function AddFoodProductPage() {
  return (
    <MerchantPageShell
      title="Add Food Products"
      description="Create and publish a new ready-to-eat food item for your menu."
      icon={<PlusCircle size={28} />}
    />
  )
}
