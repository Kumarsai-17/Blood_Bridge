
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
  Droplet,
  Zap,
  History,
  ChevronRight,
  Star,
  ShieldCheck,
  Target,
  Zap as ZapIcon,
  Activity as ActivityIcon
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'

const HospitalDashboard = () => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    fulfilledRequests: 0,
    acceptedRequests: 0,
    completedDonations: 0
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/hospital/dashboard')
      setStats(response.data.data)

      const requestsRes = await api.get('/hospital/requests')
      setRecentRequests(requestsRes.data.data.slice(0, 5))
    } catch (error) {
      toast.error('Failed to initialize coordination data')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-14 h-14 border-t-4 border-indigo-600 border-r-4 border-transparent rounded-full animate-spin mb-6 shadow-2xl shadow-indigo-100"></div>
        <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Clinical Coordination...</p>
      </div>
    )
  }

  const statsConfig = [
    {
      icon: ActivityIcon,
      title: "Clinical Signals",
      value: stats.totalRequests,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
      trend: "Total Records"
    },
    {
      icon: Clock,
      title: "Active Tactics",
      value: stats.pendingRequests,
      bg: "bg-amber-50",
      color: "text-amber-600",
      trend: stats.pendingRequests > 0 ? "Priority Feed" : "Stable"
    },
    {
      icon: CheckCircle,
      title: "Fulfilled Reserve",
      value: stats.fulfilledRequests,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
      trend: "Synchronized"
    },
    {
      icon: Users,
      title: "Donor Presence",
      value: stats.acceptedRequests,
      bg: "bg-blue-50",
      color: "text-blue-600",
      trend: "Live Engagement"
    },
    {
      icon: Heart,
      title: "Direct Impact",
      value: stats.completedDonations,
      bg: "bg-rose-50",
      color: "text-rose-600",
      trend: "Life Cycles Saved"
    }
  ]

  const quickActions = [
    {
      href: "/hospital/create-request",
      icon: Plus,
      title: "Initialize Signal",
      description: "Activate an urgent high-fidelity request for biological units",
      colorClass: "text-indigo-600"
    },
    {
      href: "/hospital/requests",
      icon: Activity,
      title: "Signal Hub",
      description: "Monitor and coordinate all active clinical requirements",
      colorClass: "text-rose-600"
    },
    {
      href: "/hospital/history",
      icon: History,
      title: "Impact Archive",
      description: "Audit historical requests and institutional fulfillments",
      colorClass: "text-slate-900"
    }
  ]

  const performanceInsights = [
    {
      icon: Zap,
      title: 'Sync Efficiency',
      description: 'Request fulfillment trajectory',
      stats: [
        {
          label: 'Fulfillment',
          value: stats.totalRequests > 0 ? `${Math.round((stats.fulfilledRequests / stats.totalRequests) * 100)}%` : '0%',
          bg: 'bg-emerald-500'
        },
        { label: 'Yield Units', value: stats.completedDonations, bg: 'bg-indigo-500' }
      ]
    },
    {
      icon: BarChart3,
      title: 'Stakeholder Sync',
      description: 'System-wide matching diagnostics',
      stats: [
        {
          label: 'Engagement',
          value: stats.totalRequests > 0 ? `${Math.round((stats.acceptedRequests / stats.totalRequests) * 100)}%` : '0%',
          bg: 'bg-indigo-500'
        },
        { label: 'Active Matrix', value: stats.acceptedRequests, bg: 'bg-indigo-900' }
      ]
    }
  ]

  return (
    <div className="space-y-12 pb-24">
      {/* Royal Coordination Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-black rounded-[3rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative overflow-hidden text-white group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <ActivityIcon className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transition-transform hover:rotate-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tight uppercase italic mb-0">Clinical Operations Command</h1>
            </div>
            <p className="text-indigo-100 text-xl font-medium max-w-2xl leading-relaxed italic">
              Orchestrating critical biological logistics for life-sustaining medical procedures. System status is <span className="text-emerald-400 font-black uppercase tracking-[0.2em] underline underline-offset-8 decoration-emerald-500/50 italic">Peak Precision</span>.
            </p>
          </div>
          <Link to="/hospital/create-request">
            <Button variant="royal" className="bg-white text-slate-900 hover:bg-rose-50 shadow-2xl border-transparent">
              <Plus className="w-5 h-5 mr-2 text-rose-600" />
              Initialize Signal
            </Button>
          </Link>
        </div>
      </div>

      {/* Operations Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Real-time telemetry of biological requirements</p>
              </div>
              <Link to="/hospital/requests">
                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 text-[10px]">
                  VIEW REGISTRY <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <CardContent className="p-12">
              {recentRequests.length === 0 ? (
                <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                  <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <Droplet className="w-12 h-12 text-slate-100" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">Signals Quiescent</h3>
                  <p className="text-slate-400 max-w-sm mx-auto text-[11px] font-black uppercase tracking-widest leading-loose italic">Initialize a high-fidelity signal to begin the synchronization protocol.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left border-b border-slate-50">
                        <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Phenotype</th>
                        <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Units</th>
                        <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Telemetry status</th>
                        <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Archive Date</th>
                        <th className="pb-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 italic">Coordination</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentRequests.map((request) => (
                        <tr key={request._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                          <td className="py-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-slate-950 flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:scale-110 transition-transform italic">
                              {request.bloodGroup}
                            </div>
                          </td>
                          <td className="py-8">
                            <span className="text-3xl font-black text-slate-900 italic tracking-tighter">{request.units}</span>
                            <span className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest italic">Units</span>
                          </td>
                          <td className="py-8">
                            <Badge variant={getStatusBadgeVariant(request.status)}>
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-8">
                            <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">
                              {new Date(request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          </td>
                          <td className="py-8 text-right px-6">
                            <Link to={`/hospital/requests/${request._id}/responses`}>
                              <Button variant="secondary" size="sm" className="rounded-2xl text-[10px]">
                                Initialize Briefing
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[4rem] p-12 shadow-2xl border-slate-100 relative group/inventory overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
              <ActivityIcon className="w-48 h-48 text-slate-950" />
            </div>
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <Droplet className="w-8 h-8 text-rose-600" />
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Perimeter Reserve Awareness</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bloodType) => (
                <div key={bloodType} className="group/item relative bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 text-center shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-rose-100 hover:-translate-y-2 hover:bg-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                  <div className="text-4xl font-black text-slate-900 mb-2 group-hover/item:text-rose-600 transition-colors italic tracking-tighter">{bloodType}</div>
                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] italic">Diagnostics</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Throughput Diagnostics Sidebar */}
        <div className="space-y-12">
          <div className="px-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Throughput Diagnostics</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Real-time performance metrics</p>
          </div>

          <div className="space-y-8">
            {performanceInsights.map((insight, index) => (
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

          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-black rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group/support border border-white/5">
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
              <ShieldCheck className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/10">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black mb-4 uppercase italic">Priority Support</h3>
              <p className="text-indigo-100 text-base mb-10 leading-relaxed font-medium italic opacity-80">Direct access to emergency orchestration for critical logistics protocols.</p>
              <Button variant="royal" className="w-full bg-white text-slate-900 hover:bg-rose-50 shadow-2xl border-transparent">
                Initialize Connection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HospitalDashboard
