import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { XCircle } from 'lucide-react'

export default function CancellationsPage() {
  return (
    <MerchantPageShell
      title="Cancellations"
      description="Review and manage cancelled orders from your store."
      icon={<XCircle size={28} />}
    />
  )
}
