import { useState, useEffect } from 'react'
import { History, Calendar, CheckCircle, XCircle, RefreshCcw, Building2, Droplet, User } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Button, Card, Badge } from '../../components/ui/core'

const InventoryHistory = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'accepted', 'cancelled'

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      // Fetch accepted and cancelled requests
      const response = await api.get('/bloodbank/requests/history')
      setRequests(response.data)
    } catch (error) {
      toast.error('Failed to load request history')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    return req.status === filter
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading history...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <History className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Request History</h1>
                  <p className="text-blue-100 text-sm mt-1">View accepted and cancelled blood requests</p>
                </div>
              </div>
            </div>
            <Button
              onClick={fetchHistory}
              className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-lg h-12 px-6 rounded-xl font-semibold"
            >
              <RefreshCcw className="w-5 h-5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          className="rounded-xl"
        >
          All Requests
        </Button>
        <Button
          onClick={() => setFilter('accepted')}
          variant={filter === 'accepted' ? 'default' : 'outline'}
          className="rounded-xl"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Accepted
        </Button>
        <Button
          onClick={() => setFilter('cancelled')}
          variant={filter === 'cancelled' ? 'default' : 'outline'}
          className="rounded-xl"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancelled
        </Button>
      </div>

      {/* Requests List */}
      <Card className="shadow-xl overflow-hidden border-0 rounded-2xl">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Request History</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredRequests.length} {filter === 'all' ? 'total' : filter} request(s)
          </p>
        </div>
        
        <div className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No requests found</p>
              <p className="text-gray-400 text-sm mt-2">
                {filter === 'all' 
                  ? 'Request history will appear here' 
                  : `No ${filter} requests yet`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request._id} className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Hospital Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{request.hospital?.name || 'Hospital'}</h3>
                          <p className="text-sm text-gray-600">{request.hospital?.location || 'Location'}</p>
                        </div>
                      </div>

                      {/* Blood Type & Units */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-red-500" />
                          <span className="font-semibold text-gray-900">{request.bloodGroup}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{request.unitsNeeded}</span> units needed
                        </div>
                        <Badge variant={request.urgency === 'critical' ? 'destructive' : 'default'}>
                          {request.urgency}
                        </Badge>
                      </div>

                      {/* Patient Info */}
                      {request.patientName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <User className="w-4 h-4" />
                          <span>Patient: {request.patientName}</span>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        {request.updatedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Updated: {new Date(request.updatedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {request.status === 'accepted' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Accepted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                          <XCircle className="w-5 h-5" />
                          <span className="font-semibold">Cancelled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default InventoryHistory
