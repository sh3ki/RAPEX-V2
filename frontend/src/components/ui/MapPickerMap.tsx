'use client'

import React, { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface MapPickerMapProps {
  center: [number, number]
  selectedLat: number | null
  selectedLng: number | null
  onLocationClick: (lat: number, lng: number) => void
}

/**
 * MapPickerMap Component
 * Client-only map component using Leaflet with explicit lifecycle cleanup
 */
const MapPickerMap: React.FC<MapPickerMapProps> = ({
  center,
  selectedLat,
  selectedLng,
  onLocationClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const markerIconRef = useRef<any>(null)
  const onLocationClickRef = useRef(onLocationClick)
  const resizeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    onLocationClickRef.current = onLocationClick
  }, [onLocationClick])

  useEffect(() => {
    let active = true

    const initializeMap = async () => {
      if (!containerRef.current || mapRef.current) return

      const L = await import('leaflet')
      if (!active || !containerRef.current) return

      leafletRef.current = L
      markerIconRef.current = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(center, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      map.on('click', (event: any) => {
        onLocationClickRef.current(event.latlng.lat, event.latlng.lng)
      })

      mapRef.current = map
      resizeTimerRef.current = window.setTimeout(() => {
        try {
          if (!mapRef.current) return
          const container = mapRef.current.getContainer?.()
          if (!container || !container.isConnected) return
          mapRef.current.invalidateSize()
        } catch {
          return
        }
      }, 120)
    }

    initializeMap()

    return () => {
      active = false
      if (resizeTimerRef.current !== null) {
        window.clearTimeout(resizeTimerRef.current)
        resizeTimerRef.current = null
      }
      if (mapRef.current) {
        mapRef.current.off()
        mapRef.current.remove()
        mapRef.current = null
      }
      markerRef.current = null
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setView(center, mapRef.current.getZoom())
  }, [center[0], center[1]])

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) return

    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    if (selectedLat !== null && selectedLng !== null) {
      markerRef.current = leafletRef.current
        .marker([selectedLat, selectedLng], { icon: markerIconRef.current })
        .addTo(mapRef.current)
    }
  }, [selectedLat, selectedLng])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      aria-label="OpenStreetMap picker"
    />
  )
}

export default MapPickerMap
