import { Outlet } from 'react-router-dom'
import DonorSidebar from '../components/donor/DonorSidebar'
import DashboardHeader from '../components/shared/DashboardHeader'

const DonorLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader role="donor" />
      <div className="flex">
        <DonorSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DonorLayout