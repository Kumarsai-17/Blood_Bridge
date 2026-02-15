import { useState, useEffect } from 'react'
import { Search, Filter, CheckCircle, Package, Mail, Phone, ShieldCheck, Activity, AlertCircle, Clock, Info, Building, RefreshCcw } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { getCompatibleDonors, getAvailableCompatibleBlood } from '../../utils/bloodCompatibility'
import { Button, Card, CardContent, Badge, Input } from '../../components/ui/core'

const PendingRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [inventory, setInventory] = useState({})
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showFulfillModal, setShowFulfillModal] = useState(false)
  const [selectedBloodTypes, setSelectedBloodTypes] = useState({})

  useEffect(() => {
    fetchRequests()
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await api.get('/bloodbank/inventory')
      const inventoryMap = {}
      response.data.forEach(item => {
        inventoryMap[item.bloodGroup] = item.unitsAvailable
      })
      setInventory(inventoryMap)
    } catch (error) {
      console.error('Failed to load inventory:', error)
    }
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bloodbank/requests')
      setRequests(response.data)
    } catch (error) {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const handleFulfill = async (requestId) => {
    try {
      const totalSelected = Object.values(selectedBloodTypes).reduce((sum, units) => sum + units, 0)
      if (totalSelected !== selectedRequest.units) {
        toast.error(`Required: ${selectedRequest.units} units. Currently allocated: ${totalSelected}`)
        return
      }

      const bloodTypesToUse = Object.entries(selectedBloodTypes)
        .filter(([_, units]) => units > 0)
        .map(([bloodGroup, units]) => ({ bloodGroup, units }))

      if (bloodTypesToUse.length === 0) {
        toast.error('Please allocate blood types')
        return
      }

      const response = await api.post('/bloodbank/fulfill', {
        requestId,
        bloodTypesToUse
      })

      if (response.data.usedBloodTypes && response.data.usedBloodTypes.length > 0) {
        const bloodTypesUsed = response.data.usedBloodTypes
          .map(bt => `${bt.bloodGroup} (${bt.units} units)`)
          .join(', ')
        toast.success(`Request fulfilled! Used: ${bloodTypesUsed}`, { duration: 5000 })
      } else {
        toast.success('Request fulfilled successfully')
      }

      setShowFulfillModal(false)
      setSelectedRequest(null)
      setSelectedBloodTypes({})
      fetchRequests()
      fetchInventory()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fulfill request')
    }
  }

  const openFulfillModal = (request) => {
    setSelectedRequest(request)
    setShowFulfillModal(true)
    const compatibleTypes = getCompatibleDonors(request.bloodGroup)
    const initialSelection = {}
    compatibleTypes.forEach(type => {
      initialSelection[type] = 0
    })
    if (inventory[request.bloodGroup] >= request.units) {
      initialSelection[request.bloodGroup] = request.units
    }
    setSelectedBloodTypes(initialSelection)
  }

  const closeFulfillModal = () => {
    setShowFulfillModal(false)
    setSelectedRequest(null)
    setSelectedBloodTypes({})
  }

  const handleBloodTypeSelection = (bloodType, units) => {
    const maxAvailable = inventory[bloodType] || 0
    const validUnits = Math.max(0, Math.min(units, maxAvailable))
    setSelectedBloodTypes(prev => ({ ...prev, [bloodType]: validUnits }))
  }

  const getTotalSelected = () => {
    return Object.values(selectedBloodTypes).reduce((sum, units) => sum + units, 0)
  }

  const filteredRequests = requests.filter(request => {
    if (filter !== 'all' && request.urgency !== filter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        request.bloodGroup.toLowerCase().includes(searchLower) ||
        request.hospital?.name.toLowerCase().includes(searchLower) ||
        request.hospital?.email.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const getUrgencyBadgeVariant = (urgency) => {
    switch (urgency) {
      case 'high': return 'destructive'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading requests...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-soft-lg border border-blue-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Requests</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Review and fulfill blood requests from hospitals and medical facilities.
            </p>
          </div>
          <Button onClick={fetchRequests} variant="outline" className="flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Requests", value: requests.length, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "High Priority", value: requests.filter(r => r.urgency === 'high').length, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
          { title: "Medium Priority", value: requests.filter(r => r.urgency === 'medium').length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Low Priority", value: requests.filter(r => r.urgency === 'low').length, icon: Info, color: "text-green-600", bg: "bg-green-50" }
        ].map((stat, index) => (
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by blood type, hospital name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex gap-2">
                {['all', 'high', 'medium', 'low'].map(u => (
                  <button
                    key={u}
                    onClick={() => setFilter(u)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === u
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {u.charAt(0).toUpperCase() + u.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-6">
        {filteredRequests.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-500">All requests have been processed.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const availableBlood = getAvailableCompatibleBlood(inventory, request.bloodGroup)
            return (
              <Card key={request._id} className="hover:shadow-soft-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                          <span className="text-xl font-bold text-red-600">{request.bloodGroup}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{request.hospital?.name}</h3>
                            <Badge variant={getUrgencyBadgeVariant(request.urgency)}>
                              {request.urgency}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" /> {request.hospital?.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" /> {request.hospital?.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Units Needed</div>
                          <div className="text-base font-bold text-gray-900">{request.units} units</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Available</div>
                          <div className={`text-base font-bold ${availableBlood.canFulfill ? 'text-green-600' : 'text-red-600'}`}>
                            {availableBlood.totalUnits} units
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Requested</div>
                          <div className="text-base font-bold text-gray-900 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Status</div>
                          <div>
                            {availableBlood.canFulfill ? (
                              <Badge variant="success">
                                <CheckCircle className="w-3 h-3 mr-1" /> Available
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="w-3 h-3 mr-1" /> Insufficient
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-fit">
                      <Button
                        onClick={() => openFulfillModal(request)}
                        disabled={!availableBlood.canFulfill}
                        className={`w-full lg:w-auto ${!availableBlood.canFulfill && 'opacity-50 cursor-not-allowed'}`}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Fulfill Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Fulfill Modal */}
      {showFulfillModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeFulfillModal}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Fulfill Request</h2>
                  </div>
                  <p className="text-sm text-gray-500">Allocate blood units for {selectedRequest.hospital?.name}</p>
                </div>
                <button onClick={closeFulfillModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500 mb-2">Request Details</div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-red-600">{selectedRequest.bloodGroup}</span>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-gray-900">{selectedRequest.units} units</div>
                        <div className="text-xs text-gray-500">{selectedRequest.urgency} priority</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500 mb-2">Hospital</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{selectedRequest.hospital?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Allocate Blood Types
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {getCompatibleDonors(selectedRequest.bloodGroup).map(bloodType => {
                    const available = inventory[bloodType] || 0
                    const isExactMatch = bloodType === selectedRequest.bloodGroup
                    const selected = selectedBloodTypes[bloodType] || 0
                    return (
                      <div key={bloodType} className={`p-4 rounded-xl border-2 transition-all ${available > 0 ? 'bg-white border-gray-200 hover:border-blue-300' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${available > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                              {bloodType}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-700">Blood Type {bloodType}</span>
                                {isExactMatch && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Exact Match</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{available} units available</div>
                            </div>
                          </div>
                          {available > 0 && (
                            <div className="flex items-center gap-3">
                              <Input
                                type="number"
                                min="0"
                                max={available}
                                value={selected || ''}
                                onChange={(e) => handleBloodTypeSelection(bloodType, parseInt(e.target.value) || 0)}
                                className="w-24 text-center"
                                placeholder="0"
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleBloodTypeSelection(bloodType, Math.min(available, selectedRequest.units - getTotalSelected() + selected))}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
                                >
                                  Max
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleBloodTypeSelection(bloodType, 0)}
                                  className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded hover:bg-gray-300 transition-colors"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Total Allocated</div>
                    <div className="text-2xl font-bold text-gray-900">{getTotalSelected()} / {selectedRequest.units} units</div>
                  </div>
                  {getTotalSelected() === selectedRequest.units ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">Ready to Fulfill</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg">
                      <Info className="w-5 h-5" />
                      <span className="text-sm font-semibold">Adjust Allocation</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-500">All inventory updates are synchronized globally</p>
              <div className="flex gap-3">
                <Button onClick={closeFulfillModal} variant="outline">Cancel</Button>
                <Button
                  onClick={() => handleFulfill(selectedRequest._id)}
                  disabled={getTotalSelected() !== selectedRequest.units}
                  className={getTotalSelected() !== selectedRequest.units ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Fulfill Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingRequests
