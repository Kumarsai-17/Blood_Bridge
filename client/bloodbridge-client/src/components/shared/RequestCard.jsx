
import { Clock, MapPin, Droplets, User, Calendar, Activity, ArrowRight } from 'lucide-react'
import { formatTimeAgo, formatUnits, formatDistance } from '../../utils/formatters'
import { Card, CardContent, Badge, Button } from '../../components/ui/core'

const RequestCard = ({
  request,
  onRespond,
  onViewDetails,
  showActions = true,
  showDistance = false,
  userRole = 'donor'
}) => {
  if (!request) {
    return <Card className="p-6 bg-slate-50"><p className="text-slate-500 font-medium italic">Invalid signal data.</p></Card>
  }

  const formatLocation = (location) => {
    if (!location) return 'Coordinates unavailable'
    if (typeof location === 'string') return location
    if (typeof location === 'object' && location.lat && location.lng) {
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
    }
    return 'Coordinates unavailable'
  }

  // Determine variant for Badge based on urgency
  const getBadgeVariant = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'destructive'
      case 'medium': return 'warning'
      case 'low': return 'success' // or 'royal'
      default: return 'outline'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all border-gray-200 bg-white">
      <CardContent className="p-6">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
              <Droplets className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {request.hospitalName || request.hospital?.name || "Unknown Facility"}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                {request.hospital?.address || formatLocation(request.location)}
              </div>
            </div>
          </div>

          <Badge variant={getBadgeVariant(request.urgency)} className="text-xs font-semibold">
            {request.urgency} PRIORITY
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
          <div>
            <div className="flex items-center text-xs text-gray-500 uppercase tracking-wider mb-1">
              <Activity className="w-3 h-3 mr-1" /> Type
            </div>
            <div className="text-2xl font-bold text-red-600">
              {request.bloodGroup}
            </div>
          </div>

          <div>
            <div className="flex items-center text-xs text-gray-500 uppercase tracking-wider mb-1">
              <User className="w-3 h-3 mr-1" /> Units
            </div>
            <div className="text-xl font-bold text-gray-900">
              {formatUnits(request.unitsNeeded || request.units || 0)}
            </div>
          </div>

          <div>
            <div className="flex items-center text-xs text-gray-500 uppercase tracking-wider mb-1">
              <Calendar className="w-3 h-3 mr-1" /> Required
            </div>
            <div className="text-sm font-semibold text-gray-700">
              {request.requiredDate
                ? new Date(request.requiredDate).toLocaleDateString()
                : request.createdAt
                  ? new Date(request.createdAt).toLocaleDateString()
                  : 'ASAP'}
            </div>
          </div>
        </div>

        {/* Footer Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 uppercase tracking-wider">
            <Clock className="w-4 h-4 mr-1" />
            <span>Signal Posted {formatTimeAgo(request.createdAt)}</span>
          </div>

          {showActions && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(request)}
              className="text-sm"
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RequestCard