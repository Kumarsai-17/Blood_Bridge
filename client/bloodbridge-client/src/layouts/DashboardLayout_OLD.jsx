
import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
    Menu, X, LogOut, Settings,
    LayoutDashboard, Users, Activity, FileText,
    ShieldCheck, Heart, Map, Bell, Search,
    ChevronRight, Truck, Database, Pipette
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/core'

const DashboardLayout = () => {
    const { user, logout } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const location = useLocation()
    const navigate = useNavigate()

    // Dynamic Navigation based on Role
    const getNavItems = () => {
        switch (user?.role) {
            case 'admin':
                return [
                    { icon: LayoutDashboard, label: 'Command Center', path: '/admin/dashboard' },
                    { icon: Users, label: 'Personnel Registry', path: '/admin/donors' },
                    { icon: Building2, label: 'Institutional Grid', path: '/admin/pending-approvals' }, // Assuming this exists or will exist
                    { icon: FileText, label: 'Intelligence Reports', path: '/admin/reports' },
                ]
            case 'donor':
                return [
                    { icon: LayoutDashboard, label: 'Impact Dashboard', path: '/donor/dashboard' },
                    { icon: Activity, label: 'Active Signals', path: '/donor/requests' },
                    { icon: Map, label: 'Surveillance Map', path: '/donor/map' },
                    { icon: History, label: 'Clinical History', path: '/donor/history' }, // Assuming Lucide icon import
                ]
            case 'hospital':
                return [
                    { icon: LayoutDashboard, label: 'Ops Command', path: '/hospital/dashboard' },
                    { icon: Activity, label: 'Signal Directory', path: '/hospital/requests' },
                    { icon: Users, label: 'Partner Network', path: '/hospital/donors' }, // Assuming logic
                ]
            case 'bloodbank':
                return [
                    { icon: LayoutDashboard, label: 'Reserve Command', path: '/bloodbank/dashboard' },
                    { icon: Database, label: 'Inventory Matrix', path: '/bloodbank/inventory' }, // Assuming logic
                    { icon: Activity, label: 'Transfer Signals', path: '/bloodbank/requests' },
                    { icon: FileText, label: 'Supply Analytics', path: '/bloodbank/reports' },
                ]
            default:
                return []
        }
    }

    // Helper for icons if imports are missing in switch scope (fixing possible ref error)
    const Building2 = Truck // Fallback for demo, real import needed
    const History = FileText // Fallback

    const navItems = getNavItems()

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">

            {/* Sidebar - Royal Command Style */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Brand Header */}
                    <div className="h-24 flex items-center px-8 bg-slate-950 border-b border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-transparent"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/50">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black uppercase tracking-wider italic leading-none">BloodBridge</h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Command v2.0</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden absolute right-4 p-2 text-slate-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
                        <div className="px-4 mb-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-2">Main Operations</p>
                        </div>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }
                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                                        <span className="font-bold text-xs uppercase tracking-widest flex-1">{item.label}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* User Profile Snippet */}
                    <div className="p-4 bg-slate-950 border-t border-white/5">
                        <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => navigate('/profile')}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest truncate flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                            <Settings className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Top Navbar */}
                <header className="h-24 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 border-b border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Breadcrumb / Page Title */}
                        <div className="hidden md:block">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                                {/* This could be dynamic based on route */}
                                {user?.role === 'admin' && 'System Command'}
                                {user?.role === 'donor' && 'Guardian Portal'}
                                {user?.role === 'hospital' && 'Clinical Ops'}
                                {user?.role === 'bloodbank' && 'Reserve Logic'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar - Visual Polish */}
                        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2.5 border border-transparent focus-within:border-indigo-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all w-64">
                            <Search className="w-4 h-4 text-slate-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Search protocols..."
                                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 placeholder:text-slate-400 w-full uppercase tracking-wide"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Logout */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="hidden md:flex text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Disconnect
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 scroll-smooth">
                    <div className="max-w-8xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    )
}

export default DashboardLayout
