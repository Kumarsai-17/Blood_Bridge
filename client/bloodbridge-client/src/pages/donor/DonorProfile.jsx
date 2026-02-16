import { useState, useEffect } from 'react'
import { User, Phone, Mail, MapPin, Droplets, Calendar, Shield, Edit, Activity, Zap, Star, ShieldCheck, Clock, Award, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import BloodTypeSelector from '../../components/shared/BloodTypeSelector'
import { PageHeader } from '../../components/shared/DashboardComponents'

const DonorProfile = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    location: { lat: null, lng: null }
  })
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'success', 'error', 'info'
  const [modalMessage, setModalMessage] = useState('')
  const [modalTitle, setModalTitle] = useState('')

  const showPopup = (type, title, message) => {
    setModalType(type)
    setModalTitle(title)
    setModalMessage(message)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setTimeout(() => {
      setModalType('')
      setModalTitle('')
      setModalMessage('')
    }, 300)
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/donor/profile')
      setProfile(response.data.data)
      setFormData({
        name: response.data.data.name,
        phone: response.data.data.phone,
        bloodGroup: response.data.data.bloodGroup,
        location: response.data.data.location
      })
    } catch (error) {
      showPopup('error', 'Sync Failure', 'Profile Telemetry Offline. Unable to load profile data.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const response = await api.put('/donor/profile', formData)
      showPopup('success', 'Profile Updated', 'Identity profile updated successfully')
      setEditing(false)
      fetchProfile()
      updateUser({ name: formData.name })
    } catch (error) {
      showPopup('error', 'Update Failed', error.response?.data?.message || 'Synchronization failure')
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      showPopup('error', 'Location Error', 'Tactical Location Protocol Unsupported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }))
        showPopup('success', 'Location Updated', 'Coordinates recalibrated successfully')
      },
      () => showPopup('error', 'Location Error', 'Positioning system failure. Please try again.')
    )
  }

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <PageHeader
          title="Hero Identity"
          subtitle="Tactical overview of your mission profile and clinical identity clearance"
          icon={ShieldCheck}
          gradient="from-slate-800 via-slate-900 to-black"
          className="mb-0 flex-1"
        />
        <button
          onClick={() => setEditing(!editing)}
          className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition shadow-2xl active:scale-95 flex items-center group ${editing ? 'bg-white border-2 border-slate-900 text-slate-900' : 'bg-slate-900 text-white hover:bg-black'
            }`}
        >
          <Edit className={`w-6 h-6 mr-3 ${editing ? 'animate-pulse' : 'group-hover:rotate-12'} transition-transform`} />
          {editing ? 'Abort Sync' : 'Recalibrate Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Core Profile */}
        <div className="lg:col-span-8 space-y-12">
          <div className="bg-white rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden group">
            <div className="px-10 py-8 border-b border-gray-50 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Identity Parameters</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Profile Verified</span>
              </div>
            </div>

            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                    <User className="w-3.5 h-3.5 mr-2" /> Authorized Callsign
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg tracking-tight text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-xl tracking-tight text-slate-900">{profile.name}</div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-2" /> Secure Comms Link
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg tracking-tight text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-xl tracking-tight text-slate-900">{profile.phone}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-2" /> Operational Ledger
                  </label>
                  <div className="px-6 py-4 bg-slate-50/50 border border-transparent rounded-2xl font-black text-lg tracking-tight text-slate-400">{profile.email}</div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                    <Droplets className="w-3.5 h-3.5 mr-2" /> Biometric Phenotype
                  </label>
                  {editing ? (
                    <BloodTypeSelector
                      value={formData.bloodGroup}
                      onChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                    />
                  ) : (
                    <div className="flex items-center px-6 py-4 bg-rose-50 border border-rose-100 rounded-2xl font-black text-xl tracking-tighter text-rose-600 shadow-sm">
                      {profile.bloodGroup}
                      <span className="ml-auto px-4 py-1.5 bg-white border border-rose-200 rounded-full text-[9px] uppercase tracking-[0.2em] font-black">
                        {profile.bloodGroup === 'O-' ? 'UNIV DONOR' :
                          profile.bloodGroup === 'AB+' ? 'UNIV RECIPIENT' : 'RECOGNIZED'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-2" /> State
                  </label>
                  <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-xl tracking-tight text-slate-900">
                    {profile.state || 'NOT SET'}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-2" /> District
                  </label>
                  <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-xl tracking-tight text-slate-900">
                    {profile.district || 'NOT SET'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-2" /> Sector Coordinates
                </label>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative group/map">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                      <div className="text-xl font-black text-slate-900 tracking-tighter">
                        {profile.location.lat ?
                          `${profile.location.lat.toFixed(4)}° N, ${profile.location.lng.toFixed(4)}° E` :
                          'OFFLINE'}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Used for nearby mission synchronization</p>
                    </div>
                    {editing && (
                      <button
                        onClick={getLocation}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 shadow-xl active:scale-95 transition-all"
                      >
                        Recalibrate Position
                      </button>
                    )}
                  </div>
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-[0.05] group-hover/map:opacity-[0.1] transition-opacity">
                    <MapPin className="w-24 h-24 text-slate-900" />
                  </div>
                </div>
              </div>

              {editing && (
                <div className="pt-8 border-t border-slate-100">
                  <button
                    onClick={handleUpdate}
                    className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black shadow-[0_20px_40px_rgba(0,0,0,0.1)] active:scale-95 transition-all flex items-center justify-center"
                  >
                    <Zap className="w-6 h-6 mr-3 text-amber-500 fill-amber-500" />
                    Confirm Identity Sync
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Mission Stats */}
        <div className="lg:col-span-4 space-y-12">
          {/* Mission Stats */}
          <div className="bg-gradient-to-br from-slate-900 to-black rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
              <Activity className="w-64 h-64 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-10 tracking-tight uppercase flex items-center relative z-10">
              <Zap className="w-6 h-6 text-rose-500 mr-3" />
              Operational Bio
            </h2>

            <div className="space-y-8 relative z-10">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center group-hover:bg-white/10 transition-colors">
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Deployments</div>
                  <div className="text-3xl font-black tracking-tighter">{profile.totalDonations || 0}</div>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center group-hover:bg-white/10 transition-colors">
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Latest Sync</div>
                  <div className="text-xl font-black tracking-tight uppercase">
                    {profile.lastDonationDate ? new Date(profile.lastDonationDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-indigo-400" />
                </div>
              </div>

              <div className={`p-8 rounded-[2rem] border flex flex-col items-center text-center space-y-4 transition-all ${profile.eligibleToDonate ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
                }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${profile.eligibleToDonate ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-rose-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                  }`}>
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Clearance</div>
                  <div className="text-2xl font-black tracking-tighter uppercase">{profile.eligibleToDonate ? 'OPTIMAL' : 'COOLDOWN'}</div>
                </div>
                {!profile.eligibleToDonate && profile.cooldownRemainingDays && (
                  <div className="px-6 py-2 bg-black/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Re-Enable in {profile.cooldownRemainingDays} Days
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Integrity */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl group/integrity">
            <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tight uppercase">Security Integrity</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Network Approval</span>
                <span className={`px-4 py-1.5 rounded-full ${profile.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {profile.isApproved ? 'SECURED' : 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Access Granted</span>
                <span className="text-slate-900">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="pt-6 border-t border-slate-50">
                <button
                  onClick={() => window.location.href = '/change-password'}
                  className="w-full py-5 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-100 transition-all flex items-center justify-center"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Rotate Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in pointer-events-none">
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in pointer-events-auto">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  modalType === 'success' ? 'bg-emerald-100' :
                  modalType === 'error' ? 'bg-rose-100' :
                  'bg-blue-100'
                }`}>
                  {modalType === 'success' && <CheckCircle className="w-10 h-10 text-emerald-600" />}
                  {modalType === 'error' && <XCircle className="w-10 h-10 text-rose-600" />}
                  {modalType === 'info' && <AlertCircle className="w-10 h-10 text-blue-600" />}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black text-center text-gray-900 mb-3 tracking-tight uppercase">
                {modalTitle}
              </h3>

              {/* Message */}
              <p className="text-center text-gray-600 mb-8 text-sm leading-relaxed">
                {modalMessage}
              </p>

              {/* Button */}
              <button
                onClick={closeModal}
                className={`w-full py-4 rounded-2xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                  modalType === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                  modalType === 'error' ? 'bg-rose-600 hover:bg-rose-700 text-white' :
                  'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DonorProfile