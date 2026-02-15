
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Droplet, Heart } from 'lucide-react'

const AuthLayout = () => {
  const location = useLocation()
  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600">

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=2883&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
          <div>
            <Link to="/" className="inline-flex items-center gap-4 group">
              <div className="p-4 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl group-hover:bg-white/30 transition-all duration-300 shadow-2xl">
                <Droplet className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold">BloodBridge</span>
            </Link>
          </div>

          <div className="space-y-8 max-w-lg mb-20">
            <h1 className="text-5xl font-bold leading-tight">
              Save Lives Through Blood Donation
            </h1>
            <p className="text-xl text-red-100 leading-relaxed">
              Join our community of donors, hospitals, and blood banks working together to ensure blood is available when it's needed most.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-red-600 bg-red-700 flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-white" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-semibold text-white">
                Join thousands of donors making a difference
              </div>
            </div>
          </div>

          <div className="text-xs text-red-100">
            © {year} BloodBridge. Connecting donors with those in need.
          </div>
        </div>
      </div>

      {/* Right Panel - Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 relative">
        <div className="w-full max-w-md">
          <Outlet />
        </div>

        {/* Mobile Header (Visible only on small screens) */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <Droplet className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">BloodBridge</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout