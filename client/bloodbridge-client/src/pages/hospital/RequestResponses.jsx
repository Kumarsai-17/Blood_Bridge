import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Droplet,
  Activity,
  Navigation,
  Ban
} from 'lucide-react'
import api from '../../services/api'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const RequestResponses = () => {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTab = location.state?.returnTab || 'approved'
  const [request, setRequest] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingDonor, setCancellingDonor] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [fulfilling, setFulfilling] = useState(false)
  const [activeTab, setActiveTab] = useState('active') // 'active' or 'cancelled'
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchRequestAndResponses()
  }, [requestId])

  const fetchRequestAndResponses = async () => {
    try {
      setLoading(true)
      const [requestRes, responsesRes] = await Promise.all([
        api.get('/hospital/requests'),
        api.get(`/hospital/requests/${requestId}/responses`)
      ])
      
      const foundRequest = requestRes.data.data.find(r => r._id === requestId)
      setRequest(foundRequest)
      setResponses(responsesRes.data)
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Failed to load responses. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleFulfillDonation = async (donorId) => {
    try {
      setFulfilling(true)
      const response = await api.post('/hospital/fulfill-donation', {
        requestId: requestId,
        donorId: donorId,
        unitsCollected: request.units
      })

      if (response.data.success) {
        setPopup({ 
          show: true, 
          type: 'success', 
          title: 'Success', 
          message: 'Donation fulfilled successfully',
          onClose: () => navigate('/hospital/requests', { state: { returnTab } })
        })
      }
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Failed', message: error.response?.data?.message || 'Failed to fulfill donation' })
    } finally {
      setFulfilling(false)
    }
  }

  const handleCancelDonor = async () => {
    if (!cancellingDonor) return

    try {
      await api.post(`/hospital/requests/${requestId}/cancel-donor`, {
        donorId: cancellingDonor
      })
      
      setPopup({ show: true, type: 'success', title: 'Donor Cancelled', message: 'Donor cancelled successfully. You can now accept another donor.' })
      setShowCancelModal(false)
      setCancellingDonor(null)
      fetchRequestAndResponses()
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Failed', message: error.response?.data?.message || 'Failed to cancel donor' })
    }
  }

  const getDirectionsToDonor = (donorLocation) => {
    if (!donorLocation || !donorLocation.lat || !donorLocation.lng) {
      setPopup({ show: true, type: 'error', title: 'Location Unavailable', message: 'Donor location not available' })
      return
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${donorLocation.lat},${donorLocation.lng}`
    window.open(url, '_blank')
  }

  const getResponseStatusBadgeVariant = (status) => {
    switch (status) {
      case 'accepted': return 'success'
      case 'declined': return 'destructive'
      case 'completed': return 'royal'
      case 'cancelled': return 'outline'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading responses...</p>
      </div>
    )
  }

      if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Not Found</h3>
        <Button onClick={() => navigate('/hospital/requests', { state: { returnTab } })} variant="primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Requests
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/hospital/requests', { state: { returnTab } })} 
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Donor Responses</h1>
          </div>
        </div>
        <div className="ml-16">
          <p className="text-gray-600 mb-4">
            View and manage donor responses for this blood request
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-base px-4 py-2">
              <Droplet className="w-4 h-4 mr-2" />
              {request.bloodGroup}
            </Badge>
            <Badge variant="outline" className="text-base px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              {request.units} units
            </Badge>
            <Badge variant="outline" className="text-base px-4 py-2">
              {request.urgency} priority
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'active'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-200 shadow-sm'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Active Responses ({responses.filter(r => r.status !== 'cancelled').length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'cancelled'
              ? 'bg-amber-100 text-amber-700 border-2 border-amber-200 shadow-sm'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Cancelled ({responses.filter(r => r.status === 'cancelled').length})
        </button>
      </div>

      {/* Responses List */}
      {responses.filter(r => activeTab === 'active' ? r.status !== 'cancelled' : r.status === 'cancelled').length === 0 ? (
        <Card className="text-center py-24 shadow-soft-lg">
          <CardContent>
            <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'active' ? 'No Active Responses Yet' : 'No Cancelled Responses'}
            </h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'active' 
                ? "Donors haven't responded to this request yet." 
                : "No donors have been cancelled for this request."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {responses.filter(r => activeTab === 'active' ? r.status !== 'cancelled' : r.status === 'cancelled').map((response, index) => (
            <Card key={index} className="shadow-soft-lg hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-8">
                      <Badge variant={getResponseStatusBadgeVariant(response.status)}>
                        {response.status}
                      </Badge>
                      {response.status === 'cancelled' && response.cancelledBy && (
                        <Badge variant={response.cancelledBy === 'donor' ? 'default' : 'destructive'} className="text-xs">
                          Cancelled by {response.cancelledBy === 'donor' ? 'Donor' : 'Hospital'}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(response.respondedAt).toLocaleString()}
                      </span>
                    </div>

                    {(response.status === 'accepted' || response.status === 'completed' || response.status === 'cancelled') && response.donorName !== 'Hidden' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mr-4 text-white shadow-md">
                              <Users className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Donor Name</div>
                              <div className="text-lg font-bold text-gray-900">{response.donorName}</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4 text-blue-600 border border-blue-100 shadow-sm">
                              <Phone className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</div>
                              <div className="text-base font-bold text-gray-900">
                                <a href={`tel:${response.donorPhone}`} className="hover:text-blue-600 transition-colors">
                                  {response.donorPhone}
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4 text-blue-600 border border-blue-100 shadow-sm">
                              <Mail className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</div>
                              <div className="text-sm font-bold text-gray-900 break-all">
                                <a href={`mailto:${response.donorEmail}`} className="hover:text-blue-600 transition-colors">
                                  {response.donorEmail}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mr-4 text-red-600 border border-red-100 shadow-sm">
                              <Droplet className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Blood Group</div>
                              <div className="text-2xl font-bold text-red-600">{response.bloodGroup}</div>
                            </div>
                          </div>
                          {response.distanceKm && (
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mr-4 text-amber-600 border border-amber-100 shadow-sm">
                                <MapPin className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Distance</div>
                                <div className="text-lg font-bold text-gray-900">{response.distanceKm} km</div>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mr-4 text-gray-600 border border-gray-100 shadow-sm">
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Responded</div>
                              <div className="text-base font-bold text-gray-900">
                                {new Date(response.respondedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 bg-gray-50 rounded-xl border border-gray-200 flex items-center text-gray-500 font-medium text-sm">
                        <Shield className="w-5 h-5 mr-3" />
                        Donor information not available (declined)
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col gap-3">
                    {response.status === 'accepted' && request.status !== 'fulfilled' && (
                      <>
                        <Button
                          onClick={() => handleFulfillDonation(response.donorId)}
                          variant="success"
                          className="w-full md:w-auto"
                          disabled={fulfilling}
                        >
                          {fulfilling ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setCancellingDonor(response.donorId)
                            setShowCancelModal(true)
                          }}
                          variant="destructive"
                          className="w-full md:w-auto"
                        >
                          <Ban className="w-5 h-5 mr-2" />
                          Cancel Donor
                        </Button>
                      </>
                    )}

                    {response.status === 'completed' && (
                      <Badge variant="royal" className="px-6 py-3 text-sm">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Completed
                      </Badge>
                    )}

                    {response.status === 'cancelled' && (
                      <Badge variant="outline" className="px-6 py-3 text-sm border-amber-200 bg-amber-50 text-amber-700">
                        <XCircle className="w-5 h-5 mr-2" />
                        Cancelled
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Get Directions Button - Bottom of Card */}
                {response.status === 'accepted' && response.donorLocation && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                      onClick={() => getDirectionsToDonor(response.donorLocation)}
                      variant="outline"
                      className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 font-semibold"
                    >
                      <Navigation className="w-5 h-5 mr-2" />
                      Navigate to Donor Location
                      <MapPin className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-center pt-6">
        <Button onClick={() => navigate('/hospital/requests', { state: { returnTab } })} variant="outline" size="lg">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Requests
        </Button>
      </div>

      {/* Cancel Donor Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false)
          setCancellingDonor(null)
        }}
        onConfirm={handleCancelDonor}
        title="Cancel Donor"
        message="Are you sure you want to cancel this donor? This will allow you to accept another donor for this request."
        type="warning"
        confirmText="Yes, Cancel Donor"
        cancelText="No, Keep Donor"
      />

      {/* Popup Modal */}
      <ConfirmModal
        isOpen={popup.show}
        onClose={() => {
          setPopup({ ...popup, show: false })
          if (popup.onClose) popup.onClose()
        }}
        onConfirm={() => {
          setPopup({ ...popup, show: false })
          if (popup.onClose) popup.onClose()
        }}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        confirmText="OK"
        showCancel={false}
      />
    </div>
  )
}

export default RequestResponses
