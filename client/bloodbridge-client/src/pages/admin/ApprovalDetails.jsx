import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building, RefreshCcw, Mail, Phone, MapPin, FileText, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const ApprovalDetails = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState(null) // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('')
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/users/${userId}`)
      setUser(response.data.data)
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Failed to load user details' })
    } finally {
      setLoading(false)
    }
  }

  const handleApprovalClick = (action) => {
    setApprovalAction(action)
    setShowApprovalModal(true)
    setRejectionReason('')
  }

  const handleApprovalConfirm = async () => {
    if (approvalAction === 'reject' && !rejectionReason.trim()) {
      setPopup({ show: true, type: 'error', title: 'Reason Required', message: 'Please provide a reason for rejection' })
      return
    }

    try {
      setProcessing(true)
      
      if (approvalAction === 'approve') {
        await api.put(`/admin/approve/${userId}`)
        setPopup({ 
          show: true, 
          type: 'success', 
          title: 'Approved', 
          message: 'User has been approved successfully' 
        })
      } else {
        await api.delete(`/admin/reject/${userId}`, { data: { reason: rejectionReason } })
        setPopup({ 
          show: true, 
          type: 'success', 
          title: 'Rejected', 
          message: 'User has been rejected successfully' 
        })
      }
      
      setShowApprovalModal(false)
      
      // Redirect back to pending approvals after 2 seconds
      setTimeout(() => {
        navigate('/admin/pending-approvals')
      }, 2000)
      
    } catch (error) {
      setPopup({ 
        show: true, 
        type: 'error', 
        title: 'Action Failed', 
        message: error.response?.data?.message || 'Failed to process approval' 
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading details...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-600 text-lg mb-4">User not found</p>
        <Button onClick={() => navigate('/admin/pending-approvals')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pending Approvals
        </Button>
      </div>
    )
  }

  const isHospital = user.role === 'hospital'
  const isBloodBank = user.role === 'bloodbank'
  const details = isHospital ? user.hospitalDetails : user.bloodBankDetails
  const certificateUrl = isHospital ? details?.documentUrl : details?.certificateUrl

  if (!isHospital && !isBloodBank) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-600 text-lg mb-4">This user type does not require approval</p>
        <Button onClick={() => navigate('/admin/pending-approvals')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pending Approvals
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8 animate-fade-in">
      {/* Back Button */}
      <Button 
        onClick={() => navigate('/admin/pending-approvals')} 
        variant="outline"
        size="sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Pending Approvals
      </Button>

      {/* Header Card */}
      <Card className="shadow-soft-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                {isHospital ? <Building className="w-8 h-8" /> : <RefreshCcw className="w-8 h-8" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h1>
                <p className="text-sm text-gray-600 mb-1.5">{user.email}</p>
                <Badge className={`${isHospital ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'} flex items-center gap-1 w-fit text-xs`}>
                  {isHospital ? <Building className="w-3.5 h-3.5" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                  {isHospital ? 'HOSPITAL' : 'BLOOD BANK'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-lg border border-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900">PENDING APPROVAL</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="shadow-soft-lg">
        <CardContent className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1.5">
                <Mail className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</p>
              </div>
              <p className="text-sm font-bold text-gray-900">{user.email}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1.5">
                <Phone className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Phone</p>
              </div>
              <p className="text-sm font-bold text-gray-900">{user.phone}</p>
            </div>
            {user.state && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">State</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{user.state}</p>
              </div>
            )}
            {user.city && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">City/District</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{user.city}</p>
              </div>
            )}
            {user.location && user.location.lat && user.location.lng && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">GPS Coordinates</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {user.location.lat.toFixed(4)}, {user.location.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registration Details */}
      <Card className={`shadow-soft-lg bg-gradient-to-br ${isHospital ? 'from-blue-50 to-white border-blue-100' : 'from-amber-50 to-white border-amber-100'}`}>
        <CardContent className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            {isHospital ? <Building className="w-4 h-4 text-blue-600" /> : <RefreshCcw className="w-4 h-4 text-amber-600" />}
            {isHospital ? 'Hospital' : 'Blood Bank'} Registration Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-3 bg-white rounded-lg border ${isHospital ? 'border-blue-100' : 'border-amber-100'} shadow-sm`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                {isHospital ? 'Registration Number' : 'Registration ID'}
              </p>
              <p className="text-sm font-bold text-gray-900">
                {isHospital ? details.registrationNumber : details.registrationId}
              </p>
            </div>
            
            {isHospital && (
              <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Hospital Type</p>
                <p className="text-sm font-bold text-gray-900">{details.hospitalType}</p>
              </div>
            )}
            
            {details.licenseAuthority && (
              <div className={`p-3 bg-white rounded-lg border ${isHospital ? 'border-blue-100' : 'border-amber-100'} shadow-sm ${!isHospital && !details.hospitalType ? 'md:col-span-2' : ''}`}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">License Authority</p>
                <p className={`text-sm font-bold ${isHospital ? 'text-blue-600' : 'text-amber-600'}`}>
                  {details.licenseAuthority}
                </p>
              </div>
            )}
          </div>

          <div className={`p-3 bg-white rounded-lg border ${isHospital ? 'border-blue-100' : 'border-amber-100'} shadow-sm mt-3`}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Address
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{details.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Document */}
      {certificateUrl && (
        <Card className="shadow-soft-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              Registration Certificate
            </h3>
            <div className="bg-white rounded-lg border-2 border-green-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-sm">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-0.5">
                      {isHospital ? 'Hospital' : 'Blood Bank'} Registration Certificate
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      PDF Document • Uploaded by {user.name}
                    </p>
                  </div>
                </div>
                <a 
                  href={certificateUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 ${isHospital ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'} text-white rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg`}
                >
                  <Download className="w-4 h-4" />
                  Download & Review
                </a>
              </div>
            </div>
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-900 font-medium flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Please review the certificate document carefully before approving the application.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!user.isApproved && (
        <Card className="shadow-soft-lg border-2 border-gray-200">
          <CardContent className="p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">Approval Actions</h3>
            <div className="flex gap-3">
              <Button
                onClick={() => handleApprovalClick('approve')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Application
              </Button>
              <Button
                onClick={() => handleApprovalClick('reject')}
                variant="outline"
                className="flex-1 border-2 border-red-600 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className={`relative p-6 text-white overflow-hidden ${approvalAction === 'approve' ? 'bg-gradient-to-br from-green-600 to-green-700' : 'bg-gradient-to-br from-red-600 to-red-700'}`}>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                    {approvalAction === 'approve' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <h2 className="text-2xl font-bold">
                    {approvalAction === 'approve' ? 'Approve Application' : 'Reject Application'}
                  </h2>
                </div>
                <p className={`${approvalAction === 'approve' ? 'text-green-100' : 'text-red-100'} text-sm`}>
                  {approvalAction === 'approve' 
                    ? 'Confirm approval for this application' 
                    : 'Provide a reason for rejection'}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {approvalAction === 'approve' ? (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-green-900 font-medium">
                    Are you sure you want to approve this {isHospital ? 'hospital' : 'blood bank'} application? 
                    The user will receive an email notification with their login credentials.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Rejection <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none min-h-[120px] resize-none"
                    placeholder="Please provide a detailed reason for rejecting this application..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This reason will be sent to the applicant via email.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowApprovalModal(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 ${approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                onClick={handleApprovalConfirm}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {approvalAction === 'approve' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Confirm {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
                  </>
                )}
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

export default ApprovalDetails
