
import { useState, useEffect } from 'react'
import {
  Users,
  Clock,
  Activity,
  TrendingUp,
  Shield,
  BarChart3,
  Globe,
  Zap,
  Star,
  ShieldCheck,
  Building2,
  Droplet,
  Cpu,
  Target,
  FileSearch,
  Zap as ZapIcon,
  ArrowRight
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/dashboard')
      setDashboard(response.data.data)
    } catch (error) {
      toast.error('Failed to initialize orchestration data')
    } finally {
      setLoading(false)
    }
  }

  const statsConfig = [
    {
      icon: Users,
      title: 'Total Stakeholders',
      value: dashboard?.totalUsers || 0,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      trend: 'Registry Growth'
    },
    {
      icon: Clock,
      title: 'Authorizations',
      value: dashboard?.pendingApprovals || 0,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      trend: dashboard?.pendingApprovals > 0 ? 'High-Priority' : 'Registry Stable'
    },
    {
      icon: Activity,
      title: 'Active Signals',
      value: dashboard?.activeRequests || 0,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      trend: 'Real-time Feed'
    },
    {
      icon: ShieldCheck,
      title: 'Global Impact',
      value: dashboard?.totalDonations || 0,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      trend: 'Verified Syncs'
    }
  ]

  const quickActions = [
    {
      href: '/admin/pending-approvals',
      icon: ShieldCheck,
      title: 'Authorization Desk',
      description: 'Review and authorize high-fidelity infrastructure credentials',
      count: dashboard?.pendingApprovals,
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50'
    },
    {
      href: '/admin/users',
      icon: Users,
      title: 'Personnel Registry',
      description: 'Manage the entire verified stakeholder ecosystem',
      count: dashboard?.totalUsers,
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50'
    },
    {
      href: '/admin/disaster-toggle',
      icon: Activity,
      title: 'Emergency Core',
      description: 'Initialize or manage high-priority response protocols',
      colorClass: 'text-rose-600',
      bgClass: 'bg-rose-50'
    },
    {
      href: '/admin/reports',
      icon: BarChart3,
      title: 'Intelligence Suite',
      description: 'Sophisticated analysis of system-wide performance telemetry',
      colorClass: 'text-indigo-950',
      bgClass: 'bg-slate-100'
    }
  ]

  const platformInsights = [
    {
      icon: Droplet,
      title: 'Biological Reserves',
      description: 'Stakeholder inventory by phenotype',
      stats: [
        { label: 'O Positive', value: '42%', color: 'bg-rose-600' },
        { label: 'A Positive', value: '28%', color: 'bg-indigo-600' },
        { label: 'Collective', value: '30%', color: 'bg-slate-900' }
      ],
      gradient: 'from-rose-600 via-red-700 to-black'
    },
    {
      icon: Globe,
      title: 'Sync Topology',
      description: 'Real-time platform synchronization',
      stats: [
        { label: 'Latency', value: '12ms', color: 'bg-indigo-500' },
        { label: 'Sync Fidelity', value: '100%', color: 'bg-emerald-500' },
        { label: 'Node Uptime', value: '99.9%', color: 'bg-blue-500' }
      ],
      gradient: 'from-indigo-600 via-indigo-800 to-black'
    },
    {
      icon: TrendingUp,
      title: 'Growth Trajectory',
      description: 'Institutional registration vectors',
      stats: [
        { label: 'Daily Pulse', value: '+18', color: 'bg-emerald-500' },
        { label: 'Weekly Velocity', value: '+142', color: 'bg-blue-500' },
        { label: 'Strategic Goal', value: '2.5k Nodes', color: 'bg-amber-600' }
      ],
      gradient: 'from-emerald-600 via-teal-700 to-black'
    },
    {
      icon: Shield,
      title: 'Compliance Matrix',
      description: 'Security & Regulatory Audit',
      stats: [
        { label: 'Verified', value: '98%', color: 'bg-indigo-400' },
        { label: 'Cipher', value: 'ECC-521', color: 'bg-indigo-600' },
        { label: 'Anomalies', value: 'Zero Detected', color: 'bg-emerald-500' }
      ],
      gradient: 'from-slate-800 to-black'
    }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-14 h-14 border-t-4 border-indigo-600 border-r-4 border-transparent rounded-full animate-spin mb-6 shadow-2xl shadow-indigo-100"></div>
        <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing System Orchestration...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Royal Hub Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-black rounded-[2.5rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative overflow-hidden text-white group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <Shield className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transition-transform hover:rotate-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">System Orchestration Hub</h1>
            </div>
            <p className="text-indigo-100 text-xl font-medium max-w-2xl leading-relaxed italic">
              Strategic oversight of global life-reserve logistics and institutional credentials. System throughput is currently <span className="text-emerald-400 font-black uppercase tracking-[0.2em] underline decoration-wavy decoration-emerald-500/50 underline-offset-8">Optimal</span>.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="px-8 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-[1.5rem] text-white font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl italic">
              <ZapIcon className="w-5 h-5 text-amber-400 animate-pulse" />
              Peak Operational Throughput
            </div>
          </div>
        </div>
      </div>

      {/* Primary Orchestration Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="border-slate-100 shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.iconBg} ${stat.iconColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.trend && (
                  <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-slate-50 border-slate-100 text-slate-500">
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{stat.title}</p>
                <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter">{stat.value}</h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Protocols */}
      <section>
        <div className="flex items-center gap-6 mb-10 px-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Strategic Protocols</h2>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href} className="group">
              <Card className="h-full border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-2xl ${action.bgClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                    <action.icon className={`w-7 h-7 ${action.colorClass}`} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3 italic">{action.title}</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 italic flex-1">
                    {action.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    {action.count !== undefined ? (
                      <span className={`text-2xl font-black ${action.colorClass} italic tracking-tighter`}>{action.count}</span>
                    ) : (
                      <span></span>
                    )}
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* System Telemetry Diagnostics */}
      <section>
        <div className="flex items-center gap-6 mb-10 px-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Telemetry Diagnostics</h2>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {platformInsights.map((insight, index) => (
            <div key={index} className={`bg-gradient-to-br ${insight.gradient} rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500`}>
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <insight.icon className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-8">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl w-fit mb-4 shadow-lg border border-white/10">
                    <insight.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-2 italic">{insight.title}</h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest italic">{insight.description}</p>
                </div>
                <div className="space-y-4 mt-auto">
                  {insight.stats.map((stat, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{stat.label}</span>
                        <span className="text-sm font-black italic">{stat.value}</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} w-3/4 rounded-full`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Audit Notification */}
      <Card className="rounded-[4rem] border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-2xl transition-all overflow-hidden">
        <CardContent className="p-12 w-full flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl">
              <FileSearch className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">System Fidelity Audit Processed</h3>
              <p className="text-slate-400 text-sm font-medium italic">Latest compliance verification completed successfully on all active infrastructure nodes.</p>
            </div>
          </div>
          <Button variant="outline" className="h-14 px-10 text-[10px] uppercase tracking-widest shadow-sm">
            Access Full Audit Log →
          </Button>
        </CardContent>
      </Card>
    </div >
  )
}

export default AdminDashboard
