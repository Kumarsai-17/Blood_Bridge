import { useState, useEffect } from 'react'
import { Bell, Check, X, Clock, AlertCircle, Heart, MapPin, Radio, Activity, ShieldCheck, Zap, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { PageHeader } from '../../components/shared/DashboardComponents'
import ConfirmModal from '../../components/shared/ConfirmModal'

const Notifications = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchBloodRequests()
  }, [])

  const fetchBloodRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/donor/requests')

      const acceptedResponse = await api.get('/donor/accepted-requests')
      const acceptedIds = acceptedResponse.data.requests.map(r => r._id)

      const requestsWithStatus = response.data.requests.map(req => ({
        ...req,
        hasResponded: acceptedIds.includes(req._id),
        isNew: (Date.now() - new Date(req.createdAt)) < 3600000
      }))

      setRequests(requestsWithStatus)
    } catch (error) {
      console.error('Error fetching blood requests:', error)
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Failed to load intelligence feed' })
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    try {
      const response = await api.post('/donor/respond', {
        requestId,
        response: 'accepted'
      })

      const message = response.data.hospital 
        ? `Coordination initialized! ${response.data.hospital.name} synchronization details accessed.`
        : 'Synchronization initialized!'
      
      setPopup({ 
        show: true, 
        type: 'success', 
        title: 'Success', 
        message,
        onClose: () => {
          fetchBloodRequests()
          navigate('/donor/accepted-requests')
        }
      })
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to initialize coordination'
      setPopup({ show: true, type: 'error', title: 'Failed', message: errorMessage })
    }
  }

  const handleDecline = async (requestId) => {
    try {
      await api.post('/donor/respond', {
        requestId,
        response: 'declined'
      })

      setPopup({ show: true, type: 'success', title: 'Success', message: 'Signal discarded' })
      setRequests(prev => prev.filter(req => req._id !== requestId))
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to discard signal'
      setPopup({ show: true, type: 'error', title: 'Failed', message: errorMessage })
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm shadow-rose-50'
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      default: return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  }

  const getUrgencyIcon = (urgency) => {
    if (urgency === 'high') {
      return <AlertCircle className="w-8 h-8 text-rose-600" />
    }
    return <Heart className="w-8 h-8 text-rose-600" />
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'pending') return !req.hasResponded
    if (filter === 'responded') return req.hasResponded
    return true
  })

  const pendingCount = requests.filter(req => !req.hasResponded).length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-14 h-14 border-t-4 border-rose-600 border-r-4 border-transparent rounded-full animate-spin mb-6 shadow-2xl shadow-rose-100"></div>
        <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing Intelligence Stream...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Royal Feed Header */}
      <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-black rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Bell className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transition-transform hover:rotate-6">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tight uppercase italic">Intelligence Stream</h1>
            </div>
            <p className="text-rose-100 text-lg font-medium leading-relaxed max-w-2xl italic">
              Real-time clinical signal intelligence and high-priority deployment directives from medical infrastructure. Monitor active coordination pulses.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping absolute inset-0"></div>
              <div className="w-4 h-4 rounded-full bg-emerald-500 relative"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest italic">Live Feed Active</span>
          </div>
        </div>
      </div>

      {/* Signal Filtering Matrix */}
      <div className="flex flex-wrap items-center gap-6 bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl w-fit">
        {[
          { key: 'all', label: 'Global Stream', icon: Globe },
          { key: 'pending', label: 'Critical Only', icon: AlertCircle },
          { key: 'responded', label: 'Synchronized Nodes', icon: ShieldCheck }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${filter === tab.key
              ? 'bg-slate-900 text-white shadow-2xl scale-105 italic'
              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.key === 'pending' && pendingCount > 0 && (
              <span className="ml-3 bg-rose-600 text-white text-[10px] px-3 py-1 rounded-full animate-bounce">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Intelligence Stream Feed */}
      <div className="space-y-10">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-[4rem] p-32 text-center border border-slate-100 shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 -mr-24 -mt-24 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
              <Activity className="w-96 h-96 text-slate-900" />
            </div>
            <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-slate-100 relative z-10">
              <Bell className="w-14 h-14 text-slate-100" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight italic relative z-10">Archive Stable</h3>
            <p className="text-slate-400 max-w-sm mx-auto text-[11px] font-black uppercase tracking-widest leading-loose italic relative z-10">No active clinical signals currently matching your frequency. System remains on standby for high-fidelity updates.</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div
              key={request._id}
              className={`group relative bg-white rounded-[4rem] border-2 p-12 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-700 overflow-hidden ${request.isNew && !request.hasResponded ? 'border-rose-200 ring-8 ring-rose-50/50 scale-[1.02]' : 'border-slate-50'
                }`}
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50 opacity-0 group-hover:opacity-40 -mr-40 -mt-40 rounded-full blur-[100px] transition-opacity duration-1000"></div>

              <div className="flex flex-col lg:flex-row justify-between items-start gap-12 relative z-10">
                <div className="flex-1 space-y-10">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center border-2 border-slate-100 group-hover:bg-white group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner">
                      {getUrgencyIcon(request.urgency)}
                    </div>
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                          {request.bloodGroup} SIGNAL IDENTIFIED
                        </h3>
                        {request.isNew && !request.hasResponded && (
                          <span className="px-5 py-2 bg-rose-600 text-white text-[10px] rounded-xl font-black uppercase tracking-[0.2em] shadow-lg animate-pulse">
                            PRIORITY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{request.hospitalName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Expected Reserve Units</div>
                      <div className="text-xl font-black text-slate-900 tracking-tighter italic">{request.units} UNITS</div>
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Spatial Vector</div>
                      <div className="text-xl font-black text-slate-900 tracking-tighter flex items-center italic">
                        <Navigation className="w-5 h-5 mr-2 text-indigo-500" /> {request.distance} KM
                      </div>
                    </div>
                    <div className="md:col-span-2 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Synchronization Priority</div>
                      <div className="flex gap-3 mt-2">
                        <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm italic ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency} URGENCY PROTOCOL
                        </span>
                      </div>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="p-10 bg-indigo-50/30 rounded-[2rem] border border-indigo-100 group-hover:bg-white transition-all italic text-slate-600 text-sm font-medium leading-relaxed relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-4 opacity-5">
                        <Zap className="w-12 h-12 text-indigo-950" />
                      </div>
                      " {request.notes} "
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-fit flex flex-col gap-6">
                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] mb-4 self-end italic shadow-inner">
                    <Clock className="w-4 h-4 text-rose-500" /> Received {new Date(request.createdAt).toLocaleTimeString()}
                  </div>

                  {!request.hasResponded ? (
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => handleAccept(request._id)}
                        className="w-full lg:w-72 h-20 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center justify-center group/btn relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                        <Check className="w-7 h-7 mr-4 group-hover/btn:scale-125 transition-transform relative z-10" />
                        Synchronize Node
                      </button>
                      <button
                        onClick={() => handleDecline(request._id)}
                        className="w-full lg:w-72 h-16 bg-white border-2 border-slate-100 text-slate-400 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95 flex items-center justify-center group/btn italic"
                      >
                        <X className="w-6 h-6 mr-4 group-hover/btn:rotate-90 transition-transform" />
                        Discard Signal
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-full lg:w-72 py-6 bg-emerald-500 text-white rounded-[1.5rem] text-center font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-100 italic relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                        Protocol Synchronized
                      </div>
                      <button
                        onClick={() => navigate('/donor/accepted-requests')}
                        className="w-full lg:w-72 h-16 bg-white border-2 border-slate-100 text-slate-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl transition-all active:scale-95 shadow-sm italic"
                      >
                        Manage Sync Node →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Deployment Support Protocols */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-black rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group/rules border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 opacity-10 group-hover/rules:scale-110 transition-transform duration-1000">
          <Globe className="w-[30rem] h-[30rem] text-white" />
        </div>
        <div className="relative z-10">
          <h4 className="text-base font-black uppercase tracking-[0.4em] mb-12 flex items-center gap-6 italic">
            <Radio className="w-7 h-7 text-indigo-400 animate-pulse" />
            Deployment Support Protocols
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group/rule">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs mb-6 border border-indigo-500/30 group-hover/rule:bg-indigo-500 group-hover/rule:text-white transition-all shadow-sm">01</div>
              <p className="text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-4 italic">Verification Requirement</p>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium italic opacity-80">Verify deployment availability and metabolic status prior to signal synchronization.</p>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group/rule">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 font-black text-xs mb-6 border border-rose-500/30 group-hover/rule:bg-rose-500 group-hover/rule:text-white transition-all shadow-sm">02</div>
              <p className="text-[11px] font-black text-rose-300 uppercase tracking-widest mb-4 italic">Priority Optimization</p>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium italic opacity-80">Prioritize Sector Intensity (Critical/Signal Red) for maximum institutional impact.</p>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group/rule">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs mb-6 border border-emerald-500/30 group-hover/rule:bg-emerald-500 group-hover/rule:text-white transition-all shadow-sm">03</div>
              <p className="text-[11px] font-black text-emerald-300 uppercase tracking-widest mb-4 italic">Institutional Sync</p>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium italic opacity-80">Facility Intelligence and direct comms are shared upon high-fidelity protocol synchronization.</p>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group/rule">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-xs mb-6 border border-amber-500/30 group-hover/rule:bg-amber-500 group-hover/rule:text-white transition-all shadow-sm">04</div>
              <p className="text-[11px] font-black text-amber-300 uppercase tracking-widest mb-4 italic">Scrub Window</p>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium italic opacity-80">Abort window for synchronized signals finalized after 300s of initial signal lock-on.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      <ConfirmModal
        isOpen={popup.show}
        onClose={() => {
          setPopup({ ...popup, show: false })
          if (popup.onClose) popup.onClose()
        }}
        onConfirm={() => {
          setPopup({ ...popup, show: false })
          if (popup.onClose) popup.onClose()
        }}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        confirmText="OK"
        showCancel={false}
      />
    </div>
  )
}

export default Notifications
