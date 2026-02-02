import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  const hoverStyle = hover ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : ''
  const clickableStyle = onClick ? 'cursor-pointer' : ''
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md transition-all duration-200 ${paddingStyles[padding]} ${hoverStyle} ${clickableStyle} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
