import { Droplet, Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Droplet className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xl font-semibold text-gray-800">BloodBridge</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Connecting blood donors with hospitals and blood banks in real-time.
              Saving lives through technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register/donor" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Become a Donor
                </Link>
              </li>
              <li>
                <Link to="/register/hospital" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Hospital Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Eligibility Criteria
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Donation Process
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Safety Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600 text-sm">support@bloodbridge.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600 text-sm">+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600 text-sm">123 Medical Street, Health City</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-600">
          <p className="text-sm">© {new Date().getFullYear()} BloodBridge. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Saving lives, one donation at a time.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer