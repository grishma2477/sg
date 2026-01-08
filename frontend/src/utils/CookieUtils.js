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

export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  console.log(`🗑️ Cookie deleted: ${name}`);
};

export const deleteAllCookies = () => {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    deleteCookie(name);
  }
  console.log('🗑️ All cookies deleted');
};

// Get auth data from cookies
export const getAuthFromCookies = () => {
  console.log('📖 Reading auth from cookies...');
  console.log('📋 All cookies:', document.cookie);
  
  const accessToken = getCookie('accessToken');
  const refreshToken = getCookie('refreshToken');
  const userId = getCookie('userId');
  const role = getCookie('role');
  const driverId = getCookie('driverId');

  console.log('✅ Auth data:', { accessToken: accessToken?.substring(0, 20) + '...', role, userId: userId?.substring(0, 8) });

  if (!accessToken || !userId || !role) {
    console.log('⚠️ Missing required auth data');
    return null;
  }

  return {
    token: accessToken,
    refreshToken: refreshToken,
    userId: userId,
    userRole: role,
    driverId: driverId
  };
};

// Save auth data to cookies
export const saveAuthToCookies = (authData) => {
  const { token, refreshToken, userId, userRole, driverId } = authData;
  const role = userRole;
  
  console.log('💾 Saving to cookies:', { role, userId: userId?.substring(0, 8) });
  
  setCookie('accessToken', token, 1);
  setCookie('refreshToken', refreshToken, 1);
  setCookie('userId', userId, 1);
  setCookie('role', role, 1);
  
  if (driverId) {
    setCookie('driverId', driverId, 1);
  }

  // Also save to localStorage as backup
  localStorage.setItem('accessToken', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userId', userId);
  localStorage.setItem('role', role);
  
  if (driverId) {
    localStorage.setItem('driverId', driverId);
  }

  console.log('✅ Saved to cookies and localStorage');
  
  // Verify cookies were set
  console.log('🔍 Verifying cookies:', document.cookie);
};

// Clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('driverId'); // CRITICAL: Clear driverId
  localStorage.removeItem('refreshToken');
  
  console.log('✅ Auth cleared');
};