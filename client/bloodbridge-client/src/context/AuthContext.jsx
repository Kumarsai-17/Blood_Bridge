import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'
import localStorageService from '../services/localStorage'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorageService.getToken())

  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      const response = await api.get('/user/profile')
      setUser(response.data)
      localStorageService.setUser(response.data)
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      // Check if OTP verification is required
      if (response.data.requiresOTP) {
        return {
          success: true,
          requiresOTP: true,
          email: response.data.email,
          role: response.data.role,
          message: response.data.message
        }
      }
      
      // Direct login (super_admin)
      const { token, role, mustChangePassword } = response.data
      
      localStorageService.setToken(token)
      localStorageService.setRole(role)
      setToken(token)
      
      // Set authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Fetch user profile
      const userResponse = await api.get('/user/profile')
      setUser(userResponse.data)
      localStorageService.setUser(userResponse.data)
      
      return { 
        success: true, 
        role, 
        mustChangePassword,
        data: userResponse.data 
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const verifyLoginOTP = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-login-otp', { email, otp })
      const { token, role, mustChangePassword } = response.data
      
      localStorageService.setToken(token)
      localStorageService.setRole(role)
      setToken(token)
      
      // Set authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Fetch user profile
      const userResponse = await api.get('/user/profile')
      setUser(userResponse.data)
      localStorageService.setUser(userResponse.data)
      
      return { 
        success: true, 
        role, 
        mustChangePassword,
        data: userResponse.data 
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'OTP verification failed' 
      }
    }
  }

  const logout = () => {
    localStorageService.clearAuth()
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
  }

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }))
    localStorageService.setUser({ ...user, ...data })
  }

  const refreshUser = async () => {
    try {
      const response = await api.get('/user/profile')
      setUser(response.data)
      localStorageService.setUser(response.data)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value = {
    user,
    loading,
    token,
    login,
    verifyLoginOTP,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!token && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}