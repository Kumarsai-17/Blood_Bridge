import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Users,
  Clock,
  CheckCircle,
  Plus,
  BarChart3,
  Heart,
  History,
  TrendingUp,
  Target
} from 'lucide-react'
import api from '../../services/api'
import { Button, Card, CardContent } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const HospitalDashboard = () => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    fulfilledRequests: 0,
    acceptedRequests: 0,
    completedDonations: 0
  })
  const [loading, setLoading] = useState(true)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/hospital/dashboard')
      setStats(response.data.data)
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Failed to load dashboard data. Please try again.' })
    } finally {
      setLoading(false)
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

  const statsConfig = [
    {
      icon: Activity,
      title: "Total Requests",
      value: stats.totalRequests,
      iconBg: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      icon: Clock,
      title: "Pending",
      value: stats.pendingRequests,
      iconBg: "bg-amber-100",
      color: "text-amber-600"
    },
    {
      icon: Users,
      title: "Donor Responses",
      value: stats.acceptedRequests,
      iconBg: "bg-purple-100",
      color: "text-purple-600"
    },
    {
      icon: Heart,
      title: "Completed",
      value: stats.fulfilledRequests,
      iconBg: "bg-green-100",
      color: "text-green-600"
    }
  ]

  const quickActions = [
    {
      href: "/hospital/create-request",
      icon: Plus,
      title: "Create Request",
      description: "Submit a new blood request to donors",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      href: "/hospital/requests",
      icon: Activity,
      title: "View Requests",
      description: "Monitor all your blood requests",
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      href: "/hospital/history",
      icon: History,
      title: "Donation History",
      description: "View completed donations",
      color: "text-gray-600",
      bg: "bg-gray-50"
    }
  ]

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Manage your blood requests and coordinate with donors to save lives.
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="shadow-soft-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">{stat.title}</p>
              <h4 className="text-3xl font-bold text-gray-900">{stat.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.href} className="block group">
            <Card className="h-full shadow-soft-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${action.bg} w-fit mb-4`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Performance Overview */}
      <Card className="shadow-soft-lg hover:shadow-xl transition-all">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Performance Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">Fulfillment Rate</span>
                <span className="text-3xl font-bold text-blue-900">
                  {stats.totalRequests > 0 ? Math.round((stats.fulfilledRequests / stats.totalRequests) * 100) : 0}%
                </span>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-700" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
              <div>
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider block mb-1">Completed</span>
                <span className="text-3xl font-bold text-green-900">{stats.fulfilledRequests || 0}</span>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
              <div>
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block mb-1">Total Responses</span>
                <span className="text-3xl font-bold text-purple-900">
                  {stats.acceptedRequests || 0}
                </span>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-700" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200">
              <div>
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block mb-1">Active Requests</span>
                <span className="text-3xl font-bold text-amber-900">{stats.pendingRequests || 0}</span>
              </div>
              <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-700" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

export default HospitalDashboard
