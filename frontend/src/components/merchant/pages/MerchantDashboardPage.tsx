'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MerchantLayout from '@/components/merchant/MerchantLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Star,
  Package,
  Clock,
} from 'lucide-react'

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  gradient: string
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, gradient }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${gradient}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

// ─── Component ────────────────────────────────────────────────────────────────

const MerchantDashboardPage: React.FC = () => {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const stored = localStorage.getItem('user')

    if (!token || !stored) {
      router.push('/merchant/login')
      return
    }

    try {
      const parsed = JSON.parse(stored)
      if (parsed.role && parsed.role !== 'merchant') {
        router.push(`/${parsed.role}/dashboard`)
        return
      }
      setUser(parsed)
    } catch {}

    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <MerchantLayout>
      <div className="p-6 sm:p-8 space-y-8">
        {/* ── Welcome Banner ── */}
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-orange-200">
          <p className="text-orange-100 text-sm font-medium mb-1">Welcome back 👋</p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {user?.business_name || user?.owner_name || 'Merchant'}
          </h1>
          <p className="text-orange-100 text-sm mt-1">
            Here&apos;s a snapshot of your store performance today.
          </p>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard
            label="Total Orders"
            value="—"
            sub="All time"
            icon={<ShoppingBag size={22} />}
            gradient="bg-gradient-to-br from-orange-400 to-pink-500"
          />
          <StatCard
            label="Total Sales"
            value="₱ —"
            sub="Gross revenue"
            icon={<DollarSign size={22} />}
            gradient="bg-gradient-to-br from-green-400 to-emerald-600"
          />
          <StatCard
            label="Active Listings"
            value="—"
            sub="Products live"
            icon={<Package size={22} />}
            gradient="bg-gradient-to-br from-blue-400 to-indigo-600"
          />
          <StatCard
            label="Store Rating"
            value="—"
            sub="Average score"
            icon={<Star size={22} />}
            gradient="bg-gradient-to-br from-yellow-400 to-orange-500"
          />
          <StatCard
            label="Growth"
            value="—"
            sub="vs last month"
            icon={<TrendingUp size={22} />}
            gradient="bg-gradient-to-br from-purple-400 to-pink-600"
          />
          <StatCard
            label="Pending Orders"
            value="—"
            sub="Needs action"
            icon={<Clock size={22} />}
            gradient="bg-gradient-to-br from-red-400 to-rose-600"
          />
        </div>

        {/* ── Filler Placeholder ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-white text-sm font-medium shadow-md shadow-orange-200 mb-4">
            <span className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
            Dashboard widgets coming soon
          </div>
          <p className="text-sm text-gray-400">
            Charts, recent orders, analytics, and more will appear here.
          </p>
        </div>
      </div>
    </MerchantLayout>
  )
}

export default MerchantDashboardPage
