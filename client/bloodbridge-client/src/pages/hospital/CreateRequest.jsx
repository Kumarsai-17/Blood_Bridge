import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Clock, Droplets, Plus, Activity, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import BloodTypeSelector from '../../components/shared/BloodTypeSelector'
import { Button, Card, CardContent } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const CreateRequest = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })
  const [formData, setFormData] = useState({
    bloodGroup: '',
    units: 1,
    urgency: 'medium',
    notes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.bloodGroup) {
      setPopup({ show: true, type: 'error', title: 'Blood Group Required', message: 'Please select blood group' })
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/hospital/create-request', formData)
      setShowSuccessModal(true)
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Failed', message: error.response?.data?.message || 'Failed to create request' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create Blood Request</h1>
          </div>
        </div>
        <p className="text-gray-600 ml-16">
          Submit a new blood request to notify eligible donors in your area.
        </p>
      </div>

      <Card className="shadow-soft-lg hover:shadow-xl transition-all">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Blood Group Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-100">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Blood Group</h3>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">
                  Select Required Blood Type
                </label>
                <BloodTypeSelector
                  value={formData.bloodGroup}
                  onChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                  required
                />
                <p className="text-xs text-gray-500 mt-4">
                  Donors with compatible blood types will be notified automatically.
                </p>
              </div>
            </div>

            {/* Units and Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Units Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Units Required</h3>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-center space-x-6">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, units: Math.max(1, formData.units - 1) })}
                      className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
                    >
                      -
                    </button>

                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900">{formData.units}</div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
                        Units (450ml each)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, units: formData.units + 1 })}
                      className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Urgency Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Urgency Level</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { value: 'low', label: 'Low Priority', color: 'bg-green-600', desc: 'Within 48 hours' },
                    { value: 'medium', label: 'Medium Priority', color: 'bg-amber-600', desc: 'Within 24 hours' },
                    { value: 'high', label: 'High Priority', color: 'bg-red-600', desc: 'Immediate need' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: level.value })}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                        formData.urgency === level.value
                          ? `${level.color} text-white border-transparent shadow-lg`
                          : `bg-white border-gray-200 hover:border-gray-300 text-gray-900`
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-sm font-bold">{level.label}</div>
                        <div className={`text-xs mt-1 ${formData.urgency === level.value ? 'text-white/80' : 'text-gray-500'}`}>
                          {level.desc}
                        </div>
                      </div>
                      {formData.urgency === level.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Additional Notes</h3>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none min-h-[120px] resize-none"
                  placeholder="Add any special instructions or medical context for donors..."
                />
                <p className="text-xs text-gray-500 mt-3">
                  Optional: Provide additional context to help donors prepare for donation.
                </p>
              </div>
            </div>

            {/* Info Notice */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-2">
                    Automatic Donor Notification
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Once submitted, eligible donors within your area will be automatically notified via email. 
                    The system will search for compatible donors within a 15km radius initially, expanding if needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Request...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Blood Request
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Success Header */}
            <div className="relative p-8 text-white overflow-hidden bg-gradient-to-br from-green-600 to-green-700">
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Request Created!</h2>
                <p className="text-green-100 text-sm">
                  Your blood request has been created successfully.
                </p>
              </div>
            </div>

            {/* Success Content */}
            <div className="p-8 text-center">
              <div className="bg-green-50 rounded-xl p-6 border border-green-100 mb-6">
                <p className="text-sm text-green-900 font-medium">
                  Eligible donors within your area have been notified and will start responding soon.
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setShowSuccessModal(false)
                  navigate('/hospital/requests')
                }}
              >
                View Requests
              </Button>
            </div>
          </div>
        </div>
      )}

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
  )
}

export default CreateRequest
