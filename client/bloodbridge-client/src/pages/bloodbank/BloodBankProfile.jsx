
import { useState, useEffect } from 'react'
import { Building2, Mail, Phone, MapPin, FileText, Shield, Edit, Activity, Zap, ShieldCheck, Clock, Award, Droplet } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Button, Card, CardContent, Input, Badge } from '../../components/ui/core'

const BloodBankProfile = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: { lat: null, lng: null },
    bloodBankDetails: {
      registrationId: '',
      licenseAuthority: '',
      address: ''
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
        bloodBankDetails: response.data.bloodBankDetails || {
          registrationId: '',
          licenseAuthority: '',
          address: ''
        }
      })
    } catch (error) {
      toast.error('Sync Failure: Hub Telemetry Offline')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await api.put('/user/profile', formData)
      toast.success('Hub parameters updated successfully')
      setEditing(false)
      fetchProfile()
      updateUser({ name: formData.name })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failure')
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tactical Position Protocol Unsupported')
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
        toast.success('Coordinates recalibrated')
      },
      () => toast.error('Positioning system failure')
    )
  }

  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Maximum volume exceeded (5MB)')
      return
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid media format')
      return
    }

    setUploadingDoc(documentType)
    try {
      toast.success(`${documentType} queued for verification. (API Link Coming Soon)`)
      event.target.value = ''
    } catch (error) {
      toast.error('Verification upload failed')
    } finally {
      setUploadingDoc(null)
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 border-b-4 border-rose-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Hub configuration...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Archive Hub</h1>
          <p className="text-rose-900 text-lg font-medium italic">Precision configuration of life-reserve infrastructure and operational clearance</p>
        </div>
        <Button
          onClick={() => setEditing(!editing)}
          variant={editing ? 'secondary' : 'royal'}
          className="shadow-2xl flex items-center gap-3"
        >
          <Edit className={`w-5 h-5 ${editing ? 'animate-pulse' : 'group-hover:rotate-12'} transition-transform`} />
          {editing ? 'Abort Sync' : 'Edit Hub Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Blood Bank Information */}
          <Card className="rounded-[3.5rem] shadow-xl border-slate-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Hub Specifications</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${profile.isApproved ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none italic">Status: {profile.isApproved ? 'Operational' : 'Authorization Pending'}</span>
              </div>
            </div>

            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Facility Callsign</label>
                  {editing ? (
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-lg font-black tracking-tight"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-xl tracking-tight text-slate-900 uppercase truncate italic">{profile.name}</div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Secure Comms</label>
                  {editing ? (
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="text-lg font-black tracking-tight"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-xl tracking-tight text-slate-900 italic">{profile.phone || 'DATA LINK ABSENT'}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Registration ID</label>
                  {editing ? (
                    <Input
                      type="text"
                      value={formData.bloodBankDetails.registrationId}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bloodBankDetails: { ...prev.bloodBankDetails, registrationId: e.target.value }
                      }))}
                      className="text-lg font-black tracking-tight"
                    />
                  ) : (
                    <div className={`px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight italic ${profile.bloodBankDetails?.registrationId ? 'text-slate-900' : 'text-rose-600'}`}>
                      {profile.bloodBankDetails?.registrationId || 'REQUISITION REQUIRED'}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">License Authority</label>
                  {editing ? (
                    <Input
                      type="text"
                      value={formData.bloodBankDetails.licenseAuthority}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bloodBankDetails: { ...prev.bloodBankDetails, licenseAuthority: e.target.value }
                      }))}
                      className="text-lg font-black tracking-tight"
                    />
                  ) : (
                    <div className={`px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight uppercase italic ${profile.bloodBankDetails?.licenseAuthority ? 'text-slate-900' : 'text-rose-600'}`}>
                      {profile.bloodBankDetails?.licenseAuthority || 'AUTHORITY UNKNOWN'}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Geospatial Sector Address</label>
                {editing ? (
                  <textarea
                    value={formData.bloodBankDetails.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bloodBankDetails: { ...prev.bloodBankDetails, address: e.target.value }
                    }))}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg tracking-tight text-slate-900 focus:bg-white focus:border-rose-500 transition-all outline-none resize-none"
                    rows="3"
                    placeholder="Complete clinical address"
                  />
                ) : (
                  <div className={`px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight italic ${profile.bloodBankDetails?.address ? 'text-slate-900' : 'text-rose-600'}`}>
                    {profile.bloodBankDetails?.address || 'COORDINATES UNKNOWN'}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">State</label>
                  <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight text-slate-900 uppercase italic">
                    {profile.state || 'NOT SET'}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">District</label>
                  <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight text-slate-900 uppercase italic">
                    {profile.district || 'NOT SET'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Email Ledger</label>
                  <div className="px-6 py-4 bg-slate-50/50 border border-transparent rounded-2xl font-black text-lg tracking-tight text-slate-400 truncate italic">{profile.email}</div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Tactical Position</label>
                  {editing ? (
                    <div className="space-y-2">
                      <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900 shadow-inner italic">
                        {formData.location?.lat ?
                          `${formData.location.lat.toFixed(4)}° N, ${formData.location.lng.toFixed(4)}° E` :
                          'GPS OFFLINE'}
                      </div>
                      <Button
                        type="button"
                        variant="accent"
                        onClick={getLocation}
                        className="w-full h-10 text-[9px]"
                      >
                        Recalibrate Sensors
                      </Button>
                    </div>
                  ) : (
                    <div className="px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-lg tracking-tight text-slate-900 italic">
                      {profile.location?.lat ?
                        `${profile.location.lat.toFixed(4)}° N, ${profile.location.lng.toFixed(4)}° E` :
                        'NODE UNTRACKED'}
                    </div>
                  )}
                </div>
              </div>

              {!editing && (!profile.bloodBankDetails?.registrationId || !profile.bloodBankDetails?.licenseAuthority || !profile.bloodBankDetails?.address) && (
                <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-8 mt-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-[0.05] group-hover:rotate-12 transition-transform">
                    <ShieldCheck className="w-32 h-32 text-rose-600" />
                  </div>
                  <div className="flex items-start">
                    <Activity className="w-8 h-8 text-rose-600 mr-5 mt-1 animate-pulse" />
                    <div>
                      <h4 className="text-xl font-black text-rose-900 uppercase tracking-tighter italic">Incomplete Hub Profile</h4>
                      <p className="text-xs font-medium text-rose-700 mt-2 leading-relaxed">
                        Hub operational status restricted. Requisitioning critical node data: Registration, Authority License, and Geospatial Coordinates.
                      </p>
                      <Button
                        onClick={() => setEditing(true)}
                        variant="accent"
                        className="mt-6 shadow-xl"
                      >
                        Update Hub Data
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {editing && (
                <div className="pt-10 border-t border-slate-100">
                  <Button
                    onClick={handleUpdate}
                    variant="royal"
                    className="w-full h-16 text-lg shadow-2xl"
                  >
                    <Zap className="w-5 h-5 mr-3 text-amber-500 fill-amber-500" />
                    Finalize Hub Sync
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Assets */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase px-2 flex items-center italic">
              <FileText className="w-6 h-6 text-rose-600 mr-3" />
              Hub Verification Assets
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Asset 1 */}
              <Card className="hover:shadow-2xl transition-all group relative overflow-hidden border-slate-100 rounded-[2.5rem]">
                <CardContent className="p-10">
                  <div className="absolute top-0 right-0 -mr-12 -mt-12 opacity-[0.02] group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-48 h-48 text-slate-900" />
                  </div>
                  <div className="flex items-start mb-8 relative z-10">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mr-5 shadow-inner border border-rose-100 group-hover:rotate-6 transition-transform">
                      <FileText className="w-8 h-8 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">Hub License</h4>
                        <Badge variant="warning" className="text-[9px]">PENDING</Badge>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Official authority license</p>
                    </div>
                  </div>
                  <label className="block relative z-10 w-full">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'Blood Bank License')}
                      disabled={uploadingDoc === 'Blood Bank License'}
                    />
                    <Button
                      as="span"
                      variant={uploadingDoc === 'Blood Bank License' ? 'secondary' : 'royal'}
                      className={`w-full cursor-pointer h-14 text-[10px] ${uploadingDoc === 'Blood Bank License' && 'opacity-70'}`}
                    >
                      {uploadingDoc === 'Blood Bank License' ? 'UPLOADING...' : 'PROVISION ASSET'}
                    </Button>
                  </label>
                </CardContent>
              </Card>

              {/* Asset 2 */}
              <Card className="hover:shadow-2xl transition-all group relative overflow-hidden border-slate-100 rounded-[2.5rem]">
                <CardContent className="p-10">
                  <div className="absolute top-0 right-0 -mr-12 -mt-12 opacity-[0.02] group-hover:scale-110 transition-transform">
                    <Building2 className="w-48 h-48 text-slate-900" />
                  </div>
                  <div className="flex items-start mb-8 relative z-10">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mr-5 shadow-inner border border-rose-100 group-hover:rotate-6 transition-transform">
                      <ShieldCheck className="w-8 h-8 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">Storage Cert</h4>
                        <Badge variant="warning" className="text-[9px]">PENDING</Badge>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Bio-hazard compliance cert</p>
                    </div>
                  </div>
                  <label className="block relative z-10 w-full">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'Storage Certificate')}
                      disabled={uploadingDoc === 'Storage Certificate'}
                    />
                    <Button
                      as="span"
                      variant={uploadingDoc === 'Storage Certificate' ? 'secondary' : 'royal'}
                      className={`w-full cursor-pointer h-14 text-[10px] ${uploadingDoc === 'Storage Certificate' && 'opacity-70'}`}
                    >
                      {uploadingDoc === 'Storage Certificate' ? 'UPLOADING...' : 'PROVISION ASSET'}
                    </Button>
                  </label>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-12">
          {/* Integrity Status */}
          <Card className="bg-slate-900 text-white shadow-2xl relative overflow-hidden group border-slate-800 rounded-[3rem]">
            <CardContent className="p-10">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-[0.1] group-hover:scale-110 transition-transform duration-1000">
                <ShieldCheck className="w-64 h-64 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-10 tracking-tight uppercase flex items-center relative z-10 italic">
                <Zap className="w-6 h-6 text-amber-500 mr-3 animate-pulse" />
                Hub Integrity
              </h3>
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Authorization</span>
                  <Badge variant={profile.isApproved ? 'success' : 'warning'} className="text-[9px]">
                    {profile.isApproved ? 'SECURED' : 'PENDING'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Hub Activated</span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-white italic">{new Date(profile.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reserve Analytics */}
          <Card className="rounded-[2.5rem] border-slate-100 shadow-xl group">
            <CardContent className="p-10">
              <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tighter uppercase flex items-center italic">
                <Activity className="w-6 h-6 text-rose-600 mr-3" />
                Reserve Metrics
              </h3>
              <div className="space-y-6">
                {[
                  { label: "Total Volume", value: profile.totalUnits || '0', icon: <Droplet className="w-4 h-4" /> },
                  { label: "Matrix Density", value: profile.bloodTypes || '8', icon: <Activity className="w-4 h-4" /> },
                  { label: "Distribution Count", value: profile.requestsFulfilled || '0', icon: <Zap className="w-4 h-4" /> }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group-hover:bg-white transition-colors">
                    <div className="flex items-center">
                      <div className="text-rose-600 mr-3 opacity-40">{stat.icon}</div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{stat.label}</span>
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter italic">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Protocol Security */}
          <Card className="rounded-[2.5rem] border-slate-100 shadow-xl">
            <CardContent className="p-10">
              <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tighter uppercase flex items-center italic">
                <Shield className="w-6 h-6 text-slate-900 mr-3" />
                Access Protocol
              </h3>
              <Button
                onClick={() => window.location.href = '/change-password'}
                variant="royal"
                className="w-full h-14 text-[9px] shadow-xl"
              >
                <Shield className="w-4 h-4 mr-3" />
                Rotate Credentials
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BloodBankProfile
