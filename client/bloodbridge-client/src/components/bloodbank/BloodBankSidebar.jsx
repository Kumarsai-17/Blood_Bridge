import { 
  Home, 
  User, 
  Package, 
  List, 
  BarChart,
  Settings,
  Droplet,
  History
} from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'

const BloodBankSidebar = () => {
  const menuItems = [
    { path: '/bloodbank/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/bloodbank/inventory', icon: Package, label: 'Inventory' },
    { path: '/bloodbank/requests', icon: List, label: 'Requests' },
    { path: '/bloodbank/inventory/history', icon: History, label: 'History' },
    { path: '/bloodbank/reports', icon: BarChart, label: 'Reports' },
    { path: '/bloodbank/profile', icon: User, label: 'Bank Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]
  
  console.log('BloodBankSidebar menuItems:', menuItems)

  return (
    <aside className="w-64 bg-white border-r min-h-screen hidden md:block">
      <div className="p-6">
        {/* Logo */}
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
  )
}

export default BloodBankSidebar