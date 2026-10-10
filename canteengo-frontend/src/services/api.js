import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

axios.interceptors.request.use((config) => {
  let authSession = null;
  try {
    authSession = JSON.parse(localStorage.getItem('canteengo_auth') || 'null');
  } catch {
    localStorage.removeItem('canteengo_auth');
  }
  if (authSession?.token) {
    config.headers.Authorization = `Bearer ${authSession.token}`;
  }
  return config;
});

export const loginAccount = (credentials) => axios.post(`${API_BASE_URL}/auth/login`, credentials);
export const registerStudent = (student) => axios.post(`${API_BASE_URL}/auth/register`, student);
export const fetchCurrentUser = () => axios.get(`${API_BASE_URL}/auth/me`);
export const fetchMenuItems = () => axios.get(`${API_BASE_URL}/food-items`);
export const createFoodItem = (item) => axios.post(`${API_BASE_URL}/food-items`, item);
export const updateFoodItem = (id, item) => axios.put(`${API_BASE_URL}/food-items/${id}`, item);
export const deleteFoodItem = (id) => axios.delete(`${API_BASE_URL}/food-items/${id}`);
export const createOrder = (order) => axios.post(`${API_BASE_URL}/orders`, order);
export const fetchAllOrders = () => axios.get(`${API_BASE_URL}/orders`);

export const updateOrderStatus = (id, status) =>
  axios.put(`${API_BASE_URL}/orders/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' },
  });