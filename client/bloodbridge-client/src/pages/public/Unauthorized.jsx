import { Link } from 'react-router-dom'
import { Shield, Home, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Unauthorized = () => {
  const { isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
            403 - Access Denied
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="space-y-6">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      Your current role doesn't have access to this section of the application.
                      Please contact an administrator if you believe this is an error.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">What you can do:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="ml-3 text-gray-700">
                      Return to your dashboard
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm">↻</span>
                    </div>
                    <span className="ml-3 text-gray-700">
                      Switch to an account with appropriate permissions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-yellow-600 text-sm">✉</span>
                    </div>
                    <span className="ml-3 text-gray-700">
                      Contact support for assistance
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
              
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Switch Account
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@bloodbridge.com" className="font-medium text-red-600 hover:text-red-500">
              support@bloodbridge.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized