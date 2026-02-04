

// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { User, Lock, Mail, Phone } from 'lucide-react';

// const RegisterPage = ({ onRegister }) => {
//   const navigate = useNavigate();
//   const [role, setRole] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     phone: '',
//     firstName: '',
//     lastName: ''
//   });

//   // Helper function to set cookie
//   const setCookie = (name, value, days = 7) => {
//     const expires = new Date();
//     expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
//     document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = {
//         email: formData.email,
//         password: formData.password,
//         role,
//         first_name: formData.firstName,
//         last_name: formData.lastName
//       };
//       const response = await fetch('http://localhost:5000/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
//       console.log('🔍 Full register response:', data);

//       if (response.ok && data.success) {
//         // Extract from nested structure
//         const { accessToken, refreshToken, user, id: userId, role: userRole } = data.data;
//         // const { id: userId, role: userRole } = user;

//         console.log('✅ Extracted data:', { accessToken, refreshToken, userId, userRole });

//         // Store tokens and user info in cookies
//         setCookie('accessToken', accessToken, 7);
//         setCookie('refreshToken', refreshToken, 30);
//         setCookie('role', userRole, 7);
//         setCookie('userId', userId, 7);

//         // Also store in localStorage as backup
//         localStorage.setItem('accessToken', accessToken);
//         localStorage.setItem('refreshToken', refreshToken);
//         localStorage.setItem('role', userRole);
//         localStorage.setItem('userId', userId);

//         // Call parent onRegister callback
//         onRegister({
//           token: accessToken,
//           refreshToken: refreshToken,
//           role: userRole,
//           userId: userId,
//           driverId: null // Will be set if driver
//         });

//         // Determine redirect path based on role
//         const redirectPath = userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard';

//         console.log('🚀 Redirecting to:', redirectPath, 'for role:', userRole);

//         // Small delay to ensure state updates
//         setTimeout(() => {
//           navigate(redirectPath, { replace: true });
//         }, 100);

//       } else {
//         alert(data.message || 'Registration failed');
//       }
//     } catch (error) {
//       console.error('❌ Registration error:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <div className="header">
//         <h1 className="header-title">Join RideShare</h1>
//         <p className="text-dim mt-1">Create your account</p>
//       </div>

//       <div className="p-4">
//         <div className="mb-4">
//           <div className="flex gap-2">
//             <button
//               type="button"
//               className={`btn flex-1 ${role === 'rider' ? 'btn-primary' : 'btn-secondary'}`}
//               onClick={() => setRole('rider')}
//             >
//               I'm a Rider
//             </button>
//             <button
//               type="button"
//               className={`btn flex-1 ${role === 'driver' ? 'btn-primary' : 'btn-secondary'}`}
//               onClick={() => setRole('driver')}
//             >
//               I'm a Driver
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="card">
//             <div className="flex gap-2 mb-3">
//               <div className="flex-1">
//                 <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>First Name</label>
//                 <input
//                   type="text"
//                   className="input"
//                   placeholder="John"
//                   value={formData.firstName}
//                   onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
//                   required
//                 />
//               </div>
//               <div className="flex-1">
//                 <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>Last Name</label>
//                 <input
//                   type="text"
//                   className="input"
//                   placeholder="Doe"
//                   value={formData.lastName}
//                   onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mb-3">
//               <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>Email</label>
//               <div style={{ position: 'relative' }}>
//                 <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
//                 <input
//                   type="email"
//                   className="input"
//                   placeholder="your@email.com"
//                   style={{ paddingLeft: '3rem' }}
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mb-3">
//               <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>Phone</label>
//               <div style={{ position: 'relative' }}>
//                 <Phone size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
//                 <input
//                   type="tel"
//                   className="input"
//                   placeholder="+1234567890"
//                   style={{ paddingLeft: '3rem' }}
//                   value={formData.phone}
//                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mb-3">
//               <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>Password</label>
//               <div style={{ position: 'relative' }}>
//                 <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
//                 <input
//                   type="password"
//                   className="input"
//                   placeholder="••••••••"
//                   style={{ paddingLeft: '3rem' }}
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   required
//                 />
//               </div>
//             </div>

//             <button type="submit" className="btn btn-primary w-full mt-3" disabled={loading}>
//               {loading ? <span className="loading"></span> : 'Create Account'}
//             </button>
//           </div>
//         </form>

//         <div className="text-center mt-4">
//           <Link to="/login" className="btn btn-secondary">
//             Already have an account? Sign In
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { User, Mail, Lock, Phone, AlertCircle, Car, UserCircle } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// const RegisterPage = ({ onRegister }) => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   const [formData, setFormData] = useState({
//     first_name: '',
//     last_name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phone_number: '',
//     role: 'rider' // Default to rider
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//     setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     // Validation
//     if (!formData.first_name || !formData.last_name) {
//       setError('Please enter your full name');
//       return;
//     }

//     if (!formData.email) {
//       setError('Please enter your email');
//       return;
//     }

//     if (!formData.password) {
//       setError('Please enter a password');
//       return;
//     }

//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters');
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     if (!formData.phone_number) {
//       setError('Please enter your phone number');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(`${API_URL}/api/auth/register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           first_name: formData.first_name,
//           last_name: formData.last_name,
//           email: formData.email,
//           password: formData.password,
//           phone_number: formData.phone_number,
//           role: formData.role
//         })
//       });

//       const data = await response.json();
//       console.log('Register response:', data);

//       if (response.ok && data.success) {
//         // Show success message
//         alert(`Registration successful! You registered as a ${formData.role}. Please login to continue.`);
        
//         // Navigate to login
//         navigate('/login');
//       } else {
//         setError(data.message || 'Registration failed');
//       }
//     } catch (error) {
//       console.error('Registration error:', error);
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         {/* Header */}
//         <div className="text-center">
//           <h2 className="text-3xl font-extrabold text-gray-900">
//             Create your account
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Join Sajilo Gaadi today
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="rounded-lg bg-red-50 p-4 border border-red-200">
//             <div className="flex items-start">
//               <AlertCircle className="h-5 w-5 text-red-400" />
//               <div className="ml-3">
//                 <p className="text-sm text-red-800">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Registration Form */}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             {/* Role Selection */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-3">
//                 I want to register as *
//               </label>
//               <div className="grid grid-cols-2 gap-4">
//                 <button
//                   type="button"
//                   onClick={() => setFormData({ ...formData, role: 'rider' })}
//                   className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all ${
//                     formData.role === 'rider'
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <UserCircle className={`w-12 h-12 mb-3 ${
//                     formData.role === 'rider' ? 'text-blue-500' : 'text-gray-400'
//                   }`} />
//                   <span className={`font-semibold ${
//                     formData.role === 'rider' ? 'text-blue-700' : 'text-gray-700'
//                   }`}>
//                     Rider
//                   </span>
//                   <span className="text-xs text-gray-500 mt-1">Book rides</span>
//                   {formData.role === 'rider' && (
//                     <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
//                       <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                   )}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setFormData({ ...formData, role: 'driver' })}
//                   className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all ${
//                     formData.role === 'driver'
//                       ? 'border-green-500 bg-green-50'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <Car className={`w-12 h-12 mb-3 ${
//                     formData.role === 'driver' ? 'text-green-500' : 'text-gray-400'
//                   }`} />
//                   <span className={`font-semibold ${
//                     formData.role === 'driver' ? 'text-green-700' : 'text-gray-700'
//                   }`}>
//                     Driver
//                   </span>
//                   <span className="text-xs text-gray-500 mt-1">Earn money</span>
//                   {formData.role === 'driver' && (
//                     <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
//                       <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                   )}
//                 </button>
//               </div>
//               {formData.role === 'driver' && (
//                 <p className="mt-2 text-sm text-green-600 font-medium">
//                   ℹ️ You'll need to complete KYC verification to start driving
//                 </p>
//               )}
//             </div>

//             {/* Name Fields */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
//                   First Name *
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <User className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="first_name"
//                     name="first_name"
//                     type="text"
//                     value={formData.first_name}
//                     onChange={handleChange}
//                     className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="John"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
//                   Last Name *
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <User className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="last_name"
//                     name="last_name"
//                     type="text"
//                     value={formData.last_name}
//                     onChange={handleChange}
//                     className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Doe"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email Address *
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="john@example.com"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Phone */}
//             <div>
//               <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
//                 Phone Number *
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Phone className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="phone_number"
//                   name="phone_number"
//                   type="tel"
//                   value={formData.phone_number}
//                   onChange={handleChange}
//                   className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="+977 9812345678"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Password *
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
//                 Confirm Password *
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   type="password"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {loading ? 'Creating account...' : 'Create Account'}
//             </button>
//           </div>

//           {/* Login Link */}
//           <div className="text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <button
//                 type="button"
//                 onClick={() => navigate('/login')}
//                 className="font-medium text-blue-600 hover:text-blue-500"
//               >
//                 Login here
//               </button>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RegisterPage = ({ onRegister }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('rider');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone_number: '',
    first_name: '',
    last_name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!role) {
      setError('Please select your role (Rider or Driver)');
      setLoading(false);
      return;
    }

    if (!formData.first_name || !formData.last_name) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (!formData.email) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    if (!formData.phone_number) {
      setError('Please enter your phone number');
      setLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: role
      };

      console.log('📤 Sending registration:', payload);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Registration response:', data);

      if (response.ok && data.success) {
        // Show success message
        alert(`✅ Registration successful! You registered as a ${role}. Please login to continue.`);
        
        // Navigate to login
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="header">
        <h1 className="header-title">Join Sajilo Gaadi</h1>
        <p className="text-dim mt-1">Create your account</p>
      </div>

      <div className="p-4">
        {/* Role Selection */}
        <div className="mb-4">
          <div className="flex gap-2">
            <button
              type="button"
              className={`btn flex-1 ${role === 'rider' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRole('rider')}
            >
              I'm a Rider
            </button>
            <button
              type="button"
              className={`btn flex-1 ${role === 'driver' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRole('driver')}
            >
              I'm a Driver
            </button>
          </div>
          {role === 'driver' && (
            <p className="text-center mt-2 text-sm" style={{ color: '#7C3AED' }}>
              ℹ️ You'll need to complete KYC verification to start driving
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg" 
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)' 
            }}>
            <p className="text-sm" style={{ color: '#FCA5A5' }}>{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div className="card">
            {/* Name Fields */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>
                Email *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={20} 
                  style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#94A3B8' 
                  }} 
                />
                <input
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  style={{ paddingLeft: '3rem' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>
                Phone Number *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone 
                  size={20} 
                  style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#94A3B8' 
                  }} 
                />
                <input
                  type="tel"
                  className="input"
                  placeholder="+977 9812345678"
                  style={{ paddingLeft: '3rem' }}
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={20} 
                  style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#94A3B8' 
                  }} 
                />
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '3rem' }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <p className="text-dim text-xs mt-1">Minimum 6 characters</p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary w-full mt-3" 
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : 'Create Account'}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4">
          <Link to="/login" className="btn btn-secondary">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;