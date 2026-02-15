import { CheckCircle, XCircle, Clock, User, Building2, MapPin, Phone, Mail } from 'lucide-react'
import { formatDate, formatRole, formatTimeAgo } from '../../utils/formatters'
import { STATUS_COLORS } from '../../utils/constants'

const ApprovalCard = ({ 
  approval, 
  onApprove, 
  onReject, 
  onViewDetails, 
  loading = false 
}) => {
  const getStatusColor = (status) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'hospital':
      case 'bloodbank':
        return <Building2 className="w-6 h-6 text-blue-600" />
      case 'donor':
        return <User className="w-6 h-6 text-red-600" />
      default:
        return <User className="w-6 h-6 text-gray-600" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-full">
            {getRoleIcon(approval.role)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {approval.name}
            </h3>
            <p className="text-sm text-gray-600">
              {formatRole(approval.role)} Registration
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon(approval.status)}
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(approval.status)}`}>
            {approval.status?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">
              {approval.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-900">
              {approval.phone || 'Not provided'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm font-medium text-gray-900">
              {approval.address || approval.location || 'Not provided'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Applied</p>
            <p className="text-sm font-medium text-gray-900">
              {formatTimeAgo(approval.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Role-specific information */}
      {approval.role === 'hospital' && approval.hospitalDetails && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Hospital Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700">Registration No:</span>
              <span className="ml-2 text-blue-900 font-medium">
                {approval.hospitalDetails.registrationNumber}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Type:</span>
              <span className="ml-2 text-blue-900 font-medium">
                {approval.hospitalDetails.hospitalType || 'General'}
              </span>
            </div>
          </div>
        </div>
      )}

      {approval.role === 'bloodbank' && approval.bloodBankDetails && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <h4 className="text-sm font-medium text-red-900 mb-2">Blood Bank Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-red-700">Registration ID:</span>
              <span className="ml-2 text-red-900 font-medium">
                {approval.bloodBankDetails.registrationId}
              </span>
            </div>
            <div>
              <span className="text-red-700">License:</span>
              <span className="ml-2 text-red-900 font-medium">
                {approval.bloodBankDetails.licenseNumber || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      )}

      {approval.role === 'donor' && approval.bloodGroup && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">Donor Details</h4>
          <div className="text-sm">
            <span className="text-green-700">Blood Type:</span>
            <span className="ml-2 text-green-900 font-medium">
              {approval.bloodGroup}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={() => onViewDetails(approval)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          View Details
        </button>

        {approval.status === 'pending' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onReject(approval)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Reject'}
            </button>
            <button
              onClick={() => onApprove(approval)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Approve'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApprovalCard