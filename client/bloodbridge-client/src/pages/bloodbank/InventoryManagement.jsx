
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Package, AlertTriangle, Droplet, Activity, RefreshCcw, Minus } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import BloodTypeSelector from '../../components/shared/BloodTypeSelector'
import { Button, Card, CardContent, Badge, Input } from '../../components/ui/core'
import ConfirmModal from '../../components/shared/ConfirmModal'

const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updatingItem, setUpdatingItem] = useState(null)
  const [newUnitsValue, setNewUnitsValue] = useState(0)
  const [updatePopupPosition, setUpdatePopupPosition] = useState(null)
  const [formData, setFormData] = useState({
    bloodGroup: '',
    unitsAvailable: 0
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bloodbank/inventory')
      setInventory(response.data)
    } catch (error) {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.unitsAvailable < 0) {
      toast.error('Units cannot be negative')
      return
    }

    try {
      // Always use POST to add/update inventory
      await api.post('/bloodbank/inventory', {
        bloodGroup: formData.bloodGroup,
        unitsAvailable: formData.unitsAvailable
      })
      
      const existingItem = inventory.find(i => i.bloodGroup === formData.bloodGroup)
      toast.success(existingItem ? 'Inventory updated successfully' : 'Blood group added to inventory')

      fetchInventory()
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = (item, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
      
      const rect = event.currentTarget.getBoundingClientRect()
      
      setUpdatePopupPosition({
        top: rect.top + window.scrollY - 494 // Push UP by 13cm (494px towards top)
      })
    }
    
    if (!item) {
      toast.error('Invalid blood type')
      return
    }
    
    setUpdatingItem(item)
    setNewUnitsValue(item.unitsAvailable)
    setShowUpdateModal(true)
  }

  const handleReduceUnit = () => {
    if (newUnitsValue > 0) {
      setNewUnitsValue(newUnitsValue - 1)
    }
  }

  const handleAddUnit = () => {
    setNewUnitsValue(newUnitsValue + 1)
  }

  const confirmUpdate = async () => {
    if (!updatingItem) {
      toast.error('No blood type selected')
      return
    }

    if (newUnitsValue < 0) {
      toast.error('Units cannot be negative')
      return
    }

    try {
      await api.post('/bloodbank/inventory', {
        bloodGroup: updatingItem.bloodGroup,
        unitsAvailable: newUnitsValue
      })
      
      const diff = newUnitsValue - updatingItem.unitsAvailable
      if (diff > 0) {
        toast.success(`Added ${diff} units to ${updatingItem.bloodGroup}`)
      } else if (diff < 0) {
        toast.success(`Reduced ${Math.abs(diff)} units from ${updatingItem.bloodGroup}`)
      } else {
        toast.success('No changes made')
      }
      
      // Close modal first
      setShowUpdateModal(false)
      setUpdatingItem(null)
      setNewUnitsValue(0)
      
      // Then refresh inventory
      await fetchInventory()
    } catch (error) {
      console.error('Update error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update units'
      toast.error(errorMsg)
      
      // Close modal even on error
      setShowUpdateModal(false)
      setUpdatingItem(null)
    }
  }

  const resetForm = () => {
    setFormData({ bloodGroup: '', unitsAvailable: 0 })
    setEditingItem(null)
    setShowAddModal(false)
    setShowUpdateModal(false)
    setUpdatingItem(null)
    setNewUnitsValue(0)
    setUpdatePopupPosition(null)
  }

  const getStockBadgeVariant = (units) => {
    if (units === 0) return 'destructive'
    if (units < 5) return 'warning'
    if (units < 10) return 'royal'
    return 'success'
  }

  const getStockStatusText = (units) => {
    if (units === 0) return 'Out of Stock'
    if (units < 5) return 'Critical'
    if (units < 10) return 'Low Stock'
    return 'In Stock'
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading inventory...</p>
      </div>
    )
  }

  const totalUnits = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0)
  const lowStockCount = inventory.filter(item => item.unitsAvailable < 5 && item.unitsAvailable > 0).length
  const outOfStockCount = inventory.filter(item => item.unitsAvailable === 0).length

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Blood Inventory</h1>
                  <p className="text-blue-100 text-sm mt-1">Real-time stock management system</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-lg h-12 px-6 rounded-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Blood Type
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Modern Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            title: "Total Units", 
            value: totalUnits, 
            icon: Droplet, 
            gradient: "from-blue-500 to-blue-600",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
          },
          { 
            title: "Out of Stock", 
            value: outOfStockCount, 
            icon: AlertTriangle, 
            gradient: "from-red-500 to-red-600",
            iconBg: "bg-red-100",
            iconColor: "text-red-600"
          },
          { 
            title: "Low Stock", 
            value: lowStockCount, 
            icon: Package, 
            gradient: "from-amber-500 to-orange-600",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600"
          },
          { 
            title: "Blood Types", 
            value: inventory.length, 
            icon: Activity, 
            gradient: "from-green-500 to-emerald-600",
            iconBg: "bg-green-100",
            iconColor: "text-green-600"
          }
        ].map((stat, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
            <CardContent className="p-6 relative">
              <div className={`p-3 rounded-xl ${stat.iconBg} w-fit mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
              <h4 className="text-3xl font-bold text-gray-900">{stat.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modern Table Card */}
      <Card className="shadow-xl overflow-hidden border-0 rounded-2xl">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Inventory Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Monitor and manage blood stock levels</p>
          </div>
          <Button onClick={fetchInventory} variant="outline" size="sm" className="rounded-xl">
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Blood Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Available Units</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {bloodGroups.map((bloodGroup) => {
                const item = inventory.find(i => i.bloodGroup === bloodGroup)
                const units = item?.unitsAvailable || 0

                return (
                  <tr key={bloodGroup} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-lg font-bold text-white">{bloodGroup}</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{bloodGroup}</div>
                          <div className="text-xs text-gray-500">Blood Group</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-bold text-gray-900">{units}</div>
                        <div className="text-xs text-gray-500 font-medium">units</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={getStockBadgeVariant(units)} className="font-semibold">
                        {getStockStatusText(units)}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-600 font-medium">
                        {item?.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })
                          : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete(item || { bloodGroup, unitsAvailable: 0 }, e)
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-2"
                          title="Update units"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Update Blood Type Modal - Smaller Size */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={resetForm}></div>
          <div className="relative min-h-screen flex items-start justify-center pt-12 px-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-scale-in" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 rounded-t-2xl p-6">
                <div className="absolute inset-0 bg-white/10"></div>
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {editingItem ? 'Update Stock' : 'Add Blood Type'}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {editingItem ? `Update ${formData.bloodGroup} blood type units` : 'Select blood type and units'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!editingItem && (
                    <div className="space-y-3">
                      <label className="text-base font-bold text-gray-900 block">
                        Blood Type
                      </label>
                      <BloodTypeSelector
                        value={formData.bloodGroup}
                        onChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                        disabled={false}
                      />
                    </div>
                  )}

                  {editingItem && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-red-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-lg font-bold text-white">{formData.bloodGroup}</span>
                      </div>
                      <div>
                        <p className="text-xs text-red-600 font-semibold">Updating Stock for</p>
                        <p className="text-base font-bold text-gray-900">{formData.bloodGroup} Blood Type</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-base font-bold text-gray-900 block">
                      Units Available
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.unitsAvailable}
                      onChange={(e) => setFormData({ ...formData, unitsAvailable: parseInt(e.target.value) || 0 })}
                      className="h-16 text-2xl text-center font-bold border-2 border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition-all"
                      placeholder="0"
                      required
                      autoFocus={editingItem}
                    />
                    <p className="text-sm text-gray-500 text-center">Each unit represents 450ml of blood</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1 h-12 text-base font-semibold rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                      disabled={!editingItem && !formData.bloodGroup}
                    >
                      {editingItem ? 'Update' : 'Add'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Units Modal - Horizontally Centered, Vertically Parallel to Button */}
      {showUpdateModal && updatingItem && updatePopupPosition && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => {
            setShowUpdateModal(false)
            setUpdatingItem(null)
            setNewUnitsValue(0)
            setUpdatePopupPosition(null)
          }}></div>
          
          <div 
            className="fixed z-50 left-1/2 transform -translate-x-1/2 animate-scale-in"
            style={{
              top: `${updatePopupPosition.top}px`
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-6 w-96">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">{updatingItem.bloodGroup}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Update Units</p>
                  <p className="text-lg font-bold text-gray-900">{updatingItem.bloodGroup} Blood Type</p>
                  <p className="text-xs text-gray-500">Current: {updatingItem.unitsAvailable} units</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 block mb-3 text-center">
                  Adjust Units
                </label>
                
                <div className="flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    onClick={handleReduceUnit}
                    disabled={newUnitsValue <= 0}
                    className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-0 shadow-lg"
                  >
                    <Minus className="w-6 h-6" />
                  </Button>
                  
                  <Input
                    type="number"
                    min="0"
                    value={newUnitsValue}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0
                      if (val >= 0) {
                        setNewUnitsValue(val)
                      }
                    }}
                    className="h-16 w-28 text-3xl text-center font-bold border-2 border-blue-500 rounded-xl"
                  />
                  
                  <Button
                    type="button"
                    onClick={handleAddUnit}
                    className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center p-0 shadow-lg"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="mt-4 text-center">
                  {newUnitsValue !== updatingItem.unitsAvailable && (
                    <p className="text-sm text-gray-600">
                      Change: 
                      <span className={`font-bold ml-1 ${newUnitsValue > updatingItem.unitsAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {newUnitsValue > updatingItem.unitsAvailable ? '+' : ''}
                        {newUnitsValue - updatingItem.unitsAvailable} units
                      </span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setShowUpdateModal(false)
                    setUpdatingItem(null)
                    setNewUnitsValue(0)
                    setUpdatePopupPosition(null)
                  }}
                  variant="outline" 
                  className="flex-1 h-12 text-base rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmUpdate}
                  className="flex-1 h-12 text-base rounded-xl text-white bg-blue-600 hover:bg-blue-700"
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default InventoryManagement
