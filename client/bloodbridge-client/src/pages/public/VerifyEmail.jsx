import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/core'
import { Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const VerifyEmail = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  useEffect(() => {
    // Get email from location state
    const emailFromState = location.state?.email
    if (emailFromState) {
      setEmail(emailFromState)
    } else {
      // If no email in state, redirect to login
      navigate('/register/donor')
    }
  }, [location, navigate])

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async (e) => {
    e.preventDefault()
    
    const trimmedOtp = otp.trim()
    
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verify email
      const verifyResponse = await api.post('/auth/verify-email', { email, otp: trimmedOtp })
      
      console.log('✅ Email verified:', verifyResponse.data)
      
      // Auto-login after verification
      const password = location.state?.password
      if (password) {
        try {
          console.log('🔐 Attempting auto-login...')
          
          // Use the login function from AuthContext
          const loginResult = await login(email, password)
          
          if (loginResult.success) {
            console.log('✅ Auto-login successful, redirecting to dashboard...')
            
            // Small delay to show the success message
            setTimeout(() => {
              navigate('/donor/dashboard', { replace: true })
            }, 500)
          } else {
            console.error('❌ Auto-login failed:', loginResult.message)
            navigate('/login', { replace: true })
          }
        } catch (loginError) {
          console.error('❌ Auto-login error:', loginError)
          navigate('/login', { replace: true })
        }
      } else {
        console.log('⚠️ No password in state, redirecting to login')
        navigate('/login', { replace: true })
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Verification failed'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    
    setResending(true)
    setError('')

    try {
      await api.post('/auth/resend-verification', { email })
      setCountdown(120) // Start 120 second countdown
      setError('') // Clear any previous errors
      setOtp('') // Clear OTP input
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to resend code'
      setError(errorMsg)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-blue-100 bg-white">
        <CardHeader className="space-y-4 pb-6 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Mail className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-gray-900">Verify Your Email</CardTitle>
            <CardDescription className="text-base text-gray-600 mt-3">
              We've sent a 6-digit verification code to
            </CardDescription>
            <div className="font-semibold text-blue-600 text-lg mt-2 break-all px-4">{email}</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 text-center">
                Enter Verification Code
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtp(value)
                  setError('')
                }}
                maxLength={6}
                required
                className="h-16 text-center text-3xl tracking-[0.5em] font-bold border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                autoFocus
              />
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span>Code expires in 10 minutes</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Verify & Continue
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">Didn't receive code?</span>
            </div>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOtp}
              disabled={resending || countdown > 0}
              className="text-sm font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending new code...
                </span>
              ) : countdown > 0 ? (
                `Resend Code in ${countdown}s`
              ) : (
                'Resend Verification Code'
              )}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-800 font-medium">
              💡 Check your spam folder if you don't see the email
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyEmail
