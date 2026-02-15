/**
 * Blood Compatibility Rules
 * DONOR_COMPATIBILITY: Shows which blood types each donor can donate TO
 * RECIPIENT_COMPATIBILITY: Shows which blood types each recipient can receive FROM
 */

// What blood types can each donor blood type donate TO
const DONOR_COMPATIBILITY = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // O- is universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],                          // O+ can donate to positive types
  'A-': ['A-', 'A+', 'AB-', 'AB+'],                         // A- can donate to A and AB types
  'A+': ['A+', 'AB+'],                                       // A+ can donate to A+ and AB+
  'B-': ['B-', 'B+', 'AB-', 'AB+'],                         // B- can donate to B and AB types
  'B+': ['B+', 'AB+'],                                       // B+ can donate to B+ and AB+
  'AB-': ['AB-', 'AB+'],                                     // AB- can donate to AB types only
  'AB+': ['AB+']                                             // AB+ can only donate to AB+
};

// What blood types each recipient can receive FROM (for donor controller)
const RECIPIENT_COMPATIBILITY = {
  'O-': ['O-'],                                              // O- can only receive from O-
  'O+': ['O-', 'O+'],                                        // O+ can receive from O-, O+
  'A-': ['O-', 'A-'],                                        // A- can receive from O-, A-
  'A+': ['O-', 'O+', 'A-', 'A+'],                          // A+ can receive from O-, O+, A-, A+
  'B-': ['O-', 'B-'],                                        // B- can receive from O-, B-
  'B+': ['O-', 'O+', 'B-', 'B+'],                          // B+ can receive from O-, O+, B-, B+
  'AB-': ['O-', 'A-', 'B-', 'AB-'],                        // AB- can receive from O-, A-, B-, AB-
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] // AB+ is universal recipient
};

/**
 * Check if a donor can donate to a specific blood type request
 * Used in matching service
 */
const canDonorGiveTo = (donorBloodType, requestedBloodType) => {
  return DONOR_COMPATIBILITY[donorBloodType]?.includes(requestedBloodType) || false;
};

/**
 * Get compatible donor blood types that can donate to the requested blood type
 * Used in blood bank fulfillment
 */
const getCompatibleDonors = (requestedBloodType) => {
  return RECIPIENT_COMPATIBILITY[requestedBloodType] || [];
};

/**
 * Get blood types that a donor can donate to
 * Used in donor controller to find compatible requests
 */
const getCompatibleRequests = (donorBloodType) => {
  return DONOR_COMPATIBILITY[donorBloodType] || [];
};

module.exports = {
  DONOR_COMPATIBILITY,
  RECIPIENT_COMPATIBILITY,
  canDonorGiveTo,
  getCompatibleDonors,
  getCompatibleRequests,
  // Legacy exports for backward compatibility
  BLOOD_COMPATIBILITY: RECIPIENT_COMPATIBILITY
};
