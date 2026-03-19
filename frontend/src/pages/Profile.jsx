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
          setKycStatus(profile.kyc_status);
          setCalculatedRisk(profile.risk_profile);
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
      const updateData = {
        ...formData,
        username: accountInfo.username,
        email: accountInfo.email,
        phone_number: accountInfo.phone_number
      };
      
      // The 'updated' object now contains the 'risk_profile' from your backend math
      const updated = await updateProfile(updateData);
      
      // Sync the UI with the backend's dynamic calculation
      setKycStatus(updated.kyc_status);
      setCalculatedRisk(updated.risk_profile); // <--- Updates the Indigo Card live
      
      alert("WealthTrack Identity Hub Synced Successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating identity details.");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 text-blue-600 font-bold">Initializing Hub...</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Identity Hub</h1>
          <p className="text-gray-500">Manage your credentials, KYC verification, and risk strategy.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
          
          {/* QUADRANT 1: ACCOUNT & SECURITY */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-blue-300">
                    {accountInfo.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="group">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">Username</label>
                <input type="text" name="username" value={accountInfo.username} onChange={handleAccountChange} 
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all" />
              </div>
              <div className="group">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">Email Address</label>
                <input type="email" name="email" value={accountInfo.email} onChange={handleAccountChange} 
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all" />
              </div>
              <div className="group">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">Contact Number</label>
                <input type="text" name="phone_number" value={accountInfo.phone_number} onChange={handleAccountChange} 
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* QUADRANT 2: KYC VERIFICATION */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-xl text-gray-800">KYC Status</h3>
              <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse ${
                kycStatus === 'completed' ? 'bg-green-100 text-green-700' : 
                kycStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {kycStatus.replace('-', ' ')}
              </span>
            </div>
            <div className="space-y-6">
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                 <p className="text-xs text-blue-800 leading-relaxed font-medium">
                   Provide your identity numbers for regulatory compliance. Updates will set status to <span className="font-bold">Pending</span>.
                 </p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">Aadhaar Card Number</label>
                <input type="text" name="aadhaar_no" value={formData.aadhaar_no} onChange={handleInputChange} 
                  placeholder="0000 0000 0000" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">PAN Card Number</label>
                <input type="text" name="pan_no" value={formData.pan_no} onChange={handleInputChange} 
                  placeholder="ABCDE1234F" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* QUADRANT 3: PERSONAL DETAILS */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl text-gray-800 mb-8">Personal Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">User Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} 
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">Mailing Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none resize-none transition-all" />
              </div>
            </div>
          </div>

          {/* QUADRANT 4: RISK STRATEGY */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xl text-gray-800 mb-6">Investment Strategy</h3>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-3 tracking-widest text-center">Your Preferred Risk Appetite</label>
              <div className="flex gap-3 mb-8">
                {['conservative', 'moderate', 'aggressive'].map((level) => (
                  <button key={level} type="button" onClick={() => setFormData({...formData, investment_risk: level})}
                    className={`flex-1 py-3 text-[10px] font-black rounded-2xl border transition-all duration-300 ${
                      formData.investment_risk === level ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-105' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                    }`}>
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-200">
              <span className="text-[10px] font-bold text-indigo-200 uppercase block mb-2 tracking-widest">Calculated Risk Profile</span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-white uppercase tracking-tighter">
                  {calculatedRisk}
                </span>
                <div className="h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
              </div>
              <p className="text-[10px] text-indigo-100 mt-3 opacity-80 leading-tight">
                This profile is derived from your real-time portfolio volatility and asset distribution.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 pb-12">
            <button type="submit" className="w-full bg-gray-900 text-white font-black py-5 rounded-3xl shadow-2xl hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-[0.2em] text-sm">
              Sync Identity Hub
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Profile;