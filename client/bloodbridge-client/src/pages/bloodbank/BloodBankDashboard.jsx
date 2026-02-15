import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Package,
  Users,
  AlertCircle,
  TrendingUp,
  Droplet,
  Clock,
  ChevronRight,
  BarChart3,
  Target,
  Zap,
  Award,
  TrendingDown,
  AlertTriangle,
  X
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const BloodBankDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dismissedAlerts, setDismissedAlerts] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bloodbank/dashboard')
      setDashboard(response.data.data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const dismissAlert = (bloodType) => {
    setDismissedAlerts([...dismissedAlerts, bloodType])
  }

  const activeCriticalStock = (dashboard?.criticalStock || []).filter(
    item => !dismissedAlerts.includes(item.bloodType)
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading your dashboard...</p>
      </div>
    )
  }

  const mainStats = [
    {
      icon: Droplet,
      title: "Total Blood Units",
      value: dashboard?.totalUnits || 0,
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      color: "text-red-600",
      iconBg: "bg-red-100"
    },
    {
      icon: Award,
      title: "Requests Fulfilled",
      value: dashboard?.totalFulfilled || 0,
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      color: "text-green-600",
      iconBg: "bg-green-100"
    },
    {
      icon: Activity,
      title: "Pending Requests",
      value: dashboard?.pendingRequests || 0,
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      color: "text-blue-600",
      iconBg: "bg-blue-100"
    },
    {
      icon: Target,
      title: "Fulfillment Rate",
      value: `${dashboard?.fulfillmentRate || 0}%`,
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      color: "text-purple-600",
      iconBg: "bg-purple-100"
    }
  ]

  const performanceMetrics = [
    {
      icon: Clock,
      title: "Avg Response Time",
      value: `${dashboard?.avgResponseHours || 0}h`,
      subtitle: "Time to fulfill",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      icon: TrendingUp,
      title: "Units Distributed",
      value: dashboard?.unitsDistributed || 0,
      subtitle: "Total units given",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      icon: Users,
      title: "Available Donors",
      value: dashboard?.totalDonors || 0,
      subtitle: "Registered donors",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      icon: AlertCircle,
      title: "Critical Stock",
      value: dashboard?.criticalStock?.length || 0,
      subtitle: "Blood types < 5 units",
      color: "text-red-600",
      bg: "bg-red-50"
    }
  ]

  // Line chart configuration
  const lineChartData = {
    labels: dashboard?.monthlyTrends?.map(t => t.month) || [],
    datasets: [
      {
        label: 'Fulfilled Requests',
        data: dashboard?.monthlyTrends?.map(t => t.fulfilled) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} fulfilled`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
          padding: 8
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: { size: 11, weight: '600' },
          color: '#64748b',
          padding: 8
        }
      }
    }
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Blood Bank Dashboard</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Real-time analytics and insights for blood bank operations and distribution management.
            </p>
          </div>
          <Link to="/bloodbank/reports">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Stock Alerts - Notification Style */}
      {activeCriticalStock.length > 0 && (
        <div className="space-y-3">
          {activeCriticalStock.map((item, index) => (
            <div 
              key={item.bloodType}
              className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 shadow-md animate-fade-in flex items-center justify-between"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Critical Stock Alert: Blood Type {item.bloodType}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Only <span className="font-bold text-red-600">{item.units} units</span> remaining. Immediate restocking required.
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissAlert(item.bloodType)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                title="Dismiss alert"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-soft-lg transition-all">
            <CardContent className="p-6">
              <div className={`p-3 rounded-xl ${stat.bg} w-fit mb-4`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <h4 className="text-3xl font-bold text-gray-900">{stat.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card className="shadow-soft-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
              <p className="text-sm text-gray-500 mt-1">Key operational indicators</p>
            </div>
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{metric.title}</p>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h4>
                <p className="text-xs text-gray-500">{metric.subtitle}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Monthly Trends - Line Chart */}
        <Card className="shadow-soft-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Fulfillment Trends</h3>
                <p className="text-sm text-gray-500 mt-1">Last 6 months performance</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>

            {dashboard?.monthlyTrends && dashboard.monthlyTrends.length > 0 ? (
              <div className="h-80">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No trend data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blood Type Distribution Analytics */}
      {dashboard?.bloodTypeDistribution && dashboard.bloodTypeDistribution.length > 0 && (
        <Card className="shadow-soft-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Distribution by Blood Type</h3>
                <p className="text-sm text-gray-500 mt-1">Fulfilled requests breakdown</p>
              </div>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dashboard.bloodTypeDistribution.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {item.bloodType}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Requests</p>
                  <p className="text-xl font-bold text-gray-900 mb-2">{item.requests}</p>
                  <p className="text-xs text-gray-500">Total: {item.totalUnits} units</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BloodBankDashboard
