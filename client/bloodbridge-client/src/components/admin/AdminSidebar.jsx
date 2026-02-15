import {
  Home,
  Users,
  UserPlus,
  Shield,
  BarChart,
  Settings,
  List,
  Droplet
} from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'

const AdminSidebar = () => {
  const menuItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/admin/pending-approvals', icon: Users, label: 'Pending Approvals' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/create-admin', icon: UserPlus, label: 'Create Admin' },
    { path: '/admin/disaster-toggle', icon: Shield, label: 'Disaster Mode' },
    { path: '/admin/reports', icon: BarChart, label: 'Reports' },
    { path: '/admin/donors-list', icon: List, label: 'Donors List' },
  ]

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
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
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

export default AdminSidebar