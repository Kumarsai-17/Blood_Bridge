
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
  ShieldCheck,
  Zap,
  Target,
  Star,
  Shield,
  Box,
  BarChart3
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { getCompatibleDonors, getAvailableCompatibleBlood } from '../../utils/bloodCompatibility'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'

const BloodBankDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bloodbank/dashboard')
      setDashboard(response.data.data)
    } catch (error) {
      toast.error('Failed to initialize reserve intelligence')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-14 h-14 border-t-4 border-rose-600 border-r-4 border-transparent rounded-full animate-spin mb-6 shadow-2xl shadow-rose-100"></div>
        <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Reserve Orchestration...</p>
      </div>
    )
  }

  const statsConfig = [
    {
      icon: Droplet,
      title: "Reserve Magnitude",
      value: dashboard?.totalUnits || 0,
      bg: "bg-rose-50",
      color: "text-rose-600",
      trend: "Total Inventory"
    },
    {
      icon: AlertCircle,
      title: "Critical Anomalies",
      value: dashboard?.lowStockItems || 0,
      bg: "bg-amber-50",
      color: "text-amber-600",
      trend: dashboard?.lowStockItems > 0 ? "Urgent Replenishment" : "Registry Stable"
    },
    {
      icon: Users,
      title: "Strategic Needs",
      value: dashboard?.pendingRequests || 0,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
      trend: "Institutional Net"
    },
    {
      icon: TrendingUp,
      title: "Throughput Velocity",
      value: dashboard?.unitsDistributed || 0,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
      trend: "Yield Distributed"
    }
  ]

  const quickActions = [
    {
      href: "/bloodbank/inventory",
      icon: Box,
      title: "Reserve Command",
      description: "Comprehensive audit and orchestration of biological stock",
      colorClass: "text-rose-600"
    },
    {
      href: "/bloodbank/requests",
      icon: Activity,
      title: "Provisioning Core",
      description: "Strategic fulfillment of emergency clinical requirements",
      colorClass: "text-indigo-600"
    },
    {
      href: "/bloodbank/reports",
      icon: BarChart3,
      title: "Intelligence Suite",
      description: "Sophisticated analysis of distribution and vault health",
      colorClass: "text-slate-900"
    }
  ]

  const inventoryInsight = {
    icon: Target,
    title: 'Reserve Health Matrix',
    description: 'Current stock synchronization status',
    stats: [
      { label: 'Synchronized', value: dashboard?.totalUnits || 0, bg: 'bg-emerald-500' },
      { label: 'Critical Signal', value: dashboard?.lowStockItems || 0, bg: 'bg-amber-500' },
      { label: 'Depleted Node', value: Object.values(dashboard?.inventory || {}).filter(u => u === 0).length, bg: 'bg-rose-600' }
    ]
  }

  const distributionInsight = {
    icon: TrendingUp,
    title: 'Flow Dynamics',
    description: 'Real-time biological distribution telemetry',
    stats: [
      { label: 'Synchronized', value: dashboard?.unitsDistributed || 0, bg: 'bg-indigo-500' },
      { label: 'Active Signals', value: dashboard?.pendingRequests || 0, bg: 'bg-rose-500' }
    ]
  }

  const getUrgencyBadgeVariant = (urgency) => {
    switch (urgency) {
      case 'high': return 'destructive'
      case 'medium': return 'warning'
      default: return 'royal'
    }
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Royal Reserve Header */}
      <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-black rounded-[3rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative overflow-hidden text-white group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <Droplet className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transition-transform hover:rotate-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tight uppercase italic mb-0">Biological Reserve Command</h1>
            </div>
            <p className="text-rose-100 text-xl font-medium max-w-2xl leading-relaxed italic">
              Orchestrating life-sustaining biological inventory and institutional provisioning. Vault status is <span className="text-emerald-400 font-black uppercase tracking-[0.2em] underline underline-offset-8 decoration-emerald-500/50 italic">Secure Assurance</span>.
            </p>
          </div>
          <Link to="/bloodbank/inventory">
            <Button variant="secondary" className="bg-white text-slate-900 hover:bg-rose-50 flex items-center gap-3 shadow-2xl">
              <Package className="w-5 h-5 text-rose-600" />
              Audit Protocol
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="border-slate-100 shadow-lg hover:shadow-xl transition-all group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                <h4 className="text-3xl font-black text-slate-900">{stat.value}</h4>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 block italic opacity-60">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Protocols */}
      <section>
        <div className="flex items-center gap-6 mb-10 px-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Strategic Protocols</h2>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href} className="group block h-full">
              <Card className="h-full hover:shadow-xl transition-all border-slate-100 bg-white">
                <CardContent className="p-8 h-full flex flex-col items-start">
                  <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${action.colorClass}`}>
                    <action.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 uppercase italic">{action.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Active Signal Registry */}
        <div className="xl:col-span-2 space-y-12">
          <Card className="rounded-[4rem] shadow-2xl border-slate-100 overflow-hidden transition-all hover:shadow-[0_60px_120px_rgba(0,0,0,0.1)]">
            <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Active Tactical Signals</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Critical requirements from medical facilities</p>
              </div>
              <Link to="/bloodbank/requests">
                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 text-[10px]">
                  VIEW REGISTRY <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <CardContent className="p-12">
              {dashboard?.recentRequests && dashboard.recentRequests.length > 0 ? (
                <div className="space-y-10">
                  {dashboard.recentRequests.map((request) => {
                    const compatibleTypes = getCompatibleDonors(request.bloodType)
                    const availableBlood = dashboard?.inventory
                      ? getAvailableCompatibleBlood(dashboard.inventory, request.bloodType)
                      : { compatible: [], totalUnits: 0, breakdown: {}, canFulfill: false }

                    return (
                      <div key={request.id} className="group/card bg-white border border-slate-100 rounded-[3rem] p-10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:border-rose-100 transition-all duration-500">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-10 mb-8">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-rose-600 to-slate-900 flex items-center justify-center text-white font-black text-3xl shadow-2xl group-hover/card:scale-110 transition-transform duration-700 italic">
                              {request.bloodType}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant={getUrgencyBadgeVariant(request.urgency)} className="mr-2">
                                  {request.urgency} SIGNAL
                                </Badge>
                                <span className="text-[10px] text-slate-400 font-extraBold italic uppercase tracking-widest px-2">ID-{request.id.slice(-6).toUpperCase()}</span>
                              </div>
                              <h4 className="text-2xl font-black text-slate-900 truncate uppercase mt-2 italic tracking-tight">{request.hospitalName}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group-hover/card:bg-white transition-colors">
                            <div className="text-right">
                              <div className="text-3xl font-black text-slate-900 italic tracking-tighter">{request.unitsNeeded}</div>
                              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Target</div>
                            </div>
                            <div className="h-10 w-px bg-slate-200"></div>
                            <div className="text-right">
                              <div className={`text-3xl font-black italic tracking-tighter ${availableBlood.canFulfill ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {availableBlood.totalUnits}
                              </div>
                              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Vault</div>
                            </div>
                          </div>
                        </div>

                        {/* Inventory Snapshot */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group-hover/card:bg-white transition-colors relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                              <ShieldCheck className="w-20 h-20 text-indigo-600" />
                            </div>
                            <div className="text-[11px] font-black text-indigo-600 uppercase mb-4 flex items-center gap-2 italic tracking-widest">
                              <ShieldCheck className="w-4 h-4" /> Synchronized Reserve Status
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {compatibleTypes.map(type => {
                                const units = dashboard?.inventory?.[type] || 0
                                return (
                                  <div key={type} className={`px-4 py-2 rounded-xl text-[10px] font-black border italic uppercase tracking-widest transition-all ${units > 0 ? 'bg-white text-slate-700 border-emerald-100 shadow-sm' : 'bg-slate-50 text-slate-300 border-slate-100'
                                    }`}>
                                    {type}: {units} Units
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center text-[11px] font-black text-slate-400 uppercase tracking-widest italic px-4">
                            <Clock className="w-5 h-5 mr-3 text-indigo-500" />
                            Archived: {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <Link to="/bloodbank/requests">
                            <Button
                              variant={availableBlood.canFulfill ? 'royal' : 'secondary'}
                              className={`h-14 px-12 text-[10px] uppercase tracking-[0.2em] shadow-2xl italic ${!availableBlood.canFulfill && 'opacity-50 cursor-not-allowed'}`}
                            >
                              {availableBlood.canFulfill ? 'Initialize Provisioning' : 'Reserves Insufficient'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                  <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <ShieldCheck className="w-12 h-12 text-slate-100" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">Reserves Quiescent</h3>
                  <p className="text-slate-400 max-w-sm mx-auto text-[11px] font-black uppercase tracking-widest leading-loose italic">No incoming supply requirements currently detected in the global tactical matrix.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reserve Telemetry Sidebar */}
        <div className="space-y-12">
          <div className="px-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">telemetry diagnostics</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Reserve trajectory analyzer</p>
          </div>

          <div className="space-y-8">
            {[inventoryInsight, distributionInsight].map((insight, index) => (
              <Card key={index} className="border-slate-100 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start mb-6">
                    <div className={`w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mr-4`}>
                      <insight.icon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900 mb-1">{insight.title}</h3>
                      <p className="text-xs font-medium text-slate-500">{insight.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {insight.stats.map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${stat.bg} mr-3`}></div>
                          <span className="text-sm font-medium text-slate-600">{stat.label}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-[4rem] p-12 shadow-2xl border-slate-100 relative overflow-hidden group/phenotype">
            <CardContent>
              <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                <Package className="w-64 h-64 text-slate-950" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3 uppercase italic">
                <Activity className="w-6 h-6 text-rose-600" />
                Phenotype Density
              </h3>
              <div className="space-y-8">
                {dashboard?.inventory && Object.entries(dashboard.inventory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([bloodType, units]) => (
                    <div key={bloodType} className="group/item">
                      <div className="flex justify-between items-center mb-3 px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-rose-600 transition-colors italic">{bloodType} Group Analysis</span>
                        <span className="text-[11px] font-black text-slate-900 italic tracking-widest">{units} Units</span>
                      </div>
                      <div className="w-full bg-slate-50 rounded-full h-3 shadow-inner overflow-hidden border border-slate-100 group-hover/item:bg-white transition-colors duration-500">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.1)] ${units === 0 ? 'bg-rose-600' :
                            units < 5 ? 'bg-amber-400' :
                              'bg-emerald-500'
                            }`}
                          style={{ width: `${Math.min((units / 20) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BloodBankDashboard
