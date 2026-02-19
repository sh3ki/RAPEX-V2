'use client'

import React, { useState } from 'react'
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

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <MerchantSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* ── Main Column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <MerchantHeader onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MerchantLayout
