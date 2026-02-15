const axios = require('axios');

/**
 * Overpass API Service for fetching nearby hospitals from OpenStreetMap
 * Completely free alternative to Google Places API
 */
class OverpassService {
  constructor() {
    this.baseURL = 'https://overpass-api.de/api/interpreter';
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Build Overpass QL query for hospitals
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {string} Overpass QL query
   */
  buildHospitalQuery(lat, lng, radiusKm) {
    const radiusMeters = radiusKm * 1000;
    
    return `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
        way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
        relation["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      );
      out center meta;
    `;
  }

  /**
   * Build Overpass QL query for clinics and medical facilities
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {string} Overpass QL query
   */
  buildMedicalQuery(lat, lng, radiusKm) {
    const radiusMeters = radiusKm * 1000;
    
    return `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
        node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
        node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
        node["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
        node["healthcare"="clinic"](around:${radiusMeters},${lat},${lng});
        way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
        way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
        relation["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      );
      out center meta;
    `;
  }

  /**
   * Parse Overpass API response
   * @param {Object} data - Raw Overpass API response
   * @param {number} userLat - User latitude for distance calculation
   * @param {number} userLng - User longitude for distance calculation
   * @returns {Array} Parsed hospital data
   */
  parseResponse(data, userLat, userLng) {
    if (!data.elements || !Array.isArray(data.elements)) {
      return [];
    }

    const hospitals = data.elements.map(element => {
      // Get coordinates based on element type
      let lat, lng;
      if (element.type === 'node') {
        lat = element.lat;
        lng = element.lon;
      } else if (element.center) {
        lat = element.center.lat;
        lng = element.center.lon;
      } else {
        return null; // Skip if no coordinates
      }

      // Calculate distance
      const distance = this.calculateDistance(userLat, userLng, lat, lng);

      // Extract tags
      const tags = element.tags || {};
      
      return {
        id: element.id,
        type: element.type,
        name: tags.name || tags['name:en'] || 'Unnamed Hospital',
        amenity: tags.amenity || tags.healthcare,
        location: { lat, lng },
        distance: parseFloat(distance.toFixed(2)),
        address: this.buildAddress(tags),
        phone: tags.phone || tags['contact:phone'],
        website: tags.website || tags['contact:website'],
        email: tags.email || tags['contact:email'],
        emergency: tags.emergency === 'yes',
        wheelchair: tags.wheelchair === 'yes',
        beds: tags.beds ? parseInt(tags.beds) : null,
        operator: tags.operator,
        operatorType: tags['operator:type'],
        openingHours: tags.opening_hours,
        speciality: tags.speciality || tags.healthcare_speciality,
        source: 'openstreetmap'
      };
    }).filter(hospital => hospital !== null);

    // Sort by distance
    return hospitals.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Build address from OSM tags
   * @param {Object} tags - OSM tags
   * @returns {string} Formatted address
   */
  buildAddress(tags) {
    const parts = [];
    
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    
    return parts.length > 0 ? parts.join(', ') : null;
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - First point latitude
   * @param {number} lng1 - First point longitude
   * @param {number} lat2 - Second point latitude
   * @param {number} lng2 - Second point longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Fetch nearby hospitals from Overpass API
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusKm - Search radius in kilometers (default: 10)
   * @param {boolean} includeClinics - Include clinics and other medical facilities (default: false)
   * @returns {Promise<Array>} Array of nearby hospitals
   */
  async getNearbyHospitals(lat, lng, radiusKm = 10, includeClinics = false) {
    try {
      console.log(`🔍 Searching OSM for hospitals near ${lat}, ${lng} within ${radiusKm}km`);

      const query = includeClinics 
        ? this.buildMedicalQuery(lat, lng, radiusKm)
        : this.buildHospitalQuery(lat, lng, radiusKm);

      const response = await axios.post(this.baseURL, query, {
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'BloodBridge/1.0 (Hospital Finder)'
        },
        timeout: this.timeout
      });

      if (response.status !== 200) {
        throw new Error(`Overpass API returned status ${response.status}`);
      }

      const hospitals = this.parseResponse(response.data, lat, lng);
      
      console.log(`✅ Found ${hospitals.length} hospitals from OSM`);
      return hospitals;

    } catch (error) {
      console.error('❌ Overpass API Error:', error.message);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - Overpass API is slow');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limited by Overpass API - try again later');
      } else if (error.response?.status >= 500) {
        throw new Error('Overpass API server error - try again later');
      } else {
        throw new Error(`Failed to fetch hospitals: ${error.message}`);
      }
    }
  }

  /**
   * Get hospital details by ID
   * @param {string} hospitalId - OSM hospital ID
   * @param {string} type - OSM element type (node, way, relation)
   * @returns {Promise<Object>} Hospital details
   */
  async getHospitalDetails(hospitalId, type = 'node') {
    try {
      const query = `
        [out:json][timeout:25];
        ${type}(${hospitalId});
        out center meta;
      `;

      const response = await axios.post(this.baseURL, query, {
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'BloodBridge/1.0 (Hospital Details)'
        },
        timeout: this.timeout
      });

      if (response.data.elements && response.data.elements.length > 0) {
        const element = response.data.elements[0];
        return this.parseResponse({ elements: [element] }, 0, 0)[0];
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get hospital details:', error.message);
      throw error;
    }
  }
}

module.exports = new OverpassService();