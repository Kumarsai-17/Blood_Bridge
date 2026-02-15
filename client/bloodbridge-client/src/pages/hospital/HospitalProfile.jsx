import { useState, useEffect } from 'react'
import { Building, Mail, Phone, MapPin, FileText, Shield, Edit, Activity, Zap, ShieldCheck, Clock, Award, ChevronRight, Stethoscope, Briefcase } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { PageHeader } from '../../components/shared/DashboardComponents'
import ConfirmModal from '../../components/shared/ConfirmModal'

const HospitalProfile = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(null)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: { lat: null, lng: null },
    hospitalDetails: {
      registrationNumber: '',
      hospitalType: '',
      licenseAuthority: '',
      address: '',
      doctorInCharge: ''
    }
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/profile')
      setProfile(response.data)
      setFormData({
        name: response.data.name,
        phone: response.data.phone,
        location: response.data.location,
        hospitalDetails: response.data.hospitalDetails || {
          registrationNumber: '',
          hospitalType: '',
          licenseAuthority: '',
          address: '',
          doctorInCharge: ''
        }
      })
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Sync Failure: Infrastructure Telemetry Offline' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await api.put('/user/profile', formData)
      setPopup({ show: true, type: 'success', title: 'Success', message: 'Infrastructure parameters updated' })
      setEditing(false)
      fetchProfile()
      updateUser({ name: formData.name })
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Failed', message: error.response?.data?.message || 'Update failure' })
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setPopup({ show: true, type: 'error', title: 'Not Supported', message: 'Tactical Position Protocol Unsupported' })
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
        setPopup({ show: true, type: 'success', title: 'Success', message: 'Coordinates recalibrated' })
      },
      () => setPopup({ show: true, type: 'error', title: 'Failed', message: 'Positioning system failure' })
    )
  }

  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setPopup({ show: true, type: 'error', title: 'File Too Large', message: 'Maximum volume exceeded (5MB)' })
      return
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setPopup({ show: true, type: 'error', title: 'Invalid Format', message: 'Invalid media format' })
      return
    }

    setUploadingDoc(documentType)
    try {
      setPopup({ show: true, type: 'success', title: 'Queued', message: `${documentType} queued for verification. (API Link Coming Soon)` })
      event.target.value = ''
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Failed', message: 'Verification upload failed' })
    } finally {
      setUploadingDoc(null)
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 border-b-4 border-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Command Node configuration...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <PageHeader
          title="Command Node"
          subtitle="Precision configuration of medical infrastructure and operational clearance"
          icon={Building}
          gradient="from-blue-700 via-indigo-800 to-slate-900"
          className="mb-0 flex-1"
        />
        <button
          onClick={() => setEditing(!editing)}
          className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition shadow-2xl active:scale-95 flex items-center group ${editing ? 'bg-white border-2 border-indigo-900 text-indigo-900' : 'bg-indigo-900 text-white hover:bg-black'
            }`}
        >
          <Edit className={`w-6 h-6 mr-3 ${editing ? 'animate-pulse' : 'group-hover:rotate-12'} transition-transform`} />
          {editing ? 'Abort Sync' : 'Edit Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Hospital Information */}
          <div className="bg-white rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Node Specifications</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${profile.isApproved ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: {profile.isApproved ? 'Operational' : 'Pending Authorization'}</span>
              </div>
            </div>

            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facility Callsign</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg tracking-tight text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-xl tracking-tight text-slate-900 uppercase truncate">{profile.name}</div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Comms</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg tracking-tight text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-xl tracking-tight text-slate-900">{profile.phone || 'DATA LINK ABSENT'}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration Identifier</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.hospitalDetails.registrationNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        hospitalDetails: { ...prev.hospitalDetails, registrationNumber: e.target.value }
                      }))}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg tracking-tight text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    />
                  ) : (
                    <div className={`px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight ${profile.hospitalDetails?.registrationNumber ? 'text-slate-900' : 'text-rose-600'}`}>
                      {profile.hospitalDetails?.registrationNumber || 'REQUISITION REQUIRED'}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Infrastructure Category</label>
                  {editing ? (
                    <select
                      value={formData.hospitalDetails.hospitalType}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        hospitalDetails: { ...prev.hospitalDetails, hospitalType: e.target.value }
                      }))}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg tracking-tight text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    >
                      <option value="">Matrix Category</option>
                      <option value="Government">Government Node</option>
                      <option value="Private">Private Node</option>
                      <option value="Charity">Charity Node</option>
                      <option value="Teaching">Teaching Core</option>
                    </select>
                  ) : (
                    <div className={`px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight uppercase ${profile.hospitalDetails?.hospitalType ? 'text-slate-900' : 'text-rose-600'}`}>
                      {profile.hospitalDetails?.hospitalType || 'TYPE UNDEFINED'}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geospatial Sector Address</label>
                {editing ? (
                  <textarea
                    value={formData.hospitalDetails.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      hospitalDetails: { ...prev.hospitalDetails, address: e.target.value }
                    }))}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg tracking-tight text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    rows="3"
                    placeholder="Complete physical coordinates"
                  />
                ) : (
                  <div className={`px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight ${profile.hospitalDetails?.address ? 'text-slate-900' : 'text-rose-600'}`}>
                    {profile.hospitalDetails?.address || 'COORDINATES UNKNOWN'}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                  <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight text-slate-900 uppercase">
                    {profile.state || 'NOT SET'}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                  <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight text-slate-900 uppercase">
                    {profile.district || 'NOT SET'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commanding Surgeon</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.hospitalDetails.doctorInCharge}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        hospitalDetails: { ...prev.hospitalDetails, doctorInCharge: e.target.value }
                      }))}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg tracking-tight text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    />
                  ) : (
                    <div className={`px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight ${profile.hospitalDetails?.doctorInCharge ? 'text-slate-900' : 'text-rose-600'}`}>
                      {profile.hospitalDetails?.doctorInCharge || 'LEADERSHIP VOID'}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tactical Position</label>
                  {editing ? (
                    <div className="space-y-2">
                      <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900 shadow-inner">
                        {formData.location?.lat ?
                          `${formData.location.lat.toFixed(4)}° N, ${formData.location.lng.toFixed(4)}° E` :
                          'GPS OFFLINE'}
                      </div>
                      <button
                        type="button"
                        onClick={getLocation}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-blue-700 shadow-lg active:scale-95"
                      >
                        Recalibrate Sensors
                      </button>
                    </div>
                  ) : (
                    <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight text-slate-900">
                      {profile.location?.lat ?
                        `${profile.location.lat.toFixed(4)}° N, ${profile.location.lng.toFixed(4)}° E` :
                        'NODE UNTRACKED'}
                    </div>
                  )}
                </div>
              </div>

              {!editing && (!profile.hospitalDetails?.registrationNumber || !profile.hospitalDetails?.hospitalType || !profile.hospitalDetails?.address || !profile.hospitalDetails?.doctorInCharge) && (
                <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-8 mt-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-[0.05] group-hover:rotate-12 transition-transform">
                    <ShieldCheck className="w-32 h-32 text-rose-600" />
                  </div>
                  <div className="flex items-start">
                    <Activity className="w-8 h-8 text-rose-600 mr-5 mt-1 animate-pulse" />
                    <div>
                      <h4 className="text-xl font-black text-rose-900 uppercase tracking-tighter">Incomplete Matrix Profile</h4>
                      <p className="text-xs font-medium text-rose-700 mt-2 leading-relaxed">
                        Operational status restricted. Requisitioning critical node data: Registration, Facility Type, Geospatial Coordinates, and Leadership verification.
                      </p>
                      <button
                        onClick={() => setEditing(true)}
                        className="mt-6 px-10 py-4 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 shadow-2xl active:scale-95 transition-all"
                      >
                        Sync Parameters Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {editing && (
                <div className="pt-10 border-t border-slate-100">
                  <button
                    onClick={handleUpdate}
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-black shadow-[0_20px_50px_rgba(0,0,0,0.1)] active:scale-95 transition-all flex items-center justify-center"
                  >
                    <Zap className="w-6 h-6 mr-3 text-amber-500 fill-amber-500" />
                    Finalize Parameter Sync
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Verification Assets */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center">
                <FileText className="w-6 h-6 text-indigo-600 mr-3" />
                Verification Assets
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1 */}
              <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 opacity-[0.02] group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-48 h-48 text-slate-900" />
                </div>
                <div className="flex items-start mb-8 relative z-10">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mr-5 shadow-inner border border-blue-100 group-hover:rotate-6 transition-transform">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Reg Certificate</h4>
                      <span className="text-[9px] font-black px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg uppercase tracking-widest">
                        PENDING
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility authority license</p>
                  </div>
                </div>
                <label className="block relative z-10">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'Registration Certificate')}
                    disabled={uploadingDoc === 'Registration Certificate'}
                  />
                  <span className={`flex items-center justify-center py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer shadow-sm ${uploadingDoc === 'Registration Certificate'
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-slate-900 text-white hover:bg-black shadow-xl active:scale-95'
                    }`}>
                    {uploadingDoc === 'Registration Certificate' ? 'UPLOADING...' : 'PROVISION ASSET'}
                  </span>
                </label>
              </div>

              {/* Card 2 */}
              <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 opacity-[0.02] group-hover:scale-110 transition-transform">
                  <Briefcase className="w-48 h-48 text-slate-900" />
                </div>
                <div className="flex items-start mb-8 relative z-10">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mr-5 shadow-inner border border-blue-100 group-hover:rotate-6 transition-transform">
                    <Stethoscope className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Clinical License</h4>
                      <span className="text-[9px] font-black px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg uppercase tracking-widest">
                        PENDING
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Med-Practitioner clearance</p>
                  </div>
                </div>
                <label className="block relative z-10">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'Medical License')}
                    disabled={uploadingDoc === 'Medical License'}
                  />
                  <span className={`flex items-center justify-center py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer shadow-sm ${uploadingDoc === 'Medical License'
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-slate-900 text-white hover:bg-black shadow-xl active:scale-95'
                    }`}>
                    {uploadingDoc === 'Medical License' ? 'UPLOADING...' : 'PROVISION ASSET'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-12">
          {/* Integrity Status */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
              <ShieldCheck className="w-64 h-64 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-10 tracking-tight uppercase flex items-center relative z-10">
              <Zap className="w-6 h-6 text-blue-400 mr-3" />
              Node Integrity
            </h3>
            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorization</span>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${profile.isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  {profile.isApproved ? 'SECURED' : 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrix Link Since</span>
                <span className="text-[11px] font-black uppercase tracking-widest text-white">{new Date(profile.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl group">
            <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tighter uppercase flex items-center">
              <Activity className="w-6 h-6 text-indigo-600 mr-3" />
              Operational History
            </h3>
            <div className="space-y-6">
              {[
                { label: "Mission Volume", value: profile.totalRequests || '0', icon: <FileText className="w-4 h-4" /> },
                { label: "Active Deployments", value: profile.activeRequests || '0', icon: <Zap className="w-4 h-4" /> },
                { label: "Mission Completion", value: profile.fulfilledRequests || '0', icon: <ShieldCheck className="w-4 h-4" /> }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group-hover:bg-white transition-colors">
                  <div className="flex items-center">
                    <div className="text-indigo-600 mr-3 opacity-40">{stat.icon}</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Protocols */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tighter uppercase flex items-center">
              <Shield className="w-6 h-6 text-rose-600 mr-3" />
              Security Protocol
            </h3>
            <button
              onClick={() => window.location.href = '/change-password'}
              className="w-full py-5 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-100 transition-all flex items-center justify-center active:scale-95 shadow-sm"
            >
              <Shield className="w-4 h-4 mr-3" />
              Rotate Credentials
            </button>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      <ConfirmModal
        isOpen={popup.show}
        onClose={() => setPopup({ ...popup, show: false })}
        onConfirm={() => setPopup({ ...popup, show: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        confirmText="OK"
        showCancel={false}
      />
    </div>
  )
}

export default HospitalProfile