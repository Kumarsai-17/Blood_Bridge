import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import ConfirmModal from '../../components/shared/ConfirmModal'

const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [samePasswordError, setSamePasswordError] = useState(false)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      setPopup({ show: true, type: 'error', title: 'Validation Error', message: 'Passwords do not match' })
      return
    }

    if (formData.newPassword.length < 6) {
      setPopup({ show: true, type: 'error', title: 'Validation Error', message: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)
    setSamePasswordError(false)
    try {
      await api.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      })
      setPopup({ 
        show: true, 
        type: 'success', 
        title: 'Success', 
        message: 'Password reset successful!',
        onClose: () => navigate('/login', { state: { email: formData.email } })
      })
    } catch (error) {
      const errorCode = error.response?.data?.code
      const errorMessage = error.response?.data?.message || 'Failed to reset password'
      
      if (errorCode === 'SAME_PASSWORD') {
        setSamePasswordError(true)
      } else {
        setPopup({ show: true, type: 'error', title: 'Failed', message: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Link to="/forgot-password" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-xl mb-6">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the code from your email and create a new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={formData.otp}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2.5 pr-10 bg-white border text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden ${
                    samePasswordError 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-red-500'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-0 right-0 h-full pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {samePasswordError && (
                <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>New password must be different from your current password</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 pr-10 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-0 right-0 h-full pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
            Remember your password? Sign in
          </Link>
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
    </div>
  )
}

export default ResetPassword