import api from './api'

const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Reset Password
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      newPassword
    })
    return response.data
  },

  // Verify Email
  verifyEmail: async (email, otp) => {
    const response = await api.post('/auth/verify-email', { email, otp })
    return response.data
  },

  // Resend Verification
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email })
    return response.data
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  },

  // Get Profile
  getProfile: async () => {
    const response = await api.get('/user/profile')
    return response.data
  },

  // Update Profile
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData)
    return response.data
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    delete api.defaults.headers.common['Authorization']
  },

  // Check if token exists
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Get current user role
  getCurrentRole: () => {
    return localStorage.getItem('role')
  }
}

export default authService