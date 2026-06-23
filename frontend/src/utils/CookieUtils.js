
// import Cookies from 'js-cookie';

// // Save auth data to cookies
// export const saveAuthToCookies = (authData) => {
//   console.log('💾 Saving auth to cookies:', authData);
  
//   if (authData.token) {
//     Cookies.set('auth_token', authData.token, { expires: 7 });
//   }
  
//   if (authData.refreshToken) {
//     Cookies.set('refresh_token', authData.refreshToken, { expires: 7 });
//   }
  
//   if (authData.userId) {
//     Cookies.set('user_id', authData.userId, { expires: 7 });
//   }
  
//   if (authData.userRole) {
//     Cookies.set('user_role', authData.userRole, { expires: 7 });
//   }
  
//   if (authData.driverId) {
//     Cookies.set('driver_id', authData.driverId, { expires: 7 });
//   }

//   // ✅ CRITICAL FIX: Save user object as JSON
//   if (authData.user) {
//     Cookies.set('user', JSON.stringify(authData.user), { expires: 7 });
//   }
  
//   console.log('✅ Auth saved to cookies');
// };

// // Get auth data from cookies
// export const getAuthFromCookies = () => {
//   const token = Cookies.get('auth_token');
  
//   if (!token) {
//     console.log('❌ No token found in cookies');
//     return null;
//   }

//   const userId = Cookies.get('user_id');
//   const userRole = Cookies.get('user_role');
//   const userJson = Cookies.get('user');
  
//   // ✅ CRITICAL FIX: Reconstruct user object from cookies
//   let user = null;
  
//   if (userJson) {
//     // If user object was saved, parse it
//     try {
//       user = JSON.parse(userJson);
//     } catch (error) {
//       console.error('Error parsing user from cookie:', error);
//     }
//   }
  
//   // If user object wasn't saved or parsing failed, create it from userId and userRole
//   if (!user && userId && userRole) {
//     user = {
//       id: userId,
//       role: userRole
//     };
//   }

//   const authData = {
//     token,
//     refreshToken: Cookies.get('refresh_token'),
//     userId,
//     userRole,
//     driverId: Cookies.get('driver_id'),
//     user  // ✅ This will now always exist after login
//   };
  
//   console.log('📦 Auth loaded from cookies:', authData);
  
//   return authData;
// };

// // Clear all auth data
// export const clearAuthData = () => {
//   console.log('🧹 Clearing auth data from cookies');
  
//   Cookies.remove('auth_token');
//   Cookies.remove('refresh_token');
//   Cookies.remove('user_id');
//   Cookies.remove('user_role');
//   Cookies.remove('driver_id');
//   Cookies.remove('user');  // ✅ Also remove user object
  
//   console.log('✅ Auth data cleared');
// };

// // Helper function to check if user is authenticated
// export const isAuthenticated = () => {
//   return !!Cookies.get('auth_token');
// };

// // Helper function to get token
// export const getToken = () => {
//   return Cookies.get('auth_token');
// };

// // Helper function to get user role
// export const getUserRole = () => {
//   return Cookies.get('user_role');
// };


import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
  expires: 7,
  sameSite: 'strict'
};

export const saveAuthToCookies = (authData = {}) => {
  const token = authData.token || authData.accessToken;
  const refreshToken = authData.refreshToken;
  const userId = authData.userId || authData.id || authData.user?.id;
  const userRole = authData.userRole || authData.role || authData.user?.role;
  const driverId = authData.driverId || authData.driver_id || authData.user?.driverId;

  if (token) Cookies.set('auth_token', token, COOKIE_OPTIONS);
  if (refreshToken) Cookies.set('refresh_token', refreshToken, COOKIE_OPTIONS);
  if (userId) Cookies.set('user_id', userId, COOKIE_OPTIONS);
  if (userRole) Cookies.set('user_role', userRole, COOKIE_OPTIONS);
  if (driverId) Cookies.set('driver_id', driverId, COOKIE_OPTIONS);

  const user = authData.user || (userId && userRole ? { id: userId, role: userRole } : null);
  if (user) Cookies.set('user', JSON.stringify(user), COOKIE_OPTIONS);
};

export const getAuthFromCookies = () => {
  const token = Cookies.get('auth_token');
  const userId = Cookies.get('user_id');
  const userRole = Cookies.get('user_role');

  if (!token || !userId || !userRole) {
    return null;
  }

  let user = null;
  const userJson = Cookies.get('user');
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      user = null;
    }
  }

  if (!user) {
    user = { id: userId, role: userRole };
  }

  return {
    token,
    refreshToken: Cookies.get('refresh_token') || null,
    userId,
    userRole,
    driverId: Cookies.get('driver_id') || null,
    user
  };
};

export const clearAuthData = () => {
  ['auth_token', 'refresh_token', 'user_id', 'user_role', 'driver_id', 'user'].forEach((name) => {
    Cookies.remove(name);
  });
};

export const isAuthenticated = () => Boolean(Cookies.get('auth_token'));
export const getToken = () => Cookies.get('auth_token') || null;
export const getUserRole = () => Cookies.get('user_role') || null;
