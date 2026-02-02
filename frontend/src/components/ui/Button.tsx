import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white focus:ring-purple-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400',
    outline: 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
    ghost: 'text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  }
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  const widthStyle = fullWidth ? 'w-full' : ''
  const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}

export default Button
