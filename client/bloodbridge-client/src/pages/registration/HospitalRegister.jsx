
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/core'
import { Building2, AlertCircle, ShieldCheck, CheckCircle, MapPin, Loader2, Eye, EyeOff, Upload, X, FileText } from 'lucide-react'
import api from '../../services/api'
import LocationSelector from '../../components/shared/LocationSelector'

const HospitalRegister = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState([])
  const [uploadingDocs, setUploadingDocs] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    hospitalName: '',
    hospitalType: '',
    registrationNumber: '',
    phone: '',
    address: '',
    website: '',
    state: '',
    city: ''
  })
  const [location, setLocation] = useState({ lat: null, lng: null })
  const [locationStatus, setLocationStatus] = useState('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate file types and sizes
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 5 * 1024 * 1024 // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, JPG, and PNG files are allowed')
        return
      }
      if (file.size > maxSize) {
        setError(`${file.name} exceeds 5MB limit`)
        return
      }
    }

    setUploadingDocs(true)
    setError('')
    const formData = new FormData()
    files.forEach(file => {
      formData.append('documents', file)
    })

    try {
      const response = await api.post('/upload/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setUploadedDocuments(prev => [...prev, ...response.data.files])
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload documents')
    } finally {
      setUploadingDocs(false)
    }
  }

  const handleRemoveDocument = async (filename) => {
    try {
      await api.delete(`/upload/documents/${filename}`)
      setUploadedDocuments(prev => prev.filter(doc => doc.filename !== filename))
    } catch (error) {
      setError('Failed to remove document')
    }
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

    if (uploadedDocuments.length === 0) {
      setError('Documents Required: Please upload at least one registration document.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Assuming API endpoint - adjust based on actual backend route
      await api.post('/auth/register', {
        ...formData,
        role: 'hospital',
        location: location,
        state: formData.state,
        city: formData.city,
        // Backend expects hospitalDetails object, mapping flat form data to it
        hospitalDetails: {
          registrationNumber: formData.registrationNumber,
          hospitalType: formData.hospitalType,
          address: formData.address,
          documentUrl: uploadedDocuments.map(doc => doc.url).join(','), // Store multiple URLs as comma-separated
          // Add other fields as needed by schema
        }
      })

      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration Error: Unable to enroll institution.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-2xl border-0 ring-1 ring-slate-900/5 backdrop-blur-sm bg-white/80">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Clinical Node Enrollment</CardTitle>
        <CardDescription className="text-center text-xs">
          Register your medical institution with the National Reserve
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
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Institution Name</label>
            <Input
              name="hospitalName"
              placeholder="St. Mary's General Hospital"
              value={formData.hospitalName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Institution Type</label>
              <select
                name="hospitalType"
                value={formData.hospitalType}
                onChange={handleChange}
                required
                className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-all focus:bg-white"
              >
                <option value="">Select Type</option>
                {['Government', 'Private', 'Semi-Government', 'Military', 'Research'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">License Number</label>
              <Input
                name="registrationNumber"
                placeholder="LIC-2024-XXXX"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Administrator Name</label>
            <Input
              name="name"
              placeholder="Dr. Sarah Connor"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Official Email</label>
              <Input
                type="email"
                name="email"
                placeholder="admin@hospital.org"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Direct Line</label>
              <Input
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Address</label>
            <Input
              name="address"
              placeholder="123 Medical Drive, Street Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
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

          {/* Document Upload */}
          {uploadedDocuments.length === 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                Registration Documents * (License, Certificate, etc.)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  id="documents"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  disabled={uploadingDocs}
                />
                <label
                  htmlFor="documents"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-600">
                    {uploadingDocs ? 'Uploading...' : 'Click to upload documents'}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    PDF, JPG, PNG (Max 5MB each)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Uploaded Documents List */}
          {uploadedDocuments.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                Uploaded Documents ({uploadedDocuments.length})
              </label>
              <div className="space-y-2">
                {uploadedDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700 truncate">{doc.originalName}</span>
                      <span className="text-xs text-slate-500">
                        ({(doc.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(doc.filename)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('documents-add').click()}
                className="w-full mt-2 py-2 px-4 border-2 border-dashed border-indigo-300 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Add More Documents
              </button>
              <input
                type="file"
                id="documents-add"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleDocumentUpload}
                className="hidden"
                disabled={uploadingDocs}
              />
            </div>
          )}

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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-4 h-12 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg"
            isLoading={loading}
          >
            {loading ? 'Verifying Credentials...' : 'Submit for Verification'}
          </Button>
        </form>

      </CardContent>
      <CardFooter className="flex justify-center bg-slate-50/50 border-t border-slate-100 p-6">
        <div className="text-xs text-slate-500 font-medium">
          Already a partner? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Access Command Center</Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default HospitalRegister
