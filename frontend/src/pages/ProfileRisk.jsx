import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Shield, History, User, Activity } from 'lucide-react';
import api from '../api';

export default function ProfileRisk() {
  const [activeTab, setActiveTab] = useState('profile'); // profile, history
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone_number: '',
    residential_address: '',
    date_of_birth: '',
    risk_profile: 'moderate',
    kyc_status: 'unverified'
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/');
      setProfile({
        name: res.data.name || '',
        email: res.data.email || '',
        phone_number: res.data.phone_number || '',
        residential_address: res.data.residential_address || '',
        date_of_birth: res.data.date_of_birth || '',
        risk_profile: res.data.risk_profile || 'moderate',
        kyc_status: res.data.kyc_status || 'unverified'
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
      // Fallback to non-paginated just in case
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
        name: profile.name || null,
        phone_number: profile.phone_number || null,
        residential_address: profile.residential_address || null,
        date_of_birth: profile.date_of_birth || null,
        risk_profile: profile.risk_profile || 'moderate'
      };
      await api.put('/profile/', payload);
      setMessage('success: Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('error: Failed to update profile.');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B3C53] tracking-tight">Profile & Risk Management</h1>
            <p className="text-gray-500 mt-1">Manage your personal information, risk tolerance, and view history.</p>
          </div>
          {message && (
            <div className={`px-4 py-3 rounded-lg font-medium text-sm transition-all shadow-sm flex items-center gap-2 ${message.startsWith('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.startsWith('success') ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.split(': ')[1]}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-full max-w-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'profile' ? 'bg-[#234C6A] text-white shadow' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <User className="w-4 h-4" />
            Profile & Risk
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'history' ? 'bg-[#234C6A] text-white shadow' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <History className="w-4 h-4" />
            User History
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
            {/* Left Column: Personal Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8 border-b pb-4 border-gray-100">
                  <h2 className="text-xl font-bold text-[#1B3C53] flex items-center gap-2">
                    <User className="w-5 h-5 text-[#234C6A]" />
                    Personal Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text" name="name"
                      value={profile.name} onChange={handleProfileChange}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A] transition-all outline-none"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email" disabled
                      value={profile.email}
                      className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel" name="phone_number"
                      value={profile.phone_number} onChange={handleProfileChange}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A] transition-all outline-none"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Residential Address</label>
                    <input
                      type="text" name="residential_address"
                      value={profile.residential_address} onChange={handleProfileChange}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A] transition-all outline-none"
                      placeholder="Full home address"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date" name="date_of_birth"
                      value={profile.date_of_birth} onChange={handleProfileChange}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A] transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 bg-[#234C6A] hover:bg-[#1B3C53] text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Save Profile Information'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Risk & KYC */}
            <div className="space-y-6">

              {/* KYC Status Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                  <Shield className="w-32 h-32" />
                </div>
                <h3 className="text-lg font-bold text-[#1B3C53] mb-5 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#234C6A]" />
                  KYC Verification
                </h3>

                <div className="flex items-center gap-4 bg-gray-100 p-5 rounded-xl border border-gray-200 relative z-10">
                  {profile.kyc_status === 'verified' ? (
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 capitalize">{profile.kyc_status}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {profile.kyc_status === 'verified' ? 'Identity is fully verified.' : 'Verification processing/pending.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Profile Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-[#1B3C53] mb-5 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#234C6A]" />
                  Risk Profile
                </h3>

                <div className="space-y-3">
                  {['conservative', 'moderate', 'aggressive'].map((level) => (
                    <div
                      key={level}
                      onClick={() => setProfile({ ...profile, risk_profile: level })}
                      className={`group cursor-pointer py-4 px-5 rounded-xl border-2 transition-all duration-200 ${profile.risk_profile === level ? 'border-[#234C6A] bg-[#234C6A]/5' : 'border-gray-100 hover:border-[#234C6A]/30 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-bold capitalize ${profile.risk_profile === level ? 'text-[#1B3C53]' : 'text-gray-700'}`}>
                          {level}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${profile.risk_profile === level ? 'border-[#234C6A]' : 'border-gray-300'}`}>
                          {profile.risk_profile === level && <div className="w-2.5 h-2.5 bg-[#234C6A] rounded-full" />}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {level === 'conservative' && 'Prioritizes capital protection with stable, lower returns.'}
                        {level === 'moderate' && 'Balances capital growth with acceptable levels of risk.'}
                        {level === 'aggressive' && 'Maximizes growth potential, accepting high market volatility.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden fade-in">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1B3C53] flex items-center gap-2">
                <History className="w-5 h-5 text-[#234C6A]" />
                Account Activity & Transacions
              </h2>
            </div>

            {history.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-700">No History Found</h3>
                <p className="text-gray-500 mt-2">Any transactions mapping to your portfolio will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="p-5 font-bold">Date / Time</th>
                      <th className="p-5 font-bold">Type</th>
                      <th className="p-5 font-bold">Asset Symbol</th>
                      <th className="p-5 font-bold text-right">Amount / Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-5">
                          <div className="font-medium text-gray-900">
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold
                             ${item.transaction_type === 'Buy' || item.transaction_type === 'Contribution' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {item.transaction_type}
                          </span>
                        </td>
                        <td className="p-5 text-sm font-bold text-gray-700">
                          {item.asset_symbol || 'N/A'}
                        </td>
                        <td className="p-5 text-sm font-bold text-gray-900 text-right">
                          {item.amount && `$${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          {item.quantity && <div className="text-gray-500 text-xs mt-1 font-medium">{item.quantity} units</div>}
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
