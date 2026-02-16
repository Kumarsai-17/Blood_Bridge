import { User, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const DashboardHeader = ({ role, onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getProfilePath = () => {
    switch(role) {
      case 'donor': return '/donor/profile'
      case 'hospital': return '/hospital/profile'
      case 'bloodbank': return '/bloodbank/profile'
      case 'admin': return '/admin/settings'
      default: return '/prof~cd sile'
    }
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
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Left side with Menu Button */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile Menu Button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{getRoleTitle()}</h1>
              <p className="text-gray-600 text-xs sm:text-sm truncate">
                Welcome, {user?.name}
              </p>
            </div>
          </div>

          {/* Right side - Mobile & Desktop */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* User Dropdown */}
            <div className="relative z-50">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="font-medium text-sm">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ')}</div>
                </div>
              </button>

              {showDropdown && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-[60] bg-black/20 md:bg-transparent" 
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  
                  {/* Dropdown Menu - Mobile & Desktop */}
                  <div className="absolute right-0 mt-2 w-64 sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-[70] overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-red-50 to-white">
                      <div className="font-bold text-gray-900 truncate text-base">{user?.name}</div>
                      <div className="text-xs text-gray-600 truncate mt-0.5">{user?.email}</div>
                      <div className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full capitalize">
                        {user?.role.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate(getProfilePath())
                          setShowDropdown(false)
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center text-gray-700"
                      >
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-sm">My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/change-password')
                          setShowDropdown(false)
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center text-gray-700"
                      >
                        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-sm">Change Password</span>
                      </button>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={() => {
                          handleLogout()
                          setShowDropdown(false)
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors flex items-center"
                      >
                        <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <LogOut className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="font-bold text-sm text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader