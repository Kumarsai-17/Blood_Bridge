import { Link } from 'react-router-dom'
import { Search, Home, ArrowLeft, Droplet } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-red-100 to-red-200">
            <Droplet className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="mt-6 text-5xl font-extrabold text-gray-900">
            404
          </h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-800">
            Page not found
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Oops! The page you're looking for seems to have gone on a little adventure.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-red-100">
          <div className="px-8 py-10">
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400 mr-3" />
                <p className="text-gray-700">
                  We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Tip:</span> Check the URL for typos, or use the navigation below to find what you need.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Common Pages</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/" className="text-red-600 hover:text-red-800 hover:underline">
                        Home Page
                      </Link>
                    </li>
                    <li>
                      <Link to="/login" className="text-red-600 hover:text-red-800 hover:underline">
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link to="/register/donor" className="text-red-600 hover:text-red-800 hover:underline">
                        Become a Donor
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Quick Actions</h3>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => window.history.back()}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Go Back
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => window.location.reload()}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Reload Page
                      </button>
                    </li>
                    <li>
                      <a
                        href="/"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Report this Issue
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 px-8 py-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow hover:shadow-md transition-all"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Still lost?{' '}
            <a
              href="mailto:support@bloodbridge.com"
              className="font-medium text-red-600 hover:text-red-500 underline"
            >
              Contact our support team
            </a>{' '}
            for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound