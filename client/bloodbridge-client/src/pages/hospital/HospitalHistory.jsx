import {
  Calendar,
  Users,
  Activity,
  Clock,
  CheckCircle,
  FileText,
  Download,
  ChevronRight
} from 'lucide-react'
import api from '../../services/api'
import { Card, CardContent, Button } from '../../components/ui/core'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../components/shared/ConfirmModal'

const HospitalHistory = () => {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await api.get('/hospital/history')
      console.log('History response:', response.data)
      setHistory(response.data.history || [])
    } catch (error) {
      console.error('History fetch error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to load donation history. Please try again.'
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (donationId) => {
    navigate(`/hospital/donation/${donationId}`)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Donor Name', 'Blood Group', 'Units', 'Notes'].join(','),
      ...history.map(donation => [
        new Date(donation.date).toLocaleDateString(),
        donation.donorName,
        donation.bloodGroup,
        donation.units,
        `"${donation.notes || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donation-history-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading history...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Donation History</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Complete record of all blood donations received at your facility.
            </p>
          </div>
          {history.length > 0 && (
            <Button
              onClick={exportHistory}
              variant="outline"
              className="w-full md:w-auto"
            >
              <Download className="w-5 h-5 mr-2" />
              Export History
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-soft-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Total Donations</p>
              <h4 className="text-3xl font-bold text-gray-900">{history.length}</h4>
            </CardContent>
          </Card>
          <Card className="shadow-soft-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-red-100">
                  <Activity className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Total Units</p>
              <h4 className="text-3xl font-bold text-gray-900">{history.reduce((sum, d) => sum + d.units, 0)}</h4>
            </CardContent>
          </Card>
          <Card className="shadow-soft-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Unique Donors</p>
              <h4 className="text-3xl font-bold text-gray-900">{new Set(history.map(d => d.donorId)).size}</h4>
            </CardContent>
          </Card>
          <Card className="shadow-soft-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gray-100">
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Latest</p>
              <h4 className="text-lg font-bold text-gray-900">{new Date(history[0].date).toLocaleDateString()}</h4>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Table */}
      {history.length === 0 ? (
        <Card className="text-center py-24 shadow-soft-lg">
          <CardContent>
            <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No History Yet</h3>
            <p className="text-gray-500 text-sm">No completed donations have been recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-soft-lg hover:shadow-xl transition-all">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Donation Records</h2>
            <p className="text-sm text-gray-500 mt-1">Detailed history of all donations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Donor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Blood & Units</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((donation) => (
                  <tr key={donation._id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {new Date(donation.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs font-medium text-gray-500">
                            {new Date(donation.date).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{donation.donorName}</div>
                          <div className="text-xs font-medium text-gray-500">Verified Donor</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center border border-red-100 shadow-sm">
                          <span className="text-xl font-bold text-red-600">{donation.bloodGroup}</span>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{donation.units} Units</div>
                          <div className="text-xs font-medium text-gray-500">Collected</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-sm font-medium text-gray-600 max-w-xs line-clamp-2">
                        {donation.notes || 'No notes'}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button
                        onClick={() => handleViewDetails(donation._id)}
                        className="p-3 bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default HospitalHistory
