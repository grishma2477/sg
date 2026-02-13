

// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Upload, CheckCircle, ArrowLeft, Loader2, FileText, Car, Calendar } from 'lucide-react';
// import { getToken } from '../utils/CookieUtils';
// import './ApplyForDriver.css';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// const ApplyForDriver = () => {
//   const navigate = useNavigate();
//   const [step, setStep] = useState('form');
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

//   const fileInputRefs = {
//     licenseFront: useRef(null),
//     licenseBack: useRef(null),
//     vehicleRegistration: useRef(null),
//     vehicleInsurance: useRef(null),
//     vehiclePhotoFront: useRef(null),
//     vehiclePhotoBack: useRef(null)
//   };

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

//       Object.keys(formData).forEach(key => {
//         if (key === 'licenseCategory') {
//           submitData.append(key, formData[key].join(','));
//         } else {
//           submitData.append(key, formData[key]);
//         }
//       });

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
//       <div className="apply-loading">
//         <Loader2 className="spinner" />
//       </div>
//     );
//   }

//   if (step === 'success') {
//     return (
//       <div className="apply-success">
//         <div className="success-card">
//           <div className="success-icon">
//             <CheckCircle />
//           </div>
          
//           <h1>Success!</h1>
//           <h2>Document Uploaded Successfully</h2>
          
//           <p className="success-message">
//             Our Team will review all the documents carefully and update you in 72 hours.
//           </p>
          
//           <p className="success-thanks">Thanks for your time.</p>
          
//           <button
//             onClick={() => navigate('/rider/dashboard')}
//             className="btn-home"
//           >
//             Go Back to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="apply-container">
//       <div className="apply-wrapper">
//         <div className="apply-card">
//           {/* Header */}
//           <div className="apply-header">
//             <button onClick={() => navigate('/rider/profile')} className="btn-back">
//               <ArrowLeft size={24} />
//             </button>
//             <div className="header-content">
//               <h1>Apply For Driver</h1>
//               <p>Join our community of trusted drivers</p>
//             </div>
//           </div>

//           {/* Error Message */}
//           {error && (
//             <div className="error-message">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             {/* Section 1: License Information */}
//             <div className="form-section">
//               <div className="section-header">
//                 <FileText size={20} />
//                 <h3>License Information</h3>
//               </div>

//               <div className="form-grid">
//                 <div className="form-group full">
//                   <label>Driving License Number *</label>
//                   <input
//                     type="text"
//                     name="licenseNumber"
//                     value={formData.licenseNumber}
//                     onChange={handleChange}
//                     placeholder="e.g., 123456789"
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Issued Date *</label>
//                   <input
//                     type="date"
//                     name="licenseIssuedDate"
//                     value={formData.licenseIssuedDate}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Expiry Date *</label>
//                   <input
//                     type="date"
//                     name="licenseExpiryDate"
//                     value={formData.licenseExpiryDate}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div className="form-group full">
//                   <label>License Category *</label>
//                   <div className="checkbox-group">
//                     {['A (Bike)', 'B (Scooter)', 'B-C (Car)'].map((category) => (
//                       <label key={category} className="checkbox-label">
//                         <input
//                           type="checkbox"
//                           checked={formData.licenseCategory.includes(category)}
//                           onChange={() => handleCheckboxChange(category)}
//                         />
//                         <span>{category}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Section 2: Vehicle Information */}
//             <div className="form-section">
//               <div className="section-header">
//                 <Car size={20} />
//                 <h3>Vehicle Information</h3>
//               </div>

//               <div className="form-grid">
//                 <div className="form-group full">
//                   <label>Vehicle Type *</label>
//                   <select
//                     name="vehicleType"
//                     value={formData.vehicleType}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="bike">Bike</option>
//                     <option value="scooter">Scooter</option>
//                     <option value="car">Car</option>
//                   </select>
//                 </div>

//                 <div className="form-group">
//                   <label>Make *</label>
//                   <input
//                     type="text"
//                     name="vehicleMake"
//                     value={formData.vehicleMake}
//                     onChange={handleChange}
//                     placeholder="e.g., Honda"
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Model *</label>
//                   <input
//                     type="text"
//                     name="vehicleModel"
//                     value={formData.vehicleModel}
//                     onChange={handleChange}
//                     placeholder="e.g., Civic"
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Year *</label>
//                   <input
//                     type="number"
//                     name="vehicleYear"
//                     value={formData.vehicleYear}
//                     onChange={handleChange}
//                     placeholder="e.g., 2020"
//                     min="1990"
//                     max="2026"
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Color *</label>
//                   <input
//                     type="text"
//                     name="vehicleColor"
//                     value={formData.vehicleColor}
//                     onChange={handleChange}
//                     placeholder="e.g., Black"
//                     required
//                   />
//                 </div>

//                 <div className="form-group full">
//                   <label>Plate Number *</label>
//                   <input
//                     type="text"
//                     name="vehiclePlateNumber"
//                     value={formData.vehiclePlateNumber}
//                     onChange={handleChange}
//                     placeholder="e.g., ABC-1234"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Section 3: Document Upload */}
//             <div className="form-section">
//               <div className="section-header">
//                 <Upload size={20} />
//                 <h3>Upload Documents</h3>
//               </div>

//               {/* License Documents */}
//               <div className="upload-section">
//                 <h4>License Documents</h4>
//                 <div className="upload-grid">
//                   <div 
//                     className={`upload-box ${files.licenseFront ? 'uploaded' : ''}`}
//                     onClick={() => fileInputRefs.licenseFront.current?.click()}
//                   >
//                     <Upload size={24} />
//                     <span className="upload-title">License Front *</span>
//                     {files.licenseFront && <span className="file-name">{files.licenseFront.name}</span>}
//                     <input
//                       ref={fileInputRefs.licenseFront}
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleFileSelect(e, 'licenseFront')}
//                       style={{ display: 'none' }}
//                     />
//                   </div>

//                   <div 
//                     className={`upload-box ${files.licenseBack ? 'uploaded' : ''}`}
//                     onClick={() => fileInputRefs.licenseBack.current?.click()}
//                   >
//                     <Upload size={24} />
//                     <span className="upload-title">License Back</span>
//                     <span className="optional">(Optional)</span>
//                     {files.licenseBack && <span className="file-name">{files.licenseBack.name}</span>}
//                     <input
//                       ref={fileInputRefs.licenseBack}
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleFileSelect(e, 'licenseBack')}
//                       style={{ display: 'none' }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Vehicle Documents */}
//               <div className="upload-section">
//                 <h4>Vehicle Documents</h4>
//                 <div className="upload-grid">
//                   <div 
//                     className={`upload-box ${files.vehicleRegistration ? 'uploaded' : ''}`}
//                     onClick={() => fileInputRefs.vehicleRegistration.current?.click()}
//                   >
//                     <Upload size={24} />
//                     <span className="upload-title">Registration *</span>
//                     {files.vehicleRegistration && <span className="file-name">{files.vehicleRegistration.name}</span>}
//                     <input
//                       ref={fileInputRefs.vehicleRegistration}
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleFileSelect(e, 'vehicleRegistration')}
//                       style={{ display: 'none' }}
//                     />
//                   </div>

//                   <div 
//                     className={`upload-box ${files.vehicleInsurance ? 'uploaded' : ''}`}
//                     onClick={() => fileInputRefs.vehicleInsurance.current?.click()}
//                   >
//                     <Upload size={24} />
//                     <span className="upload-title">Insurance *</span>
//                     {files.vehicleInsurance && <span className="file-name">{files.vehicleInsurance.name}</span>}
//                     <input
//                       ref={fileInputRefs.vehicleInsurance}
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleFileSelect(e, 'vehicleInsurance')}
//                       style={{ display: 'none' }}
//                     />
//                   </div>

//                   <div 
//                     className={`upload-box ${files.vehiclePhotoFront ? 'uploaded' : ''}`}
//                     onClick={() => fileInputRefs.vehiclePhotoFront.current?.click()}
//                   >
//                     <Upload size={24} />
//                     <span className="upload-title">Vehicle Front *</span>
//                     {files.vehiclePhotoFront && <span className="file-name">{files.vehiclePhotoFront.name}</span>}
//                     <input
//                       ref={fileInputRefs.vehiclePhotoFront}
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleFileSelect(e, 'vehiclePhotoFront')}
//                       style={{ display: 'none' }}
//                     />
//                   </div>

//                   <div 
//                     className={`upload-box ${files.vehiclePhotoBack ? 'uploaded' : ''}`}
//                     onClick={() => fileInputRefs.vehiclePhotoBack.current?.click()}
//                   >
//                     <Upload size={24} />
//                     <span className="upload-title">Vehicle Back</span>
//                     <span className="optional">(Optional)</span>
//                     {files.vehiclePhotoBack && <span className="file-name">{files.vehiclePhotoBack.name}</span>}
//                     <input
//                       ref={fileInputRefs.vehiclePhotoBack}
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleFileSelect(e, 'vehiclePhotoBack')}
//                       style={{ display: 'none' }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button type="submit" disabled={loading} className="btn-submit">
//               {loading ? (
//                 <>
//                   <Loader2 className="spinner-small" />
//                   Submitting...
//                 </>
//               ) : (
//                 'Submit Application'
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
import { 
  Upload, CheckCircle, ArrowLeft, ArrowRight, Loader2, 
  FileText, Car, Calendar, CreditCard, Shield, ChevronRight 
} from 'lucide-react';
import { getToken } from '../utils/CookieUtils';
import './ApplyForDriver.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ApplyForDriver = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [formData, setFormData] = useState({
    // License Information
    licenseNumber: '',
    licenseType: 'Commercial',
    licenseCategory: 'B-C (Car)',
    licenseIssuedDate: '',
    licenseExpiryDate: '',
    licenseRenewedDate: '',
    issuingAuthority: '',
    yearsOfExperience: '',
    
    // Vehicle Information
    vehicleType: 'car',
    vehicleCategory: 'Economy',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehiclePlateNumber: '',
    vin: '',
    cc: '',
    transmissionType: 'Manual',
    fuelType: 'Petrol',
    seatCapacity: '4',
    hasAc: true,
    
    // Vehicle Documents
    registrationNumber: '',
    registrationExpiryDate: '',
    blueBookNumber: '',
    blueBookExpiryDate: '',
    blueBookRenewedDate: '',
    insurancePolicyNumber: '',
    insuranceExpiryDate: '',
    fitnessExpiryDate: '',
    emissionExpiryDate: '',
    
    // Vehicle Amenities
    hasDashcam: false,
    hasMusic: false,
    hasWater: false,
    hasCharger: false,
    isPetFriendly: false,
    isWheelchairAccessible: false,
    
    // Safety & Compliance
    backgroundCheckStatus: 'pending',
    criminalRecordCheckStatus: 'pending',
    drivingHistoryCheckStatus: 'pending',
    driverTrainingCompleted: false,
    trainingDate: '',
    safetyQuizScore: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    
    // Operational Preferences
    preferredWorkingAreas: '',
    preferredWorkingHours: 'Flexible',
    languagesSpoken: '',
    
    // Payment Information
    bankAccountNumber: '',
    bankName: '',
    bankBranch: '',
    accountHolderName: '',
    taxIdNumber: '',
    paymentMethodPreference: 'Bank'
  });

  const [files, setFiles] = useState({
    licenseFront: null,
    licenseBack: null,
    registrationUrl: null,
    blueBookUrl: null,
    insuranceUrl: null,
    fitnessCertificateUrl: null,
    emissionCertificateUrl: null,
    photoFront: null,
    photoBack: null,
    photoLeft: null,
    photoRight: null
  });

  const fileInputRefs = Object.keys(files).reduce((acc, key) => {
    acc[key] = useRef(null);
    return acc;
  }, {});

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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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

  const validateStep = (step) => {
    setError('');
    
    switch(step) {
      case 1: // License Info
        if (!formData.licenseNumber || !formData.licenseIssuedDate || !formData.licenseExpiryDate) {
          setError('Please fill all required license fields');
          return false;
        }
        if (!files.licenseFront) {
          setError('Please upload license front image');
          return false;
        }
        break;
      
      case 2: // Vehicle Info
        if (!formData.vehicleMake || !formData.vehicleModel || !formData.vehicleYear || 
            !formData.vehicleColor || !formData.vehiclePlateNumber) {
          setError('Please fill all required vehicle fields');
          return false;
        }
        break;
      
      case 3: // Documents & Photos
        if (!files.registrationUrl || !files.insuranceUrl || !files.photoFront) {
          setError('Please upload all required documents and vehicle photos');
          return false;
        }
        break;
      
      case 4: // Emergency Contact
        if (!formData.emergencyContactName || !formData.emergencyContactNumber) {
          setError('Please provide emergency contact information');
          return false;
        }
        break;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = getToken();
      const submitData = new FormData();

      // Add all form data
      Object.keys(formData).forEach(key => {
        if (key === 'preferredWorkingAreas' || key === 'languagesSpoken') {
          // Convert comma-separated string to array
          const arrayValue = formData[key].split(',').map(s => s.trim()).filter(Boolean);
          submitData.append(key, JSON.stringify(arrayValue));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add all files
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
        setCurrentStep(6); // Success step
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

  if (currentStep === 6) {
    return (
      <div className="apply-success">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle />
          </div>
          
          <h1>Success!</h1>
          <h2>Application Submitted Successfully</h2>
          
          <p className="success-message">
            Our team will review your application and all documents carefully. 
            You'll receive an update within 72 hours.
          </p>
          
          <p className="success-thanks">Thank you for applying!</p>
          
          <button onClick={() => navigate('/rider/dashboard')} className="btn-home">
            Go to Dashboard
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
              <p>Step {currentStep} of 5</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentStep / 5) * 100}%` }}></div>
          </div>

          {/* Step Indicators */}
          <div className="step-indicators">
            <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>
              <FileText size={20} />
              <span>License</span>
            </div>
            <ChevronRight size={16} className="step-arrow" />
            <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>
              <Car size={20} />
              <span>Vehicle</span>
            </div>
            <ChevronRight size={16} className="step-arrow" />
            <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>
              <Upload size={20} />
              <span>Documents</span>
            </div>
            <ChevronRight size={16} className="step-arrow" />
            <div className={`step-indicator ${currentStep >= 4 ? 'active' : ''}`}>
              <Shield size={20} />
              <span>Safety</span>
            </div>
            <ChevronRight size={16} className="step-arrow" />
            <div className={`step-indicator ${currentStep >= 5 ? 'active' : ''}`}>
              <CreditCard size={20} />
              <span>Payment</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* STEP 1: LICENSE INFORMATION */}
            {currentStep === 1 && (
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
                      placeholder="e.g., 52-06-78-01956"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>License Type *</label>
                    <select name="licenseType" value={formData.licenseType} onChange={handleChange} required>
                      <option value="Private">Private</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>License Category *</label>
                    <select name="licenseCategory" value={formData.licenseCategory} onChange={handleChange} required>
                      <option value="A (Bike)">A (Bike)</option>
                      <option value="B (Scooter)">B (Scooter)</option>
                      <option value="B-C (Car)">B-C (Car)</option>
                    </select>
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

                  <div className="form-group">
                    <label>Renewed Date</label>
                    <input
                      type="date"
                      name="licenseRenewedDate"
                      value={formData.licenseRenewedDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Issuing Authority</label>
                    <input
                      type="text"
                      name="issuingAuthority"
                      value={formData.issuingAuthority}
                      onChange={handleChange}
                      placeholder="e.g., Department of Transport"
                    />
                  </div>

                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      min="0"
                    />
                  </div>
                </div>

                {/* License Upload */}
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
              </div>
            )}

            {/* STEP 2: VEHICLE INFORMATION */}
            {currentStep === 2 && (
              <div className="form-section">
                <div className="section-header">
                  <Car size={20} />
                  <h3>Vehicle Information</h3>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Vehicle Type *</label>
                    <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required>
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="car">Car</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="ev">Electric Vehicle (EV)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Vehicle Category</label>
                    <select name="vehicleCategory" value={formData.vehicleCategory} onChange={handleChange}>
                      <option value="Economy">Economy</option>
                      <option value="Premium">Premium</option>
                      <option value="XL">XL</option>
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
                    <label>License Plate *</label>
                    <input
                      type="text"
                      name="vehiclePlateNumber"
                      value={formData.vehiclePlateNumber}
                      onChange={handleChange}
                      placeholder="e.g., BA-1-PA-1234"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>VIN (Vehicle Identification Number)</label>
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      onChange={handleChange}
                      placeholder="17-digit VIN"
                      maxLength="17"
                    />
                  </div>

                  <div className="form-group">
                    <label>CC (Engine Capacity)</label>
                    <input
                      type="number"
                      name="cc"
                      value={formData.cc}
                      onChange={handleChange}
                      placeholder="e.g., 1500"
                    />
                  </div>

                  <div className="form-group">
                    <label>Transmission Type</label>
                    <select name="transmissionType" value={formData.transmissionType} onChange={handleChange}>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fuel Type</label>
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="EV">Electric (EV)</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Seating Capacity</label>
                    <input
                      type="number"
                      name="seatCapacity"
                      value={formData.seatCapacity}
                      onChange={handleChange}
                      min="2"
                      max="15"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="hasAc"
                        checked={formData.hasAc}
                        onChange={handleChange}
                      />
                      <span>Has Air Conditioning</span>
                    </label>
                  </div>
                </div>

                {/* Vehicle Amenities */}
                <div className="amenities-section">
                  <h4>Vehicle Amenities</h4>
                  <div className="amenities-grid">
                    <label className="checkbox-label">
                      <input type="checkbox" name="hasDashcam" checked={formData.hasDashcam} onChange={handleChange} />
                      <span>📹 Dashcam</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="hasMusic" checked={formData.hasMusic} onChange={handleChange} />
                      <span>🎵 Music System</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="hasWater" checked={formData.hasWater} onChange={handleChange} />
                      <span>💧 Water Bottles</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="hasCharger" checked={formData.hasCharger} onChange={handleChange} />
                      <span>🔌 Phone Charger</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="isPetFriendly" checked={formData.isPetFriendly} onChange={handleChange} />
                      <span>🐕 Pet Friendly</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="isWheelchairAccessible" checked={formData.isWheelchairAccessible} onChange={handleChange} />
                      <span>♿ Wheelchair Accessible</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: DOCUMENTS & PHOTOS */}
            {currentStep === 3 && (
              <div className="form-section">
                <div className="section-header">
                  <Upload size={20} />
                  <h3>Vehicle Documents & Photos</h3>
                </div>

                {/* Document Details */}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Registration Number</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="Registration #"
                    />
                  </div>

                  <div className="form-group">
                    <label>Registration Expiry</label>
                    <input
                      type="date"
                      name="registrationExpiryDate"
                      value={formData.registrationExpiryDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Blue Book Number</label>
                    <input
                      type="text"
                      name="blueBookNumber"
                      value={formData.blueBookNumber}
                      onChange={handleChange}
                      placeholder="Blue Book #"
                    />
                  </div>

                  <div className="form-group">
                    <label>Blue Book Expiry</label>
                    <input
                      type="date"
                      name="blueBookExpiryDate"
                      value={formData.blueBookExpiryDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Blue Book Renewed Date</label>
                    <input
                      type="date"
                      name="blueBookRenewedDate"
                      value={formData.blueBookRenewedDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Insurance Policy Number</label>
                    <input
                      type="text"
                      name="insurancePolicyNumber"
                      value={formData.insurancePolicyNumber}
                      onChange={handleChange}
                      placeholder="Policy #"
                    />
                  </div>

                  <div className="form-group">
                    <label>Insurance Expiry</label>
                    <input
                      type="date"
                      name="insuranceExpiryDate"
                      value={formData.insuranceExpiryDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Fitness Certificate Expiry</label>
                    <input
                      type="date"
                      name="fitnessExpiryDate"
                      value={formData.fitnessExpiryDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Emission Test Expiry</label>
                    <input
                      type="date"
                      name="emissionExpiryDate"
                      value={formData.emissionExpiryDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="upload-section">
                  <h4>Vehicle Documents</h4>
                  <div className="upload-grid">
                    <div 
                      className={`upload-box ${files.registrationUrl ? 'uploaded' : ''}`}
                      onClick={() => fileInputRefs.registrationUrl.current?.click()}
                    >
                      <Upload size={24} />
                      <span className="upload-title">Registration *</span>
                      {files.registrationUrl && <span className="file-name">{files.registrationUrl.name}</span>}
                      <input
                        ref={fileInputRefs.registrationUrl}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'registrationUrl')}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div 
                      className={`upload-box ${files.blueBookUrl ? 'uploaded' : ''}`}
                      onClick={() => fileInputRefs.blueBookUrl.current?.click()}
                    >
                      <Upload size={24} />
                      <span className="upload-title">Blue Book</span>
                      <span className="optional">(Optional)</span>
                      {files.blueBookUrl && <span className="file-name">{files.blueBookUrl.name}</span>}
                      <input
                        ref={fileInputRefs.blueBookUrl}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'blueBookUrl')}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div 
                      className={`upload-box ${files.insuranceUrl ? 'uploaded' : ''}`}
                      onClick={() => fileInputRefs.insuranceUrl.current?.click()}
                    >
                      <Upload size={24} />
                      <span className="upload-title">Insurance *</span>
                      {files.insuranceUrl && <span className="file-name">{files.insuranceUrl.name}</span>}
                      <input
                        ref={fileInputRefs.insuranceUrl}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'insuranceUrl')}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div 
                      className={`upload-box ${files.fitnessCertificateUrl ? 'uploaded' : ''}`}
                      onClick={() => fileInputRefs.fitnessCertificateUrl.current?.click()}
                    >
                      <Upload size={24} />
                      <span className="upload-title">Fitness Certificate</span>
                      <span className="optional">(Optional)</span>
                      {files.fitnessCertificateUrl && <span className="file-name">{files.fitnessCertificateUrl.name}</span>}
                      <input
                        ref={fileInputRefs.fitnessCertificateUrl}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'fitnessCertificateUrl')}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div 
                      className={`upload-box ${files.emissionCertificateUrl ? 'uploaded' : ''}`}
                      onClick={() => fileInputRefs.emissionCertificateUrl.current?.click()}
                    >
                      <Upload size={24} />
                      <span className="upload-title">Emission Certificate</span>
                      <span className="optional">(Optional)</span>
                      {files.emissionCertificateUrl && <span className="file-name">{files.emissionCertificateUrl.name}</span>}
                      <input
                        ref={fileInputRefs.emissionCertificateUrl}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'emissionCertificateUrl')}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Photos (4 angles) */}
                <div className="upload-section">
                  <h4>Vehicle Photos (4 Angles)</h4>
                  <div className="upload-grid">
                    <div 
                      className={`upload-box ${files.photoFront ? 'uploaded' : ''}`}
                      onClick={() => fileInputRefs.photoFront.current?.click()}
                    >
                      <Upload size={24} />
                      <span className="upload-title">Front View *</span>
                      {files.photoFront && <span className="file-name">{files.photoFront.name}</span>}
                      <input
                        ref={fileInputRefs.photoFront}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'photoFront')}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div 
                      className={`upload-box ${files.photoBack ? 'uploaded' : ''}`}
                      onClick={() => fileInputRefs.photoBack.current?.click()}
                    >
                      <Upload size={24} />
                      <span className="upload-title">Back View</span>
                      <span className="optional">(Optional)</span>
                      {files.photoBack && <span className="file-name">{files.photoBack.name}</span>}
                      <input
                        ref={fileInputRefs.photoBack}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'photoBack')}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div 
                      className={`upload-box ${files.photoLeft ? 'uploaded' : ''}`}
                      onClick={() => fileInputRefs.photoLeft.current?.click()}
                    >
                      <Upload size={24} />
                      <span className="upload-title">Left View</span>
                      <span className="optional">(Optional)</span>
                      {files.photoLeft && <span className="file-name">{files.photoLeft.name}</span>}
                      <input
                        ref={fileInputRefs.photoLeft}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'photoLeft')}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div 
                      className={`upload-box ${files.photoRight ? 'uploaded' : ''}`}
                      onClick={() => fileInputRefs.photoRight.current?.click()}
                    >
                      <Upload size={24} />
                      <span className="upload-title">Right View</span>
                      <span className="optional">(Optional)</span>
                      {files.photoRight && <span className="file-name">{files.photoRight.name}</span>}
                      <input
                        ref={fileInputRefs.photoRight}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'photoRight')}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SAFETY & PREFERENCES */}
            {currentStep === 4 && (
              <div className="form-section">
                <div className="section-header">
                  <Shield size={20} />
                  <h3>Safety & Preferences</h3>
                </div>

                <div className="form-grid">
                  <div className="form-group full">
                    <label>Emergency Contact Name *</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      placeholder="Full name"
                      required
                    />
                  </div>

                  <div className="form-group full">
                    <label>Emergency Contact Number *</label>
                    <input
                      type="tel"
                      name="emergencyContactNumber"
                      value={formData.emergencyContactNumber}
                      onChange={handleChange}
                      placeholder="+977-9841234567"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="driverTrainingCompleted"
                        checked={formData.driverTrainingCompleted}
                        onChange={handleChange}
                      />
                      <span>Driver Training Completed</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Training Date</label>
                    <input
                      type="date"
                      name="trainingDate"
                      value={formData.trainingDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full">
                    <label>Preferred Working Hours</label>
                    <select name="preferredWorkingHours" value={formData.preferredWorkingHours} onChange={handleChange}>
                      <option value="Morning">Morning (6 AM - 12 PM)</option>
                      <option value="Evening">Evening (12 PM - 6 PM)</option>
                      <option value="Night">Night (6 PM - 12 AM)</option>
                      <option value="Flexible">Flexible (Anytime)</option>
                    </select>
                  </div>

                  <div className="form-group full">
                    <label>Preferred Working Areas (comma-separated)</label>
                    <input
                      type="text"
                      name="preferredWorkingAreas"
                      value={formData.preferredWorkingAreas}
                      onChange={handleChange}
                      placeholder="e.g., Thamel, Boudha, Airport"
                    />
                  </div>

                  <div className="form-group full">
                    <label>Languages Spoken (comma-separated)</label>
                    <input
                      type="text"
                      name="languagesSpoken"
                      value={formData.languagesSpoken}
                      onChange={handleChange}
                      placeholder="e.g., English, Nepali, Hindi"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: PAYMENT INFORMATION */}
            {currentStep === 5 && (
              <div className="form-section">
                <div className="section-header">
                  <CreditCard size={20} />
                  <h3>Payment Information</h3>
                </div>

                <div className="form-grid">
                  <div className="form-group full">
                    <label>Account Holder Name</label>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      placeholder="Full name as per bank"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="e.g., Nabil Bank"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bank Branch</label>
                    <input
                      type="text"
                      name="bankBranch"
                      value={formData.bankBranch}
                      onChange={handleChange}
                      placeholder="e.g., Thamel Branch"
                    />
                  </div>

                  <div className="form-group full">
                    <label>Bank Account Number</label>
                    <input
                      type="text"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      placeholder="Account number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tax ID Number (PAN)</label>
                    <input
                      type="text"
                      name="taxIdNumber"
                      value={formData.taxIdNumber}
                      onChange={handleChange}
                      placeholder="PAN number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Method Preference</label>
                    <select name="paymentMethodPreference" value={formData.paymentMethodPreference} onChange={handleChange}>
                      <option value="Bank">Bank Transfer</option>
                      <option value="Wallet">Digital Wallet</option>
                      <option value="Weekly">Weekly Payout</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-nav-buttons">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="btn-nav btn-prev">
                  <ArrowLeft size={20} />
                  Previous
                </button>
              )}
              
              {currentStep < 5 ? (
                <button type="button" onClick={nextStep} className="btn-nav btn-next">
                  Next
                  <ArrowRight size={20} />
                </button>
              ) : (
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
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyForDriver;