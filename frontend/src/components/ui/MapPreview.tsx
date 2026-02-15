'use client'

import React from 'react'

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

  const bbox = `${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}`
  const marker = `${lat}%2C${lng}`
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100">
      <iframe
        title="Location Map Preview"
        src={mapSrc}
        className="absolute inset-0 w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute top-3 left-3 bg-white/90 px-3 py-1.5 rounded-md shadow text-xs text-gray-700 font-medium">
        {latitude && longitude
          ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          : `${defaultLatitude.toFixed(4)}, ${defaultLongitude.toFixed(4)} (Default: Cavite)`}
      </div>
    </div>
  )
}

export default MapPreview
