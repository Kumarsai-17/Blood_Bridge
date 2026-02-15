export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  // Basic phone validation - can be customized based on country
  const re = /^[\+]?[1-9][\d]{0,15}$/
  return re.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateName = (name) => {
  return name.trim().length >= 2
}

export const validateBloodGroup = (bloodGroup) => {
  const validGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  return validGroups.includes(bloodGroup)
}

export const validateLocation = (location) => {
  if (!location) return false
  const { lat, lng } = location
  return lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)
}

export const validateUnits = (units) => {
  return units > 0 && units <= 100
}

export const validateRegistration = (data, role) => {
  const errors = {}

  if (!validateName(data.name)) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (data.password && !validatePassword(data.password)) {
    errors.password = 'Password must be at least 6 characters'
  }

  if (data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  if (role === 'donor' && !validateBloodGroup(data.bloodGroup)) {
    errors.bloodGroup = 'Please select a valid blood group'
  }

  if (role === 'hospital' && !data.hospitalDetails?.registrationNumber) {
    errors.registrationNumber = 'Registration number is required'
  }

  if (role === 'bloodbank' && !data.bloodBankDetails?.registrationId) {
    errors.registrationId = 'Registration ID is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
}

export const formatPhoneNumber = (phone) => {
  // Format: (123) 456-7890
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return phone
}