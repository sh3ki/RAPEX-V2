'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api'
import Link from 'next/link'

interface LoginPageProps {
  role: 'admin' | 'merchant' | 'rider' | 'user'
}

const roleColors = {
  admin: { bg: 'bg-red-500', hover: 'hover:bg-red-600', text: 'Admin' },
  merchant: { bg: 'bg-green-500', hover: 'hover:bg-green-600', text: 'Merchant' },
  rider: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'Rider' },
  user: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'User' },
}

export default function LoginPage({ role }: LoginPageProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const colors = roleColors[role]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.post('/users/login/', {
        email,
        password,
      })

      const { access, refresh, user } = response.data

      // Store tokens and user
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(user))

      // Verify role matches
      if (user.role !== role) {
        setError(`This login is for ${role}s. Your account is a ${user.role}.`)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        return
      }

      // Redirect to dashboard
      router.push(`/${role}/dashboard`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">{colors.text} Login</h1>
          <p className="text-gray-600 text-center mb-8">RAPEX Platform</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${colors.bg} ${colors.hover} text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-gray-600 text-sm text-center">
              Don't have an account?{' '}
              <Link href={`/${role}/register`} className="text-blue-500 hover:underline">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 text-sm hover:text-gray-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
