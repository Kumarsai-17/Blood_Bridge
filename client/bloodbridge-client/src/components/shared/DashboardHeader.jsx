import { User, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const DashboardHeader = ({ role }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleTitle = () => {
    switch(role) {
      case 'donor': return 'Donor Portal'
      case 'hospital': return 'Hospital Portal'
      case 'bloodbank': return 'Blood Bank Portal'
      case 'admin': return 'Admin Portal'
      default: return 'Dashboard'
    }
  }

  return (
    <header className="bg-white shadow">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side */}
          <div className="flex items-center">
            <button className="md:hidden mr-4">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getRoleTitle()}</h1>
              <p className="text-gray-600 text-sm">
                Welcome back, {user?.name}
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-red-600" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{user?.role.replace('_', ' ')}</div>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-3 border-b">
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => navigate('/change-password')}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                    >
                      Change Password
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader