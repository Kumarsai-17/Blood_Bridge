const localStorageService = {
  // Token Management
  setToken: (token) => {
    localStorage.setItem('token', token)
  },

  getToken: () => {
    return localStorage.getItem('token')
  },

  removeToken: () => {
    localStorage.removeItem('token')
  },

  // User Role Management
  setRole: (role) => {
    localStorage.setItem('role', role)
  },

  getRole: () => {
    return localStorage.getItem('role')
  },

  removeRole: () => {
    localStorage.removeItem('role')
  },

  // User Data Management
  setUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
  },

  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  removeUser: () => {
    localStorage.removeItem('user')
  },

  // Settings Management
  setSettings: (settings) => {
    localStorage.setItem('settings', JSON.stringify(settings))
  },

  getSettings: () => {
    const settings = localStorage.getItem('settings')
    return settings ? JSON.parse(settings) : {}
  },

  // Theme Management
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
  },

  getTheme: () => {
    return localStorage.getItem('theme') || 'light'
  },

  // Clear all auth data
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
  },

  // Clear everything
  clearAll: () => {
    localStorage.clear()
  }
}

export default localStorageService