import { NavLink } from 'react-router-dom'
import { Home, User, History, MapPin, Bell } from 'lucide-react'

const Sidebar = ({ items }) => {
  return (
    <aside className="w-64 bg-white border-r min-h-screen hidden md:block">
      <div className="p-6">
        <nav className="space-y-2">
          {items.map((item) => (
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

export default Sidebar