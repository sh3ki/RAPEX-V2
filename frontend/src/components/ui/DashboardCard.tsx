import React from 'react'

interface DashboardCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  className?: string
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              {subtitle && <span className="text-gray-500 text-xs">{subtitle}</span>}
            </div>
          )}
          
          {!trend && subtitle && (
            <p className="text-gray-500 text-sm">{subtitle}</p>
          )}
        </div>
        
        {icon && (
          <div className="p-3 bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg">
            <div className="text-purple-600">{icon}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardCard
