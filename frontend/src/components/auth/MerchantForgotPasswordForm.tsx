'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Shield,
} from 'lucide-react'
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
  HiUsers,
} from 'react-icons/hi'
import { FaWallet, FaBoxOpen, FaMoneyBillWave } from 'react-icons/fa'
import { Button, FeatureCard, LoadingOverlay } from '@/components/ui'
import Modal from '@/components/ui/Modal'
import ToastContainer from '@/components/ui/ToastContainer'
import { useToast } from '@/hooks/useToast'
import { merchantAPI } from '@/lib/api'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Step = 'email' | 'otp' | 'reset' | 'done'

interface PasswordStrength {
  score: number          // 0-4
  label: string
  color: string
  barColor: string
  checks: {
    minLength: boolean
    hasUpper: boolean
    hasLower: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function evaluatePassword(pw: string): PasswordStrength {
  const checks = {
    minLength: pw.length >= 8,
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasNumber: /\d/.test(pw),
    hasSpecial: /[^A-Za-z0-9]/.test(pw),
  }
  const passed = Object.values(checks).filter(Boolean).length
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-emerald-600']
  const barColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500']
  return {
    score: passed,
    label: labels[passed] ?? 'Very Weak',
    color: colors[passed] ?? 'text-red-500',
    barColor: barColors[passed] ?? 'bg-red-500',
    checks,
  }
}

// ─────────────────────────────────────────────
// Background icons (shared with login/signup)
// ─────────────────────────────────────────────
const bgIconWrapperClass =
  'absolute flex items-center justify-center pointer-events-none select-none w-[60px] h-[60px] md:w-[84px] md:h-[84px]'
const bgIconClass = 'w-5 h-5 md:w-7 md:h-7'

const BG_ICONS: Array<{
  key: string
  IconComponent: React.ComponentType<{ className?: string }>
  top: string
  left: string
  color: string
  opacity: number
  rotate?: number
}> = [
  // Row 1 (top) - starting from edge (0%)
  { key: 'r1-1', IconComponent: HiShoppingCart, top: '0%', left: '0%', color: 'text-gray-700', opacity: 0.22, rotate: -12 },
  { key: 'r1-2', IconComponent: HiTruck, top: '0%', left: '8%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
  { key: 'r1-3', IconComponent: HiCreditCard, top: '0%', left: '16%', color: 'text-gray-800', opacity: 0.22, rotate: -8 },
  { key: 'r1-4', IconComponent: HiShoppingBag, top: '0%', left: '24%', color: 'text-gray-700', opacity: 0.20, rotate: 14 },
  { key: 'r1-5', IconComponent: FaWallet, top: '0%', left: '32%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },
  { key: 'r1-6', IconComponent: HiCube, top: '0%', left: '40%', color: 'text-gray-800', opacity: 0.20, rotate: 8 },
  { key: 'r1-7', IconComponent: FaMoneyBillWave, top: '0%', left: '48%', color: 'text-gray-700', opacity: 0.22, rotate: -6 },
  { key: 'r1-8', IconComponent: HiCash, top: '0%', left: '56%', color: 'text-gray-600', opacity: 0.20, rotate: 12 },
  { key: 'r1-9', IconComponent: FaBoxOpen, top: '0%', left: '64%', color: 'text-gray-800', opacity: 0.22, rotate: -14 },
  { key: 'r1-10', IconComponent: HiTag, top: '0%', left: '72%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
  { key: 'r1-11', IconComponent: HiGift, top: '0%', left: '80%', color: 'text-gray-600', opacity: 0.22, rotate: -8 },
  { key: 'r1-12', IconComponent: HiReceiptTax, top: '0%', left: '88%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
  { key: 'r1-13', IconComponent: HiCurrencyDollar, top: '0%', left: '96%', color: 'text-gray-700', opacity: 0.22, rotate: -10 },

  // Row 2
  { key: 'r2-1', IconComponent: HiCube, top: '8%', left: '4%', color: 'text-gray-600', opacity: 0.20, rotate: 8 },
  { key: 'r2-2', IconComponent: HiShoppingBag, top: '8%', left: '12%', color: 'text-gray-800', opacity: 0.22, rotate: -10 },
  { key: 'r2-3', IconComponent: HiTruck, top: '8%', left: '20%', color: 'text-gray-700', opacity: 0.20, rotate: 14 },
  { key: 'r2-4', IconComponent: FaWallet, top: '8%', left: '28%', color: 'text-gray-600', opacity: 0.22, rotate: -12 },
  { key: 'r2-5', IconComponent: HiCash, top: '8%', left: '36%', color: 'text-gray-800', opacity: 0.20, rotate: 10 },
  { key: 'r2-6', IconComponent: HiShoppingCart, top: '8%', left: '44%', color: 'text-gray-700', opacity: 0.22, rotate: -8 },
  { key: 'r2-7', IconComponent: HiCreditCard, top: '8%', left: '52%', color: 'text-gray-600', opacity: 0.20, rotate: 12 },
  { key: 'r2-8', IconComponent: FaBoxOpen, top: '8%', left: '60%', color: 'text-gray-800', opacity: 0.22, rotate: -14 },
  { key: 'r2-9', IconComponent: HiTag, top: '8%', left: '68%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
  { key: 'r2-10', IconComponent: FaMoneyBillWave, top: '8%', left: '76%', color: 'text-gray-600', opacity: 0.22, rotate: -6 },
  { key: 'r2-11', IconComponent: HiCurrencyDollar, top: '8%', left: '84%', color: 'text-gray-800', opacity: 0.20, rotate: 8 },
  { key: 'r2-12', IconComponent: HiGift, top: '8%', left: '92%', color: 'text-gray-700', opacity: 0.22, rotate: -10 },

  // Row 3
  { key: 'r3-1', IconComponent: HiTag, top: '16%', left: '0%', color: 'text-gray-800', opacity: 0.22, rotate: 12 },
  { key: 'r3-2', IconComponent: HiCreditCard, top: '16%', left: '8%', color: 'text-gray-700', opacity: 0.20, rotate: -8 },
  { key: 'r3-3', IconComponent: HiCash, top: '16%', left: '16%', color: 'text-gray-600', opacity: 0.22, rotate: 10 },
  { key: 'r3-4', IconComponent: HiCube, top: '16%', left: '24%', color: 'text-gray-800', opacity: 0.20, rotate: -14 },
  { key: 'r3-5', IconComponent: HiShoppingCart, top: '16%', left: '32%', color: 'text-gray-700', opacity: 0.22, rotate: 12 },
  { key: 'r3-6', IconComponent: FaWallet, top: '16%', left: '40%', color: 'text-gray-600', opacity: 0.20, rotate: -10 },
  { key: 'r3-7', IconComponent: HiTruck, top: '16%', left: '48%', color: 'text-gray-800', opacity: 0.22, rotate: 8 },
  { key: 'r3-8', IconComponent: HiShoppingBag, top: '16%', left: '56%', color: 'text-gray-700', opacity: 0.20, rotate: -12 },
  { key: 'r3-9', IconComponent: FaMoneyBillWave, top: '16%', left: '64%', color: 'text-gray-600', opacity: 0.22, rotate: 14 },
  { key: 'r3-10', IconComponent: HiReceiptTax, top: '16%', left: '72%', color: 'text-gray-800', opacity: 0.20, rotate: -8 },
  { key: 'r3-11', IconComponent: FaBoxOpen, top: '16%', left: '80%', color: 'text-gray-700', opacity: 0.22, rotate: 10 },
  { key: 'r3-12', IconComponent: HiCurrencyDollar, top: '16%', left: '88%', color: 'text-gray-600', opacity: 0.20, rotate: -12 },
  { key: 'r3-13', IconComponent: HiGift, top: '16%', left: '96%', color: 'text-gray-800', opacity: 0.22, rotate: 8 },

  // Row 4
  { key: 'r4-1', IconComponent: HiShoppingBag, top: '24%', left: '4%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
  { key: 'r4-2', IconComponent: HiCube, top: '24%', left: '12%', color: 'text-gray-600', opacity: 0.22, rotate: -8 },
  { key: 'r4-3', IconComponent: FaWallet, top: '24%', left: '20%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
  { key: 'r4-4', IconComponent: HiTruck, top: '24%', left: '28%', color: 'text-gray-700', opacity: 0.22, rotate: -14 },
  { key: 'r4-5', IconComponent: HiTag, top: '24%', left: '36%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
  { key: 'r4-6', IconComponent: HiCash, top: '24%', left: '44%', color: 'text-gray-800', opacity: 0.22, rotate: -8 },
  { key: 'r4-7', IconComponent: HiCreditCard, top: '24%', left: '52%', color: 'text-gray-700', opacity: 0.20, rotate: 12 },
  { key: 'r4-8', IconComponent: FaMoneyBillWave, top: '24%', left: '60%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },
  { key: 'r4-9', IconComponent: HiShoppingCart, top: '24%', left: '68%', color: 'text-gray-800', opacity: 0.20, rotate: 14 },
  { key: 'r4-10', IconComponent: HiGift, top: '24%', left: '76%', color: 'text-gray-700', opacity: 0.22, rotate: -12 },
  { key: 'r4-11', IconComponent: FaBoxOpen, top: '24%', left: '84%', color: 'text-gray-600', opacity: 0.20, rotate: 8 },
  { key: 'r4-12', IconComponent: HiReceiptTax, top: '24%', left: '92%', color: 'text-gray-800', opacity: 0.22, rotate: -10 },

  // Row 5
  { key: 'r5-1', IconComponent: HiCash, top: '32%', left: '0%', color: 'text-gray-600', opacity: 0.22, rotate: 12 },
  { key: 'r5-2', IconComponent: HiShoppingCart, top: '32%', left: '8%', color: 'text-gray-800', opacity: 0.20, rotate: -8 },
  { key: 'r5-3', IconComponent: HiTruck, top: '32%', left: '16%', color: 'text-gray-700', opacity: 0.22, rotate: 10 },
  { key: 'r5-4', IconComponent: FaBoxOpen, top: '32%', left: '24%', color: 'text-gray-600', opacity: 0.20, rotate: -14 },
  { key: 'r5-5', IconComponent: HiCreditCard, top: '32%', left: '32%', color: 'text-gray-800', opacity: 0.22, rotate: 12 },
  { key: 'r5-6', IconComponent: HiCube, top: '32%', left: '40%', color: 'text-gray-700', opacity: 0.20, rotate: -10 },
  { key: 'r5-7', IconComponent: FaWallet, top: '32%', left: '48%', color: 'text-gray-600', opacity: 0.22, rotate: 8 },
  { key: 'r5-8', IconComponent: HiTag, top: '32%', left: '56%', color: 'text-gray-800', opacity: 0.20, rotate: -12 },
  { key: 'r5-9', IconComponent: HiShoppingBag, top: '32%', left: '64%', color: 'text-gray-700', opacity: 0.22, rotate: 14 },
  { key: 'r5-10', IconComponent: HiCurrencyDollar, top: '32%', left: '72%', color: 'text-gray-600', opacity: 0.20, rotate: -8 },
  { key: 'r5-11', IconComponent: FaMoneyBillWave, top: '32%', left: '80%', color: 'text-gray-800', opacity: 0.22, rotate: 10 },
  { key: 'r5-12', IconComponent: HiGift, top: '32%', left: '88%', color: 'text-gray-700', opacity: 0.20, rotate: -12 },
  { key: 'r5-13', IconComponent: HiReceiptTax, top: '32%', left: '96%', color: 'text-gray-800', opacity: 0.22, rotate: 10 },

  // Row 6
  { key: 'r6-1', IconComponent: HiCube, top: '40%', left: '4%', color: 'text-gray-800', opacity: 0.20, rotate: 8 },
  { key: 'r6-2', IconComponent: FaWallet, top: '40%', left: '12%', color: 'text-gray-700', opacity: 0.22, rotate: -10 },
  { key: 'r6-3', IconComponent: HiShoppingBag, top: '40%', left: '20%', color: 'text-gray-600', opacity: 0.20, rotate: 14 },
  { key: 'r6-4', IconComponent: HiTag, top: '40%', left: '28%', color: 'text-gray-800', opacity: 0.22, rotate: -12 },
  { key: 'r6-5', IconComponent: HiCash, top: '40%', left: '36%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
  { key: 'r6-6', IconComponent: HiTruck, top: '40%', left: '44%', color: 'text-gray-600', opacity: 0.22, rotate: -8 },
  { key: 'r6-7', IconComponent: HiShoppingCart, top: '40%', left: '52%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
  { key: 'r6-8', IconComponent: HiReceiptTax, top: '40%', left: '60%', color: 'text-gray-700', opacity: 0.22, rotate: -14 },
  { key: 'r6-9', IconComponent: HiCreditCard, top: '40%', left: '68%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
  { key: 'r6-10', IconComponent: FaBoxOpen, top: '40%', left: '76%', color: 'text-gray-800', opacity: 0.22, rotate: -6 },
  { key: 'r6-11', IconComponent: FaMoneyBillWave, top: '40%', left: '84%', color: 'text-gray-700', opacity: 0.20, rotate: 8 },
  { key: 'r6-12', IconComponent: HiCurrencyDollar, top: '40%', left: '92%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },

  // Row 7
  { key: 'r7-1', IconComponent: HiTruck, top: '48%', left: '0%', color: 'text-gray-700', opacity: 0.22, rotate: 12 },
  { key: 'r7-2', IconComponent: HiShoppingCart, top: '48%', left: '8%', color: 'text-gray-600', opacity: 0.20, rotate: -8 },
  { key: 'r7-3', IconComponent: FaMoneyBillWave, top: '48%', left: '16%', color: 'text-gray-800', opacity: 0.22, rotate: 10 },
  { key: 'r7-4', IconComponent: HiCreditCard, top: '48%', left: '24%', color: 'text-gray-700', opacity: 0.20, rotate: -14 },
  { key: 'r7-5', IconComponent: HiCube, top: '48%', left: '32%', color: 'text-gray-600', opacity: 0.22, rotate: 12 },
  { key: 'r7-6', IconComponent: HiShoppingBag, top: '48%', left: '40%', color: 'text-gray-800', opacity: 0.20, rotate: -10 },
  { key: 'r7-7', IconComponent: HiCash, top: '48%', left: '48%', color: 'text-gray-700', opacity: 0.22, rotate: 8 },
  { key: 'r7-8', IconComponent: FaWallet, top: '48%', left: '56%', color: 'text-gray-600', opacity: 0.20, rotate: -12 },
  { key: 'r7-9', IconComponent: HiTag, top: '48%', left: '64%', color: 'text-gray-800', opacity: 0.22, rotate: 14 },
  { key: 'r7-10', IconComponent: HiGift, top: '48%', left: '72%', color: 'text-gray-700', opacity: 0.20, rotate: -8 },
  { key: 'r7-11', IconComponent: FaBoxOpen, top: '48%', left: '80%', color: 'text-gray-600', opacity: 0.22, rotate: 10 },
  { key: 'r7-12', IconComponent: HiReceiptTax, top: '48%', left: '88%', color: 'text-gray-800', opacity: 0.20, rotate: -12 },
  { key: 'r7-13', IconComponent: HiCurrencyDollar, top: '48%', left: '96%', color: 'text-gray-700', opacity: 0.22, rotate: 8 },

  // Row 8
  { key: 'r8-1', IconComponent: HiShoppingBag, top: '56%', left: '4%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
  { key: 'r8-2', IconComponent: HiCube, top: '56%', left: '12%', color: 'text-gray-800', opacity: 0.22, rotate: -8 },
  { key: 'r8-3', IconComponent: HiCash, top: '56%', left: '20%', color: 'text-gray-700', opacity: 0.20, rotate: 12 },
  { key: 'r8-4', IconComponent: FaWallet, top: '56%', left: '28%', color: 'text-gray-600', opacity: 0.22, rotate: -14 },
  { key: 'r8-5', IconComponent: HiTruck, top: '56%', left: '36%', color: 'text-gray-800', opacity: 0.20, rotate: 10 },
  { key: 'r8-6', IconComponent: HiTag, top: '56%', left: '44%', color: 'text-gray-700', opacity: 0.22, rotate: -8 },
  { key: 'r8-7', IconComponent: HiCreditCard, top: '56%', left: '52%', color: 'text-gray-600', opacity: 0.20, rotate: 12 },
  { key: 'r8-8', IconComponent: HiShoppingCart, top: '56%', left: '60%', color: 'text-gray-800', opacity: 0.22, rotate: -10 },
  { key: 'r8-9', IconComponent: FaMoneyBillWave, top: '56%', left: '68%', color: 'text-gray-700', opacity: 0.20, rotate: 14 },
  { key: 'r8-10', IconComponent: HiCurrencyDollar, top: '56%', left: '76%', color: 'text-gray-600', opacity: 0.22, rotate: -12 },
  { key: 'r8-11', IconComponent: HiReceiptTax, top: '56%', left: '84%', color: 'text-gray-800', opacity: 0.20, rotate: 8 },
  { key: 'r8-12', IconComponent: FaBoxOpen, top: '56%', left: '92%', color: 'text-gray-700', opacity: 0.22, rotate: -10 },

  // Row 9
  { key: 'r9-1', IconComponent: HiCreditCard, top: '64%', left: '0%', color: 'text-gray-800', opacity: 0.22, rotate: 12 },
  { key: 'r9-2', IconComponent: HiTag, top: '64%', left: '8%', color: 'text-gray-700', opacity: 0.20, rotate: -8 },
  { key: 'r9-3', IconComponent: HiCube, top: '64%', left: '16%', color: 'text-gray-600', opacity: 0.22, rotate: 10 },
  { key: 'r9-4', IconComponent: HiShoppingCart, top: '64%', left: '24%', color: 'text-gray-800', opacity: 0.20, rotate: -14 },
  { key: 'r9-5', IconComponent: FaWallet, top: '64%', left: '32%', color: 'text-gray-700', opacity: 0.22, rotate: 12 },
  { key: 'r9-6', IconComponent: HiCash, top: '64%', left: '40%', color: 'text-gray-600', opacity: 0.20, rotate: -10 },
  { key: 'r9-7', IconComponent: HiTruck, top: '64%', left: '48%', color: 'text-gray-800', opacity: 0.22, rotate: 8 },
  { key: 'r9-8', IconComponent: HiShoppingBag, top: '64%', left: '56%', color: 'text-gray-700', opacity: 0.20, rotate: -12 },
  { key: 'r9-9', IconComponent: HiGift, top: '64%', left: '64%', color: 'text-gray-600', opacity: 0.22, rotate: 14 },
  { key: 'r9-10', IconComponent: FaBoxOpen, top: '64%', left: '72%', color: 'text-gray-800', opacity: 0.20, rotate: -8 },
  { key: 'r9-11', IconComponent: FaMoneyBillWave, top: '64%', left: '80%', color: 'text-gray-700', opacity: 0.22, rotate: 10 },
  { key: 'r9-12', IconComponent: HiReceiptTax, top: '64%', left: '88%', color: 'text-gray-600', opacity: 0.20, rotate: -12 },
  { key: 'r9-13', IconComponent: HiCurrencyDollar, top: '64%', left: '96%', color: 'text-gray-800', opacity: 0.22, rotate: 8 },

  // Row 10
  { key: 'r10-1', IconComponent: FaBoxOpen, top: '72%', left: '4%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
  { key: 'r10-2', IconComponent: HiShoppingBag, top: '72%', left: '12%', color: 'text-gray-600', opacity: 0.22, rotate: -8 },
  { key: 'r10-3', IconComponent: HiTruck, top: '72%', left: '20%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
  { key: 'r10-4', IconComponent: HiCash, top: '72%', left: '28%', color: 'text-gray-700', opacity: 0.22, rotate: -14 },
  { key: 'r10-5', IconComponent: HiCreditCard, top: '72%', left: '36%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
  { key: 'r10-6', IconComponent: HiCube, top: '72%', left: '44%', color: 'text-gray-800', opacity: 0.22, rotate: -8 },
  { key: 'r10-7', IconComponent: FaWallet, top: '72%', left: '52%', color: 'text-gray-700', opacity: 0.20, rotate: 12 },
  { key: 'r10-8', IconComponent: HiTag, top: '72%', left: '60%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },
  { key: 'r10-9', IconComponent: HiShoppingCart, top: '72%', left: '68%', color: 'text-gray-800', opacity: 0.20, rotate: 14 },
  { key: 'r10-10', IconComponent: FaMoneyBillWave, top: '72%', left: '76%', color: 'text-gray-700', opacity: 0.22, rotate: -12 },
  { key: 'r10-11', IconComponent: HiCurrencyDollar, top: '72%', left: '84%', color: 'text-gray-600', opacity: 0.20, rotate: 8 },
  { key: 'r10-12', IconComponent: HiGift, top: '72%', left: '92%', color: 'text-gray-800', opacity: 0.22, rotate: -10 },

  // Row 11
  { key: 'r11-1', IconComponent: HiCash, top: '80%', left: '0%', color: 'text-gray-600', opacity: 0.22, rotate: 12 },
  { key: 'r11-2', IconComponent: HiCube, top: '80%', left: '8%', color: 'text-gray-800', opacity: 0.20, rotate: -8 },
  { key: 'r11-3', IconComponent: HiShoppingCart, top: '80%', left: '16%', color: 'text-gray-700', opacity: 0.22, rotate: 10 },
  { key: 'r11-4', IconComponent: FaWallet, top: '80%', left: '24%', color: 'text-gray-600', opacity: 0.20, rotate: -14 },
  { key: 'r11-5', IconComponent: HiTag, top: '80%', left: '32%', color: 'text-gray-800', opacity: 0.22, rotate: 12 },
  { key: 'r11-6', IconComponent: HiTruck, top: '80%', left: '40%', color: 'text-gray-700', opacity: 0.20, rotate: -10 },
  { key: 'r11-7', IconComponent: HiShoppingBag, top: '80%', left: '48%', color: 'text-gray-600', opacity: 0.22, rotate: 8 },
  { key: 'r11-8', IconComponent: HiCreditCard, top: '80%', left: '56%', color: 'text-gray-800', opacity: 0.20, rotate: -12 },
  { key: 'r11-9', IconComponent: FaBoxOpen, top: '80%', left: '64%', color: 'text-gray-700', opacity: 0.22, rotate: 14 },
  { key: 'r11-10', IconComponent: HiReceiptTax, top: '80%', left: '72%', color: 'text-gray-600', opacity: 0.20, rotate: -8 },
  { key: 'r11-11', IconComponent: FaMoneyBillWave, top: '80%', left: '80%', color: 'text-gray-800', opacity: 0.22, rotate: 10 },
  { key: 'r11-12', IconComponent: HiCurrencyDollar, top: '80%', left: '88%', color: 'text-gray-700', opacity: 0.20, rotate: -12 },
  { key: 'r11-13', IconComponent: HiGift, top: '80%', left: '96%', color: 'text-gray-800', opacity: 0.22, rotate: 10 },

  // Row 12 (bottom)
  { key: 'r12-1', IconComponent: HiTruck, top: '88%', left: '4%', color: 'text-gray-800', opacity: 0.20, rotate: 8 },
  { key: 'r12-2', IconComponent: HiShoppingBag, top: '88%', left: '12%', color: 'text-gray-700', opacity: 0.22, rotate: -10 },
  { key: 'r12-3', IconComponent: HiCreditCard, top: '88%', left: '20%', color: 'text-gray-600', opacity: 0.20, rotate: 14 },
  { key: 'r12-4', IconComponent: FaBoxOpen, top: '88%', left: '28%', color: 'text-gray-800', opacity: 0.22, rotate: -12 },
  { key: 'r12-5', IconComponent: HiCube, top: '88%', left: '36%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
  { key: 'r12-6', IconComponent: HiCash, top: '88%', left: '44%', color: 'text-gray-600', opacity: 0.22, rotate: -8 },
  { key: 'r12-7', IconComponent: FaWallet, top: '88%', left: '52%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
  { key: 'r12-8', IconComponent: HiShoppingCart, top: '88%', left: '60%', color: 'text-gray-700', opacity: 0.22, rotate: -14 },
  { key: 'r12-9', IconComponent: HiTag, top: '88%', left: '68%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
  { key: 'r12-10', IconComponent: HiGift, top: '88%', left: '76%', color: 'text-gray-800', opacity: 0.22, rotate: -6 },
  { key: 'r12-11', IconComponent: FaMoneyBillWave, top: '88%', left: '84%', color: 'text-gray-700', opacity: 0.20, rotate: 8 },
  { key: 'r12-12', IconComponent: HiReceiptTax, top: '88%', left: '92%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },

  // Row 13 (very bottom)
  { key: 'r13-1', IconComponent: HiCurrencyDollar, top: '96%', left: '0%', color: 'text-gray-700', opacity: 0.20, rotate: 12 },
  { key: 'r13-2', IconComponent: HiCube, top: '96%', left: '8%', color: 'text-gray-800', opacity: 0.22, rotate: -8 },
  { key: 'r13-3', IconComponent: HiShoppingCart, top: '96%', left: '16%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
  { key: 'r13-4', IconComponent: FaWallet, top: '96%', left: '24%', color: 'text-gray-700', opacity: 0.22, rotate: -14 },
  { key: 'r13-5', IconComponent: HiTruck, top: '96%', left: '32%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
  { key: 'r13-6', IconComponent: HiTag, top: '96%', left: '40%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },
  { key: 'r13-7', IconComponent: HiShoppingBag, top: '96%', left: '48%', color: 'text-gray-700', opacity: 0.20, rotate: 8 },
  { key: 'r13-8', IconComponent: HiCreditCard, top: '96%', left: '56%', color: 'text-gray-800', opacity: 0.22, rotate: -12 },
  { key: 'r13-9', IconComponent: FaBoxOpen, top: '96%', left: '64%', color: 'text-gray-600', opacity: 0.20, rotate: 14 },
  { key: 'r13-10', IconComponent: HiCash, top: '96%', left: '72%', color: 'text-gray-700', opacity: 0.22, rotate: -8 },
  { key: 'r13-11', IconComponent: HiReceiptTax, top: '96%', left: '80%', color: 'text-gray-800', opacity: 0.20, rotate: 10 },
  { key: 'r13-12', IconComponent: FaMoneyBillWave, top: '96%', left: '88%', color: 'text-gray-600', opacity: 0.22, rotate: -12 },
  { key: 'r13-13', IconComponent: HiGift, top: '96%', left: '96%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
]

// ─────────────────────────────────────────────
// OTP Input sub-component
// ─────────────────────────────────────────────
interface OTPInputProps {
  value: string[]
  onChange: (val: string[]) => void
  disabled?: boolean
}

function OTPInput({ value, onChange, disabled }: OTPInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  const handleChange = (idx: number, char: string) => {
    if (!/^\d*$/.test(char)) return
    const next = [...value]
    next[idx] = char.slice(-1)
    onChange(next)
    if (char && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...value]
    pasted.split('').forEach((c, i) => { next[i] = c })
    onChange(next)
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`
            w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
            transition-all duration-200
            ${value[i] ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-300 bg-white text-gray-800'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          `}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function MerchantForgotPasswordForm() {
  const router = useRouter()
  const { toasts, removeToast, success, error, info } = useToast()

  // Global loading / navigation
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // Step state
  const [step, setStep] = useState<Step>('email')

  // Step 1 – Email
  const [email, setEmail] = useState('')

  // Step 2 – OTP
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [resendCooldown, setResendCooldown] = useState(0)

  // Step 3 – New Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const strength = evaluatePassword(newPassword)

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // ── Resend cooldown timer ──────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown(c => c - 1), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // ── Step 1: Send OTP ──────────────────────
  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email.trim()) { error('Please enter your email address.'); return }
    setIsLoading(true)
    try {
      await merchantAPI.forgotPasswordSendOTP(email.trim())
      success('OTP sent! Please check your email inbox.')
      setStep('otp')
      setResendCooldown(60)
    } catch (err: any) {
      error(err?.response?.data?.message || 'Could not send OTP. Please check your email and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2: Resend OTP ────────────────────
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    setIsLoading(true)
    try {
      await merchantAPI.forgotPasswordSendOTP(email.trim())
      setOtp(Array(6).fill(''))
      success('OTP resent! Please check your email.')
      setResendCooldown(60)
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2: Verify OTP ────────────────────
  const handleVerifyOTP = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const otpString = otp.join('')
    if (otpString.length < 6) { error('Please enter the complete 6-digit OTP.'); return }
    setIsLoading(true)
    try {
      await merchantAPI.forgotPasswordVerifyOTP(email.trim(), otpString)
      success('OTP verified! Please set your new password.')
      setStep('reset')
    } catch (err: any) {
      error(err?.response?.data?.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 3: Show confirm modal ────────────
  const handleChangePasswordClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) { error('Please fill in both password fields.'); return }
    if (newPassword !== confirmPassword) { error('Passwords do not match.'); return }
    if (strength.score < 3) { error('Password is too weak. Please follow the requirements.'); return }
    setShowConfirmModal(true)
  }

  // ── Step 3: Confirm & Reset ───────────────
  const handleConfirmReset = async () => {
    setShowConfirmModal(false)
    setIsLoading(true)
    try {
      await merchantAPI.forgotPasswordReset(email.trim(), newPassword, confirmPassword)
      success('Password changed successfully! Redirecting to login...')
      setStep('done')
      setIsNavigating(true)
      setTimeout(() => router.push('/merchant/login'), 2000)
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Derived helpers ───────────────────────
  const progressSteps = [
    { id: 'email', label: 'Email' },
    { id: 'otp', label: 'OTP' },
    { id: 'reset', label: 'Password' },
  ]
  const currentStepIdx = progressSteps.findIndex(s => s.id === step)

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Loading overlay */}
      <LoadingOverlay isLoading={isLoading || isNavigating} />

      {/* Abstract Background Pattern - More scattered shapes and icons */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Large geometric shapes scattered everywhere */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-3xl transform -rotate-45 -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-3xl transform rotate-45 translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-white/8 rounded-3xl transform rotate-12"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-white/8 rounded-3xl transform -rotate-12"></div>
        <div className="absolute top-10 -left-32 w-72 h-72 bg-white/9 rounded-3xl transform rotate-25"></div>
        <div className="absolute bottom-10 -right-32 w-72 h-72 bg-white/9 rounded-3xl transform -rotate-25"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/7 rounded-3xl transform rotate-60"></div>
        <div className="absolute bottom-1/3 right-1/4 w-68 h-68 bg-white/8 rounded-3xl transform -rotate-50"></div>

        {/* Medium rectangles scattered throughout */}
        <div className="absolute top-20 left-5 w-40 h-40 bg-white/8 rounded-xl transform rotate-45"></div>
        <div className="absolute bottom-32 right-5 w-40 h-40 bg-white/8 rounded-xl transform -rotate-45"></div>
        <div className="absolute top-1/2 -left-16 w-48 h-48 bg-white/7 rounded-2xl transform rotate-30"></div>
        <div className="absolute bottom-1/3 -right-16 w-52 h-52 bg-white/7 rounded-2xl transform -rotate-30"></div>
        <div className="absolute top-10 right-10 w-44 h-44 bg-white/7 rounded-2xl transform rotate-15"></div>
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-white/7 rounded-2xl transform -rotate-25"></div>
        <div className="absolute top-3/4 -left-24 w-50 h-50 bg-white/8 rounded-2xl transform rotate-40"></div>
        <div className="absolute bottom-1/2 -right-20 w-46 h-46 bg-white/8 rounded-2xl transform -rotate-35"></div>
        <div className="absolute top-40 left-1/3 w-42 h-42 bg-white/7 rounded-xl transform rotate-55"></div>
        <div className="absolute bottom-40 right-1/3 w-44 h-44 bg-white/8 rounded-xl transform -rotate-48"></div>
        <div className="absolute top-2/3 right-20 w-38 h-38 bg-white/7 rounded-xl transform rotate-33"></div>
        <div className="absolute bottom-2/3 left-24 w-46 h-46 bg-white/8 rounded-xl transform -rotate-38"></div>

        {/* Small rectangles everywhere */}
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
        <div className="absolute top-16 left-1/2 w-26 h-26 bg-white/7 rounded-lg transform rotate-18"></div>
        <div className="absolute bottom-16 right-1/2 w-28 h-28 bg-white/8 rounded-lg transform -rotate-22"></div>
        <div className="absolute top-1/3 left-1/4 w-22 h-22 bg-white/7 rounded-lg transform rotate-42"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/8 rounded-lg transform -rotate-36"></div>
        <div className="absolute top-48 right-24 w-30 h-30 bg-white/7 rounded-xl transform rotate-28"></div>
        <div className="absolute bottom-48 left-28 w-32 h-32 bg-white/8 rounded-xl transform -rotate-32"></div>

        {/* E-commerce Icons - densely scattered with gray colors covering all areas */}
        {BG_ICONS.map(({ key, IconComponent, top, left, color, opacity, rotate }) => (
          <div
            key={key}
            className={bgIconWrapperClass}
            style={{
              top,
              left,
            }}
          >
            <IconComponent
              className={`${bgIconClass} ${color}`}
              style={{
                opacity,
                transform: rotate ? `rotate(${rotate}deg)` : undefined,
              }}
            />
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 max-w-5xl w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">

          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-5 p-6 lg:p-8">

            {/* Logo */}
            <div className="flex items-center justify-center mb-5">
              <Image
                src="/rapexlogosquare.png"
                alt="Rapex Logo"
                width={64}
                height={64}
                className="rounded-2xl shadow-lg"
                priority
              />
            </div>

            {/* Header */}
            <h1 className="text-3xl font-bold text-center mb-1 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
              Forgot Password
            </h1>
            <p className="text-gray-500 text-center text-sm mb-5">
              Reset your merchant account password
            </p>

            {/* Step progress (hide on done) */}
            {step !== 'done' && (
              <div className="flex items-center justify-center gap-2 mb-6">
                {progressSteps.map((s, idx) => (
                  <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          idx < currentStepIdx
                            ? 'bg-green-500 text-white'
                            : idx === currentStepIdx
                            ? 'bg-gradient-to-br from-orange-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {idx < currentStepIdx ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[10px] mt-0.5 font-medium ${
                        idx === currentStepIdx ? 'text-orange-600' : idx < currentStepIdx ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < progressSteps.length - 1 && (
                      <div className={`h-0.5 w-10 sm:w-14 rounded-full transition-all duration-300 ${
                        idx < currentStepIdx ? 'bg-green-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* ─── STEP: EMAIL ─── */}
            {step === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Registered Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      required
                      className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    We'll send a 6-digit OTP to this email address.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-base font-semibold"
                  disabled={isLoading}
                >
                  Send OTP
                </Button>

                <p className="text-center text-gray-600 text-sm">
                  Remember your password?{' '}
                  <Link
                    href="/merchant/login"
                    className="text-orange-600 hover:text-orange-700 font-semibold"
                    onClick={() => setIsNavigating(true)}
                  >
                    Back to Login
                  </Link>
                </p>
              </form>
            )}

            {/* ─── STEP: OTP ─── */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit OTP sent to{' '}
                    <span className="font-semibold text-orange-600">{email}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Check your inbox (and spam folder).</p>
                </div>

                <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-base font-semibold"
                  disabled={isLoading || otp.join('').length < 6}
                >
                  Verify OTP
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setOtp(Array(6).fill('')) }}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Change email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || isLoading}
                    className={`flex items-center gap-1 font-medium transition-colors ${
                      resendCooldown > 0 || isLoading
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-orange-600 hover:text-orange-700 cursor-pointer'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* ─── STEP: RESET PASSWORD ─── */}
            {step === 'reset' && (
              <form onSubmit={handleChangePasswordClick} className="space-y-5">

                {/* New Password */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full pl-12 pr-12 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[0, 1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i < strength.score ? strength.barColor : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${strength.color}`}>
                        Password Strength: {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className={`w-full pl-12 pr-12 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        confirmPassword && confirmPassword !== newPassword
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Passwords match!
                    </p>
                  )}
                </div>

                {/* Requirements */}
                <div className="bg-gradient-to-br from-orange-50 to-purple-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Password Requirements</p>
                  <ul className="space-y-1">
                    {[
                      { check: strength.checks.minLength, label: 'At least 8 characters' },
                      { check: strength.checks.hasUpper, label: 'At least 1 uppercase letter (A–Z)' },
                      { check: strength.checks.hasLower, label: 'At least 1 lowercase letter (a–z)' },
                      { check: strength.checks.hasNumber, label: 'At least 1 number (0–9)' },
                      { check: strength.checks.hasSpecial, label: 'Special character (!@#$ etc.) — recommended' },
                    ].map(({ check, label }) => (
                      <li key={label} className="flex items-center gap-2 text-xs">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          check ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {check ? '✓' : '·'}
                        </span>
                        <span className={check ? 'text-green-700 font-medium' : 'text-gray-500'}>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-base font-semibold"
                  disabled={isLoading}
                >
                  Change Password
                </Button>
              </form>
            )}

            {/* ─── STEP: DONE ─── */}
            {step === 'done' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-9 h-9 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Password Changed!</h2>
                <p className="text-sm text-gray-500">Your password has been updated successfully. Redirecting to login…</p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Promo panel ── */}
          <div className="hidden lg:block lg:col-span-7 bg-gradient-to-tl from-orange-500 via-pink-500 to-purple-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-2xl transform rotate-12" />
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-2xl transform -rotate-12" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
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

                <h2 className="text-4xl font-bold leading-tight mb-3">
                  Secure Your <span className="text-orange-400">Account</span>
                  <br />
                  With Rapex
                </h2>

                <p className="text-base text-white/90 mb-6 leading-relaxed">
                  Your business security is our top priority. Reset your password securely and get back to managing your store.
                </p>
              </div>

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

      {/* Footer */}
      <div className="relative z-10 text-center mt-6">
        <p className="text-white/80 text-sm">© 2026 Rapex. All rights reserved.</p>
      </div>

      {/* ── Confirmation Modal ── */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Password Change"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
            >
              Yes, Change Password
            </button>
          </div>
        }
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-purple-600" />
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Are you sure you want to change your password? You will be logged out and redirected to login.
          </p>
        </div>
      </Modal>
    </div>
  )
}
