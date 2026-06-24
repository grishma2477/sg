import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants';

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue  = [];

function processQueue(error, token = null) {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

// Auto-refresh on 401
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => { original.headers.Authorization = `Bearer ${token}`; resolve(client(original)); },
          reject,
        });
      });
    }

    original._retry  = true;
    isRefreshing     = true;

    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refresh_token: refreshToken });
      const { accessToken, refreshToken: newRefresh } = data.data;

      await SecureStore.setItemAsync('auth_token', accessToken);
      await SecureStore.setItemAsync('refresh_token', newRefresh);

      client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return client(original);
    } catch (err) {
      processQueue(err, null);
      // Clear tokens → trigger logout via store
      await Promise.all([
        SecureStore.deleteItemAsync('auth_token'),
        SecureStore.deleteItemAsync('refresh_token'),
      ]);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;

export function apiGet(path, params)     { return client.get(path, { params }).then(r => r.data); }
export function apiPost(path, body)      { return client.post(path, body).then(r => r.data); }
export function apiPut(path, body)       { return client.put(path, body).then(r => r.data); }
export function apiDelete(path)          { return client.delete(path).then(r => r.data); }
