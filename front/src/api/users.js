import { createAxiosInstance } from './utils';
import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.USERS;

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