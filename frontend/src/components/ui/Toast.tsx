'use client'

import React, { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Timer should only be set once on mount, not reset when onClose changes
    const timer = setTimeout(() => {
      setIsExiting(true)
      // Wait for fade-out animation to complete before removing
      setTimeout(() => {
        onClose()
      }, 300) // Match fadeOut animation duration
    }, duration)
    
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]) // Only depend on duration, not onClose
  
  // Color indicator styles - left border
  const borderColors = {
    success: 'border-green-500',
    error: 'border-red-500',
    warning: 'border-orange-500',
    info: 'border-blue-500',
  }
  
  // Text colors for the message
  const textColors = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-orange-700',
    info: 'text-blue-700',
  }
  
  // Icon colors
  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-orange-600',
    info: 'text-blue-600',
  }
  
  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }
  
  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300) // Match fadeOut animation duration
  }

  return (
    <div className={`bg-white border-l-4 ${borderColors[type]} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] transition-all duration-300 ${isExiting ? 'animate-fade-out' : 'animate-slide-in'}`}>
      <div className={iconColors[type]}>
        {icons[type]}
      </div>
      <p className={`flex-1 font-medium ${textColors[type]}`}>{message}</p>
      <button onClick={handleClose} className="hover:bg-gray-100 p-1 rounded transition-colors text-gray-400 hover:text-gray-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default Toast
