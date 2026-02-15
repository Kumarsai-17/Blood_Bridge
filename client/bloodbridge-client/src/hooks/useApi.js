import { useState, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (method, url, data = null, options = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api({
        method,
        url,
        data,
        ...options
      })
      
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong'
      setError(errorMessage)
      
      // Show toast for errors that are not 401 (handled by interceptor)
      if (err.response?.status !== 401) {
        toast.error(errorMessage)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    request,
    get: (url, options) => request('GET', url, null, options),
    post: (url, data, options) => request('POST', url, data, options),
    put: (url, data, options) => request('PUT', url, data, options),
    delete: (url, options) => request('DELETE', url, null, options),
  }
}

export default useApi