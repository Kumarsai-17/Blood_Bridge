import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Shield, CheckCircle, Key, ArrowLeft, Check, X, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Button, Card, CardContent, Input } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const ChangePassword = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [samePasswordError, setSamePasswordError] = useState(false)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

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

    if (formData.currentPassword === formData.newPassword) {
      setSamePasswordError(true)
      return
    }

    setLoading(true)
    setSamePasswordError(false)

    try {
      await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })

      setPopup({ 
        show: true, 
        type: 'success', 
        title: 'Success', 
        message: 'Password changed successfully',
        onClose: () => {
          if (user?.mustChangePassword) {
            navigate(`/${user.role}/dashboard`)
          } else {
            navigate(-1)
          }
        }
      })
    } catch (error) {
      const errorCode = error.response?.data?.code
      const errorMessage = error.response?.data?.message || 'Failed to change password'
      
      if (errorCode === 'SAME_PASSWORD') {
        setSamePasswordError(true)
      } else {
        setPopup({ show: true, type: 'error', title: 'Failed', message: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const passwordStrength = {
    length: formData.newPassword.length >= 6,
    uppercase: /[A-Z]/.test(formData.newPassword),
    number: /\d/.test(formData.newPassword)
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Update your password to keep your account secure.
            </p>
          </div>
          {!user?.mustChangePassword && (
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-soft-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!user?.mustChangePassword && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword.current ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="pl-11 pr-11 h-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePassword('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className={`pl-11 pr-11 h-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden ${
                      samePasswordError ? 'border-red-300 focus:ring-red-500' : ''
                    }`}
                    placeholder="Enter new password (min. 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-11 pr-11 h-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {formData.newPassword && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Password Strength
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "At least 6 characters", met: passwordStrength.length },
                      { label: "Contains uppercase letter", met: passwordStrength.uppercase },
                      { label: "Contains number", met: passwordStrength.number }
                    ].map((rule, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${rule.met ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${rule.met ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {rule.met ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${rule.met ? 'text-green-700' : 'text-gray-600'}`}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Updating Password...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span>{user?.mustChangePassword ? 'Set New Password' : 'Change Password'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Security Tips</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use a unique password you don't use elsewhere</li>
                <li>• Include a mix of letters, numbers, and symbols</li>
                <li>• Avoid using personal information</li>
                <li>• Change your password regularly</li>
              </ul>
            </div>
          </div>
        </div>
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
  )
}

export default ChangePassword
