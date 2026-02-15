import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Phone, Shield, Eye, EyeOff, UserCheck, ShieldCheck, Key, Lock, CheckCircle, XCircle } from 'lucide-react'
import api from '../../services/api'
import { Button, Card, CardContent, Input } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'
import LocationSelector from '../../components/shared/LocationSelector'

const CreateAdmin = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    region: '',
    state: '',
    city: ''
  })

  // Debug logging
  console.log('Current formData:', formData)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.region || !formData.state || !formData.city) {
      setErrorMessage('Please fill in all required fields including state and city')
      setShowErrorModal(true)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match')
      setShowErrorModal(true)
      return
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters')
      setShowErrorModal(true)
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/admin/create-admin', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        region: formData.region,
        state: formData.state,
        city: formData.city
      })

      if (response.data.credentials) {
        const credentials = `Email: ${response.data.credentials.email}\nPassword: ${response.data.credentials.password}`
        navigator.clipboard.writeText(credentials)
        setSuccessMessage('Admin created successfully!\n\nCredentials copied to clipboard (email failed)')
      } else {
        setSuccessMessage('Admin created successfully!\n\nCredentials sent via email.')
      }
      
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Failed to create admin:', error)
      const message = error.response?.data?.message || 'Failed to create admin. Please try again.'
      setErrorMessage(message)
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    navigate('/admin/users')
  }

  const handleErrorClose = () => {
    setShowErrorModal(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Admin</h1>
        </div>
        <p className="text-gray-600 max-w-2xl">
          Create a new administrator account with system management permissions.
        </p>
      </div>

      <Card className="shadow-soft-lg">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Admin Information */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Admin Information</h3>
                  <p className="text-sm text-gray-500">Basic details for the new admin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter admin's full name"
                    className="h-12"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-11 h-12"
                      placeholder="admin@bloodbridge.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-11 h-12"
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Region *</label>
                  <Input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g., North, South, East, West, Delhi, Mumbai"
                    className="h-12"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Admin will only have access to data from this region</p>
                </div>

                <div className="md:col-span-2">
                  <LocationSelector
                    selectedState={formData.state}
                    selectedCity={formData.city}
                    onStateChange={(state) => {
                      console.log('onStateChange called with:', state)
                      setFormData(prev => {
                        console.log('Previous formData:', prev)
                        const updated = { ...prev, state, city: '' }
                        console.log('Updated formData:', updated)
                        return updated
                      })
                    }}
                    onCityChange={(city) => {
                      console.log('onCityChange called with:', city)
                      setFormData(prev => ({ ...prev, city }))
                    }}
                    onLocationChange={() => {}}
                    showGPS={false}
                    required={true}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-11 pr-11 h-12"
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-11 pr-11 h-12"
                      placeholder="Re-enter password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Permissions */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Permissions</h3>
                  <p className="text-sm text-gray-500">Default admin access levels</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  New admins will have the following permissions:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { text: "Approve/reject registrations in assigned region", allowed: true },
                    { text: "View and manage users in assigned region only", allowed: true },
                    { text: "Access dashboard and reports for assigned region", allowed: true },
                    { text: "Cannot create other admins (super admin only)", allowed: false },
                    { text: "Cannot access data from other regions", allowed: false }
                  ].map((perm, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${perm.allowed ? 'bg-white border border-gray-200' : 'bg-gray-100 opacity-70'}`}>
                      {perm.allowed ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${perm.allowed ? 'text-gray-700' : 'text-gray-500'}`}>{perm.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Security Notice</p>
                <p className="text-sm text-blue-700">
                  You are setting the password for this admin account. Make sure to securely share these credentials with the new admin.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-100">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Admin...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Create Admin Account</span>
                  </div>
                )}
              </Button>

              <p className="text-center mt-4 text-sm text-gray-500">
                Admins can be managed from the User Management page
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        onConfirm={handleSuccessClose}
        title="Admin Created Successfully"
        message={successMessage}
        confirmText="OK"
        cancelText=""
        type="success"
      />

      <ConfirmModal
        isOpen={showErrorModal}
        onClose={handleErrorClose}
        onConfirm={handleErrorClose}
        title="Error Creating Admin"
        message={errorMessage}
        confirmText="OK"
        cancelText=""
        type="error"
      />
    </div>
  )
}

export default CreateAdmin
