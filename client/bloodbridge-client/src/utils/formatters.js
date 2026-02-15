export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions)
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatTimeAgo = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(date)
}

export const formatDistance = (distanceInKm) => {
  if (typeof distanceInKm !== 'number') {
    return distanceInKm || '--'
  }
  
  if (distanceInKm < 1) {
    return `${(distanceInKm * 1000).toFixed(0)} meters`
  }
  return `${distanceInKm.toFixed(1)} km`
}

export const formatDistanceKm = (distance, decimals = 1) => {
  if (typeof distance !== 'number') {
    return typeof distance === 'string' ? distance : '--'
  }
  return distance.toFixed(decimals)
}

export const formatUnits = (units) => {
  return `${units} unit${units !== 1 ? 's' : ''}`
}

export const formatBloodGroup = (bloodGroup) => {
  return bloodGroup || 'Not specified'
}

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const formatRole = (role) => {
  const roleMap = {
    donor: 'Blood Donor',
    hospital: 'Hospital',
    bloodbank: 'Blood Bank',
    admin: 'Administrator',
    super_admin: 'Super Administrator'
  }
  return roleMap[role] || capitalize(role)
}

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}