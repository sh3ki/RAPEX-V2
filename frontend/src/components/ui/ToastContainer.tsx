'use client'

import React from 'react'
import Toast, { ToastType } from './Toast'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
  createdAt?: number
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col items-end gap-3 max-w-md transition-all duration-300">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          createdAt={toast.createdAt}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

export default ToastContainer
