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

// Custom marker icons with SVG for better design
const createCustomIcon = (color, type, size = 45) => {
  const icons = {
    hospital: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="${size * 0.5}px" height="${size * 0.5}px">
      <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
    </svg>`,
    bloodbank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="${size * 0.5}px" height="${size * 0.5}px">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="${size * 0.5}px" height="${size * 0.5}px">
      <circle cx="12" cy="12" r="8"/>
    </svg>`
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        border: 4px solid white;
        box-shadow: 0 6px 16px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-45deg);
        position: relative;
      ">
        <div style="transform: rotate(45deg);">
          ${icons[type]}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  })
}

const userIcon = createCustomIcon('#3B82F6', 'user', 40)
const hospitalIcon = createCustomIcon('#4F46E5', 'hospital', 50)
const bloodBankIcon = createCustomIcon('#DC2626', 'bloodbank', 50)

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
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">All Locations</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Find hospitals and blood banks</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="hospitals">Hospitals</option>
              <option value="bloodbanks">Blood Banks</option>
            </select>
            <button
              onClick={fetchNearbyLocations}
              disabled={loading}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap"
            >
              <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile: Stacked with scrolling, Desktop: Side by Side */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map Section - Fixed height on mobile, flexible on desktop */}
        <div className="w-full md:w-1/2 h-64 md:h-full relative flex-shrink-0 isolate">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            dragging={true}
            touchZoom={true}
            doubleClickZoom={true}
            zoomControl={true}
            className="z-0"
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
                
                {/* 30km Radius Circle - Mobile Only */}
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={30000}
                  pathOptions={{
                    color: '#3B82F6',
                    fillColor: '#3B82F6',
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: '5, 10'
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
          
          {/* Map Legend - Inside map container */}
          <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-2 sm:p-4 space-y-1 sm:space-y-2 z-10 text-xs sm:text-sm border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full flex-shrink-0 shadow-sm"></div>
              <span className="font-semibold text-gray-800 truncate">You</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-indigo-700 rounded-full flex-shrink-0 shadow-sm"></div>
              <span className="font-semibold text-gray-800 truncate">Hospitals ({hospitals.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-700 rounded-full flex-shrink-0 shadow-sm"></div>
              <span className="font-semibold text-gray-800 truncate">Blood Banks ({bloodBanks.length})</span>
            </div>
          </div>
        </div>

        {/* Right Side - Location List (Scrollable) - Bottom on mobile, Right on desktop */}
        <div className="w-full md:w-1/2 flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
            {filteredLocations().length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 font-medium text-sm sm:text-base">No locations found</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Try adjusting your filters</p>
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
