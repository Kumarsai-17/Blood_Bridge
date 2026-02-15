import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Layouts
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'

// Public Pages
import Home from '../pages/public/Home'
import Login from '../pages/public/Login'
import ForgotPassword from '../pages/public/ForgotPassword'
import ResetPassword from '../pages/public/ResetPassword'
import VerifyOTP from '../pages/public/VerifyOTP'
import VerifyLoginOTP from '../pages/public/VerifyLoginOTP'
import VerifyEmail from '../pages/public/VerifyEmail'
import Unauthorized from '../pages/public/Unauthorized'
import NotFound from '../pages/public/NotFound'

// Registration Pages
import DonorRegister from '../pages/registration/DonorRegister'
import HospitalRegister from '../pages/registration/HospitalRegister'
import BloodBankRegister from '../pages/registration/BloodBankRegister'

// Common Pages
import Profile from '../pages/common/Profile'
import ChangePassword from '../pages/common/ChangePassword'
import CommonSettings from '../pages/common/Settings'

// Donor Pages
import DonorDashboard from '../pages/donor/DonorDashboard'
import DonorRequests from '../pages/donor/DonorRequests'
import DonationHistory from '../pages/donor/DonationHistory'
import RequestDetails from '../pages/donor/RequestDetails'
import AcceptedRequests from '../pages/donor/AcceptedRequests'
import MapView from '../pages/donor/MapView'
import Notifications from '../pages/donor/Notifications'
import DonorProfile from '../pages/donor/DonorProfile'

// Hospital Pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard'
import HospitalRequests from '../pages/hospital/HospitalRequests'
import RequestResponses from '../pages/hospital/RequestResponses'
import CreateRequest from '../pages/hospital/CreateRequest'
import HospitalHistory from '../pages/hospital/HospitalHistory'
import DonationDetails from '../pages/hospital/DonationDetails'
import HospitalProfile from '../pages/hospital/HospitalProfile'
import HospitalDisasterToggle from '../pages/hospital/DisasterToggle'

// Blood Bank Pages
import BloodBankDashboard from '../pages/bloodbank/BloodBankDashboard'
import InventoryManagement from '../pages/bloodbank/InventoryManagement'
import InventoryHistory from '../pages/bloodbank/InventoryHistory'
import PendingRequests from '../pages/bloodbank/PendingRequests'
import BloodBankReports from '../pages/bloodbank/BloodBankReports'
import BloodBankProfile from '../pages/bloodbank/BloodBankProfile'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import UserManagement from '../pages/admin/UserManagement'
import UserDetails from '../pages/admin/UserDetails'
import PendingApprovals from '../pages/admin/PendingApprovals'
import ApprovalDetails from '../pages/admin/ApprovalDetails'
import Reports from '../pages/admin/Reports'
import AdminSettings from '../pages/admin/Settings'
import CreateAdmin from '../pages/admin/CreateAdmin'
import DisasterToggle from '../pages/admin/DisasterToggle'

// Loading Component
import LoadingSpinner from '../components/shared/LoadingSpinner'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// Public Only Route (redirect if authenticated)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'donor':
        return <Navigate to="/donor/dashboard" replace />
      case 'hospital':
        return <Navigate to="/hospital/dashboard" replace />
      case 'bloodbank':
        return <Navigate to="/bloodbank/dashboard" replace />
      case 'admin':
      case 'super_admin':
        return <Navigate to="/admin/dashboard" replace />
      default:
        return <Navigate to="/" replace />
    }
  }

  return children
}

const AppRouter = () => {
  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}
      <Route path="/" element={<Home />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Auth Routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-login-otp" element={<VerifyLoginOTP />} />
        
        {/* Registration Routes */}
        <Route path="/register/donor" element={
          <PublicOnlyRoute>
            <DonorRegister />
          </PublicOnlyRoute>
        } />
        <Route path="/register/hospital" element={
          <PublicOnlyRoute>
            <HospitalRegister />
          </PublicOnlyRoute>
        } />
        <Route path="/register/bloodbank" element={
          <PublicOnlyRoute>
            <BloodBankRegister />
          </PublicOnlyRoute>
        } />
        <Route path="/register/blood-bank" element={
          <PublicOnlyRoute>
            <BloodBankRegister />
          </PublicOnlyRoute>
        } />
      </Route>

      {/* ========== PROTECTED ROUTES WITH DASHBOARD LAYOUT ========== */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        
        {/* Common Routes (All authenticated users) */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/settings" element={<CommonSettings />} />

        {/* ========== DONOR ROUTES ========== */}
        <Route path="/donor">
          <Route index element={<Navigate to="/donor/dashboard" replace />} />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorDashboard />
            </ProtectedRoute>
          } />
          <Route path="requests" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorRequests />
            </ProtectedRoute>
          } />
          <Route path="requests/:id" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <RequestDetails />
            </ProtectedRoute>
          } />
          <Route path="accepted-requests" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <AcceptedRequests />
            </ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonationHistory />
            </ProtectedRoute>
          } />
          <Route path="map" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <MapView />
            </ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorProfile />
            </ProtectedRoute>
          } />
        </Route>

        {/* ========== HOSPITAL ROUTES ========== */}
        <Route path="/hospital">
          <Route index element={<Navigate to="/hospital/dashboard" replace />} />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['hospital']}>
              <HospitalDashboard />
            </ProtectedRoute>
          } />
          <Route path="requests" element={
            <ProtectedRoute allowedRoles={['hospital']}>
              <HospitalRequests />
            </ProtectedRoute>
          } />
          <Route path="requests/:requestId/responses" element={
            <ProtectedRoute allowedRoles={['hospital']}>
              <RequestResponses />
            </ProtectedRoute>
          } />
          <Route path="create-request" element={
            <ProtectedRoute allowedRoles={['hospital']}>
              <CreateRequest />
            </ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute allowedRoles={['hospital']}>
              <HospitalHistory />
            </ProtectedRoute>
          } />
          <Route path="donation/:donationId" element={
            <ProtectedRoute allowedRoles={['hospital']}>
              <DonationDetails />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute allowedRoles={['hospital']}>
              <HospitalProfile />
            </ProtectedRoute>
          } />
          <Route path="disaster-toggle" element={
            <ProtectedRoute allowedRoles={['hospital']}>
              <HospitalDisasterToggle />
            </ProtectedRoute>
          } />
        </Route>

        {/* ========== BLOOD BANK ROUTES ========== */}
        <Route path="/bloodbank">
          <Route index element={<Navigate to="/bloodbank/dashboard" replace />} />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['bloodbank']}>
              <BloodBankDashboard />
            </ProtectedRoute>
          } />
          <Route path="inventory" element={
            <ProtectedRoute allowedRoles={['bloodbank']}>
              <InventoryManagement />
            </ProtectedRoute>
          } />
          <Route path="inventory/history" element={
            <ProtectedRoute allowedRoles={['bloodbank']}>
              <InventoryHistory />
            </ProtectedRoute>
          } />
          <Route path="requests" element={
            <ProtectedRoute allowedRoles={['bloodbank']}>
              <PendingRequests />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['bloodbank']}>
              <BloodBankReports />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute allowedRoles={['bloodbank']}>
              <BloodBankProfile />
            </ProtectedRoute>
          } />
        </Route>

        {/* ========== ADMIN ROUTES ========== */}
        <Route path="/admin">
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="users/:userId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <UserDetails />
            </ProtectedRoute>
          } />
          <Route path="pending-approvals" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <PendingApprovals />
            </ProtectedRoute>
          } />
          <Route path="approval-details/:userId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ApprovalDetails />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="create-admin" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <CreateAdmin />
            </ProtectedRoute>
          } />
          <Route path="disaster-toggle" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DisasterToggle />
            </ProtectedRoute>
          } />
        </Route>

      </Route>

      {/* ========== 404 NOT FOUND ========== */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}

export default AppRouter
