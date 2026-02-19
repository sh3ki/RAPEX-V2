'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, MessageSquare, ChevronDown, LogOut, Settings, User, ChevronRight } from 'lucide-react'

// ─── Breadcrumb Config ────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  merchant: 'Merchant',
  dashboard: 'Dashboard',
  orders: 'Orders',
  active: 'Active',
  completed: 'Completed',
  cancellations: 'Cancellations',
  returns: 'Return / Refunds',
  shop: 'My Shop',
  products: 'Products',
  add: 'Add',
  bulk: 'Bulk',
  'fresh-market': 'Fresh Market',
  'ready-to-eat': 'Ready-to-Eat Foods',
  'pre-loved': 'Pre-Loved Shop',
  inventory: 'Inventory',
  performance: 'Performance',
  'sales-reports': 'Sales Reports',
  analytics: 'Analytics',
  insights: 'Business Insights',
  finance: 'Finance',
  wallet: 'Wallet',
  payouts: 'Settlement / Payouts',
  bank: 'Bank Account Settings',
  notifications: 'Notifications',
  'customer-service': 'Customer Service',
  messages: 'Messages',
  'store-settings': 'Store Settings',
  help: 'Help & Support',
}

// Path-specific overrides for context-aware sub-segment labels
const PATH_LABEL_OVERRIDES: Record<string, string> = {
  '/merchant/shop/products': 'Shop Products',
  '/merchant/shop/add': 'Add Product',
  '/merchant/shop/bulk': 'Bulk Products',
  '/merchant/fresh-market/products': 'My Fresh Market',
  '/merchant/fresh-market/add': 'Add Fresh Products',
  '/merchant/fresh-market/bulk': 'Bulk Fresh Products',
  '/merchant/ready-to-eat/products': 'My Food Products',
  '/merchant/ready-to-eat/add': 'Add Food Products',
  '/merchant/ready-to-eat/bulk': 'Bulk Food Products',
  '/merchant/pre-loved/products': 'My Pre-Loved Products',
  '/merchant/pre-loved/add': 'Add Pre-Loved Products',
  '/merchant/pre-loved/bulk': 'Bulk Pre-Loved Products',
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []
  let path = ''

  for (const seg of segments) {
    path += `/${seg}`
    // Check full-path override first for context-aware labels
    const label = PATH_LABEL_OVERRIDES[path] ?? ROUTE_LABELS[seg] ?? seg
    crumbs.push({ label, href: path })
  }

  return crumbs
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MerchantHeaderProps {
  onToggleSidebar: () => void
}

interface MerchantUser {
  username?: string
  owner_name?: string
  business_name?: string
  email?: string
}

const MerchantHeader: React.FC<MerchantHeaderProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [merchantUser, setMerchantUser] = useState<MerchantUser | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const breadcrumbs = buildBreadcrumbs(pathname)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setMerchantUser(JSON.parse(stored))
      } catch {}
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    router.push('/merchant/login')
  }

  const initials = merchantUser?.username
    ? merchantUser.username.slice(0, 2).toUpperCase()
    : 'MR'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0 z-30">
      {/* ── Left: Logo + Breadcrumb ── */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Section label */}
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent flex-shrink-0 hidden sm:block select-none">
          MERCHANT
        </span>

        {/* Divider */}
        <span className="text-gray-300 hidden sm:block">|</span>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm min-w-0 overflow-hidden">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            // Skip the "merchant" root from display
            if (crumb.label === 'Merchant') return null
            return (
              <React.Fragment key={crumb.href}>
                {index > 1 && (
                  <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
                )}
                {isLast ? (
                  <span className="text-gray-800 font-semibold truncate max-w-[160px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-500 hover:text-orange-500 transition-colors truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            )
          })}
        </nav>
      </div>

      {/* ── Right: Icons + Profile ── */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Messages / Chat Icon */}
        <Link
          href="/merchant/customer-service/messages"
          className="relative p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-all"
          title="Messages"
        >
          <MessageSquare size={20} />
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/merchant/notifications"
          className="relative p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-all"
          title="Notifications"
        >
          <Bell size={20} />
          {/* Notification badge placeholder */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Link>

        {/* Profile Dropdown */}
        <div ref={dropdownRef} className="relative ml-1">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            {/* Name block (hidden on mobile) */}
            <div className="hidden sm:flex flex-col items-start leading-tight min-w-0">
              <span className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">
                @{merchantUser?.username || 'merchant'}
              </span>
              <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                {merchantUser?.owner_name || merchantUser?.business_name || ''}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              {/* Profile Info */}
              <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-purple-50 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  @{merchantUser?.username || 'merchant'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {merchantUser?.owner_name || merchantUser?.business_name || merchantUser?.email}
                </p>
              </div>

              {/* Actions */}
              <div className="py-1">
                <Link
                  href="/merchant/store-settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} className="text-gray-400" />
                  Store Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default MerchantHeader
