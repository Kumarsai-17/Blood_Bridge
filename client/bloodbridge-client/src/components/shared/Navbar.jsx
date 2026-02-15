import { Link, useNavigate } from 'react-router-dom'
import { Droplet, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <Droplet className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xl font-semibold text-gray-800">BloodBridge</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 text-gray-700 font-medium"
            >
              Home
            </Link>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/register/donor"
                  className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Become a Donor
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-700">
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register/donor"
                    className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 font-medium text-center transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Become a Donor
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-gray-700 font-medium">
                    Welcome, {user?.name}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="text-gray-600 hover:text-gray-900 font-medium text-left transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar