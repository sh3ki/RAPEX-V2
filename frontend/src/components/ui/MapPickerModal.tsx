'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { X, MapPin, Navigation } from 'lucide-react'
import Button from './Button'
import dynamic from 'next/dynamic'

interface MapProps {
  center: [number, number]
  selectedLat: number | null
  selectedLng: number | null
  onLocationClick: (lat: number, lng: number) => void
}

// Dynamically import the map component with SSR disabled
const DynamicMap = dynamic<MapProps>(() => import('@/components/ui/MapPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] md:min-h-[500px] flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading map...</p>
      </div>
    </div>
  ),
})

interface MapPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentLatitude: number | null
  currentLongitude: number | null
  onLocationSelect: (lat: number, lng: number) => void
}

/**
 * MapPickerModal Component
 * 
 * A reusable modal for picking location coordinates on a map
 * Features:
 * - Interactive OpenStreetMap with click-to-set location
 * - Real-time marker display
 * - Current location button with GPS integration
 * - Consistent styling with merchant forms
 * - Fully mobile responsive
 */
const MapPickerModal: React.FC<MapPickerModalProps> = ({
  isOpen,
  onClose,
  currentLatitude,
  currentLongitude,
  onLocationSelect,
}) => {
  // Default to Cavite coordinates if no location
  const defaultLat = 14.2456
  const defaultLng = 120.8783
  
  const [selectedLat, setSelectedLat] = useState<number | null>(currentLatitude)
  const [selectedLng, setSelectedLng] = useState<number | null>(currentLongitude)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [mapKey, setMapKey] = useState(Date.now())

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset map key when modal opens to force remount
  useEffect(() => {
    if (isOpen) {
      setMapKey(Date.now())
    }
  }, [isOpen])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLat(lat)
    setSelectedLng(lng)
  }, [])

  const handleUseCurrentLocation = () => {
    setIsGettingLocation(true)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLat(position.coords.latitude)
          setSelectedLng(position.coords.longitude)
          setIsGettingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsGettingLocation(false)
          alert('Unable to get your current location. Please select manually.')
        }
      )
    } else {
      setIsGettingLocation(false)
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleConfirm = () => {
    if (selectedLat !== null && selectedLng !== null) {
      onLocationSelect(selectedLat, selectedLng)
      onClose()
    }
  }

  const mapCenterLat = selectedLat || currentLatitude || defaultLat
  const mapCenterLng = selectedLng || currentLongitude || defaultLng

  if (!isOpen) return null

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6" />
              <h2 className="text-xl font-bold">Pick Your Location</h2>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Map Area */}
          <div className="flex-1 relative bg-gray-100">
            {/* OpenStreetMap */}
            <div className="w-full h-full min-h-[400px] md:min-h-[500px] relative">
              {isMounted && (
                <DynamicMap
                  key={mapKey}
                  center={[mapCenterLat, mapCenterLng]}
                  selectedLat={selectedLat}
                  selectedLng={selectedLng}
                  onLocationClick={handleMapClick}
                />
              )}
            </div>

            {/* Current Location Button */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={isGettingLocation}
              className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 z-[1000]"
            >
              <Navigation className={`w-5 h-5 ${isGettingLocation ? 'animate-spin' : ''}`} />
              <span className="font-medium">
                {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
              </span>
            </button>
          </div>

          {/* Coordinates Display */}
          <div className="bg-gray-50 p-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
                <input
                  type="text"
                  value={selectedLat?.toFixed(6) || currentLatitude?.toFixed(6) || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-mono text-sm"
                  placeholder="Click map to select"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
                <input
                  type="text"
                  value={selectedLng?.toFixed(6) || currentLongitude?.toFixed(6) || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-mono text-sm"
                  placeholder="Click map to select"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-white border-t flex gap-3 justify-end">
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedLat === null || selectedLng === null}
              className="bg-gradient-to-r from-orange-500 to-purple-600 text-white"
            >
              Confirm Location
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MapPickerModal
