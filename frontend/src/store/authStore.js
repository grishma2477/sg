import { create } from 'zustand';
import Cookies from 'js-cookie';

const COOKIE_OPTS = { expires: 30 };

export const useAuthStore = create((set, get) => ({
  token:        Cookies.get('auth_token')   || null,
  refreshToken: Cookies.get('refresh_token') || null,
  userId:       Cookies.get('user_id')       ? parseInt(Cookies.get('user_id')) : null,
  role:         Cookies.get('user_role')     || null,
  driverId:     Cookies.get('driver_id')     ? parseInt(Cookies.get('driver_id')) : null,
  name:         Cookies.get('user_name')     || null,

  isAuthenticated: () => !!get().token,

  login: (data) => {
    const token        = data.accessToken || data.token;
    const refreshToken = data.refreshToken;
    const userId       = data.userId;
    const role         = data.role;
    const driverId     = data.driverId ?? null;
    const name         = data.name ?? null;

    Cookies.set('auth_token',    token,            COOKIE_OPTS);
    Cookies.set('refresh_token', refreshToken,     COOKIE_OPTS);
    Cookies.set('user_id',       String(userId),   COOKIE_OPTS);
    Cookies.set('user_role',     role,             COOKIE_OPTS);
    if (driverId) Cookies.set('driver_id', String(driverId), COOKIE_OPTS);
    if (name)     Cookies.set('user_name', name, COOKIE_OPTS);

    set({ token, refreshToken, userId, role, driverId, name });
  },

  setName: (name) => {
    Cookies.set('user_name', name, COOKIE_OPTS);
    set({ name });
  },

  logout: () => {
    ['auth_token', 'refresh_token', 'user_id', 'user_role', 'driver_id', 'user_name']
      .forEach(k => Cookies.remove(k));
    set({ token: null, refreshToken: null, userId: null, role: null, driverId: null, name: null });
  },
}));
