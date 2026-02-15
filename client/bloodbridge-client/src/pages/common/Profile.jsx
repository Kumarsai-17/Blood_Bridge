import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Building, Building2, Shield, Edit, Lock, Award, CheckCircle, ArrowRight, XCircle, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { PageHeader } from '../../components/shared/DashboardComponents'
import LocationSelector from '../../components/shared/LocationSelector'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: { lat: null, lng: null },
    state: '',
    city: ''
  })

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
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
      const response = await api.get('/user/profile')
      setProfile(response.data)
      setFormData({
        name: response.data.name,
        phone: response.data.phone,
        location: response.data.location,
        state: response.data.state || '',
        city: response.data.city || response.data.district || ''
      })
    } catch (error) {
      showPopup('error', 'Load Failed', 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await api.put('/user/profile', formData)
      showPopup('success', 'Profile Updated', 'Your profile has been updated successfully')
      setEditing(false)
      fetchProfile()
      updateUser({ name: formData.name })
    } catch (error) {
      showPopup('error', 'Update Failed', error.response?.data?.message || 'Failed to update profile')
    }
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
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-lg border border-blue-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-600 rounded-lg shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <p className="text-sm text-gray-600">Manage your account information</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${editing
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            <Edit className="w-4 h-4" />
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${profile.isApproved ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            <span className="text-sm font-semibold text-gray-600">
              {profile.isApproved ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              ) : (
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-gray-900">{profile.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phone Number</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              ) : (
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-gray-900">{profile.phone || 'Not provided'}</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-gray-600">{profile.email}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Account Status</label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-gray-900">
                {profile.isApproved ? 'Verified' : 'Pending Approval'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Member Since</label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">State</label>
              {editing && (user?.role === 'admin' || user?.role === 'super_admin') ? (
                <LocationSelector
                  selectedState={formData.state}
                  selectedCity={formData.city}
                  onStateChange={(state) => setFormData(prev => ({ ...prev, state, city: '' }))}
                  onCityChange={(city) => setFormData(prev => ({ ...prev, city }))}
                  onLocationChange={(location) => setFormData(prev => ({ ...prev, location }))}
                  showGPS={false}
                  required={false}
                />
              ) : (
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-gray-900">
                  {profile.state || 'Not provided'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">City/District</label>
              {editing && (user?.role === 'admin' || user?.role === 'super_admin') ? (
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-gray-600 text-sm">
                  Select state first to choose city
                </div>
              ) : (
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-gray-900">
                  {profile.district || profile.city || 'Not provided'}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Location</label>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-gray-900">
                    {profile.location?.lat
                      ? `${profile.location.lat.toFixed(4)}°, ${profile.location.lng.toFixed(4)}°`
                      : 'Location not set'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">GPS coordinates</p>
                </div>
                {editing && (
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        setLocationLoading(true)
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setFormData(prev => ({
                              ...prev,
                              location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
                            }))
                            setLocationLoading(false)
                            showPopup('success', 'Location Updated', 'Your location has been updated successfully')
                          },
                          () => {
                            setLocationLoading(false)
                            showPopup('error', 'Location Error', 'Failed to get your location. Please try again.')
                          }
                        )
                      } else {
                        showPopup('error', 'Not Supported', 'Geolocation is not supported by your browser')
                      }
                    }}
                    disabled={locationLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {locationLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        Update Location
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {(profile.role === 'hospital' || profile.role === 'bloodbank') && (
            <div className="pt-5 border-t border-gray-100">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Organization Details</label>
              <Link
                to={profile.role === 'hospital' ? '/hospital/profile' : '/bloodbank/profile'}
                className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between group hover:bg-blue-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    {profile.role === 'hospital' ? <Building className="w-5 h-5 text-white" /> : <Building2 className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {profile.role === 'hospital' ? (profile.hospitalDetails?.hospitalType || 'Hospital') : 'Blood Bank'}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Registration: <span className="font-semibold text-blue-600">{profile.role === 'hospital' ? (profile.hospitalDetails?.registrationNumber || 'Pending') : (profile.bloodBankDetails?.registrationId || 'Pending')}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            </div>
          )}

          {editing && (
            <div className="pt-5 border-t border-gray-100">
              <button
                onClick={handleUpdate}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in pointer-events-none">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in pointer-events-auto">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
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

              <h3 className="text-2xl font-bold text-center text-gray-900 mb-3">
                {modalTitle}
              </h3>

              <p className="text-center text-gray-600 mb-8 text-sm leading-relaxed">
                {modalMessage}
              </p>

              <button
                onClick={closeModal}
                className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 ${
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

export default Profile