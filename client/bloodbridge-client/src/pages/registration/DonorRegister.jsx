
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/core'
import { UserPlus, AlertCircle, Heart, CheckCircle, MapPin, Loader2, Eye, EyeOff } from 'lucide-react'
import api from '../../services/api'
import ConfirmModal from '../../components/shared/ConfirmModal'
import LocationSelector from '../../components/shared/LocationSelector'

const DonorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    phone: '',
    address: '',
    state: '',
    city: ''
  })
  const [location, setLocation] = useState({ lat: null, lng: null })
  const [locationStatus, setLocationStatus] = useState('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleGetLocation = () => {
    setLocationStatus('loading')
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLocationStatus('error')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocationStatus('success')
      },
      (err) => {
        console.error(err)
        setError("Unable to retrieve location. Please allow access.")
        setLocationStatus('error')
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Credentials Mismatch: Passwords do not match.')
      return
    }

    if (!location.lat || !location.lng) {
      setError('Location Required: Please click "Get Current Location" to register.')
      return
    }

    if (!formData.state || !formData.city) {
      setError('Location Required: Please select your state and city.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Register the donor
      const response = await api.post('/auth/register', {
        ...formData,
        role: 'donor',
        location: location,
        state: formData.state,
        city: formData.city
      })

      if (response.data.success && response.data.requiresVerification) {
        setPopup({ 
          show: true, 
          type: 'success', 
          title: 'Success', 
          message: response.data.message || 'Registration successful! Please verify your email.',
          onClose: () => {
            navigate('/verify-email', { 
              state: { 
                email: formData.email,
                password: formData.password
              },
              replace: true
            })
          }
        })
      } else {
        navigate('/login')
      }
    } catch (err) {
      console.error('Registration error:', err)
      console.error('Error response:', err.response?.data)
      
      const errorMessage = err.response?.data?.message || 'Registration Error: Unable to enroll in registry.'
      
      if (err.response?.status === 200 && err.response?.data?.requiresVerification) {
        setPopup({ 
          show: true, 
          type: 'success', 
          title: 'Success', 
          message: err.response.data.message,
          onClose: () => {
            navigate('/verify-email', { 
              state: { 
                email: formData.email,
                password: formData.password
              },
              replace: true
            })
          }
        })
      } else {
        setError(errorMessage)
        setPopup({ show: true, type: 'error', title: 'Registration Failed', message: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-2xl border-0 ring-1 ring-slate-900/5 backdrop-blur-sm bg-white/80">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-rose-50 rounded-2xl">
            <UserPlus className="w-8 h-8 text-rose-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Guardian Enrollment</CardTitle>
        <CardDescription className="text-center text-xs">
          Join the National Biological Reserve as a Donor
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
              <Input
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Blood Phenotype</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-all focus:bg-white"
              >
                <option value="">Select Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Secure Identity (Email)</label>
            <Input
              type="email"
              name="email"
              placeholder="guardian@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Mobile Contact</label>
              <Input
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Address</label>
              <Input
                name="address"
                placeholder="Street Address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Location Selector */}
          <div className="space-y-2">
            <LocationSelector
              selectedState={formData.state}
              selectedCity={formData.city}
              onStateChange={(state) => setFormData(prev => ({ ...prev, state, city: '' }))}
              onCityChange={(city) => setFormData(prev => ({ ...prev, city }))}
              onLocationChange={setLocation}
              showGPS={true}
              required={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-0 h-full flex items-center text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-0 h-full flex items-center text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="accent"
            className="w-full mt-4 h-12 text-sm shadow-rose-500/20"
            isLoading={loading}
          >
            {loading ? 'Processing Enrollment...' : 'Confirm Enrollment'}
          </Button>
        </form>

      </CardContent>
      <CardFooter className="flex justify-center bg-slate-50/50 border-t border-slate-100 p-6">
        <div className="text-xs text-slate-500 font-medium">
          Already a guardian? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login</Link>
        </div>
      </CardFooter>

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
    </Card>
  )
}

export default DonorRegister
