import React, { useState, useEffect } from 'react';
import {
  AlertCircle, CheckCircle, Shield, History, User, Activity,
  MapPin, Phone, Mail, Calendar, TrendingUp, TrendingDown,
  Layers, Lock, Database
} from 'lucide-react';
import api from '../api';

export default function ProfileRisk() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone_number: '',
    residential_address: '',
    date_of_birth: '',
    risk_profile: 'moderate',
    kyc_status: 'pending'
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([fetchProfile(), fetchHistory()]).finally(() => setIsPageLoading(false));
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/profile-risk');
      setProfile({
        name: res.data.full_name || '',
        email: res.data.email || '',
        phone_number: res.data.phone_number || '',
        residential_address: res.data.residential_address || '',
        date_of_birth: res.data.date_of_birth || '',
        risk_profile: res.data.risk_profile || 'moderate',
        kyc_status: res.data.kyc_status || 'pending'
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/transactions/paginated?limit=15&page=1');
      setHistory(res.data.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      try {
        const resList = await api.get('/transactions');
        setHistory(resList.data || []);
      } catch (err2) {
        console.error(err2);
      }
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        full_name: profile.name || null,
        phone_number: profile.phone_number || null,
        residential_address: profile.residential_address || null,
        date_of_birth: profile.date_of_birth || null,
        risk_profile: profile.risk_profile || 'moderate'
      };
      
      console.log("Sending profile update payload:", payload);
      const response = await api.put('/api/profile-risk', payload);
      console.log("Profile update response:", response.data);
      
      setMessage('success: Profile integrated and saved successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error("Profile Update Error:", error.response?.data || error.message);
      const detail = error.response?.data?.detail;
      const errorMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || "Server error");
      setMessage(`error: Failed to save - ${errorMsg}`);
      setTimeout(() => setMessage(''), 6000);
    }
    setLoading(false);
  };

  const riskLevels = [
    { id: 'conservative', title: 'Conservative', icon: <TrendingDown className="w-5 h-5" />, desc: 'Prioritizes capital protection with stable, lower returns.', color: 'from-blue-500 to-cyan-400', badge: 'text-blue-700 bg-blue-100' },
    { id: 'moderate', title: 'Moderate', icon: <Layers className="w-5 h-5" />, desc: 'Balances capital growth with acceptable levels of market risk.', color: 'from-indigo-500 to-purple-400', badge: 'text-indigo-700 bg-indigo-100' },
    { id: 'aggressive', title: 'Aggressive', icon: <TrendingUp className="w-5 h-5" />, desc: 'Maximizes growth potential, fully accepting high volatility.', color: 'from-rose-500 to-orange-400', badge: 'text-rose-700 bg-rose-100' }
  ];

  if (isPageLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-indigo-800 font-bold">Loading profile and risk data...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 font-sans selection:bg-indigo-100">

      {/* Dynamic Header */}
      <div className="relative bg-white pt-12 pb-24 lg:pt-16 lg:pb-32 overflow-hidden shadow-sm">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-slate-100 via-indigo-50/20 to-teal-50/30 -rotate-3 transform origin-top blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs mb-4 uppercase tracking-wider backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> Backend Synced
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Profile &amp; Risk<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">Management</span>
            </h1>
            <p className="text-slate-500 mt-4 max-w-lg text-lg">Control your identity, manage your personal data, and set up your investment risk appetite securely.</p>
          </div>

          {/* Custom Animated Notification */}
          <div className={`transition-all duration-500 transform ${message ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md ${message.startsWith('success') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' : 'bg-rose-500/10 border-rose-500/20 text-rose-800'}`}>
              <div className={`p-2 rounded-full ${message.startsWith('success') ? 'bg-emerald-500' : 'bg-rose-500'} text-white shadow-lg`}>
                {message.startsWith('success') ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <p className="font-semibold">{message.split(': ')[1]}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-12 relative z-20">

        {/* Floating Custom Tabs */}
        <div className="flex p-1.5 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 w-full max-w-md mx-auto mb-10 overflow-hidden relative">
          <div
            className={`absolute top-1.5 bottom-1.5 left-1.5 right-1/2 bg-slate-900 rounded-xl transition-transform duration-300 ease-in-out shadow-sm ${activeTab === 'history' ? 'translate-x-[calc(100%-8px)]' : 'translate-x-0'}`}
          />
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold z-10 transition-colors duration-300 ${activeTab === 'profile' ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <User className="w-4 h-4" /> Attributes
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold z-10 transition-colors duration-300 ${activeTab === 'history' ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <History className="w-4 h-4" /> Activity Log
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">

            {/* Left section: Personal Form */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 lg:p-10 border border-slate-100 relative overflow-hidden group">
                {/* Decorative background glass */}
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-700 -rotate-12 pointer-events-none">
                  <User className="w-64 h-64 text-slate-900" />
                </div>

                <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <User className="w-6 h-6 text-indigo-500" /> Identity Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 relative z-10">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                      <User className="w-4 h-4 text-slate-400" /> Full Legal Name
                    </label>
                    <input
                      type="text" name="name"
                      value={profile.name} onChange={handleProfileChange}
                      className="w-full bg-slate-50 hover:bg-slate-100 border-none p-4 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 font-semibold outline-none shadow-inner"
                      placeholder="e.g. Satoshi Nakamoto"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                      <Mail className="w-4 h-4 text-slate-400" /> Registered Email
                    </label>
                    <input
                      type="email" disabled
                      value={profile.email}
                      className="w-full bg-slate-100/50 border-none p-4 rounded-2xl text-slate-400 font-medium cursor-not-allowed flex items-center"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                      <Phone className="w-4 h-4 text-slate-400" /> Mobile Number
                    </label>
                    <input
                      type="tel" name="phone_number"
                      value={profile.phone_number} onChange={handleProfileChange}
                      className="w-full bg-slate-50 hover:bg-slate-100 border-none p-4 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 font-semibold outline-none shadow-inner"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> Primary Residence
                    </label>
                    <input
                      type="text" name="residential_address"
                      value={profile.residential_address} onChange={handleProfileChange}
                      className="w-full bg-slate-50 hover:bg-slate-100 border-none p-4 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 font-semibold outline-none shadow-inner"
                      placeholder="Full street address, city, zip code"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                      <Calendar className="w-4 h-4 text-slate-400" /> Date of Birth
                    </label>
                    <input
                      type="date" name="date_of_birth"
                      value={profile.date_of_birth} onChange={handleProfileChange}
                      className="w-full bg-slate-50 hover:bg-slate-100 border-none p-4 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 font-semibold outline-none shadow-inner"
                    />
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="relative px-8 py-4 bg-slate-900 overflow-hidden hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 transition-all transform active:scale-95 disabled:opacity-70 group"
                  >
                    <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-12 -translate-x-[250%] group-hover:translate-x-[400%] transition-transform duration-700 ease-out" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Save Changes</>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section: KYC & Risk */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">

              {/* Premium KYC Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-[1px] rounded-[2rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[2rem] p-8 h-full relative z-10 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-400" /> KYC Status
                    </h3>
                    <Lock className="w-5 h-5 text-slate-600" />
                  </div>

                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-5 backdrop-blur-md">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 ${profile.kyc_status === 'verified' || profile.kyc_status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {profile.kyc_status === 'verified' || profile.kyc_status === 'completed' ? <CheckCircle className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-lg tracking-wider capitalize">
                        {profile.kyc_status === 'verified' || profile.kyc_status === 'completed' ? 'Verified' : 'Unverified'}
                      </h4>
                      <p className="text-sm text-slate-400 font-medium leading-tight mt-1">
                        {profile.kyc_status === 'verified' || profile.kyc_status === 'completed' ? "You're fully approved to trade." : "Identity check is pending."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Profile Selector */}
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-orange-500" /> Risk Assessment
                </h3>

                <div className="space-y-4">
                  {riskLevels.map((level) => {
                    const isSelected = profile.risk_profile === level.id;
                    return (
                      <label
                        key={level.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center h-6">
                          <input
                            type="radio"
                            name="risk_profile"
                            value={level.id}
                            checked={isSelected}
                            onChange={(e) => setProfile({ ...profile, risk_profile: e.target.value })}
                            className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold text-lg capitalize tracking-tight ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                            {level.title}
                          </span>
                          <span className={`${isSelected ? 'text-indigo-700' : 'text-slate-500'} text-sm mt-1 leading-relaxed`}>
                            {level.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden hidden-scrollbar transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 border border-slate-100 mb-10">
            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <Database className="w-6 h-6 text-indigo-500" /> Account Logs
                </h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">Ledger of all financial transactions mapped to you.</p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="py-24 text-center px-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                  <History className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-700 tracking-tight">Immaculately Empty</h3>
                <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto">No transaction data has been appended to your encrypted profile matrix yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto p-4">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr>
                      <th className="p-5 text-sm font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-100 bg-white sticky top-0">Timestamp</th>
                      <th className="p-5 text-sm font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-100 bg-white sticky top-0">Action</th>
                      <th className="p-5 text-sm font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-100 bg-white sticky top-0">Target Asset</th>
                      <th className="p-5 text-sm font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-100 bg-white sticky top-0 text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-5 whitespace-nowrap">
                          <div className="font-bold text-slate-800">
                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-xs font-semibold text-slate-400 mt-0.5">
                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider
                             ${item.transaction_type === 'Buy' || item.transaction_type === 'Contribution'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            {item.transaction_type}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-1 ring-slate-200">
                              {item.asset_symbol?.charAt(0) || 'C'}
                            </div>
                            <span className="font-bold text-slate-700 tracking-tight text-sm">
                              {item.asset_symbol || 'CASH_BAL'}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="font-black text-slate-900 text-lg">
                            ${item.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </div>
                          {item.quantity && <div className="text-slate-400 text-xs mt-0.5 font-bold">{item.quantity} UNITS ALLOCATED</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
