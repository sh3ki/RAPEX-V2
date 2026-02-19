import MerchantPageShell from '@/components/merchant/MerchantPageShell'
import { Lightbulb } from 'lucide-react'

export default function BusinessInsightsPage() {
  return (
    <MerchantPageShell
      title="Business Insights"
      description="AI-powered recommendations and actionable insights to grow your business."
      icon={<Lightbulb size={28} />}
    />
  )
}
