import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { UtensilsCrossed } from 'lucide-react'

export default function FoodMenuPage() {
  return (
    <MerchantPageShell
      title="Food Menu"
      description="Build and manage your restaurant or food stall menu offerings."
      icon={<UtensilsCrossed size={28} />}
    />
  )
}
