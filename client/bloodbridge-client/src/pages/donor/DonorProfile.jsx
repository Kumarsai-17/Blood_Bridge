import { useState, useEffect } from 'react'
import { User, Phone, Mail, MapPin, Droplets, Calendar, Shield, Edit, Activity, CheckCircle, XCircle, AlertCircle, X, Award, Clock, ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import BloodTypeSelector from '../../components/shared/BloodTypeSelector'
import { Card, CardContent } from '../../components/ui/core'
import useAsyncAction from '../../hooks/useAsyncAction'

const DonorProfile = () => {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
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

  // Use async action hook for location updates
  const { execute: executeLocationUpdate, loading: locationLoading } = useAsyncAction(showPopup)

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
      showPopup('error', 'Load Failed', 'Unable to load profile data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const response = await api.put('/donor/profile', formData)
      showPopup('success', 'Profile Updated', 'Your profile has been updated successfully')
      setEditing(false)
      fetchProfile()
      updateUser({ name: formData.name })
    } catch (error) {
      showPopup('error', 'Update Failed', error.response?.data?.message || 'Failed to update profile')
    }
  }

  const getLocation = async () => {
    if (!navigator.geolocation) {
      showPopup('error', 'Location Error', 'Geolocation is not supported by your browser')
      return
    }

    await executeLocationUpdate(
      () => new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData(prev => ({
              ...prev,
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }))
            resolve(position)
          },
          (error) => reject(error)
        )
      }),
      {
        successTitle: 'Location Updated',
        successMessage: 'Your location has been updated successfully',
        errorTitle: 'Location Error',
        errorMessage: 'Unable to get your location. Please try again.'
      }
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
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Mobile Header */}
      <div className="md:hidden space-y-3">
        {/* Back Button - Outside padding */}
        <button
          onClick={() => navigate('/donor/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Title and Edit Button - Match card padding (p-4) */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your information</p>
          </div>
          
          <button
            onClick={() => setEditing(!editing)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 flex-shrink-0 ${
              editing 
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-blue-600 text-white shadow-lg'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">{editing ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-base text-gray-600 mt-1">Manage your personal information and preferences</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            editing 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          <Edit className="w-5 h-5" />
          <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-soft-lg">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Personal Information</h2>

              <div className="space-y-4 sm:space-y-6">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm sm:text-base font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    ) : (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-lg text-sm sm:text-base font-semibold text-gray-900">{profile.name}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm sm:text-base font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    ) : (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-lg text-sm sm:text-base font-semibold text-gray-900">{profile.phone}</div>
                    )}
                  </div>
                </div>

                {/* Email & Blood Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      Email Address
                    </label>
                    <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 rounded-lg text-sm sm:text-base font-medium text-gray-500">{profile.email}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-gray-400" />
                      Blood Group
                    </label>
                    {editing ? (
                      <BloodTypeSelector
                        value={formData.bloodGroup}
                        onChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                      />
                    ) : (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-red-50 border border-red-100 rounded-lg text-sm sm:text-base font-bold text-red-600 flex items-center justify-between">
                        {profile.bloodGroup}
                        <span className="px-2 sm:px-3 py-1 bg-white border border-red-200 rounded-full text-[10px] sm:text-xs font-bold">
                          {profile.bloodGroup === 'O-' ? 'UNIVERSAL' :
                            profile.bloodGroup === 'AB+' ? 'RECIPIENT' : 'DONOR'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* State & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      State
                    </label>
                    <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-lg text-sm sm:text-base font-semibold text-gray-900">
                      {profile.state || 'Not Set'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      District
                    </label>
                    <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-lg text-sm sm:text-base font-semibold text-gray-900">
                      {profile.district || 'Not Set'}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Current Location
                  </label>
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-base sm:text-lg font-bold text-gray-900">
                          {profile.location.lat ?
                            `${profile.location.lat.toFixed(4)}°, ${profile.location.lng.toFixed(4)}°` :
                            'Location not set'}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Used to find nearby blood requests</p>
                      </div>
                      {editing && (
                        <button
                          onClick={getLocation}
                          disabled={locationLoading}
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 shadow-lg transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {locationLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Updating...</span>
                            </>
                          ) : (
                            'Update Location'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {editing && (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleUpdate}
                      className="w-full py-3 sm:py-4 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card - Below Personal Info */}
          <Card className="shadow-soft-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-600" />
                    Security Settings
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">Update your password to keep your account secure</p>
                </div>
                <button
                  onClick={() => window.location.href = '/change-password'}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <Shield className="w-4 h-4" />
                  Change Password
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Status */}
        <div className="space-y-6">
          {/* Donation Stats - Simplified */}
          <Card className="shadow-soft-lg">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                Donation Stats
              </h2>

              <div className="space-y-3">
                {/* Total Donations */}
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-medium">Total Donations</div>
                      <div className="text-2xl font-bold text-gray-900">{profile.totalDonations || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Last Donation */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-medium">Last Donation</div>
                      <div className="text-base font-bold text-gray-900">
                        {profile.lastDonationDate ? new Date(profile.lastDonationDate).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Status */}
          <Card className={`shadow-soft-lg ${profile.eligibleToDonate ? 'bg-gradient-to-br from-green-50 to-white border-green-200' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200'}`}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                profile.eligibleToDonate ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-amber-500 shadow-lg shadow-amber-200'
              }`}>
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Donation Status</h3>
              <p className={`text-xl sm:text-2xl font-bold mb-2 ${profile.eligibleToDonate ? 'text-green-600' : 'text-amber-600'}`}>
                {profile.eligibleToDonate ? 'Eligible' : 'Recovery Period'}
              </p>
              {!profile.eligibleToDonate && profile.cooldownRemainingDays && (
                <p className="text-xs sm:text-sm text-gray-600">
                  Available in {profile.cooldownRemainingDays} days
                </p>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="shadow-soft-lg">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 font-medium">Status</span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                    profile.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {profile.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 font-medium">Member Since</span>
                  <span className="text-gray-900 font-semibold">{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logout Button - Mobile Only */}
          <div className="md:hidden">
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${
                  modalType === 'success' ? 'bg-green-100' :
                  modalType === 'error' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  {modalType === 'success' && <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />}
                  {modalType === 'error' && <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />}
                  {modalType === 'info' && <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />}
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-2 sm:mb-3">
                {modalTitle}
              </h3>

              <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm">
                {modalMessage}
              </p>

              <button
                onClick={closeModal}
                className={`w-full py-3 sm:py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl ${
                  modalType === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  modalType === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
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
