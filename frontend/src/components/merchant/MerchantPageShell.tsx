'use client'

import React, { useLayoutEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MerchantLayout from './MerchantLayout'

interface MerchantPageShellProps {
  /** Page title shown in filler content */
  title: string
  /** Optional subtitle / description */
  description?: string
  /** Optional icon node displayed alongside the title */
  icon?: React.ReactNode
  /** Optional page-specific content. If omitted, a filler placeholder is rendered. */
  children?: React.ReactNode
}

/**
 * MerchantPageShell
 *
 * Reusable shell for every merchant portal page.
 * - Performs auth guard (redirects to login if no token)
 * - Uses useLayoutEffect so the sync localStorage check completes before
 *   the browser paints — no spinner flash on every navigation.
 *   The spinner (LoadingOverlay) is reserved for real async operations.
 * - Wraps content in MerchantLayout (sidebar + header)
 */
const MerchantPageShell: React.FC<MerchantPageShellProps> = ({
  title,
  description,
  icon,
  children,
}) => {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  // useLayoutEffect fires synchronously before browser paint.
  // localStorage.getItem is instant (<1ms), so ready=true is set before
  // anything renders — eliminating the spinner flash on every page nav.
  useLayoutEffect(() => {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')

    if (!token || !user) {
      router.push('/merchant/login')
      return
    }

    // Verify role
    try {
      const parsed = JSON.parse(user)
      if (parsed.role && parsed.role !== 'merchant') {
        router.push(`/${parsed.role}/dashboard`)
        return
      }
    } catch {}

    setReady(true)
  }, [router])

  // ── Not yet verified: return null (invisible) — resolves before browser paints
  // so users never see a blank flash. Spinner only renders for real async waits.
  if (!ready) return null

  // ── Authenticated: render layout with content ────────────────────────────
  return (
    <MerchantLayout>
      <div className="p-6 sm:p-8">
        {children ?? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* Filler Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-lg w-full">
              {icon && (
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-orange-100 to-purple-100 text-orange-500">
                  {icon}
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              {description && (
                <p className="text-sm text-gray-500 mb-6">{description}</p>
              )}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-white text-sm font-medium shadow-md shadow-orange-200">
                <span className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
                Coming Soon
              </div>
              <p className="mt-4 text-xs text-gray-400">
                This section is under construction. Check back soon!
              </p>
            </div>
          </div>
        )}
      </div>
    </MerchantLayout>
  )
}

export default MerchantPageShell
