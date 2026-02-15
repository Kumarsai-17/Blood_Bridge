import { useAuth } from '../../context/AuthContext'
import { useLocation } from 'react-router-dom'

const AuthDebug = () => {
  const { user, isAuthenticated, token } = useAuth()
  const location = useLocation()

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Path: {location.pathname}</div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>Token: {token ? '✅' : '❌'}</div>
      <div>User: {user?.name || 'None'}</div>
      <div>Role: {user?.role || 'None'}</div>
      <div>LocalStorage Token: {localStorage.getItem('token') ? '✅' : '❌'}</div>
      <div>LocalStorage Role: {localStorage.getItem('role') || 'None'}</div>
    </div>
  )
}

export default AuthDebug