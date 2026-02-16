
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Clock, CheckCircle, ChevronRight, Activity, RefreshCw, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import RequestCard from '../../components/shared/RequestCard'
import RequestDetailsModal from '../../components/donor/RequestDetailsModal'
import HospitalInfoModal from '../../components/donor/HospitalInfoModal'
import AcceptedRequestsModal from '../../components/donor/AcceptedRequestsModal'
import { Button, Card, CardContent } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const DonorRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [acceptedRequests, setAcceptedRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ eligibleToDonate: true, totalDonations: 0, responseRate: 0 })
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showHospitalModal, setShowHospitalModal] = useState(false)
  const [showAcceptedModal, setShowAcceptedModal] = useState(false)
  const [hospitalInfo, setHospitalInfo] = useState(null)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchRequests()

    const handleFocus = () => {
      fetchRequests()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const [requestsRes, dashboardRes] = await Promise.all([
        api.get('/donor/requests'),
        api.get('/donor/dashboard')
      ])

      setRequests(requestsRes.data.requests || [])
      setStats(dashboardRes.data.data || { eligibleToDonate: true })

      try {
        const acceptedRes = await api.get('/donor/accepted-requests')
        setAcceptedRequests(acceptedRes.data.requests || [])
      } catch (acceptedError) {
        if (acceptedError.response?.status === 404) {
          setAcceptedRequests([])
        } else {
          throw acceptedError
        }
      }
    } catch (error) {
      console.error('Failed to load requests:', error)
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Failed to load blood requests. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const handleRespond = async (requestId, response) => {
    try {
      const result = await api.post('/donor/respond', { requestId, response })

      if (response === 'accepted') {
        setPopup({ show: true, type: 'success', title: 'Request Accepted', message: 'You have successfully accepted this blood donation request.' })
      } else {
        setPopup({ show: true, type: 'success', title: 'Request Updated', message: `Request ${response} successfully.` })
      }

      fetchRequests()
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Action Failed', message: error.response?.data?.message || 'Failed to process request. Please try again.' })
    }
  }

  const handleCancelAccepted = async (requestId) => {
    try {
      await api.delete(`/donor/accepted-requests/${requestId}`)
      setPopup({ show: true, type: 'success', title: 'Request Cancelled', message: 'Your accepted request has been cancelled successfully.' })
      fetchRequests()
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Cancel Failed', message: error.response?.data?.message || 'Failed to cancel request. Please try again.' })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading blood requests...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Blood Requests</h1>
            </div>
            <p className="text-red-50 text-sm max-w-2xl">
              View and respond to blood donation requests from nearby hospitals
            </p>
          </div>
          <Button
            onClick={fetchRequests}
            className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-lg text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Notifications */}
      <div className="grid grid-cols-1 gap-3">
        {!stats.eligibleToDonate && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">Donation Cooldown Active</h4>
                <p className="text-sm leading-relaxed">
                  You can donate again in <span className="font-bold">{stats.cooldownRemainingDays} days</span>. Your body needs time to recover.
                </p>
              </div>
            </div>
          </div>
        )}

        {stats.hasActiveRequest && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">Active Request</h4>
                <p className="text-sm leading-relaxed mb-3">
                  You have an active accepted request. Complete it before accepting new requests.
                </p>
                <Link to="/donor/accepted-requests">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-3 py-1.5 rounded-lg text-sm">
                    View Active Request
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Heart, title: "Available Requests", value: requests.length, bg: "bg-red-50", color: "text-red-600", onClick: null },
          { icon: MapPin, title: "Search Radius", value: "20km", bg: "bg-blue-50", color: "text-blue-600", onClick: null },
          { icon: TrendingUp, title: "Performance", value: `${stats.totalDonations || 0} Donations`, subtitle: `${stats.responseRate || 0}% Response Rate`, bg: "bg-purple-50", color: "text-purple-600", onClick: null }
        ].map((stat, i) => (
          <Card key={i} className={`border-gray-200 shadow-md hover:shadow-lg transition-all ${stat.onClick ? 'cursor-pointer' : ''}`} onClick={stat.onClick}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">{stat.title}</p>
                <h4 className="text-3xl font-bold text-gray-900">{stat.value}</h4>
                {stat.subtitle && <p className="text-sm text-gray-500 mt-2">{stat.subtitle}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests List */}
      <Card className="rounded-xl shadow-md border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900">Available Requests</h2>
              <p className="text-xs text-gray-500 mt-0.5">Blood donation requests from hospitals within 20km</p>
            </div>
            <Button
              onClick={fetchRequests}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Requests Available</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">There are currently no blood donation requests in your area. Check back later.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  onRespond={handleRespond}
                  onViewDetails={handleViewDetails}
                  showActions={stats.canAcceptRequests}
                  userRole="donor"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-red-500" />
          <span>{requests.length} requests within 20km radius</span>
        </div>

        <Link to="/donor/map">
          <Button variant="outline" className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            View Map
          </Button>
        </Link>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onRespond={handleRespond}
        canRespond={stats.canAcceptRequests}
      />

      {/* Hospital Info Modal */}
      <HospitalInfoModal
        isOpen={showHospitalModal}
        onClose={() => setShowHospitalModal(false)}
        hospital={hospitalInfo?.hospital}
        request={hospitalInfo?.request}
      />

      {/* Accepted Requests Modal */}
      <AcceptedRequestsModal
        isOpen={showAcceptedModal}
        onClose={() => setShowAcceptedModal(false)}
        acceptedRequests={acceptedRequests}
        onCancelRequest={handleCancelAccepted}
      />
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

export default DonorRequests