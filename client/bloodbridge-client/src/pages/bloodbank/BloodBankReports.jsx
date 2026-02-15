
import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Download, Calendar, Activity, CheckCircle, Clock, Package, AlertCircle, RefreshCcw, AlertTriangle, X } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Pie, Line } from 'react-chartjs-2'
import api from '../../services/api'
import toast from 'react-hot-toast'
import BloodCompatibilityChart from '../../components/bloodbank/BloodCompatibilityChart'
import { Button, Card, CardContent } from '../../components/ui/core'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const BloodBankReports = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [dateRange, setDateRange] = useState('month') // week, month, year, all
  const [dismissedAlerts, setDismissedAlerts] = useState([])

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/bloodbank/reports?range=${dateRange}`)
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setStats({
        inventory: {},
        totalUnits: 0,
        requestsFulfilled: 0,
        pendingRequests: 0,
        fulfillmentRate: 0,
        monthlyTrends: [],
        mostRequested: [],
        lowStock: [],
        responseTime: {}
      })
    } finally {
      setLoading(false)
    }
  }

  const dismissAlert = (bloodType) => {
    setDismissedAlerts([...dismissedAlerts, bloodType])
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const inventoryData = stats?.inventory || {}
  const monthlyRequests = stats?.monthlyTrends || []
  const activeLowStock = (stats?.lowStock || []).filter(item => !dismissedAlerts.includes(item.bloodType))

  // Line chart configuration for fulfillment trends
  const lineChartData = {
    labels: monthlyRequests.map(d => d.month),
    datasets: [
      {
        label: 'Total Requests',
        data: monthlyRequests.map(d => d.requests || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Fulfilled',
        data: monthlyRequests.map(d => d.fulfilled || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10b981',
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
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} requests`
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

  const getMaxValue = () => {
    const values = Object.values(inventoryData)
    return values.length > 0 ? Math.max(...values) : 1
  }

  const getTotalUnits = () => {
    return Object.values(inventoryData).reduce((a, b) => a + b, 0)
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
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} units (${percentage}%)`;
          }
        }
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

  const bloodTypeDistributionData = {
    labels: bloodGroups.filter(group => inventoryData[group] > 0),
    datasets: [
      {
        data: bloodGroups.filter(group => inventoryData[group] > 0).map(group => inventoryData[group]),
        backgroundColor: [
          '#3b82f6', '#ef4444', '#f59e0b', '#10b981', 
          '#8b5cf6', '#ec4899', '#6366f1', '#f43f5e'
        ],
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
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Blood Bank Reports</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Comprehensive analytics and insights for blood bank operations and distribution management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-sm font-semibold text-gray-700 bg-transparent outline-none cursor-pointer border-none focus:ring-0"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <Button onClick={fetchReports} variant="outline" size="sm">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts - Notification Style */}
      {activeLowStock.length > 0 && (
        <div className="space-y-3">
          {activeLowStock.map((item, index) => (
            <div 
              key={item.bloodType}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-4 shadow-md animate-fade-in flex items-center justify-between"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Low Stock Alert: Blood Type {item.bloodType}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Only <span className="font-bold text-amber-600">{item.units} units</span> remaining. Please restock soon.
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissAlert(item.bloodType)}
                className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                title="Dismiss alert"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Units", value: `${getTotalUnits()}`, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Requests Fulfilled", value: stats?.requestsFulfilled || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { title: "Pending Requests", value: stats?.pendingRequests || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Fulfillment Rate", value: `${stats?.fulfillmentRate || 0}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" }
        ].map((stat, index) => (
          <Card 
            key={index} 
            className="hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className={`p-3 rounded-xl ${stat.bg} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <h4 className="text-3xl font-bold text-gray-900 transition-all duration-300">{stat.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Chart */}
        <Card className="shadow-soft-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Inventory Levels</h3>
                <p className="text-sm text-gray-500 mt-1">Current stock by blood type</p>
              </div>
              <Package className="w-5 h-5 text-blue-600" />
            </div>

            {getTotalUnits() > 0 ? (
              <div className="space-y-4">
                {bloodGroups.map((group, index) => {
                  const units = inventoryData[group] || 0
                  const percentage = (units / getMaxValue()) * 100
                  return (
                    <div 
                      key={group} 
                      className="animate-fade-in group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 group-hover:scale-110 group-hover:bg-red-200 transition-all duration-300">
                            {group}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">Blood Type {group}</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 transition-all duration-300">{units} <span className="text-sm text-gray-500 font-normal">units</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out animate-slide-in"
                          style={{ 
                            width: `${percentage}%`,
                            animationDelay: `${index * 50}ms`
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">No inventory data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="shadow-soft-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Blood Type Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Inventory breakdown</p>
              </div>
              <Package className="w-5 h-5 text-blue-600" />
            </div>

            {getTotalUnits() > 0 ? (
              <div className="w-full" style={{ height: '380px' }}>
                <Pie data={bloodTypeDistributionData} options={pieOptions} />
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">No distribution data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis - Line Chart */}
      <Card className="shadow-soft-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Fulfillment Trends</h3>
              <p className="text-sm text-gray-500 mt-1">Last 6 months performance</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>

          {monthlyRequests.length > 0 ? (
            <div className="h-80">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">No trend data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Response Time */}
        <Card className="shadow-soft-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Response Time</h4>
            </div>
            {stats?.responseTime ? (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 hover:scale-105 transition-all duration-300 animate-fade-in group">
                  <span className="text-sm text-gray-600">Average</span>
                  <span className="text-base font-bold text-gray-900">{stats.responseTime.average || 'N/A'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 hover:scale-105 transition-all duration-300 animate-fade-in group" style={{ animationDelay: '100ms' }}>
                  <span className="text-sm text-gray-600">Fastest</span>
                  <span className="text-base font-bold text-green-600">{stats.responseTime.fastest || 'N/A'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 hover:scale-105 transition-all duration-300 animate-fade-in group" style={{ animationDelay: '200ms' }}>
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-base font-bold text-blue-600">{stats.responseTime.thisMonth || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Summary */}
        <Card className="shadow-soft-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Low Stock Summary</h4>
            </div>
            {stats?.lowStock && stats.lowStock.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStock.slice(0, 5).map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 animate-fade-in group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform duration-300">
                        {item.bloodType}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{item.bloodType}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-gray-900">{item.units}</div>
                      <div className="text-xs text-gray-500">units</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-500 text-sm">All stock levels optimal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blood Compatibility Chart */}
      <BloodCompatibilityChart />
    </div>
  )
}

export default BloodBankReports
