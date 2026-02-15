import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, Users, MapPin, Clock, Activity, CheckCircle, Zap, X } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'

const DisasterToggle = () => {
  const [disasterMode, setDisasterMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [modalState, setModalState] = useState('confirm') // 'confirm' or 'activated'
  const [pendingAction, setPendingAction] = useState(null) // 'activate' or 'deactivate'
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({
    totalDonors: 0,
    activeHospitals: 0,
    activeBloodBanks: 0,
    recentRequests: 0,
    totalPendingRequests: 0
  })

  useEffect(() => {
    fetchDisasterStatus()
    fetchStats()
    fetchHistory()
  }, [])

  const fetchDisasterStatus = async () => {
    try {
      const response = await api.get('/admin/disaster-status')
      setDisasterMode(response.data.data.disasterMode)
    } catch (error) {
      console.error('Failed to load disaster mode status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/emergency-stats')
      if (response.data && response.data.success && response.data.data) {
        const data = response.data.data
        setStats({
          totalDonors: Number(data.totalDonors) || 0,
          activeHospitals: Number(data.activeHospitals) || 0,
          activeBloodBanks: Number(data.activeBloodBanks) || 0,
          recentRequests: Number(data.recentRequests) || 0,
          totalPendingRequests: Number(data.totalPendingRequests) || 0
        })
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await api.get('/admin/disaster-history')
      if (response.data && response.data.success) {
        setHistory(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to load disaster history:', error)
    }
  }

  const handleToggleClick = () => {
    const action = !disasterMode ? 'activate' : 'deactivate'
    setPendingAction(action)
    setModalState('confirm')
    setShowConfirmModal(true)
  }

  const handleConfirm = async () => {
    const newMode = pendingAction === 'activate'
    
    setToggling(true)
    try {
      const response = await api.put('/admin/disaster-toggle', { enable: newMode })
      setDisasterMode(newMode)
      
      // Refresh stats and history after toggle
      await Promise.all([fetchStats(), fetchHistory()])
      
      // Show activated/deactivated state
      setModalState('activated')
      setTimeout(() => {
        setShowConfirmModal(false)
        setModalState('confirm')
      }, 2000)
    } catch (error) {
      // Check if it's an auth error
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      } else {
        // Show error message to user
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred'
        toast.error(`Failed to ${pendingAction} disaster mode: ${errorMsg}`)
      }
      
      setShowConfirmModal(false)
      setModalState('confirm')
    } finally {
      setToggling(false)
    }
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setModalState('confirm')
    setPendingAction(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading emergency settings...</p>
      </div>
    )
  }

  const emergencyStats = [
    {
      icon: Users,
      title: "Available Donors",
      value: stats.totalDonors,
      bg: "bg-blue-50",
      color: "text-blue-600"
    },
    {
      icon: MapPin,
      title: "Active Hospitals",
      value: stats.activeHospitals,
      bg: "bg-green-50",
      color: "text-green-600"
    },
    {
      icon: Clock,
      title: "Recent Requests",
      value: stats.recentRequests,
      bg: "bg-amber-50",
      color: "text-amber-600"
    }
  ]

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className={`rounded-2xl p-8 shadow-soft-lg border transition-all ${disasterMode ? 'bg-gradient-to-br from-red-50 to-white border-red-200' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${disasterMode ? 'bg-red-100' : 'bg-blue-100'}`}>
                {disasterMode ? <AlertTriangle className="w-6 h-6 text-red-600" /> : <Shield className="w-6 h-6 text-blue-600" />}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {disasterMode ? 'Disaster Mode Active' : 'Disaster Mode'}
              </h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              {disasterMode
                ? 'Emergency protocols are active. All cooldowns suspended and notifications prioritized.'
                : 'Activate disaster mode during mass-casualty events to optimize system response.'
              }
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <Badge className={`${disasterMode ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {disasterMode ? 'Emergency Active' : 'Normal Operations'}
            </Badge>
            <Button
              onClick={handleToggleClick}
              disabled={toggling}
              variant={disasterMode ? "outline" : "destructive"}
              className="h-12 px-6"
              type="button"
            >
              {toggling ? (
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>{disasterMode ? 'Deactivate Emergency' : 'Activate Emergency'}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {emergencyStats.map((stat, idx) => (
          <Card key={idx} className="hover:shadow-soft-lg transition-all">
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

      {/* Emergency Features & Protocols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-soft-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Active Configurations</h3>
                <p className="text-sm text-gray-500">Current system settings</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: "Search Radius", active: "30km radius active", inactive: "Standard 15km radius", icon: MapPin },
                { title: "Priority Alerts", active: "All requests high priority", inactive: "Normal priority levels", icon: AlertTriangle },
                { title: "Notifications", active: "Real-time push enabled", inactive: "Standard notifications", icon: Clock }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${disasterMode ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className={`text-xs mt-1 ${disasterMode ? 'text-red-600' : 'text-gray-500'}`}>
                      {disasterMode ? item.active : item.inactive}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft-lg bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Emergency Protocols</h3>
                <p className="text-sm text-gray-500">Activated features</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                "Suspends all request cooldown periods",
                "Immediate push notifications to all donors",
                "Geo-spatial prioritization for resources",
                "Automatic escalation of urgent requests"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">{text}</span>
                </div>
              ))}
            </div>

            <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${disasterMode ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${disasterMode ? 'text-red-600' : 'text-blue-600'}`} />
              <div>
                <p className={`text-sm font-semibold mb-1 ${disasterMode ? 'text-red-900' : 'text-blue-900'}`}>Important Notice</p>
                <p className="text-xs text-gray-600">
                  Disaster mode should only be activated during legitimate mass-casualty events or authorized drills.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-start justify-center pt-20 z-50 animate-fade-in pointer-events-none">
          <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all pointer-events-auto relative ${modalState === 'activated' && pendingAction === 'activate' ? 'bg-red-50 border-2 border-red-500' : modalState === 'activated' && pendingAction === 'deactivate' ? 'bg-green-50 border-2 border-green-500' : ''}`}>
            <div className="p-6">
              {modalState === 'confirm' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${pendingAction === 'activate' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <AlertTriangle className={`w-6 h-6 ${pendingAction === 'activate' ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {pendingAction === 'activate' ? 'Activate Disaster Mode?' : 'Deactivate Disaster Mode?'}
                      </h3>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {pendingAction === 'activate' 
                      ? 'This will enable emergency protocols, suspend cooldowns, and prioritize all notifications. Only activate during legitimate emergencies.'
                      : 'This will return the system to normal operations and restore standard protocols.'
                    }
                  </p>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1"
                      disabled={toggling}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      variant={pendingAction === 'activate' ? 'destructive' : 'default'}
                      className="flex-1"
                      disabled={toggling}
                      type="button"
                    >
                      {toggling ? (
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        'Confirm'
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${pendingAction === 'activate' ? 'bg-red-100' : 'bg-green-100'}`}>
                      <CheckCircle className={`w-12 h-12 ${pendingAction === 'activate' ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${pendingAction === 'activate' ? 'text-red-900' : 'text-green-900'}`}>
                    {pendingAction === 'activate' ? 'Activated!' : 'Deactivated!'}
                  </h3>
                  <p className={pendingAction === 'activate' ? 'text-red-700' : 'text-green-700'}>
                    Disaster Mode is now {pendingAction === 'activate' ? 'active' : 'inactive'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DisasterToggle
