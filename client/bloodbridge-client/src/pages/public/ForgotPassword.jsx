import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import api from '../../services/api'
import ConfirmModal from '../../components/shared/ConfirmModal'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/auth/forgot-password', { email })
      setEmailSent(true)
      setPopup({ show: true, type: 'success', title: 'Success', message: 'Password reset email sent!' })
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Failed', message: error.response?.data?.message || 'Failed to send reset email' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Back to Login</span>
        </Link>

        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-xl bg-red-50 mb-6">
              <Mail className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Forgot Password?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              No worries, we'll send you reset instructions
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-6">
              <div className="p-6 bg-green-50 border border-green-100 rounded-lg text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Check your email</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/reset-password', { state: { email } })}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Enter Reset Code
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEmailSent(false)}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Try another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
                  Remember your password? Sign in
                </Link>
              </div>
            </form>
          )}
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
    </div>
  )
}

export default ForgotPassword