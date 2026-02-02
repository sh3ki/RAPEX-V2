'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarItem {
  label: string
  href: string
  icon?: React.ReactNode
  badge?: string | number
}

interface SidebarProps {
  items: SidebarItem[]
  logo?: React.ReactNode
  footer?: React.ReactNode
}

const Sidebar: React.FC<SidebarProps> = ({ items, logo, footer }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  
  return (
    <aside className={`bg-gradient-to-b from-orange-500 to-purple-600 text-white h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col shadow-2xl`}>
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="font-bold text-xl">
              {logo || 'RAPEX'}
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item, index) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'hover:bg-white/10'
              }`}
            >
              {item.icon && <span className="text-xl">{item.icon}</span>}
              {!isCollapsed && (
                <>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-bold bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-white/20">
          {footer}
        </div>
      )}
    </aside>
  )
}

export default Sidebar
