import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons
export const createCustomIcon = (color, iconHtml) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 16px;">
          ${iconHtml}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

// Predefined icons
export const mapIcons = {
  donor: createCustomIcon('#10b981', '👤'), // Green for donor
  hospital: createCustomIcon('#3b82f6', '🏥'), // Blue for hospital
  bloodBank: createCustomIcon('#ef4444', '🩸'), // Red for blood bank
  emergency: createCustomIcon('#f59e0b', '🚨'), // Orange for emergency
  location: createCustomIcon('#6b7280', '📍') // Gray for general location
}

const LeafletMap = ({ 
  center = [20.5937, 78.9629], 
  zoom = 5, 
  height = '400px',
  markers = [],
  showUserLocation = false,
  userLocation = null,
  showRadius = false,
  radiusKm = 5,
  className = '',
  children
}) => {
  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location */}
        {showUserLocation && userLocation && (
          <>
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={mapIcons.donor}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-green-600 mb-2">📍 Your Location</div>
                  <div className="text-sm text-gray-600">You are here</div>
                </div>
              </Popup>
            </Marker>
            
            {/* Radius circle */}
            {showRadius && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radiusKm * 1000} // Convert km to meters
                pathOptions={{
                  color: '#10b981',
                  fillColor: '#10b981',
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
            )}
          </>
        )}

        {/* Custom markers */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={[marker.lat, marker.lng]}
            icon={marker.icon || mapIcons.location}
          >
            {marker.popup && (
              <Popup>
                {typeof marker.popup === 'string' ? (
                  <div>{marker.popup}</div>
                ) : (
                  marker.popup
                )}
              </Popup>
            )}
          </Marker>
        ))}

        {/* Additional children components */}
        {children}
      </MapContainer>
    </div>
  )
}

export default LeafletMap