import { 
  Home, 
  User, 
  History, 
  MapPin, 
  Bell,
  Heart,
  Droplet,
  X,
  LogOut,
  KeyRound
} from 'lucide-react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState, useRef, useEffect } from 'react'

const DonorSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const sidebarRef = useRef(null)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const menuItems = [
    { path: '/donor/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/donor/profile', icon: User, label: 'My Profile' },
    { path: '/donor/history', icon: History, label: 'Donation History' },
    { path: '/donor/requests', icon: Heart, label: 'Blood Requests' },
    { path: '/donor/map', icon: MapPin, label: 'Nearby Locations' },
    { path: '/donor/notifications', icon: Bell, label: 'Notifications' },
  ]

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left - close sidebar
      onClose()
    }
  }

  const handleMenuItemClick = (path) => {
    // Close sidebar immediately
    onClose()
    // Navigate to the path
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    if (onClose) onClose()
  }

  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <aside className="w-64 bg-white border-r min-h-screen hidden md:block flex-shrink-0">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <Droplet className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">BloodBridge</span>
          </Link>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar - Slides in from left */}
      <aside 
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2 group" onClick={onClose}>
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <Droplet className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">BloodBridge</span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Menu Items - Using buttons for mobile */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleMenuItemClick(item.path)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-red-50 text-left"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom section - Change Password & Logout */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
          <button
            onClick={() => {
              onClose()
              navigate('/change-password')
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-white transition-colors"
          >
            <KeyRound className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Change Password</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default DonorSidebar
