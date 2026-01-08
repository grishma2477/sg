// cookieUtils.js - COMPLETE FIXED VERSION

export const saveAuthToCookies = (authData) => {
  // Save to localStorage
  localStorage.setItem('token', authData.token);
  localStorage.setItem('userId', authData.userId);
  localStorage.setItem('userRole', authData.role);
  
  // CRITICAL: Save driverId if it exists
  if (authData.driverId) {
    localStorage.setItem('driverId', authData.driverId);
  } else {
    localStorage.removeItem('driverId'); // Clear if not driver
  }

  if (authData.refreshToken) {
    localStorage.setItem('refreshToken', authData.refreshToken);
  }

  console.log('✅ Auth saved to cookies:', {
    token: 'EXISTS',
    userId: authData.userId,
    role: authData.role,
    driverId: authData.driverId || 'N/A'
  });
};

export const getAuthFromCookies = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const driverId = localStorage.getItem('driverId'); // CRITICAL: Load driverId
  const refreshToken = localStorage.getItem('refreshToken');

  if (token && userId) {
    return {
      token,
      userId,
      userRole,
      driverId,  // CRITICAL: Return driverId
      refreshToken
    };
  }

  return null;
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('driverId'); // CRITICAL: Clear driverId
  localStorage.removeItem('refreshToken');
  
  console.log('✅ Auth cleared');
};