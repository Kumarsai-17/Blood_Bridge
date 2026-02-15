import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  Activity,
  CheckCircle,
  Shield,
  TrendingUp,
  ChevronRight,
  BarChart3,
  MapPin
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Card, CardContent } from '../../components/ui/core'
import { useAuth } from '../../context/AuthContext'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/dashboard')
      console.log('Dashboard data received:', response.data.data)
      setDashboard(response.data.data)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      toast.error('Failed to load dashboard data')
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

  const statsData = [
    {
      icon: Activity,
      title: 'Total Requests',
      value: dashboard?.totalRequests || 0,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      gradient: 'from-blue-500 to-blue-600',
      description: 'All blood requests submitted across the platform',
      details: [
        { label: 'This Month', value: `${dashboard?.thisMonthRequests || 0} requests` },
        { label: 'Last Month', value: `${dashboard?.lastMonthRequests || 0} requests` },
        { label: 'Growth', value: `${dashboard?.growth >= 0 ? '+' : ''}${dashboard?.growth || 0}%` }
      ]
    },
    {
      icon: Clock,
      title: 'Active Requests',
      value: dashboard?.activeRequests || 0,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      gradient: 'from-amber-500 to-amber-600',
      description: 'Blood requests currently pending fulfillment',
      details: [
        { label: 'High Priority', value: `${dashboard?.highPriority || 0} urgent` },
        { label: 'Medium Priority', value: `${dashboard?.mediumPriority || 0} moderate` },
        { label: 'Low Priority', value: `${dashboard?.lowPriority || 0} standard` }
      ]
    },
    {
      icon: CheckCircle,
      title: 'Total Donations',
      value: dashboard?.totalDonations || 0,
      color: 'text-green-600',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      gradient: 'from-green-500 to-green-600',
      description: 'Successfully completed blood donation requests',
      details: [
        { label: 'Success Rate', value: `${dashboard?.successRate || 0}%` },
        { label: 'Avg Response', value: `${dashboard?.avgResponseHours || 0}h` },
        { label: 'Total Units', value: `${dashboard?.totalUnits || 0} units` }
      ]
    }
  ]

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Location Filter Notice for Regional Admins */}
      {user?.role === 'admin' && user?.city && user?.state && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Showing data only for {user.city}, {user.state}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              As a regional admin, you can only view and manage data from your assigned location.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              {dashboard?.adminRegion && (
                <p className="text-sm text-blue-600 font-semibold mt-1">
                  📍 Region: {dashboard.adminRegion}
                </p>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {dashboard?.isRegionalAdmin ? (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                Regional Admin
              </span>
            ) : (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                Super Admin
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-600 mt-4">
          {dashboard?.isRegionalAdmin 
            ? `Monitor and manage blood donation activities in ${dashboard.adminRegion} region.`
            : 'Monitor and manage blood donation activities across all regions.'}
        </p>
      </div>

      {/* Stats Row - 3 Cards in Single Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="shadow-soft-lg hover:shadow-xl transition-all">
            <CardContent className="p-0">
              {/* Top Section - Main Stat */}
              <div className={`${stat.bg} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">{stat.title}</p>
                <h4 className="text-5xl font-bold text-gray-900 mb-2">{stat.value}</h4>
                <p className="text-xs text-gray-600">{stat.description}</p>
              </div>

              {/* Bottom Section - Report Details */}
              <div className="bg-white p-6 border-t-2 border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <h5 className="text-sm font-bold text-gray-900">Detailed Insights</h5>
                </div>
                <div className="space-y-3">
                  {stat.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-xs font-medium text-gray-600">{detail.label}</span>
                      <span className="text-sm font-bold text-gray-900">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
