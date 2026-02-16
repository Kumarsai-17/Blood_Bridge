import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import DonorSidebar from '../components/donor/DonorSidebar'
import DashboardHeader from '../components/shared/DashboardHeader'

const DonorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader 
        role="donor" 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* Backdrop - Only shows on mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <DonorSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content Area */}
      <div className="md:flex">
        {/* Spacer for desktop sidebar */}
        <div className="hidden md:block md:w-64 flex-shrink-0" />
        
        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DonorLayout
