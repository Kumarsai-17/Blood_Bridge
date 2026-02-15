import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { User, Bell, Lock, Globe, Activity } from 'lucide-react'
import { PageHeader } from '../../components/shared/DashboardComponents'
import ConfirmModal from '../../components/shared/ConfirmModal'

const Settings = () => {
  const { user } = useAuth()
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' })
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  })
  const [language, setLanguage] = useState('en')

  const handleSaveSettings = () => {
    setPopup({ show: true, type: 'success', title: 'Success', message: 'System parameters synchronized' })
  }

  return (
    <div className="space-y-12 pb-24 relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
        <PageHeader
          title="Node Configuration"
          subtitle="Management of tactical alerts, linguistic mapping, and security protocols"
          icon={Globe}
          gradient="from-slate-900 via-slate-950 to-black"
          className="mb-0 flex-1"
        />
        <div className="flex gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition shadow-2xl active:scale-95 flex items-center group backdrop-blur-xl italic text-xs"
          >
            Abort Sync
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 shadow-2xl active:scale-95 flex items-center group transition-all italic text-xs"
          >
            Commit Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* Main Settings Area */}
        <div className="lg:col-span-8 space-y-12">
          {/* Notifications Sector */}
          <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/5 overflow-hidden">
            <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Alert Matrix</h2>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-rose-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Routing Active</span>
              </div>
            </div>

            <div className="p-10 space-y-8">
              {[
                { key: 'email', label: 'Email Protocol', sub: 'Receive tactical data via SMTP relay' },
                { key: 'sms', label: 'SMS Link', sub: 'Direct cellular encrypted transmissions' },
                { key: 'push', label: 'Neural Push', sub: 'Real-time interface-level notifications' }
              ].map((notif) => (
                <div key={notif.key} className="flex items-center justify-between p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 group hover:bg-white/[0.05] transition-all duration-500">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{notif.label}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 italic">{notif.sub}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[notif.key]}
                      onChange={(e) => setNotifications({ ...notifications, [notif.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-16 h-8 bg-slate-800 rounded-full peer peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500/30 border border-white/5 transition-all
                      after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-600 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-8 peer-checked:after:bg-emerald-500 peer-checked:after:shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Localization Sector */}
          <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/5 overflow-hidden">
            <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Linguistic Mapping</h2>
              <Globe className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="p-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Select Operational Language</label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-8 py-6 bg-white/5 border border-white/5 rounded-[2rem] font-black text-xl tracking-tight text-white focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none appearance-none cursor-pointer italic"
                  >
                    <option value="en" className="bg-slate-950">ENGLISH // EN-US</option>
                    <option value="hi" className="bg-slate-950">HINDI // HI-IN</option>
                    <option value="es" className="bg-slate-950">SPANISH // ES-ES</option>
                    <option value="fr" className="bg-slate-950">FRENCH // FR-FR</option>
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Activity className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-12">
          {/* Node Summary */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
              <User className="w-72 h-72 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-12 tracking-tight uppercase italic flex items-center relative z-10 leading-none">
              <Activity className="w-6 h-6 text-indigo-500 mr-4" />
              Node<br /><span className="text-indigo-500 ml-10">Identity</span>
            </h3>
            <div className="space-y-6 relative z-10">
              {[
                { label: 'Role', val: user?.role?.toUpperCase() || 'UNKNOWN' },
                { label: 'Status', val: 'ACTIVE' },
                { label: 'Firmware', val: 'v2.4.0' }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-white italic">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Shortcut */}
          <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-12 shadow-2xl group text-center">
            <div className="w-20 h-20 bg-rose-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-rose-600/20 shadow-2xl group-hover:scale-110 transition-transform">
              <Lock className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tighter uppercase italic">Security Vault</h3>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-10 leading-relaxed italic">
              Rotate core identity credentials<br />via the encrypted security relay
            </p>
            <button
              onClick={() => window.location.href = '/change-password'}
              className="w-full py-6 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center active:scale-95 italic"
            >
              Access Vault
            </button>
          </div>
        </div>
      </div>

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

export default Settings
