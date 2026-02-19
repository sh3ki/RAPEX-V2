import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { ListOrdered } from 'lucide-react'

export default function ActiveOrdersPage() {
  return (
    <MerchantPageShell
      title="Active Orders"
      description="View and manage all your currently active orders."
      icon={<ListOrdered size={28} />}
    />
  )
}
