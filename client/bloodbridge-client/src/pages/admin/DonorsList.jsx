
import { useState, useEffect } from 'react'
import { Search, Download, Filter, Users, Droplet, Calendar, TrendingUp, X, ChevronLeft, ChevronRight, Mail, Phone, MapPin, Heart, Zap, Star, ShieldCheck, Activity } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Button, Card, CardContent, Input, Badge } from '../../components/ui/core'

const DonorsList = () => {
    const [loading, setLoading] = useState(true)
    const [donors, setDonors] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 })
    const [filters, setFilters] = useState({
        search: '',
        bloodGroup: '',
        status: ''
    })
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        fetchDonors()
    }, [pagination.page, filters])

    const fetchDonors = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            })

            const response = await api.get(`/admin/donors-list?${params}`)

            if (response.data.success) {
                setDonors(response.data.data.donors)
                setPagination(response.data.data.pagination)
            }
        } catch (error) {
            console.error('Error fetching donors:', error)
            toast.error('Failed to access personnel registry')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            const params = new URLSearchParams(
                Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            )

            const response = await api.get(`/admin/export/donors?${params}`, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `registry-${Date.now()}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()

            toast.success('Registry archive exported successfully')
        } catch (error) {
            console.error('Error exporting donors:', error)
            toast.error('Failed to export registry archive')
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchDonors()
    }

    const clearFilters = () => {
        setFilters({ search: '', bloodGroup: '', status: '' })
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    const statuses = ['active', 'inactive', 'pending']

    const statsConfig = [
        {
            icon: Users,
            title: "Total Personnel",
            value: pagination.total,
            bg: "bg-slate-50",
            color: "text-slate-900",
            trend: "Validated Nodes"
        },
        {
            icon: Activity,
            title: "Active Donors",
            value: donors.filter(d => d.canDonate).length,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
            trend: "Ready Status"
        },
        {
            icon: Calendar,
            title: "In Recovery",
            value: donors.filter(d => !d.canDonate).length,
            bg: "bg-amber-50",
            color: "text-amber-600",
            trend: "Node Cooling"
        },
        {
            icon: Star,
            title: "Total Cycles",
            value: donors.reduce((sum, d) => sum + (d.totalDonations || 0), 0),
            bg: "bg-rose-50",
            color: "text-rose-600",
            trend: "Lifetime Impact"
        }
    ]

    return (
        <div className="space-y-12 pb-24">
            {/* Royal Header Case */}
            <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-black rounded-[2.5rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden text-white group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <ShieldCheck className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transition-transform hover:rotate-6">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Elite Donors Registry</h1>
                        </div>
                        <p className="text-rose-100 text-xl font-medium max-w-2xl leading-relaxed italic">
                            Oversee the life-saving personnel network. Monitor donation frequency, eligibility status, and coordinate clinical mobilization.
                        </p>
                    </div>
                    <Button
                        onClick={handleExport}
                        variant="secondary"
                        className="px-8 py-5 flex items-center gap-3 text-[11px] uppercase tracking-widest shadow-2xl italic"
                    >
                        <Download className="w-5 h-5" />
                        Consign Archive
                    </Button>
                </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {statsConfig.map((stat, index) => (
                    <Card key={index} className="border-slate-100 shadow-lg group">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-slate-50 border-slate-100 text-slate-500">
                                    {stat.trend}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{stat.title}</p>
                                <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter">{stat.value}</h4>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Selection & Filter Interface */}
            <Card className="rounded-[3rem] shadow-xl border-slate-100 p-2 hover:shadow-2xl transition-all">
                <CardContent className="p-8 space-y-10">
                    <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                            <Input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Search personnel by identity, proxy, or node ID..."
                                className="pl-16 h-16 text-lg rounded-[2rem] border-2 focus:ring-4 focus:ring-rose-50 focus:border-rose-500"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                variant="royal"
                                className="h-16 px-12 rounded-[2rem] shadow-xl text-[11px]"
                            >
                                Execute Search
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                                className={`h-16 px-8 rounded-[2rem] border-2 ${showFilters ? 'bg-rose-50 border-rose-200 text-rose-600' : ''}`}
                            >
                                <Filter className="w-6 h-6" />
                            </Button>
                        </div>
                    </form>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500">
                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 px-1 group-focus-within:text-rose-500 transition-colors italic">Blood Classification</label>
                                <select
                                    value={filters.bloodGroup}
                                    onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:ring-8 focus:ring-rose-50 focus:border-rose-500 outline-none font-black text-slate-900 uppercase tracking-tighter italic appearance-none transition-all"
                                >
                                    <option value="">All Phenotypes</option>
                                    {bloodGroups.map(bg => (
                                        <option key={bg} value={bg}>{bg} Group</option>
                                    ))}
                                </select>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 px-1 group-focus-within:text-rose-500 transition-colors italic">Status Verification</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:ring-8 focus:ring-rose-50 focus:border-rose-500 outline-none font-black text-slate-900 uppercase tracking-tighter italic appearance-none transition-all"
                                >
                                    <option value="">Full Range</option>
                                    {statuses.map(status => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)} Profile
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    onClick={clearFilters}
                                    variant="destructive"
                                    className="w-full h-[3.75rem] rounded-2xl text-[10px] shadow-sm bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Reset Discovery Engine
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Personnel Ledger Display */}
            <Card className="rounded-[3.5rem] shadow-xl border-slate-100 overflow-hidden group/table">
                <div className="p-10 bg-slate-50/30 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Personnel Registry Ledger</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">Detailed synchronization data for registered life-reserve entities</p>
                    </div>
                    <Badge variant="success" className="px-5 py-2 text-[10px]">
                        Global Status: Live Sync
                    </Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-slate-50">
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Personnel Identity</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Medical Profile</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Cycle Frequency</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Temporal Link</th>
                                <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Node Eligibility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-20 h-20 border-t-4 border-rose-600 border-r-4 border-transparent rounded-full animate-spin mb-8 shadow-2xl shadow-rose-100"></div>
                                            <span className="text-rose-600 font-black uppercase tracking-[0.3em] text-[11px] animate-pulse italic">Syncing Personnel Data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : donors.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-32 text-center">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
                                            <Users className="w-12 h-12 text-slate-200" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Null Set Returned</h3>
                                        <p className="max-w-sm mx-auto text-slate-400 font-medium italic">No personnel profiles found matching your current search parameters.</p>
                                    </td>
                                </tr>
                            ) : (
                                donors.map((donor) => (
                                    <tr key={donor._id} className="hover:bg-slate-50/50 transition-all duration-300 group/row">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-xl group-hover/row:scale-110 group-hover/row:rotate-3 transition-all relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                                    {donor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 group-hover/row:text-rose-600 transition-colors uppercase tracking-tight italic">{donor.name}</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 italic">{donor.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="px-5 py-2.5 bg-rose-50 text-rose-700 text-[10px] font-black rounded-xl border border-rose-100 uppercase tracking-[0.1em] shadow-sm italic">
                                                {donor.bloodGroup} Positive
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 italic">{donor.totalDonations || 0} Cycles</span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">Life Reserves Dispatched</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-slate-200 group-hover/row:text-rose-400 transition-colors" />
                                                <div>
                                                    <span className="block text-sm font-black text-slate-700 italic">
                                                        {donor.lastDonationDate
                                                            ? new Date(donor.lastDonationDate).toLocaleDateString(undefined, { dateStyle: 'medium' })
                                                            : 'Registry Primary'}
                                                    </span>
                                                    {donor.daysSinceLastDonation !== null && (
                                                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.1em] mt-0.5 block italic">
                                                            {donor.daysSinceLastDonation} T-Minus Units
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${donor.canDonate
                                                ? 'bg-emerald-500 text-white border border-emerald-400 shadow-emerald-100 scale-105'
                                                : 'bg-white text-slate-300 border border-slate-100'
                                                } transition-all group-hover/row:scale-105`}>
                                                {donor.canDonate ? (
                                                    <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                                                ) : (
                                                    <Clock className="w-4 h-4" />
                                                )}
                                                {donor.canDonate ? 'Active Node' : 'Node Recovery'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Ledger Navigation Matrix */}
                {pagination.pages > 1 && (
                    <div className="bg-slate-50/50 p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-slate-50">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                            Displaying Intelligence <span className="text-slate-900 border-b border-slate-900 pb-0.5">{(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                            of <span className="text-rose-600 font-bold">{pagination.total}</span> Registered Profiles
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                variant="secondary"
                                className="w-14 h-14 p-0 rounded-2xl shadow-xl hover:bg-slate-900 hover:text-white"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                variant="secondary"
                                className="w-14 h-14 p-0 rounded-2xl shadow-xl hover:bg-slate-900 hover:text-white"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default DonorsList
