import axios from 'axios';

export const createAxiosInstance = (baseURL) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return axios.create({
    baseURL,
    headers: {
      Authorization: user?.token ? `Bearer ${user.token}` : '',
    },
  });
}; 