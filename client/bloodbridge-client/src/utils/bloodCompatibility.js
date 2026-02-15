/**
 * Blood Compatibility Rules
 * 
 * Blood Type Compatibility Chart:
 * - O- is universal donor (can donate to all)
 * - AB+ is universal recipient (can receive from all)
 * - Rh+ can receive from Rh+ and Rh-
 * - Rh- can only receive from Rh-
 */

// Define which blood types can donate to each blood type
export const BLOOD_COMPATIBILITY = {
  'O-': ['O-'],                                    // Universal donor, but can only receive O-
  'O+': ['O-', 'O+'],                              // Can receive from O- and O+
  'A-': ['O-', 'A-'],                              // Can receive from O- and A-
  'A+': ['O-', 'O+', 'A-', 'A+'],                  // Can receive from O and A types
  'B-': ['O-', 'B-'],                              // Can receive from O- and B-
  'B+': ['O-', 'O+', 'B-', 'B+'],                  // Can receive from O and B types
  'AB-': ['O-', 'A-', 'B-', 'AB-'],                // Can receive from all negative types
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']  // Universal recipient
}

// Define which blood types each blood type can donate to
export const BLOOD_DONATION_TO = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],  // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
}

/**
 * Get compatible blood types that can donate to the requested blood type
 * @param {string} requestedBloodType - The blood type needed
 * @returns {string[]} - Array of compatible blood types that can donate
 */
export const getCompatibleDonors = (requestedBloodType) => {
  return BLOOD_COMPATIBILITY[requestedBloodType] || []
}

/**
 * Get blood types that can receive from the given blood type
 * @param {string} donorBloodType - The blood type available
 * @returns {string[]} - Array of blood types that can receive this blood
 */
export const getCompatibleRecipients = (donorBloodType) => {
  return BLOOD_DONATION_TO[donorBloodType] || []
}

/**
 * Check if a donor blood type is compatible with a recipient blood type
 * @param {string} donorBloodType - The blood type available
 * @param {string} recipientBloodType - The blood type needed
 * @returns {boolean} - True if compatible
 */
export const isCompatible = (donorBloodType, recipientBloodType) => {
  const compatibleDonors = BLOOD_COMPATIBILITY[recipientBloodType] || []
  return compatibleDonors.includes(donorBloodType)
}

/**
 * Get available units from inventory that can fulfill a blood request
 * @param {Object} inventory - Blood bank inventory { 'A+': 10, 'O-': 5, ... }
 * @param {string} requestedBloodType - The blood type needed
 * @returns {Object} - { compatible: ['O-', 'A+'], totalUnits: 15, breakdown: { 'O-': 5, 'A+': 10 } }
 */
export const getAvailableCompatibleBlood = (inventory, requestedBloodType) => {
  const compatibleTypes = getCompatibleDonors(requestedBloodType)
  const breakdown = {}
  let totalUnits = 0

  compatibleTypes.forEach(bloodType => {
    const units = inventory[bloodType] || 0
    if (units > 0) {
      breakdown[bloodType] = units
      totalUnits += units
    }
  })

  return {
    compatible: Object.keys(breakdown),
    totalUnits,
    breakdown,
    canFulfill: totalUnits > 0
  }
}

/**
 * Get compatibility info for display
 * @param {string} bloodType - The blood type
 * @returns {Object} - { canReceiveFrom: [], canDonateTo: [], isUniversalDonor: bool, isUniversalRecipient: bool }
 */
export const getBloodTypeInfo = (bloodType) => {
  return {
    canReceiveFrom: BLOOD_COMPATIBILITY[bloodType] || [],
    canDonateTo: BLOOD_DONATION_TO[bloodType] || [],
    isUniversalDonor: bloodType === 'O-',
    isUniversalRecipient: bloodType === 'AB+'
  }
}

/**
 * Get priority order for using blood types (use exact match first, then compatible)
 * @param {string} requestedBloodType - The blood type needed
 * @returns {string[]} - Array of blood types in priority order
 */
export const getBloodTypePriority = (requestedBloodType) => {
  const compatible = getCompatibleDonors(requestedBloodType)
  
  // Put exact match first, then O- (universal donor), then others
  const priority = [requestedBloodType]
  
  if (requestedBloodType !== 'O-' && compatible.includes('O-')) {
    priority.push('O-')
  }
  
  compatible.forEach(type => {
    if (!priority.includes(type)) {
      priority.push(type)
    }
  })
  
  return priority
}
