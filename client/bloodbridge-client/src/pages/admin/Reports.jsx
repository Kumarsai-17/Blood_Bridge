import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart as BarChartIcon,
  Users,
  Activity,
  TrendingUp,
  RefreshCw,
  Download,
  Droplet,
  Building2,
  Clock,
  Filter,
  FileText,
  CheckCircle,
  X,
  MapPin
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'
import { useAuth } from '../../context/AuthContext'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

const Reports = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState('last30days')
  const [visibleSections, setVisibleSections] = useState(new Set())
  const observerRef = useRef(null)
  const [reportData, setReportData] = useState({
    overview: {
      totalUsers: 0,
      totalDonors: 0,
      totalHospitals: 0,
      totalBloodBanks: 0,
      pendingRequests: 0,
      fulfilledRequests: 0,
      totalRequests: 0
    },
    monthlyStats: [],
    bloodGroupStats: [],
    recentActivity: [],
    userDistribution: {
      donors: 0,
      hospitals: 0,
      bloodBanks: 0,
      admins: 0
    }
  })

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  useEffect(() => {
    // Set up Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.dataset.section]))
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    // Observe all sections after data loads
    if (!loading && observerRef.current) {
      const sections = document.querySelectorAll('[data-section]')
      sections.forEach((section) => {
        observerRef.current.observe(section)
      })
    }
  }, [loading])

  const fetchReportData = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem('token')

      if (!token) {
        return
      }

      const response = await api.get(`/admin/reports?dateRange=${dateRange}`)

      if (response.data.success) {
        setReportData(response.data.data)
        console.log('📊 Monthly Stats:', response.data.data.monthlyStats)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export/donors', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  const handleActivityClick = (activity, event) => {
    // Navigate to user management with the user ID and click position
    if (activity.userId) {
      const clickPos = event ? { x: event.clientX, y: event.clientY } : null
      navigate('/admin/users', { 
        state: { 
          userId: activity.userId,
          clickPosition: clickPos
        } 
      })
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 12, weight: '600' },
          usePointStyle: true,
          padding: 20,
          color: '#64748b'
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y;
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          color: '#94a3b8', 
          font: { size: 11, weight: '600' },
          stepSize: 1,
          precision: 0
        },
        grid: { 
          color: 'rgba(241, 245, 249, 0.8)',
          drawBorder: false
        }
      },
      x: {
        grid: { display: false },
        ticks: { 
          color: '#94a3b8', 
          font: { size: 11, weight: '600' } 
        }
      }
    },
    barPercentage: 0.7,
    categoryPercentage: 0.8
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.2,
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          font: { family: 'Inter', size: 11, weight: '600' },
          padding: 10,
          usePointStyle: true,
          color: '#64748b',
          boxWidth: 8,
          boxHeight: 8,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i);
                return {
                  text: label,
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  lineWidth: style.borderWidth,
                  hidden: !chart.getDataVisibility(i),
                  index: i
                };
              });
            }
            return [];
          }
        },
        maxWidth: 120
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 11 },
        cornerRadius: 8
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    }
  }

  const barData = {
    labels: reportData.monthlyStats.map(item => item.month),
    datasets: [
      {
        label: 'Total Requests',
        data: reportData.monthlyStats.map(item => item.requests || item.count || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        hoverBackgroundColor: '#3b82f6',
        borderRadius: 8,
        barThickness: 28,
      },
      {
        label: 'Fulfilled Donations',
        data: reportData.monthlyStats.map(item => item.fulfilled || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        hoverBackgroundColor: '#22c55e',
        borderRadius: 8,
        barThickness: 28,
      }
    ]
  }

  const bloodGroupData = {
    labels: reportData.bloodGroupStats.map(item => item._id),
    datasets: [
      {
        label: 'Donors',
        data: reportData.bloodGroupStats.map(item => item.count),
        backgroundColor: [
          '#ef4444', '#f97316', '#f59e0b', '#eab308',
          '#84cc16', '#22c55e', '#10b981', '#14b8a6'
        ],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  }

  const userDistributionData = {
    labels: ['Donors', 'Hospitals', 'Blood Banks', 'Admins'],
    datasets: [
      {
        data: [
          reportData.userDistribution.donors || 0,
          reportData.userDistribution.hospitals || 0,
          reportData.userDistribution.bloodBanks || 0,
          reportData.userDistribution.admins || 0
        ],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#1e293b'],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      {/* Full Page Loading Overlay for Refresh */}
      {refreshing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-700 text-sm font-medium mt-4">Loading...</p>
          </div>
        </div>
      )}

      {/* Location Filter Notice for Regional Admins */}
      {user?.role === 'admin' && user?.city && user?.state && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Showing reports only for {user.city}, {user.state}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              As a regional admin, you can only view reports and analytics from your assigned location.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 via-blue-50/50 to-white rounded-xl p-6 shadow-lg border border-blue-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-lg shadow-md">
                <BarChartIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
            </div>
            <p className="text-sm text-gray-600 max-w-2xl">
              Comprehensive analytics and insights about system performance and user activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => {
                  console.log('📅 Date range changed to:', e.target.value);
                  setDateRange(e.target.value);
                }}
                className="pl-4 pr-10 h-10 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-gray-400"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="thisYear">This Year</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <Button
              onClick={fetchReportData}
              disabled={refreshing}
              variant="outline"
              className={`h-10 px-4 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={handleExport}
              className="h-10 px-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-section="stats">
        {[
          { title: "Total Users", value: reportData.overview.totalUsers, icon: Users, bg: "bg-blue-50", color: "text-blue-600" },
          { title: "Active Donors", value: reportData.overview.totalDonors, icon: Droplet, bg: "bg-red-50", color: "text-red-600" },
          { title: "Hospitals", value: reportData.overview.totalHospitals, icon: Building2, bg: "bg-green-50", color: "text-green-600" },
          { title: "Fulfilled Requests", value: reportData.overview.fulfilledRequests, icon: TrendingUp, bg: "bg-purple-50", color: "text-purple-600" }
        ].map((stat, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-lg transition-all border border-gray-100 ${
              visibleSections.has('stats') ? 'animate-fade-in' : 'opacity-0'
            }`}
            style={{ animationDelay: visibleSections.has('stats') ? `${index * 0.1}s` : '0s' }}
          >
            <CardContent className="p-5">
              <div className={`p-2.5 rounded-lg ${stat.bg} w-fit mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xs text-gray-500 mb-1 font-medium">{stat.title}</p>
              <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Trends - Full Width */}
      <Card 
        className={`shadow-lg border border-gray-100 ${
          visibleSections.has('trends') ? 'animate-fade-in' : 'opacity-0'
        }`}
        data-section="trends"
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Monthly Trends</h3>
              <p className="text-sm text-gray-500 mt-2">Blood request activity over time</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <BarChartIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="h-[380px]">
            <Bar data={barData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* User Distribution and Blood Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-section="charts">
        {/* User Distribution */}
        <Card className={`shadow-lg border border-gray-100 ${
          visibleSections.has('charts') ? 'animate-fade-in' : 'opacity-0'
        }`} style={{ animationDelay: visibleSections.has('charts') ? '0.1s' : '0s' }}>
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">User Distribution</h3>
              <p className="text-sm text-gray-500 mt-2">Role-based breakdown</p>
            </div>
            <div className="w-full" style={{ height: '380px' }}>
              <Pie data={userDistributionData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Blood Group Distribution */}
        <Card className={`shadow-lg border border-gray-100 ${
          visibleSections.has('charts') ? 'animate-fade-in' : 'opacity-0'
        }`} style={{ animationDelay: visibleSections.has('charts') ? '0.2s' : '0s' }}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Blood Groups</h3>
                <p className="text-sm text-gray-500 mt-2">Donor distribution by blood type</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <Droplet className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="w-full" style={{ height: '380px' }}>
              <Pie data={bloodGroupData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Full Width */}
      <Card 
        className={`shadow-lg border border-gray-100 ${
          visibleSections.has('activity') ? 'animate-fade-in' : 'opacity-0'
        }`}
        data-section="activity"
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent History</h3>
              <p className="text-sm text-gray-500 mt-2">Approved and rejected hospitals and blood banks</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="space-y-3">
            {reportData.recentActivity.length > 0 && reportData.recentActivity.slice(0, 15).map((activity, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 p-5 rounded-xl bg-gray-50 transition-all animate-slide-in border border-gray-200" 
                style={{ animationDelay: `${0.4 + idx * 0.05}s` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${
                  activity.type === 'approved' ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {activity.type === 'approved' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <X className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold ${
                      activity.type === 'approved' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {activity.action}
                    </p>
                    <Badge variant="default" className={`text-xs capitalize font-semibold ${
                      activity.role === 'hospital' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {activity.role === 'bloodbank' ? 'Blood Bank' : activity.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 font-semibold truncate">
                    {activity.user || 'Unknown User'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-gray-900 font-bold text-base mb-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    }) : 'N/A'}
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Reports
