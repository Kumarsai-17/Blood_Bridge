import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import DashboardHeader from '../components/shared/DashboardHeader'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader role="admin" />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout