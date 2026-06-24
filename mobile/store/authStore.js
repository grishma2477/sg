import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const set = (key, val) => val != null
  ? SecureStore.setItemAsync(key, String(val))
  : SecureStore.deleteItemAsync(key).catch(() => {});

export const useAuthStore = create((setState, get) => ({
  token:        null,
  refreshToken: null,
  userId:       null,
  role:         null,
  driverId:     null,
  name:         null,

  // Hydrate from SecureStore on app launch
  hydrate: async () => {
    const [token, refreshToken, userId, role, driverId, name] = await Promise.all([
      SecureStore.getItemAsync('auth_token'),
      SecureStore.getItemAsync('refresh_token'),
      SecureStore.getItemAsync('user_id'),
      SecureStore.getItemAsync('user_role'),
      SecureStore.getItemAsync('driver_id'),
      SecureStore.getItemAsync('user_name'),
    ]);
    setState({
      token,
      refreshToken,
      userId:   userId   ? parseInt(userId)   : null,
      role,
      driverId: driverId ? parseInt(driverId) : null,
      name,
    });
  },

  login: async (data) => {
    const token        = data.accessToken || data.token;
    const refreshToken = data.refreshToken;
    const userId       = data.userId;
    const role         = data.role;
    const driverId     = data.driverId ?? null;
    const name         = data.name ?? null;

    await Promise.all([
      set('auth_token',    token),
      set('refresh_token', refreshToken),
      set('user_id',       userId),
      set('user_role',     role),
      set('driver_id',     driverId),
      set('user_name',     name),
    ]);

    setState({ token, refreshToken, userId, role, driverId, name });
  },

  setName: async (name) => {
    await SecureStore.setItemAsync('user_name', name);
    setState({ name });
  },

  logout: async () => {
    await Promise.all([
      'auth_token','refresh_token','user_id','user_role','driver_id','user_name',
    ].map(k => SecureStore.deleteItemAsync(k).catch(() => {})));
    setState({ token: null, refreshToken: null, userId: null, role: null, driverId: null, name: null });
  },
}));
