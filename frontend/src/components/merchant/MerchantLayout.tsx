'use client'

import React, { useState, useEffect } from 'react'
import MerchantSidebar from './MerchantSidebar'
import MerchantHeader from './MerchantHeader'

interface MerchantLayoutProps {
  children: React.ReactNode
}

/**
 * MerchantLayout
 *
 * Shared layout for all merchant dashboard pages.
 * Renders the collapsible sidebar + top header + main content area.
 *
 * Usage:
 *   <MerchantLayout>
 *     <YourPageContent />
 *   </MerchantLayout>
 */
const MerchantLayout: React.FC<MerchantLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Restore collapsed state from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem('sidebarCollapsed')
    if (stored === 'true') setSidebarCollapsed(true)
  }, [])

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebarCollapsed', String(next))
      return next
    })
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <MerchantSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* ── Main Column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header – hamburger opens mobile sidebar on small screens */}
        <MerchantHeader onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MerchantLayout
