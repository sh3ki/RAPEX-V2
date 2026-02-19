import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <MerchantPageShell
      title="Analytics"
      description="Deep-dive into visitor behavior, conversion rates and product performance."
      icon={<TrendingUp size={28} />}
    />
  )
}
