import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Clock, AlertCircle,
  Navigation, Building, CheckCircle, XCircle,
  ShieldCheck, RefreshCcw, Target, Phone
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { formatTimeAgo } from '../../utils/formatters'
import ConfirmModal from '../../components/shared/ConfirmModal'

const AcceptedRequests = () => {
  const { user } = useAuth()
  const [acceptedRequests, setAcceptedRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchAcceptedRequests()

    // Set up interval to update countdown timers
    const interval = setInterval(() => {
      setAcceptedRequests(prev => [...prev]) // Force re-render for countdown
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const fetchAcceptedRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/donor/accepted-requests')
      setAcceptedRequests(response.data.requests || [])
    } catch (error) {
      if (error.response?.status === 404) {
        setPopup({ show: true, type: 'error', title: 'Sync Required', message: 'System synchronization required. Please refresh.' })
        setAcceptedRequests([])
      } else {
        setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Failed to load accepted requests. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const canCancelRequest = (acceptedAt) => {
    const now = new Date()
    const acceptedTime = new Date(acceptedAt)
    const diffInMinutes = (now - acceptedTime) / (1000 * 60)
    return diffInMinutes <= 5
  }

  const getTimeRemaining = (acceptedAt) => {
    const now = new Date()
    const acceptedTime = new Date(acceptedAt)
    const diffInMinutes = (now - acceptedTime) / (1000 * 60)
    const remainingMinutes = Math.max(0, 5 - diffInMinutes)

    if (remainingMinutes <= 0) return 'Review period expired'

    const minutes = Math.floor(remainingMinutes)
    const seconds = Math.floor((remainingMinutes - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} remaining to cancel`
  }

  const handleCancelRequest = async (requestId) => {
    try {
      await api.delete(`/donor/accepted-requests/${requestId}`)
      setPopup({ show: true, type: 'success', title: 'Request Cancelled', message: 'Your accepted request has been cancelled successfully.' })
      fetchAcceptedRequests()
    } catch (error) {
      if (error.response?.status === 404) {
        setPopup({ show: true, type: 'error', title: 'Sync Required', message: 'System synchronization required. Please refresh.' })
      } else {
        setPopup({ show: true, type: 'error', title: 'Cancel Failed', message: error.response?.data?.message || 'Failed to cancel request. Please try again.' })
      }
    }
  }

  const handleGetDirections = async (request) => {
    const destination = request.location
    const destinationName = request.hospitalName

    if (!destination?.lat || !destination?.lng) {
      setPopup({ show: true, type: 'error', title: 'Location Unavailable', message: `${destinationName} location is not available.` })
      return
    }

    // Try to get user's current location for accurate directions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude
          const destLat = destination.lat
          const destLng = destination.lng
          
          // Open Google Maps with navigation mode
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`
          window.open(directionsUrl, '_blank')
        },
        (error) => {
          console.error('Geolocation error:', error)
          
          // Fallback: Use user's profile location or just destination
          if (user?.location?.lat && user?.location?.lng) {
            const userLat = user.location.lat
            const userLng = user.location.lng
            const destLat = destination.lat
            const destLng = destination.lng
            
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`
            window.open(directionsUrl, '_blank')
          } else {
            // Last resort: Just open destination with navigation
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`
            window.open(directionsUrl, '_blank')
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
        
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`
        window.open(directionsUrl, '_blank')
      } else {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`
        window.open(directionsUrl, '_blank')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading requests...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/donor/dashboard"
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-blue-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Accepted Requests</h1>
          </div>
        </div>
        <p className="text-gray-600 ml-16">
          View and manage your accepted blood donation requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Requests</p>
          <h4 className="text-2xl font-bold text-gray-900">{acceptedRequests.length}</h4>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Can Cancel</p>
          <h4 className="text-2xl font-bold text-gray-900">{acceptedRequests.filter(req => canCancelRequest(req.acceptedAt)).length}</h4>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Committed</p>
          <h4 className="text-2xl font-bold text-gray-900">{acceptedRequests.filter(req => !canCancelRequest(req.acceptedAt)).length}</h4>
        </div>
      </div>

      {/* Requests List */}
      {acceptedRequests.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-md border border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Accepted Requests</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            You haven't accepted any blood donation requests yet. Browse available requests to get started.
          </p>
          <Link
            to="/donor/requests"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <Target className="w-5 h-5 mr-2" /> View Requests
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {acceptedRequests.map((request) => {
            const canCancel = canCancelRequest(request.acceptedAt)
            const timeRemaining = getTimeRemaining(request.acceptedAt)

            return (
              <div key={request._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                        <Building className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{request.hospitalName}</h3>
                        <p className="text-sm text-gray-500 mt-1">Accepted {formatTimeAgo(request.acceptedAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{request.distance || '0'} km</div>
                      <div className="text-xs text-gray-500">away</div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Blood Type</div>
                      <div className="text-xl font-bold text-red-600">{request.bloodGroup}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Units</div>
                      <div className="text-xl font-bold text-gray-900">{request.units}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Urgency</div>
                      <div className="text-lg font-bold text-orange-600 capitalize">{request.urgency}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
                      <div className="text-lg font-bold text-green-600">Active</div>
                    </div>
                  </div>

                  {/* Hospital Contact */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900">Hospital Location</h4>
                          <p className="text-sm text-blue-700">{request.hospitalName}</p>
                        </div>
                      </div>
                      {request.hospitalPhone && (
                        <a
                          href={`tel:${request.hospitalPhone}`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          Call Hospital
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Cancel Status */}
                  {canCancel && (
                    <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <div>
                          <h4 className="text-sm font-semibold text-amber-900">Cancellation Window</h4>
                          <p className="text-sm text-amber-700">{timeRemaining}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleGetDirections(request)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </button>

                    {canCancel ? (
                      <button
                        onClick={() => handleCancelRequest(request._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Request
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-400 rounded-xl text-sm font-semibold cursor-not-allowed"
                      >
                        Cannot Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-gray-900 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/10 rounded-xl">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Important Guidelines</h3>
            <p className="text-gray-400 text-sm mt-1">Please read before donating</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
            <p className="text-gray-300 text-sm"><span className="text-white font-semibold block mb-1">5-Minute Cancellation Window</span> You can cancel within 5 minutes of accepting. After that, the request is locked.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
            <p className="text-gray-300 text-sm"><span className="text-white font-semibold block mb-1">One Request at a Time</span> You can only accept one blood donation request at a time.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
            <p className="text-gray-300 text-sm"><span className="text-white font-semibold block mb-1">Be Prepared</span> Ensure you've had adequate rest, food, and water before donating.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
            <p className="text-gray-300 text-sm"><span className="text-white font-semibold block mb-1">Contact Hospital</span> Call the hospital directly if you need to reschedule or have questions.</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center">
        <Link
          to="/donor/requests"
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-semibold hover:shadow-md transition-all"
        >
          <Target className="w-5 h-5 text-blue-600" />
          View All Requests
        </Link>
        <button
          onClick={fetchAcceptedRequests}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          <RefreshCcw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Popup Modal */}
      <ConfirmModal
        isOpen={popup.show}
        onClose={() => setPopup({ ...popup, show: false })}
        onConfirm={() => setPopup({ ...popup, show: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        confirmText="OK"
        showCancel={false}
      />
    </div>
  )
}

export default AcceptedRequests
