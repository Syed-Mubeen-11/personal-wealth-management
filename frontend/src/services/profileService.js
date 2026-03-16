import API from './api';

export const getProfile = async () => {
  const response = await API.get('/profile');
  return response.data;
};

export const saveProfile = async (formData, isUpdate) => {
  // We prepare the specific Multipart/Form-Data request
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' }
  };

  const data = new FormData();
  data.append('age', formData.age);
  data.append('address', formData.address);
  
  // Only append photo if a new one was selected
  if (formData.profile_photo) {
    data.append('profile_photo', formData.profile_photo);
  }

  if (isUpdate) {
    const response = await API.put('/profile', data, config);
    return response.data;
  } else {
    const response = await API.post('/profile', data, config);
    return response.data;
  }
};