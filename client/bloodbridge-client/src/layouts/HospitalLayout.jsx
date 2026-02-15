import { Outlet } from 'react-router-dom'
import HospitalSidebar from '../components/hospital/HospitalSidebar'
import DashboardHeader from '../components/shared/DashboardHeader'

const HospitalLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader role="hospital" />
      <div className="flex">
        <HospitalSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default HospitalLayout