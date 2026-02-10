/**
 * Centralized Icon Component System
 * 
 * Following RAPEX blueprint requirements:
 * - Uses React icon libraries (Lucide React)
 * - NO manual SVG icons
 * - Consistent sizing and styling
 * - Easy to maintain and swap
 * 
 * @example
 * ```tsx
 * import { Icon } from '@/components/ui'
 * 
 * <Icon name="User" size={20} className="text-gray-500" />
 * <Icon name="Lock" size={24} />
 * <Icon name="Mail" />
 * ```
 */

import React from 'react'
import * as LucideIcons from 'lucide-react'

export type IconName = keyof typeof LucideIcons

interface IconProps {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
  color?: string
  onClick?: () => void
}

/**
 * Predefined icon sizes for consistency
 */
export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
} as const

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24,
  className = '',
  strokeWidth = 2,
  color,
  onClick,
}) => {
  const LucideIcon = LucideIcons[name] as LucideIcons.LucideIcon
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide icons`)
    return null
  }

  return (
    <LucideIcon 
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      color={color}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  )
}

export default Icon
