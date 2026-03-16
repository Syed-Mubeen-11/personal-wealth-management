import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getProfile, saveProfile } from '../services/profileService';
import { getMe } from '../services/authService';

const Profile = () => {
  const [accountInfo, setAccountInfo] = useState(null);
  const [profileExists, setProfileExists] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    address: '',
    profile_photo: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await getMe();
        setAccountInfo(me);
        
        const profile = await getProfile();
        if (profile) {
          setProfileExists(true);
          setFormData({ age: profile.age, address: profile.address, profile_photo: null });
          // If backend returns a URL for the photo:
          setPreview(profile.profile_photo_url || null); 
        }
      } catch (err) {
        setProfileExists(false);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

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
      await saveProfile(formData, profileExists);
      alert(profileExists ? "Profile Updated!" : "Profile Created!");
      setProfileExists(true);
    } catch (err) {
      alert("Error saving profile details.");
    }
  };

  if (loading) return <div className="ml-64 p-8">Loading...</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Account Card (Read Only) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4 border-4 border-white shadow-md">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-3xl font-bold">
                    {accountInfo?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold">{accountInfo?.username}</h2>
              <p className="text-gray-500 text-sm">{accountInfo?.email}</p>
            </div>
            <div className="text-sm space-y-2 border-t pt-4">
              <p><strong>Phone:</strong> {accountInfo?.phone_number}</p>
            </div>
          </div>

          {/* Edit/Create Profile Form */}
          <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">{profileExists ? "Edit Details" : "Complete Your Profile"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Profile Photo</label>
                <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Age</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Address</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-4">
                {profileExists ? "Update Profile" : "Create Profile"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;