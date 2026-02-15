/**
 * Coordinate validation middleware to prevent injection attacks
 * and ensure valid geographic coordinates
 */

const validateCoordinates = (req, res, next) => {
  const { lat, lng } = req.query;

  // Check if coordinates are provided
  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }

  // Convert to numbers and validate
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Check if conversion was successful (not NaN)
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinate format. Must be valid numbers.'
    });
  }

  // Validate latitude range (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({
      success: false,
      message: 'Latitude must be between -90 and 90 degrees'
    });
  }

  // Validate longitude range (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      message: 'Longitude must be between -180 and 180 degrees'
    });
  }

  // For India-specific validation (optional)
  // India bounds: Lat: 8.4 to 37.6, Lng: 68.7 to 97.25
  const isInIndia = (
    latitude >= 6.0 && latitude <= 38.0 &&
    longitude >= 68.0 && longitude <= 98.0
  );

  if (!isInIndia) {
    console.warn(`⚠️ Coordinates outside India bounds: ${latitude}, ${longitude}`);
    // Don't block, just log for monitoring
  }

  // Validate maxDistance parameter if provided
  if (req.query.maxDistance) {
    const maxDistance = parseInt(req.query.maxDistance);

    if (isNaN(maxDistance) || maxDistance < 0 || maxDistance > 100000) {
      return res.status(400).json({
        success: false,
        message: 'maxDistance must be a number between 0 and 100000 meters'
      });
    }
  }

  // Add validated coordinates to request
  req.validatedCoords = {
    lat: latitude,
    lng: longitude,
    maxDistance: req.query.maxDistance ? parseInt(req.query.maxDistance) : 30000
  };

  next();
};

/**
 * Sanitize location data in request body
 */
const sanitizeLocationData = (req, res, next) => {
  if (req.body.location) {
    const { lat, lng } = req.body.location;

    if (lat !== undefined && lng !== undefined) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location coordinates'
        });
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: 'Location coordinates out of valid range'
        });
      }

      // Sanitize and normalize
      req.body.location = {
        lat: Math.round(latitude * 1000000) / 1000000, // 6 decimal places
        lng: Math.round(longitude * 1000000) / 1000000
      };
    }
  }

  next();
};

module.exports = {
  validateCoordinates,
  sanitizeLocationData
};