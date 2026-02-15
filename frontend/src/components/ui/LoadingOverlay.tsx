import React from 'react'

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading?: boolean
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Custom loading message */
  message?: string
}

/**
 * LoadingOverlay Component
 * 
 * A full-screen overlay with a dark transparent background that keeps content visible.
 * Shows a centered loading spinner with optional message.
 * 
 * Use for:
 * - Navigation between pages
 * - Form submissions
 * - API calls
 * - Any action requiring user to wait
 * 
 * Features:
 * - Dark transparent overlay (content remains visible)
 * - Centered spinner
 * - Optional loading message
 * - Prevents interaction during loading
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading = true,
  size = 'lg',
  message
}) => {
  if (!isLoading) return null

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[9999]" 
      style={{ 
        margin: 0, 
        padding: 0, 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden' 
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
          className={`${sizeMap[size]}`}
          style={{ shapeRendering: 'auto', display: 'block' }}
        >
          <g>
            {[...Array(14)].map((_, i) => {
              const rotation = i * 25.714285714285715
              const delay = -(1.0317460317460319 - i * 0.07936507936507936)
              return (
                <g key={i} transform={`rotate(${rotation} 50 50)`}>
                  <rect
                    fill="#b168f0"
                    height="16"
                    width="6"
                    ry="8"
                    rx="3"
                    y="20"
                    x="47"
                  >
                    <animate
                      repeatCount="indefinite"
                      begin={`${delay}s`}
                      dur="1.1111111111111112s"
                      keyTimes="0;1"
                      values="1;0"
                      attributeName="opacity"
                    />
                  </rect>
                </g>
              )
            })}
          </g>
        </svg>
        
        {/* Optional Message */}
        {message && (
          <p className="text-white text-lg font-medium">{message}</p>
        )}
      </div>
    </div>
  )
}

export default LoadingOverlay
