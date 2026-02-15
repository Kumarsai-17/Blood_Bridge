import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Clock, AlertCircle, Phone, User, Navigation, CheckCircle, ArrowLeft, ShieldCheck, Activity, Zap, Target, Star, Heart } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { getAccurateDirections } from '../../utils/directions'
import { PageHeader } from '../../components/shared/DashboardComponents'
import ConfirmModal from '../../components/shared/ConfirmModal'

const RequestDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [request, setRequest] = useState(null)
  const [distance, setDistance] = useState(null)
  const [eta, setEta] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [clickPosition, setClickPosition] = useState(null)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchRequestDetails()
  }, [id])

  const fetchRequestDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/donor/request/${id}`)
      setRequest(response.data.data)
      setDistance(response.data.data.distanceKm)
      calculateETA(response.data.data.distanceKm)
    } catch (error) {
      setPopup({ 
        show: true, 
        type: 'error', 
        title: 'Load Failed', 
        message: 'Failed to access coordination details',
        onClose: () => navigate('/donor/dashboard')
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateETA = (distanceKm) => {
    const avgSpeed = 30 // km/h
    const timeHours = distanceKm / avgSpeed
    const timeMinutes = Math.round(timeHours * 60)
    setEta(timeMinutes)
  }

  const handleRespond = async (response, event) => {
    if (event) {
      setClickPosition({ x: event.clientX, y: event.clientY })
    }
    setConfirmAction({ response })
    setShowConfirmModal(true)
  }

  const confirmRespond = async () => {
    if (!confirmAction) return

    setResponding(true)
    try {
      await api.post('/donor/respond', {
        requestId: id,
        response: confirmAction.response
      })

      setPopup({ 
        show: true, 
        type: 'success', 
        title: 'Success', 
        message: `Coordination ${confirmAction.response} successfully`,
        onClose: () => navigate('/donor/dashboard')
      })
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Failed', message: error.response?.data?.message || 'Failed to initialize coordination' })
    } finally {
      setResponding(false)
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-rose-100 text-rose-800 border-rose-200 shadow-sm shadow-rose-50'
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getDirections = () => {
    if (!request?.hospital?.location) {
      setPopup({ show: true, type: 'error', title: 'Location Unavailable', message: 'Institution coordinates not available' })
      return
    }
    getAccurateDirections(request.hospital.location, user, request.hospital.name)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-14 h-14 border-t-4 border-rose-600 border-r-4 border-transparent rounded-full animate-spin mb-6 shadow-2xl shadow-rose-100"></div>
        <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing Briefing Data...</p>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="text-center py-24 bg-white rounded-[3rem] shadow-xl border border-slate-100 max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-50">
          <AlertCircle className="w-12 h-12 text-slate-100" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Registry Null</h3>
        <p className="text-slate-400 mb-10 max-w-xs mx-auto text-[11px] font-black uppercase tracking-widest leading-loose">The clinical request you're looking for doesn't exist or has been synchronized.</p>
        <button
          onClick={() => navigate('/donor/dashboard')}
          className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95"
        >
          Return to Hub
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      {/* Royal Header Case */}
      <div className="flex flex-col md:flex-row items-center gap-10">
        <button
          onClick={() => navigate('/donor/dashboard')}
          className="w-20 h-20 bg-white border-2 border-slate-50 rounded-[2rem] flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl group/back active:scale-90"
        >
          <ArrowLeft className="w-8 h-8 group-hover/back:-translate-x-2 transition-transform" />
        </button>
        <div className="flex-1 w-full">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-black rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-white w-full">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <ShieldCheck className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-3">
                <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">Coordination Pulse</div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Clinical Deployment Brief</h1>
              <p className="text-indigo-200 text-lg font-medium italic mt-2">Sophisticated coordination metrics and facility coordinates for specialized mobilization.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Coordination Intelligence */}
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden group/card hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all">
            <div className="p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-10">
                <div className="flex items-center gap-10">
                  <div className="w-28 h-28 bg-rose-50 rounded-[3rem] flex items-center justify-center text-rose-600 border-2 border-rose-100 shadow-2xl group-hover/card:scale-110 transition-transform duration-1000 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <span className="text-5xl font-black italic relative z-10">{request.bloodGroup}</span>
                  </div>
                  <div>
                    <span className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border mb-4 inline-block shadow-lg italic ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency} PRIORITY SIGNAL
                    </span>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{request.hospital.name}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-8 px-10 py-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                  <div className="text-right">
                    <div className="text-4xl font-black text-indigo-600 tracking-tighter italic">{distance}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">KM Distance</div>
                  </div>
                  <div className="h-12 w-px bg-slate-200"></div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-slate-900 tracking-tighter italic">{eta}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">EST Minutes</div>
                  </div>
                </div>
              </div>

              {/* Institution Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-50 pt-16 mb-16">
                <div className="flex items-center gap-8 group/item">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-all shadow-sm">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 font-black">Sector Coordinates</div>
                    <div className="text-base font-black text-slate-900 tracking-tight italic">
                      {request.hospital.location.lat.toFixed(6)} N, {request.hospital.location.lng.toFixed(6)} E
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8 group/item">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-rose-50 group-hover/item:text-rose-600 transition-all shadow-sm">
                    <Phone className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 font-black">Comms Authorization</div>
                    <div className="text-base font-black text-slate-900 tracking-tight italic">Secured until activation</div>
                  </div>
                </div>
              </div>

              {/* Synchronization Timeline */}
              <div className="border-t border-slate-50 pt-16 mb-16">
                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em] mb-12 flex items-center gap-4 italic">
                  Synchronization Timeline
                  <div className="h-px flex-1 bg-slate-50"></div>
                </h3>
                <div className="space-y-12">
                  <div className="flex items-center gap-10 group/timeline">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-2xl ring-4 ring-slate-50 transition-transform group-hover/timeline:scale-110">01</div>
                    <div>
                      <div className="text-base font-black text-slate-900 leading-none uppercase tracking-tight italic">Signal Initialization</div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">Broadcasted 14 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-10 group/timeline">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-2xl ring-4 ring-indigo-50 transition-transform group-hover/timeline:scale-110">02</div>
                    <div>
                      <div className="text-base font-black text-slate-900 leading-none uppercase tracking-tight italic">Coordination Protocol</div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">Automatic scrub in 23 hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Advisory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-16 border-t border-slate-50">
                <div className="p-8 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100 hover:bg-white hover:shadow-2xl transition-all group/adv">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="font-black uppercase tracking-[0.2em] text-[10px] text-indigo-900 italic">Security Protocol</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed font-medium italic">
                    Institution intelligence and direct voice comms authorized only after secure coordination acknowledgment.
                  </p>
                </div>
                <div className="p-8 bg-rose-50/30 rounded-[2.5rem] border border-rose-100 hover:bg-white hover:shadow-2xl transition-all group/adv">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="font-black uppercase tracking-[0.2em] text-[10px] text-rose-900 italic">Clinical Alert</span>
                  </div>
                  <p className="text-sm text-rose-900 leading-relaxed font-medium italic">
                    Ensure system integrity by verifying all clinical eligibility criteria prior to mobilization synchronization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coordination Interface Sidebar */}
        <div className="space-y-12">
          {/* Action Console */}
          <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-[0_50px_120px_rgba(0,0,0,0.3)] group/console relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-12 text-slate-500 italic relative z-10">Action Interface</h3>

            <div className="space-y-6 relative z-10">
              <button
                onClick={(e) => handleRespond('accepted', e)}
                disabled={responding}
                className="w-full h-24 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.3em] hover:bg-slate-50 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center transition-all shadow-2xl active:scale-95 group/action"
              >
                {responding ? (
                  <div className="px-5 py-2 bg-slate-900 rounded-xl animate-pulse text-white">SYNCING...</div>
                ) : (
                  <>
                    <Zap className="w-8 h-8 mr-4 text-rose-600 group-hover/action:scale-125 transition-transform" />
                    Initialize Sync
                  </>
                )}
              </button>

              <button
                onClick={(e) => handleRespond('declined', e)}
                disabled={responding}
                className="w-full h-20 bg-white/5 hover:bg-rose-900/40 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] transition-all border-2 border-white/5 hover:border-rose-500/30 active:scale-95 italic"
              >
                Decline Signal
              </button>
            </div>
          </div>

          {/* Deployment Support Controls */}
          <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-xl space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-10 text-slate-400 italic">Deployment Support</h3>
            <button
              onClick={getDirections}
              className="w-full py-6 rounded-2xl bg-slate-50 border-2 border-slate-50 flex items-center justify-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 group/tool"
            >
              <Navigation className="w-6 h-6 mr-4 group-hover/tool:translate-x-2 transition-transform" />
              Navigation Sync
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-6 rounded-2xl bg-slate-50 border-2 border-slate-50 flex items-center justify-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 group/tool"
            >
              <Activity className="w-6 h-6 mr-4 group-hover/tool:rotate-180 duration-700 transition-transform" />
              Clinical Audit
            </button>

            <button
              onClick={() => navigate('/donor/profile')}
              className="w-full py-6 rounded-2xl bg-slate-50 border-2 border-slate-50 flex items-center justify-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 group/tool"
            >
              <User className="w-6 h-6 mr-4" />
              Identity Profile
            </button>
          </div>

          {/* Safety Assurance Protocol */}
          <div className="bg-gradient-to-br from-emerald-950 to-slate-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group/assurance border border-emerald-900/50">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 group-hover/assurance:scale-110 transition-transform duration-1000">
              <CheckCircle className="w-64 h-64 text-emerald-400" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-12 text-emerald-400 italic">Safety Assurance</h3>
            <ul className="space-y-8 relative z-10">
              {[
                'Nutrition Cycle < 4h',
                'Fluid Intake Verified',
                'Restorative Rest (>7h)',
                'Eligibility Standards Approved'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-6 group/check">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 font-bold text-sm group-hover/check:bg-emerald-500 group-hover/check:text-white transition-all">✓</div>
                  <span className="text-[12px] font-black uppercase tracking-widest text-emerald-100 italic">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Channel */}
          <div className="p-10 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 leading-loose italic">Require high-priority administrative assistance? Access direct support channels below.</p>
            <button
              onClick={() => window.location.href = 'mailto:support@bloodbridge.com'}
              className="text-indigo-600 hover:text-indigo-800 font-black text-[11px] uppercase tracking-[0.3em] border-b-4 border-indigo-50 pb-2 transition-all hover:border-indigo-400 italic"
            >
              Initialize Support Channel →
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmRespond}
        title="Confirm Action"
        message={`Are you sure you want to ${confirmAction?.response} this coordination signal?`}
        confirmText="Confirm"
        cancelText="Cancel"
        type={confirmAction?.response === 'accept' ? 'success' : 'danger'}
        clickPosition={clickPosition}
      />
      
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

export default RequestDetails