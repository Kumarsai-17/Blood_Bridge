import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Users,
  Activity,
  Clock,
  CheckCircle,
  FileText,
  Droplet,
  Shield,
  Info,
  Heart,
  User
} from 'lucide-react'
import api from '../../services/api'
import { Button, Card, CardContent, Badge } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const DonationDetails = () => {
  const { donationId } = useParams()
  const navigate = useNavigate()
  const [donation, setDonation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchDonationDetails()
  }, [donationId])

  const fetchDonationDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get('/hospital/history')
      console.log('Donation history response:', response.data)
      const foundDonation = response.data.history?.find(d => d._id === donationId)
      
      if (foundDonation) {
        setDonation(foundDonation)
      } else {
        setPopup({ show: true, type: 'error', title: 'Not Found', message: 'Donation record not found' })
      }
    } catch (error) {
      console.error('Donation details fetch error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to load donation details'
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading donation details...</p>
      </div>
    )
  }

  if (!donation) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Donation Not Found</h3>
        <p className="text-gray-500 mb-6">The donation record you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/hospital/history')} variant="primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Back Button */}
      <Button 
        onClick={() => navigate('/hospital/history')} 
        variant="outline"
        size="sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to History
      </Button>

      {/* Header Card */}
      <Card className="shadow-soft-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Donation Completed</h1>
                <p className="text-sm text-gray-600 mb-2">Successfully recorded blood donation</p>
                <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit text-xs">
                  <Heart className="w-3.5 h-3.5" />
                  VERIFIED DONATION
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Donation Date</div>
              <div className="text-lg font-bold text-gray-900">
                {new Date(donation.date).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">
                {new Date(donation.date).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blood & Units Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-soft-lg border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center border-2 border-red-200 shadow-md">
                <Droplet className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Blood Group</div>
                <div className="text-4xl font-bold text-red-600">{donation.bloodGroup}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200 shadow-md">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Units Collected</div>
                <div className="text-4xl font-bold text-blue-600">{donation.units}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donor Information */}
      <Card className="shadow-soft-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Donor Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Donor Name</p>
              </div>
              <p className="text-base font-bold text-gray-900">{donation.donorName}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-4 h-4 text-red-600" />
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Blood Type</p>
              </div>
              <p className="text-base font-bold text-red-600">{donation.bloodGroup}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Timeline */}
      <Card className="shadow-soft-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Donation Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Donation Date</div>
                <div className="text-base font-bold text-gray-900">
                  {new Date(donation.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Time of Donation</div>
                <div className="text-base font-bold text-gray-900">
                  {new Date(donation.date).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {donation.donatedAt && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recorded At</div>
                  <div className="text-base font-bold text-gray-900">
                    {new Date(donation.donatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      {donation.notes && (
        <Card className="shadow-soft-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Additional Notes
            </h3>
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 leading-relaxed">{donation.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Card */}
      <Card className="shadow-soft-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center border-2 border-green-200 shadow-md">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-green-900 mb-1">Donation Successfully Completed</h4>
              <p className="text-sm text-green-700">This donation has been verified and recorded in the system. Thank you for saving lives!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-4">
        <Shield className="w-4 h-4 text-blue-600" />
        <span>All donation records are securely stored and encrypted</span>
      </div>

      {/* Popup Modal */}
      <ConfirmModal
        isOpen={popup.show}
        onClose={() => {
          setPopup({ ...popup, show: false })
          if (popup.type === 'error') {
            navigate('/hospital/history')
          }
        }}
        onConfirm={() => {
          setPopup({ ...popup, show: false })
          if (popup.type === 'error') {
            navigate('/hospital/history')
          }
        }}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        confirmText="OK"
        showCancel={false}
      />
    </div>
  )
}

export default DonationDetails
