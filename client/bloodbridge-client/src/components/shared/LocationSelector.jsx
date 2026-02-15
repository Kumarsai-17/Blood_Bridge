import { useState, useEffect } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { states, getCitiesByState } from '../../data/locations'
import { Button } from '../ui/core'

const LocationSelector = ({ 
  selectedState, 
  selectedCity, 
  onStateChange, 
  onCityChange,
  onLocationChange,
  showGPS = true,
  required = true 
}) => {
  const [cities, setCities] = useState([])
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [locationCaptured, setLocationCaptured] = useState(false)
  const [capturedCoords, setCapturedCoords] = useState(null)

  useEffect(() => {
    console.log('States array:', states)
    console.log('States length:', states.length)
    if (selectedState) {
      const citiesForState = getCitiesByState(selectedState)
      console.log('Cities for', selectedState, ':', citiesForState)
      setCities(citiesForState)
    } else {
      setCities([])
    }
  }, [selectedState])

  const handleStateChange = (e) => {
    const state = e.target.value
    console.log('State selected:', state)
    onStateChange(state)
    onCityChange('') // Reset city when state changes
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setLoadingLocation(true)
    setLocationError('')
    setLocationCaptured(false)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const coords = {
          lat: latitude,
          lng: longitude
        }
        console.log('GPS Location captured:', coords)
        setCapturedCoords(coords)
        setLocationCaptured(true)
        onLocationChange(coords)
        setLoadingLocation(false)
      },
      (error) => {
        setLoadingLocation(false)
        setLocationCaptured(false)
        console.error('Geolocation error:', error)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out.')
            break
          default:
            setLocationError('An error occurred while getting location.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className="space-y-4">
      {/* GPS Location Button */}
      {showGPS && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            GPS Location {required && '*'}
          </label>
          <Button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={loadingLocation}
            variant={locationCaptured ? "default" : "outline"}
            className={`w-full h-12 flex items-center justify-center gap-2 ${
              locationCaptured ? 'bg-green-600 hover:bg-green-700 text-white' : ''
            }`}
          >
            {loadingLocation ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Getting your location...</span>
              </>
            ) : locationCaptured ? (
              <>
                <Navigation className="w-5 h-5" />
                <span>Location Captured ✓</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                <span>Get Current Location (GPS)</span>
              </>
            )}
          </Button>
          {locationCaptured && capturedCoords && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              ✓ Coordinates: {capturedCoords.lat.toFixed(4)}, {capturedCoords.lng.toFixed(4)}
            </p>
          )}
          {locationError && (
            <p className="text-sm text-red-600 mt-2">{locationError}</p>
          )}
          {!locationCaptured && !locationError && (
            <p className="text-xs text-gray-500 mt-2">
              Click to automatically detect your location using GPS
            </p>
          )}
        </div>
      )}

      {/* State Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          State {required && '*'}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required={required}
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* City Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          City {required && '*'}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!selectedState}
            required={required}
          >
            <option value="">
              {selectedState ? 'Select City' : 'Select State First'}
            </option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        {!selectedState && (
          <p className="text-xs text-gray-500 mt-2">
            Please select a state first to see available cities
          </p>
        )}
      </div>
    </div>
  )
}

export default LocationSelector
