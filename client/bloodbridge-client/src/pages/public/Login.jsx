
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/core'
import { LogIn, AlertCircle, CheckCircle, Droplet, Eye, EyeOff } from 'lucide-react'
import api from '../../services/api'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('') // Clear error on typing
    setUnverifiedEmail(null) // Clear unverified email state
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please enter your email and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        // Check if OTP verification is required
        if (result.requiresOTP) {
          // Redirect to login OTP verification page
          navigate('/verify-login-otp', {
            state: {
              email: formData.email,
              role: result.role
            }
          })
          return
        }

        // Direct login (super_admin) - Navigate based on role
        switch (result.role) {
          case 'donor':
            navigate('/donor/dashboard')
            break
          case 'hospital':
            navigate('/hospital/dashboard')
            break
          case 'bloodbank':
            navigate('/bloodbank/dashboard')
            break
          case 'admin':
          case 'super_admin':
            navigate('/admin/dashboard')
            break
          default:
            navigate('/')
        }
      } else {
        // Check if it's an email verification error
        if (result.message && result.message.toLowerCase().includes('verify')) {
          setUnverifiedEmail(formData.email)
          setError('Please verify your email address to login.')
        } else {
          setError(result.message || 'Invalid email or password')
        }
      }
    } catch (err) {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return

    try {
      await api.post('/auth/resend-verification', { email: unverifiedEmail })
      
      // Redirect to verification page
      navigate('/verify-email', { 
        state: { 
          email: unverifiedEmail,
          password: formData.password
        }
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code')
    }
  }

  return (
    <Card className="w-full shadow-xl border border-gray-100">
      <CardHeader className="space-y-3 pb-6">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-red-100 rounded-xl">
            <Droplet className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <CardTitle className="text-3xl text-center font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription className="text-center text-gray-600">
          Sign in to your BloodBridge account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {unverifiedEmail && (
              <button
                onClick={handleResendVerification}
                className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700 underline"
              >
                Click here to resend verification code
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <Input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
                className="h-12 pr-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-0 h-full flex items-center text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-12 text-base bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign In
              </span>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">New to BloodBridge?</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 bg-gray-50 border-t border-gray-100 p-6">
        <div className="text-center text-sm text-gray-600 font-medium mb-2">
          New to BloodBridge?
        </div>
        <Link to="/register/donor" className="w-full">
          <Button variant="outline" size="md" className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all">
            Register as Donor
          </Button>
        </Link>
        {/* Hospital and Blood Bank registration hidden on mobile, visible on desktop */}
        <div className="hidden md:grid md:grid-cols-2 gap-3 w-full">
          <Link to="/register/hospital" className="w-full">
            <Button variant="outline" size="sm" className="w-full text-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all">
              Hospital
            </Button>
          </Link>
          <Link to="/register/blood-bank" className="w-full">
            <Button variant="outline" size="sm" className="w-full text-sm hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all">
              Blood Bank
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default Login
