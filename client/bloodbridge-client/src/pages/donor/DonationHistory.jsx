import { useState, useEffect } from 'react'
import { Calendar, Heart, MapPin, Building, Award, Clock, Droplet, Zap, History, Star, ChevronRight, Activity, ShieldCheck, Target, Award as AwardIcon, XCircle } from 'lucide-react'
import api from '../../services/api'
import { PageHeader, StatCard } from '../../components/shared/DashboardComponents'
import ConfirmModal from '../../components/shared/ConfirmModal'

const DonationHistory = () => {
  const [history, setHistory] = useState([])
  const [cancelledRequests, setCancelledRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })
  const [activeTab, setActiveTab] = useState('completed') // 'completed' or 'cancelled'
  const [cancelledFilter, setCancelledFilter] = useState('all') // 'all', 'donor', 'hospital'
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalUnits: 0,
    livesSaved: 0,
    firstDonation: null,
    lastDonation: null,
    cancelledCount: 0,
    cancelledByDonor: 0,
    cancelledByHospital: 0
  })

  useEffect(() => {
    fetchDonationHistory()
  }, [])

  const fetchDonationHistory = async () => {
    try {
      setLoading(true)
      const [historyRes, acceptedRes] = await Promise.all([
        api.get('/donor/history'),
        api.get('/donor/accepted-requests')
      ])
      
      setHistory(historyRes.data.history || [])
      
      // Filter cancelled requests from accepted requests
      const cancelled = acceptedRes.data.acceptedRequests?.filter(r => r.status === 'cancelled') || []
      setCancelledRequests(cancelled)
      
      calculateStats(historyRes.data.history || [], cancelled)
    } catch (error) {
      console.error('Donation history fetch error:', error)
      setPopup({ show: true, type: 'error', title: 'Load Failed', message: 'Failed to load donation history. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (donations, cancelled = []) => {
    const cancelledByDonor = cancelled.filter(r => r.cancelledBy === 'donor').length
    const cancelledByHospital = cancelled.filter(r => r.cancelledBy === 'hospital').length
    
    if (donations.length === 0) {
      setStats({
        totalDonations: 0,
        totalUnits: 0,
        livesSaved: 0,
        firstDonation: null,
        lastDonation: null,
        cancelledCount: cancelled.length,
        cancelledByDonor: cancelledByDonor,
        cancelledByHospital: cancelledByHospital
      })
      return
    }

    const totalUnits = donations.reduce((sum, donation) => sum + (donation.units || 1), 0)
    const sortedDates = donations.map(d => new Date(d.date)).sort((a, b) => a - b)

    setStats({
      totalDonations: donations.length,
      totalUnits: totalUnits,
      livesSaved: totalUnits * 3,
      firstDonation: sortedDates[0],
      lastDonation: sortedDates[sortedDates.length - 1],
      cancelledCount: cancelled.length,
      cancelledByDonor: cancelledByDonor,
      cancelledByHospital: cancelledByHospital
    })
  }

  const getAchievementLevel = (donations) => {
    if (donations >= 20) return { level: 'Transcendent', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: '💎', gradient: 'from-purple-500 to-indigo-600' }
    if (donations >= 10) return { level: 'Pillar', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: '👑', gradient: 'from-rose-500 to-red-600' }
    if (donations >= 5) return { level: 'Guardian', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: '🛡️', gradient: 'from-blue-500 to-indigo-600' }
    if (donations >= 1) return { level: 'Initiate', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: '✨', gradient: 'from-emerald-500 to-teal-600' }
    return { level: 'Candidate', color: 'bg-slate-50 text-slate-700 border-slate-100', icon: '🌟', gradient: 'from-slate-400 to-slate-600' }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-14 h-14 border-t-4 border-rose-600 border-r-4 border-transparent rounded-full animate-spin mb-6 shadow-2xl shadow-rose-100"></div>
        <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Impact Ledger...</p>
      </div>
    )
  }

  const achievement = getAchievementLevel(stats.totalDonations)

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <History className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Donation History</h1>
            </div>
            <p className="text-blue-50 text-base max-w-2xl">
              View your complete donation history and track your impact
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-semibold">Verified</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={Droplet}
          title="Total Units"
          value={`${stats.totalUnits}`}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          trend="Blood Donated"
        />
        <StatCard
          icon={Heart}
          title="Lives Saved"
          value={stats.livesSaved}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend="Estimated Impact"
        />
        <StatCard
          icon={Activity}
          title="Total Donations"
          value={stats.totalDonations}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          trend="Completed"
        />
        <StatCard
          icon={XCircle}
          title="Cancelled"
          value={stats.cancelledCount}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend="Requests"
        />
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 ${achievement.color}`}>
              {achievement.icon}
            </div>
          </div>
          <h3 className="text-xs font-semibold text-gray-500 mb-1">Achievement Level</h3>
          <div className="text-2xl font-bold text-gray-900">{achievement.level}</div>
        </div>
      </div>

      {/* History Table */}
      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-md">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <History className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Donations Yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Start your donation journey by responding to blood requests in your area.</p>
          <button
            onClick={() => window.location.href = '/donor/dashboard'}
            className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
          >
            Find Requests
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden h-full">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Donation Records</h2>
                    <p className="text-sm text-gray-600 mt-1">Complete history of your donations</p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-semibold text-gray-900">
                    {activeTab === 'completed' ? history.length : cancelledRequests.length} Records
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'completed'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Completed ({history.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'cancelled'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Cancelled ({cancelledRequests.length})
                  </button>
                </div>

                {/* Cancelled Filter */}
                {activeTab === 'cancelled' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setCancelledFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        cancelledFilter === 'all'
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All ({cancelledRequests.length})
                    </button>
                    <button
                      onClick={() => setCancelledFilter('donor')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        cancelledFilter === 'donor'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      By Me ({stats.cancelledByDonor})
                    </button>
                    <button
                      onClick={() => setCancelledFilter('hospital')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        cancelledFilter === 'hospital'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      By Hospital ({stats.cancelledByHospital})
                    </button>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                {activeTab === 'completed' ? (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hospital</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Blood Type</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {history.map((donation) => (
                        <tr key={donation._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center border border-red-100 shrink-0">
                                <Calendar className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {new Date(donation.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(donation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-sm font-medium text-gray-700">{donation.hospitalName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold">
                              {donation.bloodGroup}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hospital</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Blood Type</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Cancelled By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {cancelledRequests.filter(r => {
                        if (cancelledFilter === 'all') return true
                        return r.cancelledBy === cancelledFilter
                      }).length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <XCircle className="w-12 h-12 text-gray-300" />
                              <p className="text-gray-500 text-sm">
                                {cancelledFilter === 'all' 
                                  ? 'No cancelled requests' 
                                  : cancelledFilter === 'donor'
                                  ? 'No requests cancelled by you'
                                  : 'No requests cancelled by hospital'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        cancelledRequests.filter(r => {
                          if (cancelledFilter === 'all') return true
                          return r.cancelledBy === cancelledFilter
                        }).map((request) => (
                          <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100 shrink-0">
                                  <Calendar className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {new Date(request.cancelledAt || request.respondedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(request.cancelledAt || request.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-sm font-medium text-gray-700">{request.request?.hospital?.name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold">
                                {request.request?.bloodGroup || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                                request.cancelledBy === 'donor' 
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                  : 'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                {request.cancelledBy === 'donor' ? 'By Me' : 'By Hospital'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Stats Summary */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Donation Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">First Donation</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.firstDonation ? new Date(stats.firstDonation).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Latest Donation</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.lastDonation ? new Date(stats.lastDonation).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm text-blue-700 font-semibold">Total Impact</span>
                  <span className="text-sm font-bold text-blue-900">{stats.livesSaved} Lives</span>
                </div>
              </div>
            </div>

            {/* Achievement Milestones */}
            <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-md border border-red-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-red-600" />
                Milestones
              </h3>
              <div className="space-y-4">
                {[
                  { target: 1, title: "First Donation", icon: "🎯", color: "emerald" },
                  { target: 5, title: "Regular Donor", icon: "⭐", color: "blue" },
                  { target: 10, title: "Dedicated Donor", icon: "💎", color: "purple" },
                  { target: 20, title: "Hero Donor", icon: "👑", color: "amber" }
                ].map((milestone) => {
                  const completed = stats.totalDonations >= milestone.target
                  const progress = Math.min((stats.totalDonations / milestone.target) * 100, 100)
                  return (
                    <div key={milestone.target} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{milestone.icon}</span>
                          <span className="text-sm font-semibold text-gray-700">{milestone.title}</span>
                        </div>
                        <span className={`text-xs font-bold ${completed ? 'text-green-600' : 'text-gray-500'}`}>
                          {completed ? '✓ Achieved' : `${stats.totalDonations}/${milestone.target}`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            completed 
                              ? `bg-${milestone.color}-500` 
                              : 'bg-gray-300'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
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

export default DonationHistory