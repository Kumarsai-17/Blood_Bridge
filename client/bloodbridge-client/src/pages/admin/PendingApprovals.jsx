import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, Clock, Building, Building2, Eye, FileText, MapPin, User, Phone, Mail, Calendar, Shield, Download, ExternalLink, Image, File, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'
import { useAuth } from '../../context/AuthContext'

const PendingApprovals = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/pending-approvals')
      setPendingUsers(response.data.data)
    } catch (error) {
      toast.error('Failed to load pending approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (user) => {
    navigate(`/admin/approval-details/${user._id}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading pending approvals...</p>
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
              As a regional admin, you can only view and manage approvals from your assigned location.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Review and approve new user registrations for hospitals and blood banks.
            </p>
          </div>
          <Button
            onClick={fetchPendingApprovals}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Total Pending", value: pendingUsers.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Hospitals", value: pendingUsers.filter(u => u.role === 'hospital').length, icon: Building, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Blood Banks", value: pendingUsers.filter(u => u.role === 'bloodbank').length, icon: Building2, color: "text-red-600", bg: "bg-red-50" }
        ].map((stat, index) => (
          <Card key={index} className="hover:shadow-soft-lg transition-all">
            <CardContent className="p-6">
              <div className={`p-3 rounded-xl ${stat.bg} w-fit mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <h4 className="text-3xl font-bold text-gray-900">{stat.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approvals List */}
      {pendingUsers.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No pending approvals at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl shadow-soft-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Organization</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Registration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Submitted</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingUsers.map((user) => (
                  <tr key={user._id} className="group hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${user.role === 'hospital' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                          {user.role === 'hospital' ? <Building className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role === 'hospital' ? 'default' : 'error'}>
                        {user.role === 'hospital' ? 'Hospital' : 'Blood Bank'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.role === 'hospital'
                          ? (user.hospitalDetails?.registrationNumber || 'N/A')
                          : (user.bloodBankDetails?.registrationId || 'N/A')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => handleViewDetails(user)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 ml-auto"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default PendingApprovals

