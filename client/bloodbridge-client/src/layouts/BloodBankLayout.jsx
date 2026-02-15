import { Outlet } from 'react-router-dom'
import BloodBankSidebar from '../components/bloodbank/BloodBankSidebar'
import DashboardHeader from '../components/shared/DashboardHeader'

const BloodBankLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader role="bloodbank" />
      <div className="flex">
        <BloodBankSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default BloodBankLayout