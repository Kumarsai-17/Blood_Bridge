
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  Clock,
  MapPin,
  Droplet,
  CheckCircle,
  ShieldCheck,
  History,
  ArrowRight,
  Activity,
  User,
  Target,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import RequestDetailsModal from '../../components/donor/RequestDetailsModal'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const DonorDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    availableRequests: 0,
    myResponses: 0,
    completedDonations: 0,
    livesSaved: 0,
    eligibleToDonate: true,
    cooldownRemainingDays: 0
  })
  const [requests, setRequests] = useState([])
  const [acceptedRequests, setAcceptedRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  const inspirationalQuotes = [
    "Donate blood, save lives. Your donation can make a difference.",
    "Be a hero. Donate blood and give someone a second chance at life.",
    "Every drop counts. Your blood donation can save up to 3 lives.",
    "The gift of blood is the gift of life. Thank you for being a donor.",
    "Blood donation is the greatest gift you can give to humanity.",
    "Your blood type doesn't matter. What matters is your willingness to help.",
    "One pint of blood can save three lives. Be someone's hero today.",
    "Donate blood because life is worth living and worth saving.",
    "Blood donors are life savers. Join the cause and make a difference.",
    "A single donation can help multiple patients in need.",
    "Give blood and keep the world beating. Your donation matters.",
    "Blood donation: A small act of kindness with a huge impact.",
    "Be the reason someone smiles today. Donate blood.",
    "Your donation today could save a life tomorrow.",
    "Real heroes don't wear capes. They donate blood.",
    "Share your power. Donate blood and save lives.",
    "Blood connects us all. Be a part of the lifeline.",
    "Donate blood: Because every life deserves a fighting chance.",
    "Your blood can write someone's survival story.",
    "Be generous with your blood. It costs nothing but saves everything."
  ]

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % inspirationalQuotes.length)
    }, 3000)

    return () => clearInterval(quoteInterval)
  }, [])

  useEffect(() => {
    fetchDashboardData()

    const handleFocus = () => {
      fetchDashboardData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, requestsRes] = await Promise.all([
        api.get('/donor/dashboard'),
        api.get('/donor/requests')
      ])

      setStats(dashboardRes.data.data)
      setRequests(requestsRes.data.requests)

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
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Failed to load dashboard data. Please try again.' })
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

      fetchDashboardData()
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Action Failed', message: error.response?.data?.message || 'Failed to process request. Please try again.' })
    }
  }

  const handleCancelAccepted = async (requestId) => {
    try {
      await api.delete(`/donor/accepted-requests/${requestId}`)
      setPopup({ show: true, type: 'success', title: 'Request Cancelled', message: 'Your accepted request has been cancelled successfully.' })
      fetchDashboardData()
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Cancel Failed', message: error.response?.data?.message || 'Failed to cancel request. Please try again.' })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Inspirational Quotes Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -ml-24 -mb-24"></div>
        </div>
        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 min-h-[70px] flex items-center">
              <p className="text-white text-xl font-bold leading-relaxed transition-all duration-700 ease-in-out drop-shadow-lg">
                {inspirationalQuotes[currentQuoteIndex]}
              </p>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              {inspirationalQuotes.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index === currentQuoteIndex ? 'bg-white w-8' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            </div>
            {stats.eligibleToDonate ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full w-fit">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Eligible to Donate</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full w-fit">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">
                  Available in {stats.cooldownRemainingDays} days
                </span>
              </div>
            )}
            <p className="text-gray-600 max-w-2xl">
              {stats.eligibleToDonate
                ? "You're ready to save lives! Check out the blood requests below and respond to those near you."
                : `Your body is recovering from your last donation. You'll be eligible to donate again in ${stats.cooldownRemainingDays} days.`}
            </p>
          </div>
          <Link to="/donor/map">
            <Button variant="primary" size="lg" className="whitespace-nowrap">
              <MapPin className="w-5 h-5 mr-2" />
              View Map
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { icon: Heart, title: "Lives Saved", value: stats.livesSaved, bg: "bg-red-50", color: "text-red-600" },
          { icon: Droplet, title: "Total Donations", value: stats.completedDonations, bg: "bg-blue-50", color: "text-blue-600" },
          { icon: Clock, title: "My Responses", value: stats.myResponses, bg: "bg-amber-50", color: "text-amber-600" },
          { icon: CheckCircle, title: "Accepted", value: acceptedRequests.length, bg: "bg-green-50", color: "text-green-600" },
          { icon: Activity, title: "Available", value: stats.availableRequests, bg: "bg-purple-50", color: "text-purple-600" }
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-soft-lg transition-all">
            <CardContent className="p-6">
              <div className={`p-3 rounded-xl ${stat.bg} w-fit mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <h4 className="text-3xl font-bold text-gray-900">{stat.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notifications */}
      {!stats.eligibleToDonate && (
        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 flex items-start gap-4 border border-amber-100 shadow-soft">
          <div className="p-3 bg-amber-100 rounded-xl flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-amber-900 mb-1">Recovery Period</h4>
            <p className="text-amber-700">
              Your body is recovering. You'll be eligible to donate again in <span className="font-bold">{stats.cooldownRemainingDays} days</span>.
            </p>
          </div>
        </div>
      )}

      {acceptedRequests.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 flex items-start gap-4 border border-blue-100 shadow-soft">
          <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-blue-900 mb-1">Active Commitments</h4>
            <p className="text-blue-700 mb-4">
              You have {acceptedRequests.length} accepted request(s). View details and coordinate with hospitals.
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate('/donor/accepted-requests')}>
              View Accepted Requests
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { to: "/donor/map", icon: MapPin, title: "View Map", desc: "See blood requests near you on the map", color: "text-red-600", bg: "bg-red-50" },
          { to: "/donor/history", icon: History, title: "Donation History", desc: "View your past donations and impact", color: "text-blue-600", bg: "bg-blue-50" },
          { to: "/donor/profile", icon: User, title: "My Profile", desc: "Update your information and preferences", color: "text-gray-600", bg: "bg-gray-50" }
        ].map((action, i) => (
          <Link key={i} to={action.to} className="block group">
            <Card className="h-full hover:shadow-soft-lg transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${action.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Blood Requests */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Card className="shadow-soft-lg h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Available Blood Requests</h2>
                <p className="text-sm text-gray-500 mt-1">Requests within 15km of your location</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-100">
                <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-xs font-semibold text-red-600">Live</span>
              </div>
            </div>

            <div className="p-6 flex-1">
              {requests.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Heart className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Requests Available</h3>
                  <p className="text-gray-500 max-w-sm mx-auto text-sm">
                    There are no blood requests in your area right now. Check back later!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requests.map((request) => (
                    <div
                      key={request._id}
                      className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-soft-lg transition-all group"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform">
                            {request.bloodGroup}
                          </div>
                          <Badge variant={request.urgency === 'high' ? 'destructive' : request.urgency === 'medium' ? 'warning' : 'info'}>
                            {request.urgency}
                          </Badge>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2 truncate">{request.hospital?.name}</h4>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <MapPin className="w-4 h-4 mr-1 text-red-500" />
                          <span>Within 15km</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{request.units}</div>
                            <div className="text-xs text-gray-500">Units Needed</div>
                          </div>
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(request)}
                        >
                          View Details
                        </Button>
                        <Button
                          disabled={!stats.eligibleToDonate || acceptedRequests.length > 0}
                          onClick={() => handleRespond(request._id, 'accepted')}
                          variant={stats.eligibleToDonate && acceptedRequests.length === 0 ? 'primary' : 'secondary'}
                          size="sm"
                          className="flex-1"
                        >
                          {acceptedRequests.length > 0 ? 'Accepted' : 'Accept'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 flex flex-col">
          <Card className="shadow-soft-lg flex-1">
            <CardContent className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
                Donation Safety Tips
              </h3>
              <ul className="space-y-4 flex-1">
                {[
                  { label: 'Get Good Rest', icon: Clock, desc: 'Sleep 8+ hours before donating' },
                  { label: 'Stay Hydrated', icon: Droplet, desc: 'Drink plenty of water' },
                  { label: 'Bring ID', icon: ShieldCheck, desc: 'Valid identification required' },
                  { label: 'Eat Healthy', icon: Heart, desc: 'Have a nutritious meal before donation' },
                  { label: 'Avoid Alcohol', icon: AlertCircle, desc: 'No alcohol 24 hours before donating' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start group">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors flex-shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <RequestDetailsModal
        request={selectedRequest}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onRespond={handleRespond}
        canRespond={stats.eligibleToDonate && acceptedRequests.length === 0}
      />

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

export default DonorDashboard
