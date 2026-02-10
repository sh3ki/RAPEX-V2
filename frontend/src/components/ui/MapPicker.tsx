'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLocation({ lat, lng });
        onChange(lat, lng);
        setLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  const openMapPicker = () => {
    const lat = latitude || currentLocation?.lat || 14.5995;
    const lng = longitude || currentLocation?.lng || 120.9842;
    
    // Open OpenStreetMap in new window
    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
    window.open(osmUrl, '_blank');
  };

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Location Coordinates
      </label>

      <div className="space-y-3">
        {/* Display coordinates if set */}
        {(latitude && longitude) || currentLocation ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Location Set</p>
                <p className="text-xs text-green-700 mt-1">
                  Latitude: {latitude || currentLocation?.lat}<br />
                  Longitude: {longitude || currentLocation?.lng}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">No location selected yet</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Navigation className="w-5 h-5" />
            {loading ? 'Getting Location...' : 'Use Current Location'}
          </button>

          <button
            type="button"
            onClick={openMapPicker}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            Pick from Map
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Manual input */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude || ''}
              onChange={(e) => onChange(parseFloat(e.target.value), longitude || 0)}
              placeholder="14.5995"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude || ''}
              onChange={(e) => onChange(latitude || 0, parseFloat(e.target.value))}
              placeholder="120.9842"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
