


// // Cookie utility functions

// export const setCookie = (name, value, days = 1) => {
//   const expires = new Date();
//   expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
//   document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
//   console.log(`🍪 Cookie set: ${name} = ${value}`);
// };

// export const getCookie = (name) => {
//   const nameEQ = name + "=";
//   const ca = document.cookie.split(';');
  
//   for (let i = 0; i < ca.length; i++) {
//     let c = ca[i];
//     while (c.charAt(0) === ' ') c = c.substring(1, c.length);
//     if (c.indexOf(nameEQ) === 0) {
//       const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
//       console.log(`📖 Cookie read: ${name} = ${value}`);
//       return value;
//     }
//   }
  
//   console.log(`⚠️ Cookie not found: ${name}`);
//   return null;
// };

// export const deleteCookie = (name) => {
//   document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
//   console.log(`🗑️ Cookie deleted: ${name}`);
// };

// export const deleteAllCookies = () => {
//   const cookies = document.cookie.split(";");
//   for (let i = 0; i < cookies.length; i++) {
//     const cookie = cookies[i];
//     const eqPos = cookie.indexOf("=");
//     const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
//     deleteCookie(name);
//   }
//   console.log('🗑️ All cookies deleted');
// };

// // Get auth data from cookies
// export const getAuthFromCookies = () => {
//   console.log('📖 Reading auth from cookies...');
//   console.log('📋 All cookies:', document.cookie);
  
//   const accessToken = getCookie('accessToken');
//   const refreshToken = getCookie('refreshToken');
//   const userId = getCookie('userId');
//   const role = getCookie('role');
//   const driverId = getCookie('driverId');

//   console.log('✅ Auth data:', { accessToken: accessToken?.substring(0, 20) + '...', role, userId: userId?.substring(0, 8) });

//   if (!accessToken || !userId || !role) {
//     console.log('⚠️ Missing required auth data');
//     return null;
//   }

//   return {
//     token: accessToken,
//     refreshToken: refreshToken,
//     userId: userId,
//     userRole: role,
//     driverId: driverId
//   };
// };

// // Save auth data to cookies
// export const saveAuthToCookies = (authData) => {
//   const { token, refreshToken, userId, userRole, driverId } = authData;
//   const role = userRole;
  
//   console.log('💾 Saving to cookies:', { role, userId: userId?.substring(0, 8) });
  
//   setCookie('accessToken', token, 1);
//   setCookie('refreshToken', refreshToken, 1);
//   setCookie('userId', userId, 1);
//   setCookie('role', role, 1);
  
//   if (driverId) {
//     setCookie('driverId', driverId, 1);
//   }

//   // Also save to localStorage as backup
//   localStorage.setItem('accessToken', token);
//   localStorage.setItem('refreshToken', refreshToken);
//   localStorage.setItem('userId', userId);
//   localStorage.setItem('role', role);
  
//   if (driverId) {
//     localStorage.setItem('driverId', driverId);
//   }

//   console.log('✅ Saved to cookies and localStorage');
  
//   // Verify cookies were set
//   console.log('🔍 Verifying cookies:', document.cookie);
// };

// // Clear all auth data
// export const clearAuthData = () => {
//   console.log('🗑️ Clearing all auth data');
  
//   // Clear cookies
//   deleteCookie('accessToken');
//   deleteCookie('refreshToken');
//   deleteCookie('userId');
//   deleteCookie('role');
//   deleteCookie('driverId');

//   // Clear localStorage
//   localStorage.removeItem('accessToken');
//   localStorage.removeItem('refreshToken');
//   localStorage.removeItem('userId');
//   localStorage.removeItem('role');
//   localStorage.removeItem('driverId');

//   console.log('✅ Auth data cleared');
// };



import Cookies from 'js-cookie';

// Save auth data to cookies
export const saveAuthToCookies = (authData) => {
  console.log('💾 Saving auth to cookies:', authData);
  
  if (authData.token) {
    Cookies.set('auth_token', authData.token, { expires: 7 });
  }
  
  if (authData.refreshToken) {
    Cookies.set('refresh_token', authData.refreshToken, { expires: 7 });
  }
  
  if (authData.userId) {
    Cookies.set('user_id', authData.userId, { expires: 7 });
  }
  
  if (authData.userRole) {
    Cookies.set('user_role', authData.userRole, { expires: 7 });
  }
  
  if (authData.driverId) {
    Cookies.set('driver_id', authData.driverId, { expires: 7 });
  }

  // ✅ CRITICAL FIX: Save user object as JSON
  if (authData.user) {
    Cookies.set('user', JSON.stringify(authData.user), { expires: 7 });
  }
  
  console.log('✅ Auth saved to cookies');
};

// Get auth data from cookies
export const getAuthFromCookies = () => {
  const token = Cookies.get('auth_token');
  
  if (!token) {
    console.log('❌ No token found in cookies');
    return null;
  }

  const userId = Cookies.get('user_id');
  const userRole = Cookies.get('user_role');
  const userJson = Cookies.get('user');
  
  // ✅ CRITICAL FIX: Reconstruct user object from cookies
  let user = null;
  
  if (userJson) {
    // If user object was saved, parse it
    try {
      user = JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user from cookie:', error);
    }
  }
  
  // If user object wasn't saved or parsing failed, create it from userId and userRole
  if (!user && userId && userRole) {
    user = {
      id: userId,
      role: userRole
    };
  }

  const authData = {
    token,
    refreshToken: Cookies.get('refresh_token'),
    userId,
    userRole,
    driverId: Cookies.get('driver_id'),
    user  // ✅ This will now always exist after login
  };
  
  console.log('📦 Auth loaded from cookies:', authData);
  
  return authData;
};

// Clear all auth data
export const clearAuthData = () => {
  console.log('🧹 Clearing auth data from cookies');
  
  Cookies.remove('auth_token');
  Cookies.remove('refresh_token');
  Cookies.remove('user_id');
  Cookies.remove('user_role');
  Cookies.remove('driver_id');
  Cookies.remove('user');  // ✅ Also remove user object
  
  console.log('✅ Auth data cleared');
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!Cookies.get('auth_token');
};

// Helper function to get token
export const getToken = () => {
  return Cookies.get('auth_token');
};

// Helper function to get user role
export const getUserRole = () => {
  return Cookies.get('user_role');
};