'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Package,
  TrendingUp,
  Bell,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Wallet,
  MessageSquare,
  Tag,
  BarChart2,
  Lightbulb,
  CreditCard,
  Landmark,
  Headphones,
  ListOrdered,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  PlusCircle,
  Layers,
  Leaf,
  UtensilsCrossed,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavChild {
  label: string
  href: string
  icon: React.ReactNode
}

interface NavItem {
  label: string
  icon: React.ReactNode
  href?: string
  children?: NavChild[]
  key?: string
}

// ─── Navigation Config ────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    href: '/merchant/dashboard',
  },
  {
    label: 'Orders',
    icon: <ShoppingBag size={20} />,
    key: 'orders',
    children: [
      { label: 'Active', href: '/merchant/orders/active', icon: <ListOrdered size={16} /> },
      { label: 'Completed', href: '/merchant/orders/completed', icon: <CheckCircle2 size={16} /> },
      { label: 'Cancellations', href: '/merchant/orders/cancellations', icon: <XCircle size={16} /> },
      { label: 'Return / Refunds', href: '/merchant/orders/returns', icon: <RefreshCcw size={16} /> },
    ],
  },
  {
    label: 'My Shop',
    icon: <Store size={20} />,
    key: 'shop',
    children: [
      { label: 'Shop Products', href: '/merchant/shop/products', icon: <Package size={16} /> },
      { label: 'Add Product', href: '/merchant/shop/add', icon: <PlusCircle size={16} /> },
      { label: 'Bulk Products', href: '/merchant/shop/bulk', icon: <Layers size={16} /> },
    ],
  },
  {
    label: 'Fresh Market',
    icon: <Leaf size={20} />,
    href: '/merchant/fresh-market',
  },
  {
    label: 'Food Menu',
    icon: <UtensilsCrossed size={20} />,
    href: '/merchant/food-menu',
  },
  {
    label: 'Pre-Loved Products',
    icon: <Tag size={20} />,
    href: '/merchant/pre-loved',
  },
  {
    label: 'Inventory',
    icon: <Package size={20} />,
    href: '/merchant/inventory',
  },
  {
    label: 'Performance',
    icon: <TrendingUp size={20} />,
    key: 'performance',
    children: [
      { label: 'Sales Reports', href: '/merchant/performance/sales-reports', icon: <BarChart2 size={16} /> },
      { label: 'Analytics', href: '/merchant/performance/analytics', icon: <TrendingUp size={16} /> },
      { label: 'Business Insights', href: '/merchant/performance/insights', icon: <Lightbulb size={16} /> },
    ],
  },
  {
    label: 'Finance',
    icon: <Wallet size={20} />,
    key: 'finance',
    children: [
      { label: 'Wallet', href: '/merchant/finance/wallet', icon: <Wallet size={16} /> },
      { label: 'Settlement / Payouts', href: '/merchant/finance/payouts', icon: <CreditCard size={16} /> },
      { label: 'Bank Account Settings', href: '/merchant/finance/bank', icon: <Landmark size={16} /> },
    ],
  },
  {
    label: 'Notifications',
    icon: <Bell size={20} />,
    href: '/merchant/notifications',
  },
  {
    label: 'Customer Service',
    icon: <Headphones size={20} />,
    key: 'customer-service',
    children: [
      { label: 'Messages', href: '/merchant/customer-service/messages', icon: <MessageSquare size={16} /> },
    ],
  },
  {
    label: 'Store Settings',
    icon: <Settings size={20} />,
    href: '/merchant/store-settings',
  },
  {
    label: 'Help & Support',
    icon: <HelpCircle size={20} />,
    href: '/merchant/help',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface MerchantSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const MerchantSidebar: React.FC<MerchantSidebarProps> = ({ isCollapsed, onToggle }) => {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Auto-expand active groups on mount / route change
  useEffect(() => {
    const active = new Set<string>()
    NAV_ITEMS.forEach((item) => {
      if (item.children && item.key) {
        const hasActive = item.children.some((child) => pathname.startsWith(child.href))
        if (hasActive) active.add(item.key)
      }
    })
    setExpandedGroups(active)
  }, [pathname])

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside
      className={`
        relative bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shadow-sm
        transition-all duration-300 ease-in-out flex-shrink-0
        ${isCollapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* ── Brand / Logo ── */}
      <div className="flex items-center h-16 px-3 border-b border-gray-100 flex-shrink-0">
        {/* Logo image always visible */}
        <Link href="/merchant/dashboard" className="flex-shrink-0">
          <Image
            src="/rapexlogosquare.png"
            alt="RAPEX"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
        </Link>
        {!isCollapsed && (
          <span className="ml-2 flex-1 text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent select-none">
            RAPEX
          </span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
        {NAV_ITEMS.map((item, idx) => {
          if (item.href) {
            // ── Leaf item ──────────────────────────────────────────────────
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-orange-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`}>{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          }

          if (item.children && item.key) {
            // ── Group item ─────────────────────────────────────────────────
            const groupKey = item.key
            const isExpanded = expandedGroups.has(groupKey)
            const anyChildActive = item.children.some((c) => isActive(c.href))

            return (
              <div key={groupKey}>
                <button
                  onClick={() => {
                    if (isCollapsed) return
                    toggleGroup(groupKey)
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${anyChildActive
                      ? 'text-orange-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className={`flex-shrink-0 ${anyChildActive ? 'text-orange-500' : 'text-gray-500'}`}>{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      <span className="flex-shrink-0 text-gray-400">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    </>
                  )}
                </button>

                {/* ── Sub-items ── */}
                {!isCollapsed && isExpanded && (
                  <div className="mt-1 ml-3 pl-3 border-l border-gray-200 space-y-0.5">
                    {item.children.map((child) => {
                      const childActive = isActive(child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`
                            flex items-center gap-2.5 px-2 py-2 rounded-md text-xs font-medium transition-all duration-150
                            ${childActive
                              ? 'bg-orange-50 text-orange-600'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                            }
                          `}
                        >
                          <span className={`flex-shrink-0 ${childActive ? 'text-orange-500' : ''}`}>{child.icon}</span>
                          <span className="truncate">{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return null
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0">
        {!isCollapsed && (
          <p className="text-[10px] text-gray-400 text-center select-none">
            © {new Date().getFullYear()} RAPEX Platform
          </p>
        )}
      </div>
    </aside>
  )
}

export default MerchantSidebar
