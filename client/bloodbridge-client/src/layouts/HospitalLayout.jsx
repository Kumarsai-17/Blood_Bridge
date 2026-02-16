import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import HospitalSidebar from '../components/hospital/HospitalSidebar'
import DashboardHeader from '../components/shared/DashboardHeader'

const HospitalLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader role="hospital" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Backdrop for mobile - ABOVE content, BELOW sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[45] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - ABOVE backdrop */}
      <HospitalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content - Desktop has sidebar, mobile doesn't */}
      <div className="md:flex">
        {/* Desktop spacer for sidebar */}
        <div className="hidden md:block md:w-64 flex-shrink-0"></div>
        
        <main className="flex-1 p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default HospitalLayout