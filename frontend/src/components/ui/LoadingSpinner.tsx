import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fullScreen?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  fullScreen = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }

  const spinner = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      className={`${sizeMap[size]} ${className}`}
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
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner
