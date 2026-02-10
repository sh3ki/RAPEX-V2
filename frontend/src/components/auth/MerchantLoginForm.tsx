'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { 
  HiShoppingCart, 
  HiCreditCard, 
  HiTruck, 
  HiShoppingBag, 
  HiCube, 
  HiChartBar, 
  HiCurrencyDollar, 
  HiTag, 
  HiLocationMarker,
  HiGift,
  HiReceiptTax,
  HiCash,
  HiLightningBolt,
  HiShieldCheck,
  HiUsers
} from 'react-icons/hi'
import { Button, Input, LoadingSpinner, FeatureCard, Icon } from '@/components/ui'

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
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Abstract Background Pattern - More floating shapes outside container */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Large geometric shapes - Outside container */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-3xl transform -rotate-45 -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-3xl transform rotate-45 translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-white/8 rounded-3xl transform rotate-12"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-white/8 rounded-3xl transform -rotate-12"></div>
        <div className="absolute top-10 -left-32 w-72 h-72 bg-white/9 rounded-3xl transform rotate-25"></div>
        <div className="absolute bottom-10 -right-32 w-72 h-72 bg-white/9 rounded-3xl transform -rotate-25"></div>
        
        {/* Medium rectangles - Outside container */}
        <div className="absolute top-20 left-5 w-40 h-40 bg-white/8 rounded-xl transform rotate-45"></div>
        <div className="absolute bottom-32 right-5 w-40 h-40 bg-white/8 rounded-xl transform -rotate-45"></div>
        <div className="absolute top-1/2 -left-16 w-48 h-48 bg-white/7 rounded-2xl transform rotate-30"></div>
        <div className="absolute bottom-1/3 -right-16 w-52 h-52 bg-white/7 rounded-2xl transform -rotate-30"></div>
        <div className="absolute top-10 right-10 w-44 h-44 bg-white/7 rounded-2xl transform rotate-15"></div>
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-white/7 rounded-2xl transform -rotate-25"></div>
        <div className="absolute top-3/4 -left-24 w-50 h-50 bg-white/8 rounded-2xl transform rotate-40"></div>
        <div className="absolute bottom-1/2 -right-20 w-46 h-46 bg-white/8 rounded-2xl transform -rotate-35"></div>
        
        {/* Small rectangles - Outside container */}
        <div className="absolute top-1/2 left-5 w-24 h-24 bg-white/8 rounded-lg transform rotate-12"></div>
        <div className="absolute bottom-1/3 right-5 w-24 h-24 bg-white/8 rounded-lg transform -rotate-12"></div>
        <div className="absolute top-1/3 -left-10 w-28 h-28 bg-white/7 rounded-xl transform rotate-45"></div>
        <div className="absolute bottom-1/4 left-8 w-32 h-32 bg-white/7 rounded-xl transform -rotate-20"></div>
        <div className="absolute top-3/4 right-8 w-36 h-36 bg-white/8 rounded-xl transform rotate-35"></div>
        <div className="absolute bottom-2/3 left-16 w-20 h-20 bg-white/8 rounded-lg transform -rotate-15"></div>
        <div className="absolute top-1/4 right-12 w-32 h-32 bg-white/7 rounded-xl transform rotate-20"></div>
        <div className="absolute bottom-1/2 left-12 w-28 h-28 bg-white/8 rounded-lg transform -rotate-40"></div>
        <div className="absolute top-2/3 -right-12 w-38 h-38 bg-white/7 rounded-xl transform rotate-50"></div>
        <div className="absolute bottom-3/4 -left-14 w-34 h-34 bg-white/8 rounded-xl transform -rotate-30"></div>
        <div className="absolute top-1/3 right-6 w-30 h-30 bg-white/7 rounded-lg transform rotate-25"></div>
        <div className="absolute bottom-1/4 -right-8 w-42 h-42 bg-white/8 rounded-xl transform -rotate-45"></div>

        {/* E-commerce Icons Only - Using Heroicons - All same size (w-12 h-12) - Grayish/Transparent */}
        <div className="absolute top-20 right-24 opacity-20">
          <HiShoppingCart className="w-12 h-12 text-gray-800" />
        </div>
        <div className="absolute bottom-32 left-20 opacity-25">
          <HiCube className="w-12 h-12 text-gray-700" />
        </div>
        <div className="absolute top-1/3 right-16 opacity-20">
          <HiTruck className="w-12 h-12 text-gray-800" />
        </div>
        <div className="absolute bottom-20 right-1/4 opacity-25">
          <HiCreditCard className="w-12 h-12 text-gray-700" />
        </div>
        <div className="absolute top-1/4 left-1/3 opacity-20">
          <HiShoppingBag className="w-12 h-12 text-gray-800" />
        </div>
        <div className="absolute top-2/3 left-16 opacity-25">
          <HiCash className="w-12 h-12 text-gray-700" />
        </div>
        <div className="absolute top-1/2 left-1/3 opacity-20">
          <HiShoppingCart className="w-12 h-12 text-gray-800" />
        </div>
        <div className="absolute bottom-1/3 left-2/3 opacity-25">
          <HiCurrencyDollar className="w-12 h-12 text-gray-700" />
        </div>
        <div className="absolute top-3/4 right-1/3 opacity-20">
          <HiTag className="w-12 h-12 text-gray-800" />
        </div>
        <div className="absolute bottom-1/2 right-1/4 opacity-25">
          <HiLocationMarker className="w-12 h-12 text-gray-700" />
        </div>
        <div className="absolute top-1/3 left-20 opacity-20">
          <HiGift className="w-12 h-12 text-gray-800" />
        </div>
        <div className="absolute bottom-1/4 right-16 opacity-25">
          <HiReceiptTax className="w-12 h-12 text-gray-700" />
        </div>
        <div className="absolute top-2/3 right-1/3 opacity-20">
          <HiTruck className="w-12 h-12 text-gray-800" />
        </div>
        <div className="absolute bottom-2/3 left-1/4 opacity-25">
          <HiShoppingBag className="w-12 h-12 text-gray-700" />
        </div>
        <div className="absolute top-1/4 right-1/3 opacity-20">
          <HiCube className="w-12 h-12 text-gray-800" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 opacity-25">
          <HiCreditCard className="w-12 h-12 text-gray-700" />
        </div>
        <div className="absolute top-1/2 right-12 opacity-20">
          <HiCash className="w-12 h-12 text-gray-800" />
        </div>
        <div className="absolute bottom-1/2 left-24 opacity-25">
          <HiGift className="w-12 h-12 text-gray-700" />
        </div>
        <div className="absolute top-3/4 left-1/4 opacity-20">
          <HiTag className="w-12 h-12 text-gray-800" />
        </div>
        <div className="absolute bottom-3/4 right-1/4 opacity-25">
          <HiShoppingCart className="w-12 h-12 text-gray-700" />
        </div>
      </div>

      {/* Single Centered Container - 5/11 Form + 7/11 Info */}
      <div className="relative z-10 max-w-5xl w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Side - Login Form (5/11) */}
          <div className="lg:col-span-5 p-6 lg:p-8">
            {/* Logo - Using rapexlogosquare.png */}
            <div className="flex items-center justify-center mb-6">
              <Image 
                src="/rapexlogosquare.png" 
                alt="Rapex Logo" 
                width={64} 
                height={64}
                className="rounded-2xl shadow-lg"
                priority
              />
            </div>

            {/* Header - Larger */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
              Merchant Portal
            </h1>
            <p className="text-gray-600 text-center text-base mb-6">Access your merchant dashboard</p>

            {/* Form - Larger inputs */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input - Larger */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Username or Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                    className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input - Larger */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-12 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot Password - Larger */}
              <div className="flex items-center justify-between pt-2">
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

              {/* Sign In Button - Larger */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6 py-3 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Sign Up Link - Larger */}
            <p className="text-center text-gray-600 text-sm mt-5">
              Don't have an account?{' '}
              <Link href="/merchant/signup" className="text-orange-600 hover:text-orange-700 font-semibold">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Right Side - Promotional Content (7/11) - Different gradient direction */}
          <div className="hidden lg:block lg:col-span-7 bg-gradient-to-tl from-orange-500 via-pink-500 to-purple-600 p-8 text-white relative overflow-hidden">
            {/* Additional overlay rectangles for right side */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-2xl transform rotate-12"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-2xl transform -rotate-12"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Top Section */}
              <div>
                {/* Icon & Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <HiLightningBolt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">Rapex Merchant</h3>
                      <p className="text-white/80 text-xs">Enterprise Solution</p>
                    </div>
                  </div>
                  <div className="bg-orange-500 px-3 py-1.5 rounded-full">
                    <span className="text-white font-bold text-xs">Trusted by 10K+</span>
                  </div>
                </div>

                {/* Main Heading */}
                <h2 className="text-4xl font-bold leading-tight mb-3">
                  Grow Your <span className="text-orange-400">Business</span>
                  <br />
                  With Rapex
                </h2>

                {/* Description */}
                <p className="text-base text-white/90 mb-6 leading-relaxed">
                  Join thousands of merchants who trust Rapex for their delivery and payment solutions.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <FeatureCard
                  icon={<HiLightningBolt className="w-6 h-6 text-white" />}
                  title="Fast Delivery"
                  description="Quick and reliable service"
                />
                <FeatureCard
                  icon={<HiShieldCheck className="w-6 h-6 text-white" />}
                  title="Secure Payments"
                  description="Protected transactions"
                />
                <FeatureCard
                  icon={<HiChartBar className="w-6 h-6 text-white" />}
                  title="Analytics"
                  description="Track your performance"
                />
                <FeatureCard
                  icon={<HiUsers className="w-6 h-6 text-white" />}
                  title="Support"
                  description="24/7 help and onboarding"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer outside container - At bottom of screen */}
      <div className="relative z-10 text-center mt-6">
        <p className="text-white/80 text-sm">© 2025 Rapex. All rights reserved.</p>
      </div>
    </div>
  )
}
