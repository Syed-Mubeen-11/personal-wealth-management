import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getProfile, updateProfile } from '../services/profileService';
import { getMe } from '../services/authService';

const Profile = () => {
  const [accountInfo, setAccountInfo] = useState({
    username: '',
    email: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    age: '',
    address: '',
    aadhaar_no: '',
    pan_no: '',
    investment_risk: '',
    profile_photo: null
  });
  const [preview, setPreview] = useState(null);
  const [kycStatus, setKycStatus] = useState('not-submitted');
  const [calculatedRisk, setCalculatedRisk] = useState('pending');

  useEffect(() => {
    const init = async () => {
      try {
        const me = await getMe();
        setAccountInfo({
          username: me.username || '',
          email: me.email || '',
          phone_number: me.phone_number || ''
        });
        
        const profile = await getProfile();
        if (profile) {
          setFormData({
            age: profile.age || '',
            address: profile.address || '',
            aadhaar_no: profile.aadhaar_no || '',
            pan_no: profile.pan_no || '',
            investment_risk: profile.investment_risk || 'pending',
            profile_photo: null
          });
          setKycStatus(profile.kyc_status || 'not-submitted');
          setCalculatedRisk(profile.risk_profile || 'pending');
          setPreview(profile.profile_photo ? `http://127.0.0.1:8000/${profile.profile_photo}` : null);
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountInfo({ ...accountInfo, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profile_photo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Constructing the update object
      const updateData = {
        ...formData,
        username: accountInfo.username,
        email: accountInfo.email,
        phone_number: accountInfo.phone_number
      };
      
      // Call the service
      const updated = await updateProfile(updateData);
      
      // Update local state with the backend's synchronized values
      setKycStatus(updated.kyc_status);
      setCalculatedRisk(updated.risk_profile); 
      setFormData(prev => ({
        ...prev,
        investment_risk: updated.investment_risk
      }));
      
      alert("WealthTrack Identity Hub Synced Successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating identity details.");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50 text-blue-600 font-black tracking-tighter text-2xl animate-pulse">
      INITIALIZING HUB...
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Identity Hub</h1>
          <p className="text-gray-400 font-medium">Manage your credentials, KYC verification, and risk strategy.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
          
          {/* QUADRANT 1: ACCOUNT & SECURITY */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="relative group mb-8">
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50 border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                {preview ? (
                  <img src={preview} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-black text-blue-200">
                    {accountInfo.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full shadow-xl pointer-events-none group-hover:bg-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>

            <div className="w-full space-y-5">
              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Username</label>
                <input type="text" name="username" value={accountInfo.username} onChange={handleAccountChange} 
                  className="w-full mt-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-700" />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Email Address</label>
                <input type="email" name="email" value={accountInfo.email} onChange={handleAccountChange} 
                  className="w-full mt-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-700" />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Contact Number</label>
                <input type="text" name="phone_number" value={accountInfo.phone_number} onChange={handleAccountChange} 
                  className="w-full mt-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-700" />
              </div>
            </div>
          </div>

          {/* QUADRANT 2: KYC VERIFICATION */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-2xl text-gray-800 tracking-tight">KYC Verification</h3>
              <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                kycStatus === 'completed' ? 'bg-green-100 text-green-700' : 
                kycStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {kycStatus.replace('-', ' ')}
              </span>
            </div>
            <div className="space-y-6 flex-grow">
              <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                 <p className="text-xs text-blue-800 leading-relaxed font-bold">
                    Official identity verification is required for market transactions. Updates will reset status to <span className="underline italic text-blue-600">Pending</span>.
                 </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Aadhaar Card Number</label>
                <input type="text" name="aadhaar_no" value={formData.aadhaar_no} onChange={handleInputChange} 
                  placeholder="0000 0000 0000" className="w-full mt-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-700" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">PAN Card Number</label>
                <input type="text" name="pan_no" value={formData.pan_no} onChange={handleInputChange} 
                  placeholder="ABCDE1234F" className="w-full mt-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-700" />
              </div>
            </div>
          </div>

          {/* QUADRANT 3: PERSONAL DETAILS */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="font-black text-2xl text-gray-800 tracking-tight mb-8">Biometric Context</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Current Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} 
                  className="w-full mt-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-700" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Mailing Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} rows="4"
                  className="w-full mt-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none resize-none transition-all font-bold text-gray-700" />
              </div>
            </div>
          </div>

          {/* QUADRANT 4: RISK STRATEGY */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="font-black text-2xl text-gray-800 tracking-tight mb-8">Market Strategy</h3>
              <div className="flex gap-3 mb-8">
                {['conservative', 'moderate', 'aggressive'].map((level) => (
                  <button 
                    key={level} 
                    type="button" 
                    onClick={() => setFormData({...formData, investment_risk: level})}
                    className={`flex-1 py-4 text-[10px] font-black rounded-2xl border-2 transition-all duration-300 ${
                      formData.investment_risk?.toLowerCase() === level 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-105' 
                        : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <span className="text-[10px] font-black text-indigo-200 uppercase block mb-3 tracking-[0.2em]">Validated Profile</span>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-white uppercase tracking-tighter">
                  {calculatedRisk}
                </span>
                <div className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)] animate-pulse"></div>
              </div>
              <p className="text-[10px] text-indigo-100 mt-4 font-bold opacity-70 leading-relaxed">
                This profile is dynamically calculated based on your disposable income, savings ratio, and stated risk appetite.
              </p>
            </div>
          </div>

          {/* FOOTER ACTION */}
          <div className="lg:col-span-2 py-8">
            <button 
              type="submit" 
              className="group relative w-full bg-gray-900 text-white font-black py-6 rounded-[2rem] shadow-2xl overflow-hidden hover:bg-blue-600 transition-all duration-500"
            >
              <span className="relative z-10 flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-sm">
                Synchronize Identity Hub
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Profile;