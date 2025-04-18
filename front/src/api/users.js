import { createAxiosInstance } from './utils';

const API_URL = 'http://localhost:5000/api/users';

const getProfile = async () => {
  const instance = createAxiosInstance(API_URL);
  const response = await instance.get('/profile');
  return response.data;
};

const updateProfile = async (userData) => {
  const instance = createAxiosInstance(API_URL);
  const response = await instance.put('/profile', userData);
  return response.data;
};

const userService = {
  getProfile,
  updateProfile,
};

export default userService;