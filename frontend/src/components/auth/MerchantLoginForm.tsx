'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Input, LoadingSpinner, FeatureCard } from '@/components/ui'

export default function MerchantLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // API call will be here
    setTimeout(() => setIsLoading(false), 2000)
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 relative overflow-hidden flex items-center justify-center p-4">
      {/* Abstract Background Rectangles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large rectangles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-3xl transform -rotate-45 -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-3xl transform rotate-45 translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-white/5 rounded-2xl transform rotate-12"></div>
        <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-white/5 rounded-2xl transform -rotate-12"></div>
        
        {/* Medium rectangles */}
        <div className="absolute top-20 left-1/4 w-40 h-40 bg-white/5 rounded-xl transform rotate-45"></div>
        <div className="absolute bottom-32 right-1/3 w-40 h-40 bg-white/5 rounded-xl transform -rotate-45"></div>
        
        {/* Small rectangles */}
        <div className="absolute top-1/2 left-20 w-24 h-24 bg-white/5 rounded-lg transform rotate-12"></div>
        <div className="absolute bottom-1/3 right-20 w-24 h-24 bg-white/5 rounded-lg transform -rotate-12"></div>

        {/* Minimalist Black Icons Scattered */}
        {/* Shopping Cart */}
        <svg className="absolute top-20 right-24 w-12 h-12 text-black/15" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.6-1.4 2.5c-.2.3-.2.6-.2 1 0 1.1.9 2 2 2h12v-2H7.4c-.1 0-.2-.1-.2-.2l.1-.2L8.1 13h7.5c.7 0 1.4-.4 1.7-1l3.6-6.5c.1-.2.1-.3.1-.5 0-.6-.4-1-1-1H5.2l-.9-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        
        {/* Delivery Box */}
        <svg className="absolute bottom-32 left-20 w-14 h-14 text-black/15" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.7 1.3 3 3 3s3-1.3 3-3h6c0 1.7 1.3 3 3 3s3-1.3 3-3h2v-5l-3-4zM6 18.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm13.5-9l1.9 2.5H17V9.5h2.5zm-1.5 9c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"/>
        </svg>
        
        {/* Bike/Rider */}
        <svg className="absolute top-1/3 right-16 w-14 h-14 text-black/15" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/>
        </svg>
        
        {/* Credit Card */}
        <svg className="absolute bottom-20 right-1/4 w-12 h-12 text-black/15" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
        </svg>
        
        {/* Store */}
        <svg className="absolute top-1/4 left-1/3 w-14 h-14 text-black/10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/>
        </svg>
        
        {/* Chart */}
        <svg className="absolute top-2/3 left-16 w-12 h-12 text-black/15" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
        </svg>
      </div>

      {/* Centered Container Box */}
      <div className="relative z-10 max-w-6xl w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Login Form */}
          <div className="p-8 lg:p-12">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                R
              </div>
            </div>

            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Merchant Login</h1>
            <p className="text-gray-600 text-center mb-8">Access your merchant dashboard</p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Username or Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Remember & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  href="/merchant/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6 py-3 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 text-sm mt-6">
              Don't have an account?{' '}
              <Link href="/merchant/signup" className="text-orange-600 hover:text-orange-700 font-semibold">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Right Side - Promotional Content with Gradient Background */}
          <div className="hidden lg:block bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-12 text-white relative overflow-hidden">
            {/* Additional overlay rectangles for right side */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-2xl transform rotate-12"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-2xl transform -rotate-12"></div>
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 text-center">
                Grow Your <span className="text-yellow-300">Business</span>
                <br />
                With Rapex
              </h2>

              {/* Description */}
              <p className="text-lg text-white/90 mb-8 leading-relaxed text-center">
                Join thousands of merchants who trust Rapex for their delivery and payment solutions.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-5">
                <FeatureCard
                  icon={
                    <svg className="w-7 h-7 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                  title="Fast Delivery"
                  description="Quick and reliable service"
                />
                <FeatureCard
                  icon={
                    <svg className="w-7 h-7 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1a5 5 0 00-5 5v1H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-2 5a2 2 0 114 0v1H10V6zm2 7a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  }
                  title="Secure Payments"
                  description="Protected transactions"
                />
                <FeatureCard
                  icon={
                    <svg className="w-7 h-7 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 13h2v7H3v-7zm4-6h2v13H7V7zm4 3h2v10h-2V10zm4-2h2v12h-2V8zm4-3h2v15h-2V5z" />
                    </svg>
                  }
                  title="Analytics"
                  description="Track your performance"
                />
                <FeatureCard
                  icon={
                    <svg className="w-7 h-7 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  }
                  title="Support"
                  description="24/7 help and onboarding"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer inside container */}
        <div className="text-center py-4 text-gray-600 text-sm border-t border-gray-200">
          © 2025 Rapex. All rights reserved.
        </div>
      </div>
    </div>
  )
}
