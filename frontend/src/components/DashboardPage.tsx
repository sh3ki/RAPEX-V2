'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardPageProps {
  role: 'admin' | 'merchant' | 'rider' | 'user'
}

const roleInfo = {
  admin: { title: 'Admin Dashboard', color: 'bg-red-500', features: ['User Management', 'Platform Settings', 'Reports', 'System Health'] },
  merchant: { title: 'Merchant Dashboard', color: 'bg-green-500', features: ['Products', 'Orders', 'Analytics', 'Settings'] },
  rider: { title: 'Rider Dashboard', color: 'bg-orange-500', features: ['Active Orders', 'Earnings', 'Ratings', 'Profile'] },
  user: { title: 'User Dashboard', color: 'bg-blue-500', features: ['My Orders', 'Wishlist', 'Profile', 'Support'] },
}

export default function DashboardPage({ role }: DashboardPageProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const info = roleInfo[role]

  useEffect(() => {
    // Check authentication
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('access_token')

    if (!storedUser || !accessToken) {
      router.push(`/${role}/login`)
      return
    }

    const userData = JSON.parse(storedUser)

    // Verify role
    if (userData.role !== role) {
      router.push(`/${userData.role}/dashboard`)
      return
    }

    setUser(userData)
    setLoading(false)
  }, [role, router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    router.push(`/${role}/login`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className={`${info.color} text-white p-6 shadow-lg`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{info.title}</h1>
            <p className="text-sm opacity-90">Welcome, {user?.first_name || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm">Name</label>
              <p className="text-lg font-semibold">{user?.first_name} {user?.last_name}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm">Email</label>
              <p className="text-lg font-semibold">{user?.email}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm">Role</label>
              <p className="text-lg font-semibold capitalize">{user?.role}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm">Phone</label>
              <p className="text-lg font-semibold">{user?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {info.features.map((feature) => (
            <div key={feature} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h3 className="font-bold text-gray-800 mb-2">{feature}</h3>
              <p className="text-gray-600 text-sm">Coming soon</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>RAPEX E-Commerce & Delivery Platform</p>
          <Link href="/" className="text-blue-500 hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}
