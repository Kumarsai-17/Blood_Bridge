import LeafletMap, { mapIcons } from './LeafletMap'

const MapTest = () => {
  const testMarkers = [
    {
      id: 1,
      lat: 28.6139,
      lng: 77.2090,
      icon: mapIcons.hospital,
      popup: (
        <div>
          <h3 className="font-semibold">AIIMS Delhi</h3>
          <p className="text-sm">Leading hospital in Delhi</p>
        </div>
      )
    },
    {
      id: 2,
      lat: 28.6200,
      lng: 77.2100,
      icon: mapIcons.bloodBank,
      popup: "Red Cross Blood Bank"
    }
  ]

  const userLocation = {
    lat: 28.6129,
    lng: 77.2295
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Map Test</h2>
      <LeafletMap
        center={[28.6139, 77.2090]}
        zoom={12}
        height="400px"
        markers={testMarkers}
        showUserLocation={true}
        userLocation={userLocation}
        showRadius={true}
        radiusKm={5}
        className="border-2 border-gray-300"
      />
    </div>
  )
}

export default MapTest