import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Mail, Phone, Shield, CheckCircle, Calendar, Building, RefreshCcw, Droplet, Download, FileText, MapPin } from 'lucide-react'
import api from '../../services/api'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const UserDetails = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/users/${userId}`)
      console.log('User details received:', response.data.data)
      setUser(response.data.data)
    } catch (error) {
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Failed to load user details' })
    } finally {
      setLoading(false)
    }
  }

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
      case 'admin': return <Shield className="w-4 h-4" />
      case 'super_admin': return <Shield className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading user details...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-600 text-lg mb-4">User not found</p>
        <Button onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Back Button */}
      <Button 
        onClick={() => navigate('/admin/users')} 
        variant="outline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </Button>

      {/* Header Card */}
      <Card className="shadow-soft-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <Badge className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit`}>
                {getRoleIcon(user.role)}
                {user.role.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="shadow-soft-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem icon={<Mail className="w-5 h-5 text-blue-600" />} label="Email" value={user.email} />
            <InfoItem icon={<Phone className="w-5 h-5 text-blue-600" />} label="Phone" value={user.phone} />
            <InfoItem icon={<Calendar className="w-5 h-5 text-blue-600" />} label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
            {user.state && (
              <InfoItem 
                icon={<MapPin className="w-5 h-5 text-blue-600" />} 
                label="State" 
                value={user.state} 
              />
            )}
            {user.city && (
              <InfoItem 
                icon={<MapPin className="w-5 h-5 text-blue-600" />} 
                label="City/District" 
                value={user.city} 
              />
            )}
            {user.location && user.location.lat && user.location.lng && (
              <InfoItem 
                icon={<MapPin className="w-5 h-5 text-blue-600" />} 
                label="GPS Coordinates" 
                value={`${user.location.lat.toFixed(4)}, ${user.location.lng.toFixed(4)}`} 
              />
            )}
            <InfoItem 
              icon={<CheckCircle className={`w-5 h-5 ${user.isApproved ? 'text-green-500' : 'text-amber-500'}`} />} 
              label="Approval Status" 
              value={user.isApproved ? 'Approved' : 'Pending'} 
              valueClass={user.isApproved ? 'text-green-600' : 'text-amber-600'} 
            />
            <InfoItem 
              icon={<Shield className={`w-5 h-5 ${user.isActive !== false ? 'text-green-500' : 'text-red-500'}`} />} 
              label="Account Status" 
              value={user.isActive !== false ? 'Active' : 'Deactivated'} 
              valueClass={user.isActive !== false ? 'text-green-600' : 'text-red-600'} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Donor Information */}
      {user.role === 'donor' && (
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-soft-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-600" />
              Donor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-red-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Blood Group</p>
                <p className="text-3xl font-bold text-red-600">{user.bloodGroup}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-red-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Donations</p>
                <p className="text-3xl font-bold text-blue-600">{user.totalDonations || 0}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-red-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Status</p>
                <p className="text-xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Information */}
      {(user.role === 'admin' || user.role === 'super_admin') && (
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-soft-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Admin Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.role === 'admin' && (
                <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assigned Region</p>
                  <p className="text-lg font-bold text-purple-600">{user.region || 'Not Set'}</p>
                </div>
              )}
              {user.role === 'super_admin' && (
                <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Access Level</p>
                  <p className="text-lg font-bold text-purple-600">All Regions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hospital Details */}
      {user.role === 'hospital' && user.hospitalDetails && (
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-soft-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Hospital Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Registration Number</p>
                <p className="text-base font-bold text-gray-900">{user.hospitalDetails.registrationNumber}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hospital Type</p>
                <p className="text-base font-bold text-gray-900">{user.hospitalDetails.hospitalType}</p>
              </div>
            </div>

            {user.hospitalDetails.licenseNumber && (
              <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">License Number</p>
                <p className="text-base font-bold text-blue-600">{user.hospitalDetails.licenseNumber}</p>
              </div>
            )}
            
            <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </p>
              <p className="text-sm text-gray-700">{user.hospitalDetails.address}</p>
            </div>

            {user.hospitalDetails.certificate && (
              <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Certificate Document
                </p>
                <a 
                  href={user.hospitalDetails.certificate} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate PDF
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Blood Bank Details */}
      {user.role === 'bloodbank' && user.bloodBankDetails && (
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100 shadow-soft-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-amber-600" />
              Blood Bank Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-white rounded-xl border border-amber-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Registration ID</p>
                <p className="text-base font-bold text-gray-900">{user.bloodBankDetails.registrationId}</p>
              </div>
              {user.bloodBankDetails.licenseNumber && (
                <div className="p-4 bg-white rounded-xl border border-amber-100 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">License Number</p>
                  <p className="text-base font-bold text-amber-600">{user.bloodBankDetails.licenseNumber}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white rounded-xl border border-amber-100 shadow-sm mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </p>
              <p className="text-sm text-gray-700">{user.bloodBankDetails.address}</p>
            </div>

            {user.bloodBankDetails.certificate && (
              <div className="p-4 bg-white rounded-xl border border-amber-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Certificate Document
                </p>
                <a 
                  href={user.bloodBankDetails.certificate} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate PDF
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Popup Modal */}
      <ConfirmModal
        isOpen={popup.show}
        onClose={() => setPopup({ ...popup, show: false })}
        onConfirm={() => setPopup({ ...popup, show: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        confirmText="OK"
        showCancel={false}
      />
    </div>
  )
}

const InfoItem = ({ icon, label, value, valueClass = 'text-gray-900' }) => (
  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
    </div>
    <p className={`text-sm font-bold ${valueClass}`}>{value || 'N/A'}</p>
  </div>
)

export default UserDetails
