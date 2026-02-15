import { X, MapPin, Clock, Droplets, Phone, AlertCircle } from 'lucide-react'

const RequestDetailsModal = ({ request, isOpen, onClose, onRespond, canRespond = true }) => {
  if (!isOpen || !request) return null

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const handleRespond = (response) => {
    onRespond(request._id, response)
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Blood Request Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Hospital Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="font-semibold text-blue-900 text-sm mb-2">Hospital Information</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center text-blue-800">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="font-medium">{request.hospitalName}</span>
              </div>
              {request.hospitalPhone && (
                <div className="flex items-center text-blue-700">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{request.hospitalPhone}</span>
                </div>
              )}
              {request.distance && (
                <div className="flex items-center text-blue-700">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{request.distance} km away</span>
                </div>
              )}
            </div>
          </div>

          {/* Request Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <div className="flex items-center mb-1">
                <Droplets className="w-4 h-4 text-red-600 mr-1.5" />
                <span className="font-semibold text-red-900 text-xs">Blood Type</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{request.bloodGroup}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <span className="font-semibold text-gray-900 text-xs block mb-1">Units Needed</span>
              <div className="text-2xl font-bold text-gray-900">{request.units}</div>
              <div className="text-xs text-gray-500">({request.units * 450}ml total)</div>
            </div>

            <div className={`rounded-lg p-3 border ${getUrgencyColor(request.urgency)}`}>
              <div className="flex items-center mb-1">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                <span className="font-semibold text-xs">Urgency Level</span>
              </div>
              <div className="text-lg font-bold capitalize">{request.urgency}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center mb-1">
                <Clock className="w-4 h-4 text-gray-600 mr-1.5" />
                <span className="font-semibold text-gray-900 text-xs">Posted</span>
              </div>
              <div className="text-xs text-gray-600">
                {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {request.notes && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="font-semibold text-gray-900 text-xs mb-1.5">Additional Information</h4>
              <p className="text-sm text-gray-700">{request.notes}</p>
            </div>
          )}

          {/* Urgency Description */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="font-semibold text-gray-900 text-xs mb-1.5">What This Means</h4>
            <div className="text-xs text-gray-700">
              {request.urgency === 'high' && (
                <p>🚨 <strong>Critical:</strong> Patient needs blood immediately. Every minute counts!</p>
              )}
              {request.urgency === 'medium' && (
                <p>⚠️ <strong>Urgent:</strong> Blood needed within 24 hours for patient care.</p>
              )}
              {request.urgency === 'low' && (
                <p>📅 <strong>Scheduled:</strong> Blood needed within 48 hours for planned procedure.</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {canRespond && (
          <div className="p-5 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={() => handleRespond('accepted')}
                className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                ✅ I Can Donate
              </button>
              <button
                onClick={() => handleRespond('declined')}
                className="flex-1 bg-gray-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                ❌ Cannot Donate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestDetailsModal