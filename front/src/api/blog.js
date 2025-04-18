import { createAxiosInstance } from './utils';

const API_URL = 'http://localhost:5000/api/blogs';

const getAllBlogs = async () => {
  const instance = createAxiosInstance(API_URL);
  const response = await instance.get('/');
  return response.data;
};

const getBlogById = async (id) => {
  const instance = createAxiosInstance(API_URL);
  const response = await instance.get(`/${id}`);
  return response.data;
};

const createBlog = async (blogData) => {
  const instance = createAxiosInstance(API_URL);
  const response = await instance.post('/', blogData);
  return response.data;
};

const updateBlog = async (id, blogData) => {
  const instance = createAxiosInstance(API_URL);
  const response = await instance.put(`/${id}`, blogData);
  return response.data;
};

const deleteBlog = async (id) => {
  const instance = createAxiosInstance(API_URL);
  const response = await instance.delete(`/${id}`);
  return response.data;
};

const blogService = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};

export default blogService;