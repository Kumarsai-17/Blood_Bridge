
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout' // Unified Layout

// Public Pages
import Home from '../pages/public/Home'
import Login from '../pages/public/Login'
import DonorRegister from '../pages/registration/DonorRegister'
import HospitalRegister from '../pages/registration/HospitalRegister'
import BloodBankRegister from '../pages/registration/BloodBankRegister'
import ResetPassword from '../pages/public/ResetPassword'

// Donor Pages
import DonorDashboard from '../pages/donor/DonorDashboard'
import DonorRequests from '../pages/donor/DonorRequests'
import DonationHistory from '../pages/donor/DonationHistory'
import RequestDetails from '../pages/donor/RequestDetails'
import Notifications from '../pages/donor/Notifications'
import AcceptedRequests from '../pages/donor/AcceptedRequests'
import MapView from '../pages/donor/MapView'

// Hospital Pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard'
import HospitalRequests from '../pages/hospital/HospitalRequests'
import CreateRequest from '../pages/hospital/CreateRequest'
// import HospitalDonorsList from '../pages/hospital/HospitalDonorsList' // Make sure this exists or fix path

// Blood Bank Pages
import BloodBankDashboard from '../pages/bloodbank/BloodBankDashboard'
import BloodBankInventory from '../pages/bloodbank/InventoryManagement'
import BloodBankReports from '../pages/bloodbank/BloodBankReports'
import PendingRequests from '../pages/bloodbank/PendingRequests'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import DonorsList from '../pages/admin/DonorsList'
import PendingApprovals from '../pages/admin/PendingApprovals'
import Reports from '../pages/admin/Reports'
import Settings from '../pages/admin/Settings'
import CreateAdmin from '../pages/admin/CreateAdmin'
import DisasterToggle from '../pages/admin/DisasterToggle'

// Common
import Profile from '../pages/common/Profile'
import Unauthorized from '../pages/public/Unauthorized' // Ensure this exists

import LoadingSpinner from '../components/shared/LoadingSpinner'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes - Wrapped in Split-Screen Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register/donor" element={<DonorRegister />} />
        <Route path="/register/hospital" element={<HospitalRegister />} />
        <Route path="/register/blood-bank" element={<BloodBankRegister />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes - Wrapped in Unified Dashboard Layout */}
      <Route element={<DashboardLayout />}>

        {/* Common */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['admin', 'donor', 'hospital', 'blood_bank']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Donor Routes */}
        <Route path="/donor">
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests/:id"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <RequestDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="history"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonationHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="accepted-requests"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <AcceptedRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="map"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <MapView />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Hospital Routes */}
        <Route path="/hospital">
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['hospital']}>
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests"
            element={
              <ProtectedRoute allowedRoles={['hospital']}>
                <HospitalRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-request"
            element={
              <ProtectedRoute allowedRoles={['hospital']}>
                <CreateRequest />
              </ProtectedRoute>
            }
          />
          {/* <Route 
            path="donors" 
            element={
              <ProtectedRoute allowedRoles={['hospital']}>
                <HospitalDonorsList />
              </ProtectedRoute>
            } 
          /> */}
        </Route>

        {/* Blood Bank Routes */}
        <Route path="/bloodbank">
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['bloodbank']}>
                <BloodBankDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute allowedRoles={['bloodbank']}>
                <BloodBankInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests"
            element={
              <ProtectedRoute allowedRoles={['bloodbank']}>
                <PendingRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={['bloodbank']}>
                <BloodBankReports />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="donors"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DonorsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="pending-approvals"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <PendingApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <CreateAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="disaster-toggle"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DisasterToggle />
              </ProtectedRoute>
            }
          />
        </Route>

      </Route>

      {/* Fallback & Unauthorized */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRouter