import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Filter, Eye, Shield, Ban, CheckCircle, X, Building, Mail, Phone, Users, RefreshCcw, Droplet, Calendar, ShieldCheck, Download, MapPin } from 'lucide-react'
import api from '../../services/api'
import { Button, Card, CardContent, Input, Badge } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'
import { useAuth } from '../../context/AuthContext'

const UserManagement = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [successType, setSuccessType] = useState('success')
  const [confirmAction, setConfirmAction] = useState(null)
  const [clickPosition, setClickPosition] = useState(null)
  const [successClickPosition, setSuccessClickPosition] = useState(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId, currentStatus, event) => {
    if (event) {
      setClickPosition({ x: event.clientX, y: event.clientY })
    }
    const newStatus = !currentStatus
    const action = newStatus ? 'activate' : 'deactivate'

    setConfirmAction({ type: 'toggleStatus', userId, newStatus, action })
    setShowConfirmModal(true)
  }

  const confirmToggleStatus = async () => {
    if (!confirmAction) return

    setConfirming(true)
    try {
      await api.put(`/admin/users/${confirmAction.userId}/status`, { isActive: confirmAction.newStatus })
      setSuccessMessage(`User ${confirmAction.action}d successfully`)
      setSuccessType(confirmAction.action === 'activate' ? 'success' : 'danger')
      setShowConfirmModal(false)
      setShowSuccessModal(true)
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user status:', error)
      setShowConfirmModal(false)
    } finally {
      setConfirming(false)
    }
  }

  const handleResendCredentials = async (userId, event) => {
    if (event) {
      setClickPosition({ x: event.clientX, y: event.clientY })
    }
    setConfirmAction({ type: 'resendCredentials', userId })
    setShowConfirmModal(true)
  }

  const confirmResendCredentials = async () => {
    if (!confirmAction) return

    setConfirming(true)
    try {
      await api.post(`/admin/users/${confirmAction.userId}/resend-credentials`)
      setSuccessMessage('Credentials sent successfully')
      setSuccessType('success')
      setShowConfirmModal(false)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Failed to send credentials:', error)
      setShowConfirmModal(false)
    } finally {
      setConfirming(false)
    }
  }

  const handleConfirm = () => {
    // Store click position for success modal
    setSuccessClickPosition(clickPosition)
    
    if (confirmAction?.type === 'toggleStatus') {
      confirmToggleStatus()
    } else if (confirmAction?.type === 'resendCredentials') {
      confirmResendCredentials()
    }
  }

  const handleViewDetails = (userId) => {
    navigate(`/admin/users/${userId}`)
  }

  const closeModal = () => {
    // No longer needed
  }

  const filteredUsers = users.filter(user => {
    // Exclude super_admin from the list
    if (user.role === 'super_admin') return false
    if (filter !== 'all' && user.role !== filter) return false
    
    // Filter by status (active/deactivated)
    if (statusFilter === 'active' && user.isActive === false) return false
    if (statusFilter === 'deactivated' && user.isActive !== false) return false
    
    if (search) {
      const s = search.toLowerCase()
      return user.name.toLowerCase().includes(s) || user.email.toLowerCase().includes(s) || user.phone?.includes(s)
    }
    return true
  })

  const statsConfig = [
    { icon: Users, title: "Total Users", value: users.filter(u => u.role !== 'super_admin').length, bg: "bg-blue-50", color: "text-blue-600" },
    { icon: Droplet, title: "Donors", value: users.filter(u => u.role === 'donor').length, bg: "bg-red-50", color: "text-red-600" },
    { icon: Building, title: "Hospitals", value: users.filter(u => u.role === 'hospital').length, bg: "bg-green-50", color: "text-green-600" },
    { icon: RefreshCcw, title: "Blood Banks", value: users.filter(u => u.role === 'bloodbank').length, bg: "bg-amber-50", color: "text-amber-600" },
    { icon: ShieldCheck, title: "Admins", value: users.filter(u => u.role === 'admin').length, bg: "bg-purple-50", color: "text-purple-600" }
  ]

  const getRoleColor = (role) => {
    switch (role) {
      case 'donor': return 'bg-red-100 text-red-700'
      case 'hospital': return 'bg-blue-100 text-blue-700'
      case 'bloodbank': return 'bg-amber-100 text-amber-700'
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'super_admin': return 'bg-gray-900 text-white'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'donor': return <Droplet className="w-4 h-4" />
      case 'hospital': return <Building className="w-4 h-4" />
      case 'bloodbank': return <RefreshCcw className="w-4 h-4" />
      case 'admin': return <ShieldCheck className="w-4 h-4" />
      case 'super_admin': return <Shield className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Location Filter Notice for Regional Admins */}
      {user?.role === 'admin' && user?.city && user?.state && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Showing data only for {user.city}, {user.state}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              As a regional admin, you can only view and manage users from your assigned location.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>
        <p className="text-gray-600 max-w-2xl">
          Manage all system users, view details, and control access permissions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="hover:shadow-soft-lg transition-all">
            <CardContent className="p-6">
              <div className={`p-3 rounded-xl ${stat.bg} w-fit mb-4`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <h4 className="text-3xl font-bold text-gray-900">{stat.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <Card className="shadow-soft-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-3 h-12 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all shadow-sm hover:shadow-md"
                >
                  <option value="all">All Users</option>
                  <option value="donor">Donors</option>
                  <option value="hospital">Hospitals</option>
                  <option value="bloodbank">Blood Banks</option>
                  <option value="admin">Admins</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 h-12 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all shadow-sm hover:shadow-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="deactivated">Deactivated</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <Button onClick={fetchUsers} variant="outline" className="h-12">
                <RefreshCcw className="w-4 h-4" />
              </Button>

              <Button
                onClick={async () => {
                  try {
                    const response = await api.get('/admin/export/donors', { responseType: 'blob' });
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `users-${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    setSuccessMessage('Users exported successfully');
                    setSuccessType('success');
                    setShowSuccessModal(true);
                  } catch (error) {
                    console.error('Export failed:', error);
                  }
                }}
                className="h-12"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-soft-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit`}>
                        {getRoleIcon(user.role)}
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => handleViewDetails(user._id)} variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>

                        {user.role !== 'super_admin' && (
                          <>
                            <Button
                              onClick={(e) => handleToggleStatus(user._id, user.isActive !== false, e)}
                              variant="ghost"
                              size="sm"
                              className={user.isActive !== false ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                            >
                              {(user.isActive !== false) ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>

                            {(user.role === 'hospital' || user.role === 'bloodbank') && (
                              <Button
                                onClick={(e) => handleResendCredentials(user._id, e)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Shield className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>


      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => !confirming && setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        title={confirmAction?.type === 'toggleStatus' ? 'Confirm Status Change' : 'Confirm Action'}
        message={
          confirmAction?.type === 'toggleStatus'
            ? `Are you sure you want to ${confirmAction.action} this user?`
            : 'Send new credentials to this user?'
        }
        confirmText={confirming ? "Processing..." : "Confirm"}
        cancelText="Cancel"
        type="warning"
        clickPosition={clickPosition}
        loading={confirming}
      />

      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        confirmText="OK"
        cancelText=""
        type={successType}
        clickPosition={successClickPosition}
      />
    </div>
  )
}

export default UserManagement
