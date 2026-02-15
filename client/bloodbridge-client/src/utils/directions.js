import toast from 'react-hot-toast'

/**
 * Get accurate directions from user's current location to destination
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @param {Object} user - User object with profile location
 * @param {string} destinationName - Name of destination for user feedback
 */
export const getAccurateDirections = async (destination, user, destinationName = 'destination') => {
  if (!destination?.lat || !destination?.lng) {
    toast.error(`${destinationName} location not available`)
    return
  }

  // Try to get user's current location for accurate directions
  if (navigator.geolocation) {
    toast.loading('Getting your location for accurate directions...', { id: 'location' })
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        const destLat = destination.lat
        const destLng = destination.lng
        
        // Open Google Maps with from and to coordinates
        const directionsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${destLat},${destLng}`
        window.open(directionsUrl, '_blank')
        
        toast.success('Directions opened with your current location', { id: 'location' })
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.dismiss('location')
        
        // Fallback: Use user's profile location or just destination
        if (user?.location?.lat && user?.location?.lng) {
          const userLat = user.location.lat
          const userLng = user.location.lng
          const destLat = destination.lat
          const destLng = destination.lng
          
          const directionsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${destLat},${destLng}`
          window.open(directionsUrl, '_blank')
          toast.success('Directions opened with your profile location')
        } else {
          // Last resort: Just open destination
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`, '_blank')
          toast('Directions opened. Please set your starting location in Google Maps.', {
            icon: 'ℹ️',
            duration: 4000
          })
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  } else {
    // Geolocation not supported, use profile location or just destination
    if (user?.location?.lat && user?.location?.lng) {
      const userLat = user.location.lat
      const userLng = user.location.lng
      const destLat = destination.lat
      const destLng = destination.lng
      
      const directionsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${destLat},${destLng}`
      window.open(directionsUrl, '_blank')
      toast.success('Directions opened with your profile location')
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`, '_blank')
      toast('Directions opened. Please set your starting location in Google Maps.', {
        icon: 'ℹ️',
        duration: 4000
      })
    }
  }
}

/**
 * Simple directions to destination (fallback)
 * @param {Object} destination - Destination coordinates {lat, lng}
 */
export const getSimpleDirections = (destination) => {
  if (destination?.lat && destination?.lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`, '_blank')
  } else {
    toast.error('Location not available')
  }
}