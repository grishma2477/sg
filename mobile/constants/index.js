import Constants from 'expo-constants';

export const API_URL    = process.env.EXPO_PUBLIC_API_URL    || 'http://localhost:5000';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || API_URL;

export const COLORS = {
  primary:   '#4f46e5',
  primaryDark:'#3730a3',
  success:   '#22c55e',
  danger:    '#ef4444',
  warning:   '#f59e0b',
  gray50:    '#f9fafb',
  gray100:   '#f3f4f6',
  gray200:   '#e5e7eb',
  gray300:   '#d1d5db',
  gray400:   '#9ca3af',
  gray500:   '#6b7280',
  gray700:   '#374151',
  gray900:   '#111827',
  white:     '#ffffff',
};

export const FONTS = {
  regular: 'System',
  medium:  'System',
  bold:    'System',
};

export const VEHICLE_TYPES = [
  { type: 'bike', label: 'Bike', icon: '🏍️', desc: 'Fast & affordable', eta: '3 min', baseFare: '50–150' },
  { type: 'car',  label: 'Car',  icon: '🚗', desc: 'Comfortable sedan',  eta: '5 min', baseFare: '150–350' },
  { type: 'suv',  label: 'SUV',  icon: '🚙', desc: 'Spacious & premium', eta: '7 min', baseFare: '300–600' },
];

export const POSITIVE_TAPS = [
  { key: 'GREAT_DRIVING', label: '👍 Great driving' },
  { key: 'FRIENDLY',      label: '😊 Friendly' },
  { key: 'CLEAN_VEHICLE', label: '✨ Clean vehicle' },
  { key: 'ON_TIME',       label: '⏱ On time' },
];

export const NEGATIVE_TAPS = [
  { key: 'RECKLESS_DRIVING', label: '⚠️ Reckless' },
  { key: 'UNFRIENDLY',       label: '😞 Unfriendly' },
  { key: 'DIRTY_VEHICLE',    label: '🚫 Dirty vehicle' },
  { key: 'LATE',             label: '⏰ Late' },
];

export const KATHMANDU_CENTER = { latitude: 27.7172, longitude: 85.3240 };
