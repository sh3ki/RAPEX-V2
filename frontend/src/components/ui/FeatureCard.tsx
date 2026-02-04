import React, { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  className?: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className = '',
}) => {
  return (
    <div
      className={`bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg ${className}`}
    >
      <div className="mb-3 flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">{icon}</div>
      <h3 className="font-bold text-lg mb-2 text-white">{title}</h3>
      <p className="text-sm text-white/90 leading-relaxed">{description}</p>
    </div>
  )
}

export default FeatureCard
