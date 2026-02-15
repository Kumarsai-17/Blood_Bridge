import { X, MapPin, Phone, Navigation, Building, Clock, Droplets } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const HospitalInfoModal = ({ isOpen, onClose, hospital, request, onGetDirections }) => {
  const { user } = useAuth()
  
  if (!isOpen || !hospital) return null

  const handleGetDirections = async () => {
    if (!hospital.location?.lat || !hospital.location?.lng) {
      alert('Hospital location not available')
      return
    }

    // Try to get user's current location for accurate directions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude
          const hospitalLat = hospital.location.lat
          const hospitalLng = hospital.location.lng
          
          // Open Google Maps with from and to coordinates
          const directionsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${hospitalLat},${hospitalLng}`
          window.open(directionsUrl, '_blank')
        },
        (error) => {
          console.error('Geolocation error:', error)
          
          // Fallback: Use user's profile location or just destination
          if (user?.location?.lat && user?.location?.lng) {
            const userLat = user.location.lat
            const userLng = user.location.lng
            const hospitalLat = hospital.location.lat
            const hospitalLng = hospital.location.lng
            
            const directionsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${hospitalLat},${hospitalLng}`
            window.open(directionsUrl, '_blank')
          } else {
            // Last resort: Just open destination
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}`, '_blank')
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    } else {
      // Geolocation not supported, use profile location or just destination
      if (user?.location?.lat && user?.location?.lng) {
        const userLat = user.location.lat
        const userLng = user.location.lng
        const hospitalLat = hospital.location.lat
        const hospitalLng = hospital.location.lng
        
        const directionsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${hospitalLat},${hospitalLng}`
        window.open(directionsUrl, '_blank')
      } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}`, '_blank')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-green-50">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <Building className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-900">Request Accepted!</h2>
              <p className="text-sm text-green-700">Thank you for helping save lives</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-100 rounded-full"
          >
            <X className="w-5 h-5 text-green-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your response has been sent!
            </h3>
            <p className="text-gray-600 text-sm">
              The hospital has been notified of your acceptance. Please proceed to the location as soon as possible.
            </p>
          </div>

          {/* Hospital Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Hospital Details
            </h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">{hospital.name}</p>
                  <p className="text-sm text-blue-700">
                    {hospital.address || 
                     (hospital.location ? `${hospital.location.lat?.toFixed(4)}, ${hospital.location.lng?.toFixed(4)}` : 'Address not available')
                    }
                  </p>
                </div>
              </div>
              
              {hospital.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-blue-600 mr-2" />
                  <a 
                    href={`tel:${hospital.phone}`}
                    className="text-blue-800 hover:underline font-medium"
                  >
                    {hospital.phone}
                  </a>
                </div>
              )}

              {request?.distance && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-blue-800">
                    {request.distance} km away from you
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Request Summary */}
          {request && (
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                <Droplets className="w-4 h-4 mr-2" />
                Request Summary
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-red-600">Blood Type</p>
                  <p className="font-semibold text-red-800">{request.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-xs text-red-600">Units Needed</p>
                  <p className="font-semibold text-red-800">{request.units}</p>
                </div>
                <div>
                  <p className="text-xs text-red-600">Urgency</p>
                  <p className="font-semibold text-red-800 capitalize">{request.urgency}</p>
                </div>
                <div>
                  <p className="text-xs text-red-600">Status</p>
                  <p className="font-semibold text-green-800">Accepted</p>
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Important Notes
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• You have 5 minutes to cancel if needed</li>
              <li>• Please bring a valid ID to the hospital</li>
              <li>• Ensure you've had adequate rest and food</li>
              <li>• Contact the hospital if you face any issues</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleGetDirections}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Get Directions to Hospital
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.location.href = '/donor/requests'}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Requests
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HospitalInfoModal