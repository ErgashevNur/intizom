import axios from 'axios';
import { CreateOrderPayload, UpdateOrderStatusPayload } from './types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_BASE });

const adminApi = axios.create({ baseURL: API_BASE });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProduct = () => api.get('/products').then((r) => r.data);

export const createOrder = (data: CreateOrderPayload) =>
  api.post('/orders', data).then((r) => r.data);

export const trackOrder = (orderNumber: string) =>
  api.get(`/orders/track/${orderNumber}`).then((r) => r.data);

export const adminLogin = (username: string, password: string) =>
  api.post('/admin/auth/login', { username, password }).then((r) => r.data);

export const adminGetOrders = (status?: string) =>
  adminApi
    .get('/admin/orders', { params: status ? { status } : {} })
    .then((r) => r.data);

export const adminGetOrder = (id: number) =>
  adminApi.get(`/admin/orders/${id}`).then((r) => r.data);

export const adminUpdateOrderStatus = (id: number, data: UpdateOrderStatusPayload) =>
  adminApi.patch(`/admin/orders/${id}/status`, data).then((r) => r.data);

export const adminGetStats = () =>
  adminApi.get('/admin/stats').then((r) => r.data);
