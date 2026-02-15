import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Set initial token if it exists
const token = localStorage.getItem('token')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || ''
      if (message.includes('expired') || message.includes('Invalid or expired token')) {
        const currentPath = window.location.pathname
        if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
          localStorage.removeItem('token')
          localStorage.removeItem('role')
          localStorage.removeItem('user')
          
          setTimeout(() => {
            window.location.href = '/login'
          }, 100)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api