
import { Link } from 'react-router-dom'
import { Activity, ShieldCheck, Heart, ArrowRight, Droplet, Users, Building2, MapPin, Clock, CheckCircle, Zap, TrendingUp } from 'lucide-react'
import { Button, Card, CardContent } from '../../components/ui/core'
import { useAuth } from '../../context/AuthContext'

const Home = () => {
  const { isAuthenticated, user } = useAuth()

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'donor':
        return '/donor/dashboard'
      case 'hospital':
        return '/hospital/dashboard'
      case 'bloodbank':
        return '/bloodbank/dashboard'
      case 'admin':
      case 'super_admin':
        return '/admin/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">

      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo with Animation */}
            <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-red-400 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                  <Droplet className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-pink-500 bg-clip-text text-transparent">
                BloodBridge
              </h1>
            </div>

            <p className="text-2xl text-gray-700 mb-4 font-semibold animate-fade-in animation-delay-200">
              Save Lives, One Donation at a Time
            </p>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed animate-fade-in animation-delay-300">
              Connecting blood donors with hospitals and blood banks through a simple, efficient platform that makes every donation count.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 animate-fade-in animation-delay-500">
              {isAuthenticated ? (
                <Link to={getDashboardPath()}>
                  <Button variant="primary" size="lg" className="h-14 px-10 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-red-600 to-red-500">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="primary" size="lg" className="h-14 px-10 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-red-600 to-red-500">
                      Sign In
                      <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                  </Link>
                  <Link to="/register/donor">
                    <Button variant="outline" size="lg" className="h-14 px-10 text-lg border-2 border-red-600 text-red-600 hover:bg-red-50 transform hover:-translate-y-1 transition-all duration-300">
                      Become a Donor
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Join Section with Enhanced Cards - Only show when not authenticated */}
      {!isAuthenticated && (
        <div className="py-8 sm:py-12 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Join Our Community</h2>
              <p className="text-xl text-gray-600">Choose your role and start making a difference today</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="group shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-red-100 hover:border-red-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-red-50">
              <CardContent className="p-8">
                <div className="relative inline-flex p-5 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Heart className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Blood Donor</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Register as a donor and receive notifications when your blood type is needed in your area</p>
                <Link to="/register/donor">
                  <Button variant="primary" className="w-full bg-gradient-to-r from-red-600 to-red-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    Register as Donor
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-blue-100 hover:border-blue-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50">
              <CardContent className="p-8">
                <div className="relative inline-flex p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Building2 className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Hospital</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Post blood requirements and connect with donors and blood banks efficiently</p>
                <Link to="/register/hospital">
                  <Button variant="primary" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    Register Hospital
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-green-100 hover:border-green-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-green-50">
              <CardContent className="p-8">
                <div className="relative inline-flex p-5 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Droplet className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Blood Bank</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Manage blood inventory and respond to hospital requests efficiently</p>
                <Link to="/register/blood-bank">
                  <Button variant="primary" className="w-full bg-gradient-to-r from-green-600 to-green-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    Register Blood Bank
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      )}

      {/* How It Works with Timeline */}
      <div className="py-20 sm:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">A streamlined process connecting those who need blood with those who can donate</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-red-200 to-green-200 transform -translate-y-1/2 z-0"></div>
            
            <Card className="relative z-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6 shadow-lg">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Hospitals Request</h3>
                <p className="text-gray-600">Medical facilities post blood requirements with specific blood types and urgency levels</p>
              </CardContent>
            </Card>

            <Card className="relative z-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-red-200">
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6 shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Donors Respond</h3>
                <p className="text-gray-600">Registered donors receive notifications and can accept requests that match their blood type</p>
              </CardContent>
            </Card>

            <Card className="relative z-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lives Saved</h3>
                <p className="text-gray-600">Donors visit hospitals to complete donations, helping patients in need</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Grid with Icons */}
      <div className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600">Tools designed to make blood donation coordination simple and effective</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: 'Location-Based Matching',
                description: 'Find donors and hospitals near you for faster response times',
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                icon: Zap,
                title: 'Real-Time Updates',
                description: 'Get instant notifications about new requests and responses',
                gradient: 'from-amber-500 to-amber-600'
              },
              {
                icon: ShieldCheck,
                title: 'Verified Users',
                description: 'All hospitals and blood banks are verified by administrators',
                gradient: 'from-green-500 to-green-600'
              },
              {
                icon: Droplet,
                title: 'Blood Type Filtering',
                description: 'Automatic matching based on blood type compatibility',
                gradient: 'from-red-500 to-red-600'
              },
              {
                icon: TrendingUp,
                title: 'Donation History',
                description: 'Track your donation history and impact over time',
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                icon: Activity,
                title: 'Emergency Mode',
                description: 'Priority alerts during disaster situations and mass casualties',
                gradient: 'from-orange-500 to-orange-600'
              }
            ].map((feature, index) => (
              <Card key={feature.title} className="group shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className={`inline-flex p-4 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 border-t border-gray-700">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="p-2 bg-red-100 rounded-lg">
                <Droplet className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-xl font-bold text-white">BloodBridge</span>
            </div>
            <div className="flex gap-8">
              <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-sm text-gray-400 text-center">
              &copy; 2024 BloodBridge. Connecting donors with those in need.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        .animation-delay-700 {
          animation-delay: 700ms;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

export default Home
