export const BLOOD_TYPES = [
  'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'
]

export const USER_ROLES = {
  DONOR: 'donor',
  HOSPITAL: 'hospital',
  BLOOD_BANK: 'bloodbank',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
}

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled'
}

export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

export const URGENCY_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
}

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  fulfilled: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
}

export const BLOOD_TYPE_COLORS = {
  'O+': 'bg-red-100 text-red-800 border-red-200',
  'O-': 'bg-red-200 text-red-900 border-red-300',
  'A+': 'bg-blue-100 text-blue-800 border-blue-200',
  'A-': 'bg-blue-200 text-blue-900 border-blue-300',
  'B+': 'bg-green-100 text-green-800 border-green-200',
  'B-': 'bg-green-200 text-green-900 border-green-300',
  'AB+': 'bg-purple-100 text-purple-800 border-purple-200',
  'AB-': 'bg-purple-200 text-purple-900 border-purple-300'
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile'
  },
  DONOR: {
    DASHBOARD: '/donor/dashboard',
    REQUESTS: '/donor/requests',
    RESPOND: '/donor/respond',
    HISTORY: '/donor/history'
  },
  HOSPITAL: {
    DASHBOARD: '/hospital/dashboard',
    REQUESTS: '/hospital/requests',
    CREATE_REQUEST: '/hospital/requests',
    RESPONSES: '/hospital/responses'
  },
  BLOOD_BANK: {
    DASHBOARD: '/bloodbank/dashboard',
    INVENTORY: '/bloodbank/inventory',
    REQUESTS: '/bloodbank/requests'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    APPROVALS: '/admin/approvals',
    DISASTER: '/admin/disaster'
  }
}

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
}

export const DISTANCE_RADIUS = {
  DEFAULT: 50, // km
  MAX: 200 // km
}

export const DONATION_ELIGIBILITY = {
  MIN_AGE: 18,
  MAX_AGE: 65,
  MIN_WEIGHT: 50, // kg
  MIN_HEMOGLOBIN: 12.5 // g/dL
}