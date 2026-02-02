'use client'

import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    const accessToken = localStorage.getItem('access_token')

    if (!user || !accessToken) {
      router.push('/')
      return
    }

    if (requiredRole) {
      const userData = JSON.parse(user)
      if (userData.role !== requiredRole) {
        router.push(`/${userData.role}/dashboard`)
      }
    }
  }, [requiredRole, router])

  return <>{children}</>
}
