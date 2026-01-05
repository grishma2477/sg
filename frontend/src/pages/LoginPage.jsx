// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Mail, Lock } from 'lucide-react';

// const LoginPage = ({ onLogin }) => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });

//   // Helper function to set cookie with 1 day expiry
//   const setCookie = (name, value, days = 1) => {
//     const expires = new Date();
//     expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
//     document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       const data = await response.json();
     
//       console.log("role of the logged in :", role1)
//       if (response.ok && data.success) {
//         // Extract from nested structure
//         const { accessToken, refreshToken, user } = data.data;
        
//         // Make sure we have user object
//         if (!user || !user.id || !user.role) {
//           console.error('❌ Invalid user data:', user);
//           alert('Login failed: Invalid user data');
//           return;
//         }

//         const userId = user.id;
//         const role = user.role;

//         console.log('✅ Extracted data:', { accessToken, refreshToken, userId, role });

//         // Store tokens and user info in cookies (1 day expiry)
//         setCookie('accessToken', accessToken, 1);
//         setCookie('refreshToken', refreshToken, 1);
//         setCookie('role', role, 1);
//         setCookie('userId', userId, 1);

//         // Also store in localStorage as backup
//         localStorage.setItem('accessToken', accessToken);
//         localStorage.setItem('refreshToken', refreshToken);
//         localStorage.setItem('role', role);
//         localStorage.setItem('userId', userId);

//         // Call parent onLogin callback
//         onLogin({
//           token: accessToken,
//           refreshToken: refreshToken,
//           role: role,
//           userId: userId,
//           driverId: null // Will be set if driver
//         });

//         // Determine redirect path based on role
//         const redirectPath = role === 'rider' ? '/rider/dashboard' : '/driver/dashboard';
        
//         console.log('🚀 Redirecting to:', redirectPath, 'for role:', role);

//         // Small delay to ensure state updates
//         setTimeout(() => {
//           navigate(redirectPath, { replace: true });
//         }, 100);

//       } else {
//         alert(data.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error('❌ Login error:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <div className="header">
//         <h1 className="header-title">Welcome Back</h1>
//         <p className="text-dim mt-1">Sign in to continue</p>
//       </div>

//       <div className="p-4">
//         <form onSubmit={handleSubmit}>
//           <div className="card">
//             <div className="mb-3">
//               <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//                 Email
//               </label>
//               <div style={{position: 'relative'}}>
//                 <Mail 
//                   size={20} 
//                   style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} 
//                 />
//                 <input
//                   type="email"
//                   className="input"
//                   placeholder="your@email.com"
//                   style={{paddingLeft: '3rem'}}
//                   value={formData.email}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mb-3">
//               <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//                 Password
//               </label>
//               <div style={{position: 'relative'}}>
//                 <Lock 
//                   size={20} 
//                   style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} 
//                 />
//                 <input
//                   type="password"
//                   className="input"
//                   placeholder="••••••••"
//                   style={{paddingLeft: '3rem'}}
//                   value={formData.password}
//                   onChange={(e) => setFormData({...formData, password: e.target.value})}
//                   required
//                 />
//               </div>
//             </div>

//             <button 
//               type="submit" 
//               className="btn btn-primary w-full mt-3"
//               disabled={loading}
//             >
//               {loading ? <span className="loading"></span> : 'Sign In'}
//             </button>
//           </div>
//         </form>

//         <div className="text-center mt-4">
//           <Link to="/register" className="btn btn-secondary">
//             Don't have an account? Sign Up
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Helper function to set cookie with 1 day expiry
  const setCookie = (name, value, days = 1) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    console.log(`🍪 Set cookie: ${name} = ${value.substring(0, 20)}...`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('🔍 Full login response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        console.log('📦 data.data:', data.data);
        console.log('👤 data.data.user:', data.data.user);
        
        // Extract tokens
        const accessToken = data.data.accessToken;
        const refreshToken = data.data.refreshToken;
        
        // Extract user info
        const userId = data.data.user.id;
        const role = data.data.user.role;

        console.log('✅ Extracted values:');
        console.log('  - accessToken:', accessToken?.substring(0, 30) + '...');
        console.log('  - refreshToken:', refreshToken?.substring(0, 30) + '...');
        console.log('  - userId:', userId);
        console.log('  - role:', role);

        // Store in cookies (1 day expiry)
        setCookie('accessToken', accessToken, 1);
        setCookie('refreshToken', refreshToken, 1);
        setCookie('userId', userId, 1);
        setCookie('role', role, 1);

        // Store in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userId);
        localStorage.setItem('role', role);
        
        console.log('💾 Stored in localStorage');
        console.log('🍪 All cookies set');

        // Call parent onLogin callback
        onLogin({
          token: accessToken,
          refreshToken: refreshToken,
          role: role,
          userId: userId,
          driverId: null
        });

        // Determine redirect path
        const redirectPath = role === 'rider' ? '/rider/dashboard' : '/driver/dashboard';
        console.log('🚀 Redirecting to:', redirectPath);

        // Redirect
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);

      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="header">
        <h1 className="header-title">Welcome Back</h1>
        <p className="text-dim mt-1">Sign in to continue</p>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="mb-3">
              <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
                Email
              </label>
              <div style={{position: 'relative'}}>
                <Mail 
                  size={20} 
                  style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} 
                />
                <input
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  style={{paddingLeft: '3rem'}}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
                Password
              </label>
              <div style={{position: 'relative'}}>
                <Lock 
                  size={20} 
                  style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} 
                />
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  style={{paddingLeft: '3rem'}}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full mt-3"
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/register" className="btn btn-secondary">
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;