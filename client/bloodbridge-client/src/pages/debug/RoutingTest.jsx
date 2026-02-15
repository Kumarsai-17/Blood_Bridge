import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const RoutingTest = () => {
  const { user, isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  const handleTestLogin = async () => {
    const result = await login('superadmin@bloodbridge.com', 'SuperAdmin@123')
    if (result.success) {
      console.log('Login successful, navigating to admin dashboard...')
      navigate('/admin/dashboard')
    } else {
      console.error('Login failed:', result.message)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Routing Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Authentication Status</h2>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>User: {user?.name || 'None'}</p>
          <p>Role: {user?.role || 'None'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Test Actions</h2>
          <div className="space-x-2">
            <button 
              onClick={handleTestLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Test Admin Login
            </button>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Go to Admin Dashboard
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Quick Links</h2>
          <ul className="space-y-1">
            <li><a href="/admin/dashboard" className="text-blue-600 hover:underline">/admin/dashboard</a></li>
            <li><a href="/login" className="text-blue-600 hover:underline">/login</a></li>
            <li><a href="/" className="text-blue-600 hover:underline">/</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RoutingTest