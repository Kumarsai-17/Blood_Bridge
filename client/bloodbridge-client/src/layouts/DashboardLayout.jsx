import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
    Menu, X, LogOut, Settings,
    LayoutDashboard, Users, Activity, FileText,
    ShieldCheck, Shield, Droplet, Map, History, Truck, Database, Building2, Search, Bell, User, Lock, ChevronDown, Home
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/core'

const DashboardLayout = () => {
    const { user, logout } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const navigate = useNavigate()

    // Dynamic Navigation based on Role
    const getNavItems = () => {
        switch (user?.role) {
            case 'admin':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
                    { icon: Users, label: 'Users', path: '/admin/users' },
                    { icon: ShieldCheck, label: 'Approvals', path: '/admin/pending-approvals' },
                    { icon: FileText, label: 'Reports', path: '/admin/reports' },
                ]
            case 'super_admin':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
                    { icon: Users, label: 'Users', path: '/admin/users' },
                    { icon: ShieldCheck, label: 'Approvals', path: '/admin/pending-approvals' },
                    { icon: Shield, label: 'Create Admin', path: '/admin/create-admin' },
                    { icon: FileText, label: 'Reports', path: '/admin/reports' },
                ]
            case 'donor':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/donor/dashboard' },
                    { icon: Activity, label: 'Requests', path: '/donor/requests' },
                    { icon: Map, label: 'Map View', path: '/donor/map' },
                    { icon: History, label: 'History', path: '/donor/history' },
                ]
            case 'hospital':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/hospital/dashboard' },
                    { icon: Activity, label: 'Requests', path: '/hospital/requests' },
                    { icon: Shield, label: 'Disaster Mode', path: '/hospital/disaster-toggle' },
                    { icon: History, label: 'History', path: '/hospital/history' },
                ]
            case 'bloodbank':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/bloodbank/dashboard' },
                    { icon: Database, label: 'Inventory', path: '/bloodbank/inventory' },
                    { icon: Activity, label: 'Requests', path: '/bloodbank/requests' },
                    { icon: History, label: 'History', path: '/bloodbank/inventory/history' },
                    { icon: FileText, label: 'Reports', path: '/bloodbank/reports' },
                ]
            default:
                return []
        }
    }

    const navItems = getNavItems()

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Sidebar */}
            <aside
                className={`w-72 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out flex-shrink-0 ${
                    sidebarOpen ? 'ml-0' : '-ml-72'
                }`}
            >
                <div className="flex flex-col h-screen sticky top-0">
                    {/* Brand Header */}
                    <div className="h-20 flex items-center px-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Droplet className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">BloodBridge</h1>
                                <p className="text-xs text-gray-500">Save Lives Together</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-6 px-4">
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-600 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon className="w-5 h-5" />
                                            <span className="text-sm">{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Navbar */}
                <header className="h-20 bg-white sticky top-0 z-30 flex items-center justify-between px-6 border-b border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <>
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>

                                {/* BloodBridge Logo - Only visible when sidebar is closed */}
                                <button
                                    onClick={() => navigate('/')}
                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                >
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Droplet className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-lg font-bold text-gray-900">BloodBridge</h1>
                                        <p className="text-xs text-gray-500">Save Lives Together</p>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Home Button */}
                        <Button
                            onClick={() => navigate('/')}
                            variant="ghost"
                            size="sm"
                            className="hidden md:flex text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Home
                        </Button>

                        {/* User Profile - Top Right with Dropdown */}
                        <div className="hidden md:block relative">
                            <div 
                                className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200" 
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown Menu */}
                            {profileDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-30" 
                                        onClick={() => setProfileDropdownOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-40 animate-fade-in">
                                        <button
                                            onClick={() => {
                                                setProfileDropdownOpen(false)
                                                navigate('/profile')
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                                        >
                                            <User className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium">My Profile</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setProfileDropdownOpen(false)
                                                navigate('/change-password')
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                                        >
                                            <Lock className="w-4 h-4 text-amber-600" />
                                            <span className="text-sm font-medium">Change Password</span>
                                        </button>
                                        <div className="border-t border-gray-100 my-2"></div>
                                        <button
                                            onClick={() => {
                                                setProfileDropdownOpen(false)
                                                logout()
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm font-medium">Logout</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    )
}

export default DashboardLayout
