'use client'

import React, { useEffect, useState, useRef } from 'react'
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
  X,
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
    key: 'fresh-market',
    children: [
      { label: 'My Fresh Market', href: '/merchant/fresh-market/products', icon: <Package size={16} /> },
      { label: 'Add Fresh Products', href: '/merchant/fresh-market/add', icon: <PlusCircle size={16} /> },
      { label: 'Bulk Fresh Products', href: '/merchant/fresh-market/bulk', icon: <Layers size={16} /> },
    ],
  },
  {
    label: 'Ready-to-Eat Foods',
    icon: <UtensilsCrossed size={20} />,
    key: 'ready-to-eat',
    children: [
      { label: 'My Food Products', href: '/merchant/ready-to-eat/products', icon: <Package size={16} /> },
      { label: 'Add Food Products', href: '/merchant/ready-to-eat/add', icon: <PlusCircle size={16} /> },
      { label: 'Bulk Food Products', href: '/merchant/ready-to-eat/bulk', icon: <Layers size={16} /> },
    ],
  },
  {
    label: 'Pre-Loved Shop',
    icon: <Tag size={20} />,
    key: 'pre-loved',
    children: [
      { label: 'My Pre-Loved Products', href: '/merchant/pre-loved/products', icon: <Package size={16} /> },
      { label: 'Add Pre-Loved Products', href: '/merchant/pre-loved/add', icon: <PlusCircle size={16} /> },
      { label: 'Bulk Pre-Loved Products', href: '/merchant/pre-loved/bulk', icon: <Layers size={16} /> },
    ],
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
  /** Desktop collapsed state */
  isCollapsed: boolean
  onToggle: () => void
  /** Mobile drawer open state */
  isMobileOpen: boolean
  onMobileClose: () => void
}

const MerchantSidebar: React.FC<MerchantSidebarProps> = ({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}) => {
  const pathname = usePathname()

  // ─── Flyout state (desktop collapsed hover panel) ─────────────────────────
  interface FlyoutState {
    key: string
    label: string
    children: NavChild[]
    top: number
  }
  const [flyout, setFlyout] = useState<FlyoutState | null>(null)
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openFlyout = (state: FlyoutState) => {
    if (flyoutTimer.current) clearTimeout(flyoutTimer.current)
    setFlyout(state)
  }
  const closeFlyout = () => {
    flyoutTimer.current = setTimeout(() => setFlyout(null), 120)
  }
  const keepFlyout = () => {
    if (flyoutTimer.current) clearTimeout(flyoutTimer.current)
  }

  // Close mobile drawer on route change; also clear flyout
  useEffect(() => {
    onMobileClose()
    setFlyout(null)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  // ─── Shared nav content (collapsed controls appearance) ──────────────────
  const renderNav = (collapsed: boolean) => (
    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-200">
      {NAV_ITEMS.map((item) => {
        // ── Single leaf item ──────────────────────────────────────────────
        if (item.href) {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-orange-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        }

        // ── Section item ──────────────────────────────────────────────────
        if (item.children && item.key) {
          const anyChildActive = item.children.some((c) => isActive(c.href))

          // ── COLLAPSED: single parent icon; flyout rendered as fixed overlay ─
          if (collapsed) {
            return (
              <div
                key={item.key}
                className="mt-1"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  openFlyout({
                    key: item.key!,
                    label: item.label,
                    children: item.children!,
                    top: rect.top,
                  })
                }}
                onMouseLeave={closeFlyout}
              >
                {/* Section icon — gradient active when any child is active */}
                <div
                  className={`
                    flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-150 cursor-default
                    ${anyChildActive
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-orange-200'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                  title={item.label}
                >
                  <span className={`flex-shrink-0 ${anyChildActive ? 'text-white' : ''}`}>
                    {item.icon}
                  </span>
                </div>
              </div>
            )
          }

          // ── EXPANDED: section title + always-visible children ────────
          return (
            <div key={item.key}>
              {/* Section title header */}
              <div className="flex items-center gap-2 px-3 pt-4 pb-1">
                <span className={`flex-shrink-0 ${anyChildActive ? 'text-orange-500' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest select-none
                    ${anyChildActive ? 'text-orange-500' : 'text-gray-400'}
                  `}
                >
                  {item.label}
                </span>
              </div>

              {/* Children — active uses full gradient to match leaf items */}
              <div className="space-y-0.5">
                {item.children.map((child) => {
                  const childActive = isActive(child.href)
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`
                        flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-lg text-xs font-medium transition-all duration-150
                        ${childActive
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-orange-200'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className={`flex-shrink-0 ${childActive ? 'text-white' : ''}`}>
                        {child.icon}
                      </span>
                      <span className="truncate">{child.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        }

        return null
      })}
    </nav>
  )

  // ─── Brand bar ────────────────────────────────────────────────────────────
  const renderBrand = (collapsed: boolean, isMobile = false) => (
    <div className="flex items-center h-16 px-3 border-b border-gray-100 flex-shrink-0">
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
      {!collapsed && (
        <span className="ml-2 flex-1 text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent select-none">
          RAPEX
        </span>
      )}
      {isMobile ? (
        <button
          onClick={onMobileClose}
          className="ml-auto p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Close sidebar"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      ) : (
        <button
          onClick={onToggle}
          className="ml-auto p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      )}
    </div>
  )

  const renderFooter = (collapsed: boolean) => (
    <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0">
      {!collapsed && (
        <p className="text-[10px] text-gray-400 text-center select-none">
          © {new Date().getFullYear()} RAPEX Platform
        </p>
      )}
    </div>
  )

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          MOBILE: Slide-in drawer  (visible only on < md)
      ══════════════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col h-screen shadow-xl
          transform transition-transform duration-300 ease-in-out
          md:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Mobile navigation"
      >
        {renderBrand(false, true)}
        {renderNav(false)}
        {renderFooter(false)}
      </aside>

      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP: Sticky collapsible sidebar  (visible only on md+)
      ══════════════════════════════════════════════════════════════════ */}
      <aside
        className={`
          hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0
          bg-white border-r border-gray-200 shadow-sm
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
        `}
        aria-label="Desktop navigation"
      >
        {renderBrand(isCollapsed)}
        {renderNav(isCollapsed)}
        {renderFooter(isCollapsed)}
      </aside>

      {/* ══════════════════════════════════════════════════════════════════
          FLYOUT — fixed overlay, desktop collapsed mode only
          Icon-only child buttons, layered on top of page content
      ══════════════════════════════════════════════════════════════════ */}
      {isCollapsed && flyout && (
        <div
          className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 py-2 hidden md:block"
          style={{ left: 80, top: flyout.top - 4 }}
          onMouseEnter={keepFlyout}
          onMouseLeave={closeFlyout}
        >
          {/* Icon-only child links */}
          <div className="flex flex-col gap-0.5 px-2 py-1">
            {flyout.children.map((child) => {
              const childActive = isActive(child.href)
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  title={child.label}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150
                    ${childActive
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-orange-200'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className={`flex-shrink-0 ${childActive ? 'text-white' : ''}`}>
                    {child.icon}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export default MerchantSidebar
