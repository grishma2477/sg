

// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Upload, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
// import { getToken } from '../utils/CookieUtils';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// const ApplyForDriver = () => {
//   const navigate = useNavigate();
//   const [step, setStep] = useState('form'); // 'form' or 'success'
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [checkingExisting, setCheckingExisting] = useState(true);

//   const [formData, setFormData] = useState({
//     licenseNumber: '',
//     licenseIssuedDate: '',
//     licenseExpiryDate: '',
//     licenseCategory: [],
//     vehicleType: 'car',
//     vehicleMake: '',
//     vehicleModel: '',
//     vehicleYear: '',
//     vehicleColor: '',
//     vehiclePlateNumber: ''
//   });

//   const [files, setFiles] = useState({
//     licenseFront: null,
//     licenseBack: null,
//     vehicleRegistration: null,
//     vehicleInsurance: null,
//     vehiclePhotoFront: null,
//     vehiclePhotoBack: null
//   });

//   const licenseFrontRef = useRef(null);

//   useEffect(() => {
//     checkExistingApplication();
//   }, []);

//   const checkExistingApplication = async () => {
//     try {
//       const token = getToken();
//       const response = await fetch(`${API_URL}/api/driver-applications/check`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       const data = await response.json();
      
//       if (data.success && data.data.hasApplication) {
//         const status = data.data.status;
        
//         if (status === 'pending') {
//           alert('You already have a pending application. Please wait for admin review.');
//           navigate('/rider/profile');
//         } else if (status === 'approved') {
//           alert('Your application has already been approved! You are now a driver.');
//           navigate('/driver/dashboard');
//         } else if (status === 'rejected') {
//           alert(`Your previous application was rejected: ${data.data.remarks || 'No reason provided'}\n\nYou can submit a new application.`);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking application:', error);
//     } finally {
//       setCheckingExisting(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleCheckboxChange = (category) => {
//     const current = formData.licenseCategory;
//     const updated = current.includes(category)
//       ? current.filter(c => c !== category)
//       : [...current, category];
    
//     setFormData({ ...formData, licenseCategory: updated });
//   };

//   const handleFileSelect = (e, fileType) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       setError('File size must be less than 5MB');
//       return;
//     }

//     if (!file.type.startsWith('image/')) {
//       setError('Please upload an image file');
//       return;
//     }

//     setFiles({ ...files, [fileType]: file });
//     setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       // Validation
//       if (formData.licenseCategory.length === 0) {
//         setError('Please select at least one license category');
//         setLoading(false);
//         return;
//       }

//       if (!files.licenseFront) {
//         setError('Please upload driving license front image');
//         setLoading(false);
//         return;
//       }

//       if (!files.vehicleRegistration) {
//         setError('Please upload vehicle registration');
//         setLoading(false);
//         return;
//       }

//       if (!files.vehicleInsurance) {
//         setError('Please upload vehicle insurance');
//         setLoading(false);
//         return;
//       }

//       if (!files.vehiclePhotoFront) {
//         setError('Please upload vehicle front photo');
//         setLoading(false);
//         return;
//       }

//       const token = getToken();
//       const submitData = new FormData();

//       // Add form data
//       Object.keys(formData).forEach(key => {
//         if (key === 'licenseCategory') {
//           submitData.append(key, formData[key].join(','));
//         } else {
//           submitData.append(key, formData[key]);
//         }
//       });

//       // Add files
//       Object.keys(files).forEach(key => {
//         if (files[key]) {
//           submitData.append(key, files[key]);
//         }
//       });

//       const response = await fetch(`${API_URL}/api/driver-applications/submit`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         body: submitData
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setStep('success');
//       } else {
//         setError(data.message || 'Submission failed');
//       }
//     } catch (error) {
//       console.error('❌ Application submission error:', error);
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (checkingExisting) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   if (step === 'success') {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" style={{ paddingBottom: '2rem' }}>
//         <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
//           <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
//             <CheckCircle className="w-12 h-12 text-green-600" />
//           </div>
          
//           <h1 className="text-2xl font-bold text-gray-900 mb-4">Success</h1>
          
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">
//             Document Uploaded Successfully
//           </h2>
          
//           <p className="text-gray-600 mb-6">
//             Our Team will review all the documents carefully and update you in 72 hours.
//           </p>
          
//           <p className="text-gray-500 mb-8">
//             Thanks for your time.
//           </p>
          
//           <button
//             onClick={() => navigate('/rider/dashboard')}
//             className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
//           >
//             Go Back to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-8 px-4" style={{ paddingBottom: '2rem' }}>
//       <div className="max-w-4xl mx-auto w-full">
//         <div className="bg-white rounded-3xl shadow-xl p-8">
//           {/* Header */}
//           <div className="flex items-center mb-6">
//             <button
//               onClick={() => navigate('/rider/profile')}
//               className="p-2 hover:bg-gray-100 rounded-full"
//             >
//               <ArrowLeft size={24} className="text-gray-600" />
//             </button>
//             <h1 className="text-2xl font-bold text-gray-900 ml-4">
//               Apply For Driver
//             </h1>
//           </div>

//           {/* Description */}
//           <p className="text-gray-600 mb-6 text-sm leading-relaxed">
//             Join our community of trusted drivers by completing the document verification process. Please provide all required information accurately.
//           </p>

//           {/* Error Message */}
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             {/* Driving License Number */}
//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Driving License Number
//               </label>
//               <input
//                 type="text"
//                 name="licenseNumber"
//                 value={formData.licenseNumber}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
//                 placeholder="123456789"
//                 required
//               />
//             </div>

//             {/* Issued Date */}
//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Issued Date
//               </label>
//               <input
//                 type="date"
//                 name="licenseIssuedDate"
//                 value={formData.licenseIssuedDate}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
//                 placeholder="April 05, 2026"
//                 required
//               />
//             </div>

//             {/* Expiry Date */}
//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Expiry Date
//               </label>
//               <input
//                 type="date"
//                 name="licenseExpiryDate"
//                 value={formData.licenseExpiryDate}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
//                 placeholder="April 05, 2026"
//                 required
//               />
//             </div>

//             {/* Category */}
//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 mb-3">
//                 Category
//               </label>
//               <div className="space-y-2">
//                 {['A (Bike)', 'B (Scooter)', 'B-C (Car)'].map((category) => (
//                   <label key={category} className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={formData.licenseCategory.includes(category)}
//                       onChange={() => handleCheckboxChange(category)}
//                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                     />
//                     <span className="ml-2 text-gray-700">{category}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Vehicle Information */}
//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Vehicle Type
//               </label>
//               <select
//                 name="vehicleType"
//                 value={formData.vehicleType}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
//                 required
//               >
//                 <option value="bike">Bike</option>
//                 <option value="scooter">Scooter</option>
//                 <option value="car">Car</option>
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Make
//                 </label>
//                 <input
//                   type="text"
//                   name="vehicleMake"
//                   value={formData.vehicleMake}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
//                   placeholder="Honda"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Model
//                 </label>
//                 <input
//                   type="text"
//                   name="vehicleModel"
//                   value={formData.vehicleModel}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
//                   placeholder="Civic"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Year
//                 </label>
//                 <input
//                   type="number"
//                   name="vehicleYear"
//                   value={formData.vehicleYear}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
//                   placeholder="2020"
//                   min="1990"
//                   max="2026"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Color
//                 </label>
//                 <input
//                   type="text"
//                   name="vehicleColor"
//                   value={formData.vehicleColor}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
//                   placeholder="Black"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Plate Number
//               </label>
//               <input
//                 type="text"
//                 name="vehiclePlateNumber"
//                 value={formData.vehiclePlateNumber}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
//                 placeholder="ABC-1234"
//                 required
//               />
//             </div>

//             {/* Upload Document Section */}
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-gray-700 mb-3">
//                 Step 3 : Upload Document
//               </h3>
              
//               <div className="mb-3">
//                 <label className="block text-sm text-gray-600 mb-2">
//                   Upload Driving Licenses *
//                 </label>
//                 <div
//                   onClick={() => licenseFrontRef.current?.click()}
//                   className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
//                 >
//                   <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
//                     <Upload className="w-8 h-8 text-blue-600" />
//                   </div>
//                   <p className="text-sm font-semibold text-gray-700">
//                     {files.licenseFront ? files.licenseFront.name : 'Upload Document Front'}
//                   </p>
//                   <input
//                     ref={licenseFrontRef}
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => handleFileSelect(e, 'licenseFront')}
//                     className="hidden"
//                   />
//                 </div>
//               </div>

//               {/* Hidden file inputs for other documents */}
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleFileSelect(e, 'licenseBack')}
//                 className="hidden"
//                 id="licenseBack"
//               />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleFileSelect(e, 'vehicleRegistration')}
//                 className="hidden"
//                 id="vehicleRegistration"
//               />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleFileSelect(e, 'vehicleInsurance')}
//                 className="hidden"
//                 id="vehicleInsurance"
//               />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleFileSelect(e, 'vehiclePhotoFront')}
//                 className="hidden"
//                 id="vehiclePhotoFront"
//               />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleFileSelect(e, 'vehiclePhotoBack')}
//                 className="hidden"
//                 id="vehiclePhotoBack"
//               />

//               {/* Additional upload buttons */}
//               <div className="grid grid-cols-2 gap-3 mt-3">
//                 <button
//                   type="button"
//                   onClick={() => document.getElementById('licenseBack').click()}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   {files.licenseBack ? '✓ License Back' : 'License Back (Optional)'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => document.getElementById('vehicleRegistration').click()}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   {files.vehicleRegistration ? '✓ Registration' : 'Vehicle Registration *'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => document.getElementById('vehicleInsurance').click()}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   {files.vehicleInsurance ? '✓ Insurance' : 'Vehicle Insurance *'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => document.getElementById('vehiclePhotoFront').click()}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   {files.vehiclePhotoFront ? '✓ Vehicle Front' : 'Vehicle Photo *'}
//                 </button>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Submitting...
//                 </>
//               ) : (
//                 'Submit'
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApplyForDriver;



import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, ArrowLeft, Loader2, FileText, Car, Calendar } from 'lucide-react';
import { getToken } from '../utils/CookieUtils';
import './ApplyForDriver.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ApplyForDriver = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [formData, setFormData] = useState({
    licenseNumber: '',
    licenseIssuedDate: '',
    licenseExpiryDate: '',
    licenseCategory: [],
    vehicleType: 'car',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehiclePlateNumber: ''
  });

  const [files, setFiles] = useState({
    licenseFront: null,
    licenseBack: null,
    vehicleRegistration: null,
    vehicleInsurance: null,
    vehiclePhotoFront: null,
    vehiclePhotoBack: null
  });

  const fileInputRefs = {
    licenseFront: useRef(null),
    licenseBack: useRef(null),
    vehicleRegistration: useRef(null),
    vehicleInsurance: useRef(null),
    vehiclePhotoFront: useRef(null),
    vehiclePhotoBack: useRef(null)
  };

  useEffect(() => {
    checkExistingApplication();
  }, []);

  const checkExistingApplication = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/driver-applications/check`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success && data.data.hasApplication) {
        const status = data.data.status;
        
        if (status === 'pending') {
          alert('You already have a pending application. Please wait for admin review.');
          navigate('/rider/profile');
        } else if (status === 'approved') {
          alert('Your application has already been approved! You are now a driver.');
          navigate('/driver/dashboard');
        } else if (status === 'rejected') {
          alert(`Your previous application was rejected: ${data.data.remarks || 'No reason provided'}\n\nYou can submit a new application.`);
        }
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (category) => {
    const current = formData.licenseCategory;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    
    setFormData({ ...formData, licenseCategory: updated });
  };

  const handleFileSelect = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setFiles({ ...files, [fileType]: file });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.licenseCategory.length === 0) {
        setError('Please select at least one license category');
        setLoading(false);
        return;
      }

      if (!files.licenseFront) {
        setError('Please upload driving license front image');
        setLoading(false);
        return;
      }

      if (!files.vehicleRegistration) {
        setError('Please upload vehicle registration');
        setLoading(false);
        return;
      }

      if (!files.vehicleInsurance) {
        setError('Please upload vehicle insurance');
        setLoading(false);
        return;
      }

      if (!files.vehiclePhotoFront) {
        setError('Please upload vehicle front photo');
        setLoading(false);
        return;
      }

      const token = getToken();
      const submitData = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'licenseCategory') {
          submitData.append(key, formData[key].join(','));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      const response = await fetch(`${API_URL}/api/driver-applications/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('success');
      } else {
        setError(data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('❌ Application submission error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="apply-loading">
        <Loader2 className="spinner" />
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="apply-success">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle />
          </div>
          
          <h1>Success!</h1>
          <h2>Document Uploaded Successfully</h2>
          
          <p className="success-message">
            Our Team will review all the documents carefully and update you in 72 hours.
          </p>
          
          <p className="success-thanks">Thanks for your time.</p>
          
          <button
            onClick={() => navigate('/rider/dashboard')}
            className="btn-home"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-container">
      <div className="apply-wrapper">
        <div className="apply-card">
          {/* Header */}
          <div className="apply-header">
            <button onClick={() => navigate('/rider/profile')} className="btn-back">
              <ArrowLeft size={24} />
            </button>
            <div className="header-content">
              <h1>Apply For Driver</h1>
              <p>Join our community of trusted drivers</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section 1: License Information */}
            <div className="form-section">
              <div className="section-header">
                <FileText size={20} />
                <h3>License Information</h3>
              </div>

              <div className="form-grid">
                <div className="form-group full">
                  <label>Driving License Number *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="e.g., 123456789"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Issued Date *</label>
                  <input
                    type="date"
                    name="licenseIssuedDate"
                    value={formData.licenseIssuedDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={formData.licenseExpiryDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group full">
                  <label>License Category *</label>
                  <div className="checkbox-group">
                    {['A (Bike)', 'B (Scooter)', 'B-C (Car)'].map((category) => (
                      <label key={category} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.licenseCategory.includes(category)}
                          onChange={() => handleCheckboxChange(category)}
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Vehicle Information */}
            <div className="form-section">
              <div className="section-header">
                <Car size={20} />
                <h3>Vehicle Information</h3>
              </div>

              <div className="form-grid">
                <div className="form-group full">
                  <label>Vehicle Type *</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    required
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Make *</label>
                  <input
                    type="text"
                    name="vehicleMake"
                    value={formData.vehicleMake}
                    onChange={handleChange}
                    placeholder="e.g., Honda"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Model *</label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    placeholder="e.g., Civic"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Year *</label>
                  <input
                    type="number"
                    name="vehicleYear"
                    value={formData.vehicleYear}
                    onChange={handleChange}
                    placeholder="e.g., 2020"
                    min="1990"
                    max="2026"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Color *</label>
                  <input
                    type="text"
                    name="vehicleColor"
                    value={formData.vehicleColor}
                    onChange={handleChange}
                    placeholder="e.g., Black"
                    required
                  />
                </div>

                <div className="form-group full">
                  <label>Plate Number *</label>
                  <input
                    type="text"
                    name="vehiclePlateNumber"
                    value={formData.vehiclePlateNumber}
                    onChange={handleChange}
                    placeholder="e.g., ABC-1234"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Document Upload */}
            <div className="form-section">
              <div className="section-header">
                <Upload size={20} />
                <h3>Upload Documents</h3>
              </div>

              {/* License Documents */}
              <div className="upload-section">
                <h4>License Documents</h4>
                <div className="upload-grid">
                  <div 
                    className={`upload-box ${files.licenseFront ? 'uploaded' : ''}`}
                    onClick={() => fileInputRefs.licenseFront.current?.click()}
                  >
                    <Upload size={24} />
                    <span className="upload-title">License Front *</span>
                    {files.licenseFront && <span className="file-name">{files.licenseFront.name}</span>}
                    <input
                      ref={fileInputRefs.licenseFront}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'licenseFront')}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div 
                    className={`upload-box ${files.licenseBack ? 'uploaded' : ''}`}
                    onClick={() => fileInputRefs.licenseBack.current?.click()}
                  >
                    <Upload size={24} />
                    <span className="upload-title">License Back</span>
                    <span className="optional">(Optional)</span>
                    {files.licenseBack && <span className="file-name">{files.licenseBack.name}</span>}
                    <input
                      ref={fileInputRefs.licenseBack}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'licenseBack')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Documents */}
              <div className="upload-section">
                <h4>Vehicle Documents</h4>
                <div className="upload-grid">
                  <div 
                    className={`upload-box ${files.vehicleRegistration ? 'uploaded' : ''}`}
                    onClick={() => fileInputRefs.vehicleRegistration.current?.click()}
                  >
                    <Upload size={24} />
                    <span className="upload-title">Registration *</span>
                    {files.vehicleRegistration && <span className="file-name">{files.vehicleRegistration.name}</span>}
                    <input
                      ref={fileInputRefs.vehicleRegistration}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'vehicleRegistration')}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div 
                    className={`upload-box ${files.vehicleInsurance ? 'uploaded' : ''}`}
                    onClick={() => fileInputRefs.vehicleInsurance.current?.click()}
                  >
                    <Upload size={24} />
                    <span className="upload-title">Insurance *</span>
                    {files.vehicleInsurance && <span className="file-name">{files.vehicleInsurance.name}</span>}
                    <input
                      ref={fileInputRefs.vehicleInsurance}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'vehicleInsurance')}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div 
                    className={`upload-box ${files.vehiclePhotoFront ? 'uploaded' : ''}`}
                    onClick={() => fileInputRefs.vehiclePhotoFront.current?.click()}
                  >
                    <Upload size={24} />
                    <span className="upload-title">Vehicle Front *</span>
                    {files.vehiclePhotoFront && <span className="file-name">{files.vehiclePhotoFront.name}</span>}
                    <input
                      ref={fileInputRefs.vehiclePhotoFront}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'vehiclePhotoFront')}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div 
                    className={`upload-box ${files.vehiclePhotoBack ? 'uploaded' : ''}`}
                    onClick={() => fileInputRefs.vehiclePhotoBack.current?.click()}
                  >
                    <Upload size={24} />
                    <span className="upload-title">Vehicle Back</span>
                    <span className="optional">(Optional)</span>
                    {files.vehiclePhotoBack && <span className="file-name">{files.vehiclePhotoBack.name}</span>}
                    <input
                      ref={fileInputRefs.vehiclePhotoBack}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'vehiclePhotoBack')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? (
                <>
                  <Loader2 className="spinner-small" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyForDriver;