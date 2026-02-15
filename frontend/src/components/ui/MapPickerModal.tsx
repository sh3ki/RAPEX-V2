'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { X, MapPin, Navigation, Search, Target } from 'lucide-react'
import Button from './Button'
import dynamic from 'next/dynamic'

interface MapProps {
  center: [number, number]
  selectedLat: number | null
  selectedLng: number | null
  onLocationClick: (lat: number, lng: number) => void
  onMapReady?: (centerFn: () => void) => void
}

// Dynamically import the map component with SSR disabled
const DynamicMap = dynamic<MapProps>(() => import('@/components/ui/MapPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
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
 * - Address search with OpenStreetMap Nominatim geocoding
 * - Search results dropdown with location pinpointing
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
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const centerMapFnRef = useRef<(() => void) | null>(null)

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setShowResults(false)

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Search failed')

      const results = await response.json()
      setSearchResults(results)
      setShowResults(true)
    } catch (error) {
      console.error('Error searching address:', error)
      alert('Unable to search address. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setSelectedLat(lat)
    setSelectedLng(lng)
    setShowResults(false)
    setSearchQuery(result.display_name)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

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

  const handleCenterOnLocation = () => {
    if (centerMapFnRef.current) {
      centerMapFnRef.current()
    }
  }

  const handleMapReady = useCallback((centerFn: () => void) => {
    centerMapFnRef.current = centerFn
  }, [])

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
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col touch-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 p-4 sm:p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold">Pick Your Location</h2>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 active:bg-white/30 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors touch-manipulation"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Map Area */}
          <div className="relative bg-gray-100 h-[350px] sm:h-[400px] md:h-[500px] touch-auto">
            {/* OpenStreetMap */}
            <div className="w-full h-full relative touch-pan-x touch-pan-y touch-pinch-zoom">
              {isMounted && (
                <DynamicMap
                  key={mapKey}
                  center={[mapCenterLat, mapCenterLng]}
                  selectedLat={selectedLat}
                  selectedLng={selectedLng}
                  onLocationClick={handleMapClick}
                  onMapReady={handleMapReady}
                />
              )}
            </div>

            {/* Search Bar - Top Center */}
            <div className="absolute top-3 sm:top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-3 sm:px-4 z-[1000]">
              <div className="bg-white rounded-lg shadow-lg">
                <div className="flex items-center gap-2 p-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Search address..."
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-base sm:text-sm border-0 focus:outline-none text-gray-700 min-h-[44px] touch-manipulation"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 active:from-orange-700 active:to-purple-800 text-white px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    aria-label="Search address"
                  >
                    <Search className={`w-5 h-5 ${isSearching ? 'animate-spin' : ''}`} />
                    <span className="font-medium hidden sm:inline">
                      {isSearching ? 'Searching...' : 'Search'}
                    </span>
                  </button>
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="border-t border-gray-200 max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSearchResult(result)}
                        className="w-full text-left px-3 sm:px-4 py-3 sm:py-3 min-h-[56px] hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors touch-manipulation"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700 line-clamp-2">{result.display_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showResults && searchResults.length === 0 && (
                  <div className="border-t border-gray-200 px-3 sm:px-4 py-3 text-center text-sm text-gray-500">
                    No results found. Try a different search.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Control Buttons */}
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-center z-[1000] gap-2 sm:gap-4">
              {/* Center Location Button */}
              <button
                onClick={handleCenterOnLocation}
                disabled={selectedLat === null || selectedLng === null}
                className="bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                title="Center on selected location"
                aria-label="Center map on selected location"
              >
                <Target className="w-5 h-5" />
              </button>

              {/* Current Location Button */}
              <button
                onClick={handleUseCurrentLocation}
                disabled={isGettingLocation}
                className="bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 px-3 sm:px-4 py-3 min-h-[44px] rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 touch-manipulation"
                aria-label="Use current location"
              >
                <Navigation className={`w-5 h-5 flex-shrink-0 ${isGettingLocation ? 'animate-spin' : ''}`} />
                <span className="font-medium text-sm hidden sm:inline whitespace-nowrap">
                  {isGettingLocation ? 'Getting...' : 'Use Current Location'}
                </span>
              </button>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="bg-gray-50 p-3 sm:p-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Latitude</label>
                <input
                  type="text"
                  value={selectedLat?.toFixed(6) || currentLatitude?.toFixed(6) || ''}
                  readOnly
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-mono text-sm min-h-[44px] touch-manipulation"
                  placeholder="Click map to select"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Longitude</label>
                <input
                  type="text"
                  value={selectedLng?.toFixed(6) || currentLongitude?.toFixed(6) || ''}
                  readOnly
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-mono text-sm min-h-[44px] touch-manipulation"
                  placeholder="Click map to select"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 bg-white border-t flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={onClose}
              variant="secondary"
              className="w-full sm:w-auto min-h-[44px] touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedLat === null || selectedLng === null}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-purple-600 text-white min-h-[44px] touch-manipulation"
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
