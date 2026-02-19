import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { BarChart2 } from 'lucide-react'

export default function SalesReportsPage() {
  return (
    <MerchantPageShell
      title="Sales Reports"
      description="Analyze your store's sales performance with detailed reports and charts."
      icon={<BarChart2 size={28} />}
    />
  )
}
