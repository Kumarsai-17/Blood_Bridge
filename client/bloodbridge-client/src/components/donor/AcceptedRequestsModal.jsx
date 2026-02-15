import { useState, useEffect } from 'react'
import { X, MapPin, Clock, Droplets, Phone, AlertCircle, Navigation, Building } from 'lucide-react'
import { formatTimeAgo } from '../../utils/formatters'
import { getAccurateDirections } from '../../utils/directions'
import { useAuth } from '../../context/AuthContext'

const AcceptedRequestsModal = ({ isOpen, onClose, acceptedRequests, onCancelRequest }) => {
  const { user } = useAuth()
  
  if (!isOpen) return null

  const canCancelRequest = (acceptedAt) => {
    const now = new Date()
    const acceptedTime = new Date(acceptedAt)
    const diffInMinutes = (now - acceptedTime) / (1000 * 60)
    return diffInMinutes <= 5
  }

  const getTimeRemaining = (acceptedAt) => {
    const now = new Date()
    const acceptedTime = new Date(acceptedAt)
    const diffInMinutes = (now - acceptedTime) / (1000 * 60)
    const remainingMinutes = Math.max(0, 5 - diffInMinutes)
    
    if (remainingMinutes <= 0) return 'Cannot cancel'
    
    const minutes = Math.floor(remainingMinutes)
    const seconds = Math.floor((remainingMinutes - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} left to cancel`
  }

  const handleGetDirections = (request) => {
    getAccurateDirections(request.location, user, request.hospitalName)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">My Accepted Requests</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {acceptedRequests.length === 0 ? (
            <div className="text-center py-12">
              <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Accepted Requests</h3>
              <p className="text-gray-600">
                You haven't accepted any blood requests yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {acceptedRequests.map((request) => {
                const canCancel = canCancelRequest(request.acceptedAt)
                const timeRemaining = getTimeRemaining(request.acceptedAt)
                
                return (
                  <div key={request._id} className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-50 rounded-full">
                          <Droplets className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.hospitalName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Accepted {formatTimeAgo(request.acceptedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Accepted
                        </span>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Droplets className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Blood Type</p>
                          <p className="font-semibold text-red-600">{request.bloodGroup}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Distance</p>
                          <p className="font-semibold">{request.distance} km</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Urgency</p>
                          <p className="font-semibold capitalize">{request.urgency}</p>
                        </div>
                      </div>
                    </div>

                    {/* Hospital Info */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        Hospital Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-blue-800">{request.hospitalName}</span>
                        </div>
                        {request.hospitalPhone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-blue-600 mr-2" />
                            <a 
                              href={`tel:${request.hospitalPhone}`}
                              className="text-blue-800 hover:underline"
                            >
                              {request.hospitalPhone}
                            </a>
                          </div>
                        )}
                        {request.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-blue-800">
                              {typeof request.location === 'string' 
                                ? request.location 
                                : `${request.location.lat?.toFixed(4)}, ${request.location.lng?.toFixed(4)}`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cancellation Info */}
                    <div className={`p-3 rounded-lg mb-4 ${
                      canCancel 
                        ? 'bg-yellow-50 border border-yellow-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex items-center">
                        <AlertCircle className={`w-4 h-4 mr-2 ${
                          canCancel ? 'text-yellow-600' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm ${
                          canCancel ? 'text-yellow-800' : 'text-gray-600'
                        }`}>
                          {canCancel 
                            ? `⏰ ${timeRemaining}` 
                            : '🔒 Cancellation period expired (5 minutes)'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleGetDirections(request)}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Navigation className="w-5 h-5 mr-2" />
                        Get Directions
                      </button>
                      
                      {canCancel && (
                        <button
                          onClick={() => onCancelRequest(request._id)}
                          className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                      
                      {!canCancel && (
                        <button
                          disabled
                          className="flex-1 bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
                        >
                          Cannot Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AcceptedRequestsModal