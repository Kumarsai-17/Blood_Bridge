import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { RefreshCw, ChevronLeft, ShieldCheck, ArrowRight } from 'lucide-react'
import api from '../../services/api'

const VerifyOTP = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const [error, setError] = useState('')
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) {
      navigate('/login')
    }
  }, [email, navigate])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')

    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit code')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/auth/verify-email', { email, otp: otpString })
      navigate('/login', { state: { email } })
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (timeLeft > 0) return

    setResendLoading(true)
    setError('')
    try {
      await api.post('/auth/resend-verification', { email })
      setTimeLeft(300)
      setError('New verification code sent!')
    } catch (error) {
      setError('Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Back to Login</span>
        </Link>

        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-xl mb-6">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Verify Email
            </h2>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
              Enter the 6-digit code sent to<br />
              <span className="font-semibold text-gray-900">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 bg-white border border-gray-200 rounded-lg text-center text-2xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 py-2 px-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs font-medium text-gray-600">
                  {timeLeft > 0 ? (
                    <>Code expires in: <span className="font-mono font-semibold text-gray-900">{formatTime(timeLeft)}</span></>
                  ) : (
                    <span className="text-red-600">Code expired</span>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || timeLeft > 0}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:hover:text-gray-600 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend Code'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Wrong email? Change it
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP