'use client'

import React, { useState } from 'react'
import { Target } from 'lucide-react'

interface MapPreviewProps {
  latitude: number | null
  longitude: number | null
  defaultLatitude?: number
  defaultLongitude?: number
}

const MapPreview: React.FC<MapPreviewProps> = ({
  latitude,
  longitude,
  defaultLatitude = 14.2456,
  defaultLongitude = 120.8783,
}) => {
  const lat = latitude ?? defaultLatitude
  const lng = longitude ?? defaultLongitude
  const [mapKey, setMapKey] = useState(0)

  const bbox = `${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}`
  const marker = `${lat}%2C${lng}`
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`

  const handleCenterLocation = () => {
    // Force iframe reload to center on location
    setMapKey(prev => prev + 1)
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100 touch-auto">
      <iframe
        key={mapKey}
        title="Location Map Preview"
        src={mapSrc}
        className="absolute inset-0 w-full h-full touch-pan-x touch-pan-y touch-pinch-zoom"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Center Location Button - Bottom Right - Mobile Optimized */}
      <button
        onClick={handleCenterLocation}
        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 p-3 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95 z-20 touch-manipulation"
        title="Center on location"
        aria-label="Center map on location"
      >
        <Target className="w-5 h-5 sm:w-5 sm:h-5" />
      </button>
    </div>
  )
}

export default MapPreview
