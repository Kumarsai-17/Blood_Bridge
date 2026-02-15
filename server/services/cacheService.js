/**
 * Caching service for geospatial queries
 * Uses MongoDB aggregation and in-memory caching for performance
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 1000;
    
    // Clean up cache every 10 minutes
    setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
  }

  /**
   * Generate cache key for geospatial queries
   */
  generateGeoKey(lat, lng, maxDistance, type) {
    // Round coordinates to reduce cache fragmentation
    const roundedLat = Math.round(lat * 100) / 100; // 2 decimal places
    const roundedLng = Math.round(lng * 100) / 100;
    const roundedDistance = Math.round(maxDistance / 1000) * 1000; // Round to nearest km
    
    return `geo:${roundedLat}:${roundedLng}:${roundedDistance}:${type}`;
  }

  /**
   * Get cached data
   */
  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`📦 Cache hit for key: ${key}`);
    return cached.data;
  }

  /**
   * Set cached data
   */
  set(key, data) {
    // Prevent cache from growing too large
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entries
      const oldestKeys = Array.from(this.cache.keys()).slice(0, 100);
      oldestKeys.forEach(k => this.cache.delete(k));
    }

    this.cache.set(key, {
      data: data,
      expiry: Date.now() + this.cacheTimeout,
      created: Date.now()
    });

    console.log(`💾 Cached data for key: ${key}`);
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxCacheSize,
      timeout: this.cacheTimeout
    };
  }

  /**
   * Cache aggregation pipeline results
   */
  async cacheAggregationResult(key, aggregationFn) {
    // Check cache first
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    // Execute aggregation
    const result = await aggregationFn();
    
    // Cache the result
    this.set(key, result);
    
    return result;
  }

  /**
   * Invalidate cache for a specific location type
   */
  invalidateByType(type) {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (key.includes(`:${type}`)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    console.log(`🔄 Invalidated ${invalidated} cache entries for type: ${type}`);
  }

  /**
   * Invalidate cache within a geographic area
   */
  invalidateByArea(centerLat, centerLng, radiusKm) {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (key.startsWith('geo:')) {
        const parts = key.split(':');
        if (parts.length >= 4) {
          const lat = parseFloat(parts[1]);
          const lng = parseFloat(parts[2]);
          
          // Simple distance check (not perfectly accurate but good enough for cache invalidation)
          const distance = Math.sqrt(
            Math.pow(centerLat - lat, 2) + Math.pow(centerLng - lng, 2)
          ) * 111; // Rough km conversion
          
          if (distance <= radiusKm) {
            this.cache.delete(key);
            invalidated++;
          }
        }
      }
    }
    
    console.log(`🔄 Invalidated ${invalidated} cache entries within ${radiusKm}km of ${centerLat}, ${centerLng}`);
  }
}

module.exports = new CacheService();