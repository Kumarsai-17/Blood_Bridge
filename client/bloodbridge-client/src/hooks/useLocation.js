import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const useLocation = () => {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      setLoading(true)
      setError(null)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          setLocation(locationData)
          setLoading(false)
          resolve(locationData)
        },
        (err) => {
          let errorMessage = 'Failed to get location'
          
          switch(err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.'
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.'
              break
            case err.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
          }
          
          setError(errorMessage)
          setLoading(false)
          reject(new Error(errorMessage))
          toast.error(errorMessage)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  const requestPermission = async () => {
    try {
      if (!navigator.permissions) {
        // Fallback for browsers that don't support permissions API
        return await getCurrentLocation()
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' })
      
      if (permission.state === 'granted') {
        return await getCurrentLocation()
      } else if (permission.state === 'prompt') {
        return await getCurrentLocation()
      } else {
        setError('Location permission denied')
        toast.error('Please enable location access in your browser settings')
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    requestPermission,
    reset: () => {
      setLocation(null)
      setError(null)
      setLoading(false)
    }
  }
}

export default useLocation