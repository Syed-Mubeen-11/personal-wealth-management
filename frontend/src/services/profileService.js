import API from './api';

export const getProfile = async () => {
  const response = await API.get('/profile');
  return response.data;
};

export const updateProfile = async (formData) => {
  const data = new FormData();
  
  // Append basic details
  data.append('age', formData.age);
  data.append('address', formData.address);
  
  // Append new KYC and Risk fields
  data.append('aadhaar_no', formData.aadhaar_no);
  data.append('pan_no', formData.pan_no);
  data.append('investment_risk', formData.investment_risk);

  // Only append photo if a new file was actually selected
  if (formData.profile_photo instanceof File) {
    data.append('profile_photo', formData.profile_photo);
  }

  // Since the profile is created at registration, we only use PUT
  const response = await API.put('/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};