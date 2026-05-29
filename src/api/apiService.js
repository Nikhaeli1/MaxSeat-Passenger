import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── CHANGE THIS to your server's local IP ───────────────────────────────────
export const BASE_URL = 'https://web-production-ab4a.up.railway.app';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// ── Token helpers ─────────────────────────────────────────────────────────────
export const saveToken  = (t) => AsyncStorage.setItem('pax_token', t);
export const clearToken = ()  => AsyncStorage.removeItem('pax_token');
export const getToken   = ()  => AsyncStorage.getItem('pax_token');

// ── Attach Bearer token ───────────────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginPassenger  = (username, password) =>
  api.post('/api/passenger/login',  { username, password }).then(r => r.data);

export const logoutPassenger = () =>
  api.post('/api/passenger/logout').then(r => r.data).catch(() => {});

// ── PUV data ──────────────────────────────────────────────────────────────────
export const fetchAllPuvs   = () =>
  api.get('/api/passenger/puvs').then(r => r.data);

export const fetchPuvDetail = (plate) =>
  api.get(`/api/passenger/puv/${encodeURIComponent(plate)}`).then(r => r.data);

// ── Complaint ─────────────────────────────────────────────────────────────────
export const submitComplaint = (plate, complaint, description) =>
  api.post('/api/passenger/complaint', { plate, complaint, description }).then(r => r.data);

// ── My reports ────────────────────────────────────────────────────────────────
export const fetchMyComplaints = () =>
  api.get('/api/passenger/my-complaints').then(r => r.data);

// ── Profile ───────────────────────────────────────────────────────────────────
export const updatePassengerProfile = (data) =>
  api.put('/api/passenger/profile', data).then(r => r.data);

export const changePassengerPassword = (data) =>
  api.put('/api/passenger/change-password', data).then(r => r.data);