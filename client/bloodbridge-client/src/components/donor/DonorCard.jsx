import { MapPin, Phone, Mail, Droplets, Calendar, Star } from 'lucide-react'
import { formatDistance, formatTimeAgo } from '../../utils/formatters'
import { BLOOD_TYPE_COLORS } from '../../utils/constants'

const DonorCard = ({ 
  donor, 
  onContact, 
  onViewProfile, 
  showDistance = false,
  showLastDonation = true,
  showRating = false
}) => {
  const getBloodTypeColor = (bloodType) => BLOOD_TYPE_COLORS[bloodType] || 'bg-gray-100 text-gray-800'

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {donor.name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{donor.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{donor.address || donor.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getBloodTypeColor(donor.bloodGroup)}`}>
            {donor.bloodGroup}
          </span>
          
          {showRating && donor.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">{donor.rating}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {showDistance && donor.distance && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Distance</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDistance(donor.distance)}
              </p>
            </div>
          </div>
        )}

        {showLastDonation && donor.lastDonation && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Last Donation</p>
              <p className="text-sm font-medium text-gray-900">
                {formatTimeAgo(donor.lastDonation)}
              </p>
            </div>
          </div>
        )}

        {donor.totalDonations && (
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Total Donations</p>
              <p className="text-sm font-medium text-gray-900">
                {donor.totalDonations}
              </p>
            </div>
          </div>
        )}

        {donor.availability && (
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              donor.availability === 'available' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {donor.availability}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          {donor.phone && (
            <button
              onClick={() => onContact('phone', donor.phone)}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
          )}
          
          {donor.email && (
            <button
              onClick={() => onContact('email', donor.email)}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
          )}
        </div>

        {onViewProfile && (
          <button
            onClick={() => onViewProfile(donor)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            View Profile
          </button>
        )}
      </div>
    </div>
  )
}

export default DonorCard