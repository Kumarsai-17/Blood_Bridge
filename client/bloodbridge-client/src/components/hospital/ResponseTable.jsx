import { useState } from 'react'
import { Phone, Mail, MapPin, CheckCircle, XCircle, Clock, User } from 'lucide-react'
import { formatTimeAgo, formatDistance } from '../../utils/formatters'
import { STATUS_COLORS, BLOOD_TYPE_COLORS } from '../../utils/constants'

const ResponseTable = ({ responses, onAccept, onReject, onContact, loading = false }) => {
  const getStatusColor = (status) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
  const getBloodTypeColor = (bloodType) => BLOOD_TYPE_COLORS[bloodType] || 'bg-gray-100 text-gray-800'

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  if (!responses || responses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <User className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Responses Yet</h3>
        <p className="text-gray-600">
          Donors haven't responded to this request yet. Check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Donor Responses ({responses.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blood Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Response Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {responses.map((response) => (
              <tr key={response._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {response.donor?.name?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {response.donor?.name || 'Anonymous Donor'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {response.donor?.address || 'Location not available'}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBloodTypeColor(response.donor?.bloodGroup)}`}>
                    {response.donor?.bloodGroup || 'N/A'}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {response.distance ? formatDistance(response.distance) : 'N/A'}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTimeAgo(response.createdAt)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(response.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(response.status)}`}>
                      {response.status?.toUpperCase()}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {response.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onAccept(response)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Accept Response"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onReject(response)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Reject Response"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    
                    {response.donor?.phone && (
                      <button
                        onClick={() => onContact('phone', response.donor.phone)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Call Donor"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                    
                    {response.donor?.email && (
                      <button
                        onClick={() => onContact('email', response.donor.email)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Email Donor"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResponseTable