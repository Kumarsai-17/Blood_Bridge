import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, Filter, Building, Building2, Phone, Mail, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatDistanceKm } from '../../utils/formatters'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons
const createCustomIcon = (color, html) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${html}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  })
}

const userIcon = createCustomIcon('#3B82F6', '📍')
const hospitalIcon = createCustomIcon('#6366F1', '🏥')
const bloodBankIcon = createCustomIcon('#EF4444', '🩸')

// Component to handle map updates
const MapController = ({ center, zoom }) => {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])
  return null
}

const MapView = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [hospitals, setHospitals] = useState([])
  const [bloodBanks, setBloodBanks] = useState([])
  const [filter, setFilter] = useState('all')
  const [userLocation, setUserLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090])
  const [mapZoom, setMapZoom] = useState(12)
  const locationRefs = useRef({})

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [modalTitle, setModalTitle] = useState('')

  const showPopup = (type, title, message) => {
    setModalType(type)
    setModalTitle(title)
    setModalMessage(message)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setTimeout(() => {
      setModalType('')
      setModalTitle('')
      setModalMessage('')
    }, 300)
  }

  // Set initial map center when user location is available
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
    }
  }, [userLocation])

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    if (userLocation) {
      fetchNearbyLocations()
    }
  }, [userLocation])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = { lat: position.coords.latitude, lng: position.coords.longitude }
          setUserLocation(location)
          setMapCenter([location.lat, location.lng])
          setLoading(false)
        },
        (error) => {
          if (user?.location?.lat && user?.location?.lng) {
            const location = { lat: user.location.lat, lng: user.location.lng }
            setUserLocation(location)
            setMapCenter([location.lat, location.lng])
          } else {
            const defaultLoc = { lat: 28.6139, lng: 77.2090 }
            setUserLocation(defaultLoc)
            setMapCenter([defaultLoc.lat, defaultLoc.lng])
          }
          setLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setLoading(false)
    }
  }

  const fetchNearbyLocations = async () => {
    if (!userLocation) return
    try {
      setLoading(true)
      const [hospitalsRes, bloodBanksRes] = await Promise.all([
        api.get('/donor/all-nearby-hospitals', {
          params: { lat: userLocation.lat, lng: userLocation.lng, maxDistance: 100000 }
        }),
        api.get('/donor/nearby-bloodbanks', {
          params: { lat: userLocation.lat, lng: userLocation.lng, maxDistance: 100000 }
        })
      ])
      console.log('Hospitals fetched:', hospitalsRes.data.data?.length || 0)
      console.log('Blood banks fetched:', bloodBanksRes.data.data?.length || 0)
      setHospitals(hospitalsRes.data.data || [])
      setBloodBanks(bloodBanksRes.data.data || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
      showPopup('error', 'Load Failed', 'Failed to load locations. Please try again.')
    } finally {
      setLoading(false)
    }
  }



  const filteredLocations = () => {
    const list = [
      ...hospitals.map(h => ({ ...h, type: 'hospital' })),
      ...bloodBanks.map(b => ({ ...b, type: 'bloodbank' }))
    ]
    if (filter === 'hospitals') return list.filter(l => l.type === 'hospital')
    if (filter === 'bloodbanks') return list.filter(l => l.type === 'bloodbank')
    return list.sort((a, b) => a.distance - b.distance)
  }

  const handleLocationClick = (location, index) => {
    setSelectedLocation(location)
    if (location.location?.lat && location.location?.lng) {
      setMapCenter([location.location.lat, location.location.lng])
      setMapZoom(14)
    }
  }

  const getDirections = (lat, lng, name) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`
    window.open(url, '_blank')
  }

  if (loading && !userLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Locations</h1>
            <p className="text-sm text-gray-600 mt-1">Find all hospitals and blood banks</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="hospitals">Hospitals Only</option>
              <option value="bloodbanks">Blood Banks Only</option>
            </select>
            <button
              onClick={fetchNearbyLocations}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Map (Sticky) */}
        <div className="w-1/2 relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} zoom={mapZoom} />
            
            {/* User Location Marker */}
            {userLocation && (
              <>
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">Your Location</div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* 30km Radius Circle */}
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={30000}
                  pathOptions={{
                    color: '#3B82F6',
                    fillColor: '#3B82F6',
                    fillOpacity: 0.1,
                    weight: 2
                  }}
                />
              </>
            )}

            {/* Location Markers */}
            {filteredLocations().map((location, index) => {
              if (!location.location?.lat || !location.location?.lng) return null
              
              return (
                <Marker
                  key={`${location.type}-${index}`}
                  position={[location.location.lat, location.location.lng]}
                  icon={location.type === 'hospital' ? hospitalIcon : bloodBankIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedLocation(location)
                      const locationId = `location-${location.type}-${index}`
                      if (locationRefs.current[locationId]) {
                        locationRefs.current[locationId].scrollIntoView({
                          behavior: 'smooth',
                          block: 'center'
                        })
                      }
                    }
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{location.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatDistanceKm(location.distance, 1)} km away
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
          
          {/* Map Legend */}
          <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 space-y-2 z-[1000]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Your Location</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Hospitals ({hospitals.length})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Blood Banks ({bloodBanks.length})</span>
            </div>
          </div>
        </div>

        {/* Right Side - Location List (Scrollable) */}
        <div className="w-1/2 overflow-y-auto bg-gray-50">
          <div className="p-6 space-y-4">
            {filteredLocations().length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No locations found</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              filteredLocations().map((location, index) => {
                const locationId = `location-${location.type}-${index}`
                return (
                  <div
                    key={locationId}
                    ref={el => locationRefs.current[locationId] = el}
                    onClick={() => handleLocationClick(location, index)}
                    className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
                      selectedLocation === location ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            location.type === 'hospital' ? 'bg-indigo-100' : 'bg-red-100'
                          }`}>
                            {location.type === 'hospital' ? (
                              <Building className={`w-6 h-6 ${location.type === 'hospital' ? 'text-indigo-600' : 'text-red-600'}`} />
                            ) : (
                              <Building2 className="w-6 h-6 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{location.name}</h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              location.type === 'hospital' 
                                ? 'bg-indigo-100 text-indigo-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {location.type === 'hospital' ? 'Hospital' : 'Blood Bank'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatDistanceKm(location.distance, 1)}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">km away</div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        {location.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{location.phone}</span>
                          </div>
                        )}
                        {location.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{location.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>
                            {location.location?.lat?.toFixed(4)}, {location.location?.lng?.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            getDirections(location.location.lat, location.location.lng, location.name)
                          }}
                          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Navigation className="w-4 h-4" />
                          Get Directions
                        </button>
                        {location.type === 'hospital' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = '/donor/requests'
                            }}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all"
                          >
                            View Requests
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in pointer-events-none">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in pointer-events-auto">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  modalType === 'success' ? 'bg-emerald-100' :
                  modalType === 'error' ? 'bg-rose-100' :
                  'bg-blue-100'
                }`}>
                  {modalType === 'success' && <CheckCircle className="w-10 h-10 text-emerald-600" />}
                  {modalType === 'error' && <XCircle className="w-10 h-10 text-rose-600" />}
                  {modalType === 'info' && <AlertCircle className="w-10 h-10 text-blue-600" />}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-center text-gray-900 mb-3">
                {modalTitle}
              </h3>

              <p className="text-center text-gray-600 mb-8 text-sm leading-relaxed">
                {modalMessage}
              </p>

              <button
                onClick={closeModal}
                className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                  modalType === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                  modalType === 'error' ? 'bg-rose-600 hover:bg-rose-700 text-white' :
                  'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapView
