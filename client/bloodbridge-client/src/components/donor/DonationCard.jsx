import { Calendar, MapPin, Droplets, Building2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDate, formatUnits } from '../../utils/formatters'
import { STATUS_COLORS, BLOOD_TYPE_COLORS } from '../../utils/constants'

const DonationCard = ({ donation, onViewDetails }) => {
  const getStatusColor = (status) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
  const getBloodTypeColor = (bloodType) => BLOOD_TYPE_COLORS[bloodType] || 'bg-gray-100 text-gray-800'

  const getStatusIcon = (status) => {
    switch (status) {
      case 'fulfilled':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-50 rounded-full">
            <Droplets className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {donation.hospitalName || donation.hospital?.name || 'Blood Donation'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <Building2 className="w-4 h-4" />
              <span>{donation.hospital?.address || donation.location || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon(donation.status)}
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(donation.status)}`}>
            {donation.status?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Blood Type</p>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getBloodTypeColor(donation.bloodGroup)}`}>
              {donation.bloodGroup}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Units</p>
            <p className="text-sm font-medium text-gray-900">
              {formatUnits(donation.units || donation.unitsNeeded || 1)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(donation.donationDate || donation.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {donation.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{donation.notes}</p>
        </div>
      )}

      {donation.certificate && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Certificate Available
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>
            {donation.distance ? `${donation.distance.toFixed(1)} km away` : 'Location not available'}
          </span>
        </div>

        {onViewDetails && (
          <button
            onClick={() => onViewDetails(donation)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  )
}

export default DonationCard