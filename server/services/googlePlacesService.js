const axios = require('axios');

class GooglePlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  /**
   * Search for hospitals and blood banks near a location
   */
  async searchNearbyPlaces(lat, lng, radius = 30000, type = 'hospital') {
    try {
      if (!this.apiKey) {
        console.warn('Google Places API key not configured');
        return [];
      }

      const searchTypes = {
        hospital: 'hospital',
        bloodbank: 'hospital' // Google doesn't have specific blood bank type
      };

      const response = await axios.get(`${this.baseUrl}/nearbysearch/json`, {
        params: {
          location: `${lat},${lng}`,
          radius: radius,
          type: searchTypes[type] || 'hospital',
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        console.error('Google Places API error:', response.data.status);
        return [];
      }

      return response.data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        address: place.vicinity,
        rating: place.rating,
        types: place.types,
        isOpen: place.opening_hours?.open_now,
        photoReference: place.photos?.[0]?.photo_reference
      }));
    } catch (error) {
      console.error('Google Places API error:', error.message);
      return [];
    }
  }

  /**
   * Get detailed information about a place
   */
  async getPlaceDetails(placeId) {
    try {
      if (!this.apiKey) return null;

      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,website,rating,opening_hours,geometry',
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        console.error('Google Places Details API error:', response.data.status);
        return null;
      }

      return response.data.result;
    } catch (error) {
      console.error('Google Places Details API error:', error.message);
      return null;
    }
  }

  /**
   * Batch search for multiple cities
   */
  async searchMultipleCities(cities, type = 'hospital') {
    const results = [];
    
    for (const city of cities) {
      console.log(`🔍 Searching for ${type}s in ${city.name}...`);
      
      const places = await this.searchNearbyPlaces(
        city.lat, 
        city.lng, 
        50000, // 50km radius for cities
        type
      );
      
      results.push(...places.map(place => ({
        ...place,
        city: city.name,
        state: city.state,
        country: city.country
      })));

      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }
}

module.exports = new GooglePlacesService();