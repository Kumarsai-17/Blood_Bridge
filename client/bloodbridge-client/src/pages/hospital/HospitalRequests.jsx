import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Activity,
  AlertCircle,
  Plus,
  Info,
  Droplet,
  Target,
  Trash2
} from 'lucide-react'
import api from '../../services/api'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const HospitalRequests = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [requestToCancel, setRequestToCancel] = useState(null)
  const [activeTab, setActiveTab] = useState(location.state?.returnTab || 'approved') // Restore tab from navigation state
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/hospital/requests')
      setRequests(response.data.data)
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Failed to load requests. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRequest = async (requestId) => {
    setRequestToCancel(requestId)
    setShowCancelModal(true)
  }

  const confirmCancelRequest = async () => {
    try {
      setCancellingId(requestToCancel)
      setShowCancelModal(false)
      await api.post(`/hospital/request/${requestToCancel}/cancel`)
      setPopup({ show: true, type: 'success', title: 'Request Cancelled', message: 'Your blood request has been cancelled successfully.' })
      fetchRequests()
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Cancel Failed', message: error.response?.data?.message || 'Failed to cancel request' })
    } finally {
      setCancellingId(null)
      setRequestToCancel(null)
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'fulfilled': return 'success'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  const getUrgencyBadgeVariant = (urgency) => {
    switch (urgency) {
      case 'high': return 'destructive'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'outline'
    }
  }

  const getResponseStatusBadgeVariant = (status) => {
    switch (status) {
      case 'accepted': return 'success'
      case 'declined': return 'destructive'
      case 'completed': return 'royal'
      default: return 'outline'
    }
  }

  const hasAcceptedResponses = (request) => {
    return request.responses?.some(r => r.status === 'accepted' || r.status === 'completed')
  }

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === 'approved') {
      return request.status !== 'cancelled' && request.status !== 'fulfilled'
    } else if (activeTab === 'fulfilled') {
      return request.status === 'fulfilled'
    } else {
      return request.status === 'cancelled'
    }
  })

  const approvedCount = requests.filter(r => r.status !== 'cancelled' && r.status !== 'fulfilled').length
  const fulfilledCount = requests.filter(r => r.status === 'fulfilled').length
  const cancelledCount = requests.filter(r => r.status === 'cancelled').length

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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              View and manage all your blood requests and donor responses.
            </p>
          </div>
          <Link to="/hospital/create-request">
            <Button variant="primary" size="lg" className="w-full lg:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              Create Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'approved'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setActiveTab('fulfilled')}
          className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'fulfilled'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Fulfilled ({fulfilledCount})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'cancelled'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="text-center py-24 shadow-soft-lg">
          <CardContent>
            <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <AlertCircle className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {activeTab === 'approved' ? 'No Approved Requests' : activeTab === 'fulfilled' ? 'No Fulfilled Requests' : 'No Cancelled Requests'}
            </h3>
            <p className="text-gray-500 mb-8 text-sm max-w-md mx-auto">
              {activeTab === 'approved' 
                ? "You don't have any approved blood requests. Click the 'Create Request' button above to get started."
                : activeTab === 'fulfilled'
                ? "You don't have any fulfilled requests yet."
                : "You don't have any cancelled requests."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((request) => {
            const isCancelled = request.status === 'cancelled'
            return (
              <Card 
                key={request._id} 
                className={`shadow-md hover:shadow-lg transition-all ${
                  isCancelled ? 'bg-red-50 border border-red-200' : 'bg-white'
                }`}
              >
                <CardContent className="p-6">
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                        isCancelled 
                          ? 'bg-red-200 border border-red-300' 
                          : 'bg-red-100 border border-red-200'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          isCancelled ? 'text-red-700' : 'text-red-600'
                        }`}>
                          {request.bloodGroup}
                        </span>
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${
                          isCancelled ? 'text-red-900' : 'text-gray-900'
                        }`}>
                          {request.units} {request.units === 1 ? 'Unit' : 'Units'} Required
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {request.status}
                          </Badge>
                          {!isCancelled && (
                            <Badge variant={getUrgencyBadgeVariant(request.urgency)}>
                              {request.urgency}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Created</div>
                      <div className={`text-sm font-semibold ${
                        isCancelled ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {request.notes && (
                    <div className={`mb-4 p-4 rounded-lg ${
                      isCancelled 
                        ? 'bg-red-100 border border-red-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <Info className={`w-4 h-4 mt-0.5 ${
                          isCancelled ? 'text-red-700' : 'text-gray-600'
                        }`} />
                        <div>
                          <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                            isCancelled ? 'text-red-800' : 'text-gray-600'
                          }`}>
                            Notes
                          </div>
                          <div className={`text-sm ${
                            isCancelled ? 'text-red-900' : 'text-gray-700'
                          }`}>
                            {request.notes}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Row */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className={`w-5 h-5 ${
                          isCancelled ? 'text-red-700' : 'text-blue-600'
                        }`} />
                        <div>
                          <div className="text-xs text-gray-500">Responses</div>
                          <div className={`text-lg font-bold ${
                            isCancelled ? 'text-red-900' : 'text-gray-900'
                          }`}>
                            {request.responses?.length || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-5 h-5 ${
                          isCancelled ? 'text-red-700' : 'text-green-600'
                        }`} />
                        <div>
                          <div className="text-xs text-gray-500">Accepted</div>
                          <div className={`text-lg font-bold ${
                            isCancelled ? 'text-red-900' : 'text-gray-900'
                          }`}>
                            {request.responses?.filter(r => r.status === 'accepted').length || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {request.status === 'pending' && !hasAcceptedResponses(request) && (
                        <Button
                          onClick={() => handleCancelRequest(request._id)}
                          variant="destructive"
                          size="sm"
                          disabled={cancellingId === request._id}
                        >
                          {cancellingId === request._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        onClick={() => navigate(`/hospital/requests/${request._id}/responses`, { state: { returnTab: activeTab } })}
                        variant={isCancelled ? 'secondary' : 'primary'}
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false)
          setRequestToCancel(null)
        }}
        onConfirm={confirmCancelRequest}
        title="Cancel Request?"
        message="Are you sure you want to cancel this blood request? This action cannot be undone."
        type="warning"
        confirmText="Yes, Cancel"
        cancelText="Keep Request"
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

export default HospitalRequests
