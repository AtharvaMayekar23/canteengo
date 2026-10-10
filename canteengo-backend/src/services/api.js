import axios from 'axios';

// Spring Boot Backend Base URL
const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu Endpoints
export const fetchMenuItems = () => API.get('/menu');
export const addMenuItem = (itemData) => API.post('/menu', itemData);

// Order Endpoints
export const fetchAllOrders = () => API.get('/orders');
export const createOrder = (orderData) => API.post('/orders', orderData);
export const updateOrderStatus = (orderId, status) =>
  API.patch(`/orders/${orderId}/status?status=${status}`);

export default API;