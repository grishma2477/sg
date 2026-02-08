// import React, { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Camera, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
// import { getToken } from '../utils/CookieUtils';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// const KYCUploadPage = () => {
//   const navigate = useNavigate();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);

//   // Form data
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     dateOfBirth: '',
//     address: '',
//     phoneNumber: '',
//     email: '',
//     gender: 'male',
//     nationalIdentityNumber: '',
//     bloodGroup: 'O+',
//     documentType: 'citizenship',
//     documentNumber: '',
//     issuedDate: '',
//     expiryDate: ''
//   });

//   // Files
//   const [profilePhoto, setProfilePhoto] = useState(null);
//   const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
//   const [documentFront, setDocumentFront] = useState(null);
//   const [documentFrontPreview, setDocumentFrontPreview] = useState(null);
//   const [documentBack, setDocumentBack] = useState(null);
//   const [documentBackPreview, setDocumentBackPreview] = useState(null);

//   // Refs for file inputs
//   const profileInputRef = useRef(null);
//   const docFrontInputRef = useRef(null);
//   const docBackInputRef = useRef(null);

//   // Handle input changes
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   // Handle file selection
//   const handleFileSelect = (e, type) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       setError('File size must be less than 5MB');
//       return;
//     }

//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       setError('Please upload an image file');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       if (type === 'profile') {
//         setProfilePhoto(file);
//         setProfilePhotoPreview(reader.result);
//       } else if (type === 'docFront') {
//         setDocumentFront(file);
//         setDocumentFrontPreview(reader.result);
//       } else if (type === 'docBack') {
//         setDocumentBack(file);
//         setDocumentBackPreview(reader.result);
//       }
//     };
//     reader.readAsDataURL(file);
//     setError('');
//   };

//   // Validate step
//   const validateStep = () => {
//     setError('');
    
//     if (currentStep === 1) {
//       if (!formData.firstName || !formData.lastName) {
//         setError('Please enter your full name');
//         return false;
//       }
//       if (!formData.dateOfBirth) {
//         setError('Please enter your date of birth');
//         return false;
//       }
//       if (!formData.address) {
//         setError('Please enter your address');
//         return false;
//       }
//       if (!formData.gender) {
//         setError('Please select your gender');
//         return false;
//       }
//       if (!formData.nationalIdentityNumber) {
//         setError('Please enter your national identity number');
//         return false;
//       }
//       if (!formData.bloodGroup) {
//         setError('Please select your blood group');
//         return false;
//       }
//     }

//     if (currentStep === 2) {
//       if (!formData.documentType) {
//         setError('Please select document type');
//         return false;
//       }
//       if (!formData.documentNumber) {
//         setError('Please enter document number');
//         return false;
//       }
//       if (!formData.issuedDate) {
//         setError('Please enter issued date');
//         return false;
//       }
//     }

//     if (currentStep === 3) {
//       if (!profilePhoto) {
//         setError('Please upload your selfie');
//         return false;
//       }
//     }

//     if (currentStep === 4) {
//       if (!documentFront) {
//         setError('Please upload document front image');
//         return false;
//       }
//     }

//     return true;
//   };

//   // Next step
//   const handleNext = () => {
//     if (validateStep()) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   // Previous step
//   const handlePrevious = () => {
//     setCurrentStep(currentStep - 1);
//     setError('');
//   };

//   // Submit KYC
//   const handleSubmit = async () => {
//     if (!validateStep()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const token = getToken();
//       if (!token) {
//         setError('Please login first');
//         navigate('/login');
//         return;
//       }

//       // Create FormData
//       const submitData = new FormData();
      
//       // Add text fields
//       Object.keys(formData).forEach(key => {
//         submitData.append(key, formData[key]);
//       });

//       // Add files
//       if (profilePhoto) {
//         submitData.append('profilePhoto', profilePhoto);
//       }
//       if (documentFront) {
//         submitData.append('documentFront', documentFront);
//       }
//       if (documentBack) {
//         submitData.append('documentBack', documentBack);
//       }

//       console.log('📤 Submitting KYC...');

//       const response = await fetch(`${API_URL}/api/kyc/submit`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         body: submitData
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setSuccess(true);
//         setCurrentStep(6); // Success screen
//         console.log('✅ KYC submitted successfully');
//       } else {
//         setError(data.message || 'KYC submission failed');
//       }
//     } catch (error) {
//       console.error('❌ KYC submission error:', error);
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Render step content
//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="space-y-4">
//             <h2 className="text-2xl font-bold mb-4">Personal Details</h2>
            
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">First Name *</label>
//                 <input
//                   type="text"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="John"
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium mb-2">Last Name *</label>
//                 <input
//                   type="text"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="Doe"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Date of Birth *</label>
//               <input
//                 type="date"
//                 name="dateOfBirth"
//                 value={formData.dateOfBirth}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Address *</label>
//               <textarea
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter your full address"
//                 rows="3"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Gender *</label>
//               <select
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 required
//               >
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="others">Others</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">National Identity Number *</label>
//               <input
//                 type="text"
//                 name="nationalIdentityNumber"
//                 value={formData.nationalIdentityNumber}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 placeholder="12345678"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Blood Group</label>
//               <select
//                 name="bloodGroup"
//                 value={formData.bloodGroup}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="A+">A+</option>
//                 <option value="A-">A-</option>
//                 <option value="B+">B+</option>
//                 <option value="B-">B-</option>
//                 <option value="AB+">AB+</option>
//                 <option value="AB-">AB-</option>
//                 <option value="O+">O+</option>
//                 <option value="O-">O-</option>
//               </select>
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-4">
//             <h2 className="text-2xl font-bold mb-4">Document Details</h2>
            
//             <div>
//               <label className="block text-sm font-medium mb-2">Document Type *</label>
//               <select
//                 name="documentType"
//                 value={formData.documentType}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 required
//               >
//                 <option value="citizenship">Citizenship</option>
//                 <option value="passport">Passport</option>
//                 <option value="nin">National ID</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Document Number *</label>
//               <input
//                 type="text"
//                 name="documentNumber"
//                 value={formData.documentNumber}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 placeholder="123456789"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Issued Date *</label>
//               <input
//                 type="date"
//                 name="issuedDate"
//                 value={formData.issuedDate}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Expiry Date</label>
//               <input
//                 type="date"
//                 name="expiryDate"
//                 value={formData.expiryDate}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-4">
//             <h2 className="text-2xl font-bold mb-4">Take a Selfie</h2>
//             <p className="text-gray-600 mb-4">Please upload a clear selfie</p>

//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//               {profilePhotoPreview ? (
//                 <div className="space-y-4">
//                   <img 
//                     src={profilePhotoPreview} 
//                     alt="Profile preview" 
//                     className="w-48 h-48 mx-auto rounded-full object-cover"
//                   />
//                   <button
//                     onClick={() => profileInputRef.current?.click()}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                   >
//                     Change Photo
//                   </button>
//                 </div>
//               ) : (
//                 <div
//                   onClick={() => profileInputRef.current?.click()}
//                   className="cursor-pointer"
//                 >
//                   <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//                   <p className="text-lg font-medium mb-2">Take a Selfie</p>
//                   <p className="text-sm text-gray-500">Click to upload photo</p>
//                 </div>
//               )}
//               <input
//                 ref={profileInputRef}
//                 type="file"
//                 accept="image/*"
//                 capture="user"
//                 onChange={(e) => handleFileSelect(e, 'profile')}
//                 className="hidden"
//               />
//             </div>

//             <div className="bg-blue-50 p-4 rounded-lg">
//               <p className="text-sm text-blue-800 font-medium mb-2">📸 Capture Guidelines:</p>
//               <ul className="text-sm text-blue-700 space-y-1">
//                 <li>✓ Make sure you are in proper lighting</li>
//                 <li>✓ Take a selfie with your document</li>
//                 <li>✓ Make sure while you are in the picture</li>
//                 <li>✓ Please check the picture is clear</li>
//               </ul>
//             </div>
//           </div>
//         );

//       case 4:
//         return (
//           <div className="space-y-4">
//             <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
//             <p className="text-gray-600 mb-4">Upload front and back of your document</p>

//             {/* Document Front */}
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//               <h3 className="font-medium mb-3">Document Front *</h3>
//               {documentFrontPreview ? (
//                 <div className="space-y-3">
//                   <img 
//                     src={documentFrontPreview} 
//                     alt="Document front" 
//                     className="w-full max-w-md mx-auto rounded-lg"
//                   />
//                   <button
//                     onClick={() => docFrontInputRef.current?.click()}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full"
//                   >
//                     Change Image
//                   </button>
//                 </div>
//               ) : (
//                 <div
//                   onClick={() => docFrontInputRef.current?.click()}
//                   className="cursor-pointer text-center py-8"
//                 >
//                   <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
//                   <p className="text-sm text-gray-600">Click to upload document front</p>
//                 </div>
//               )}
//               <input
//                 ref={docFrontInputRef}
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleFileSelect(e, 'docFront')}
//                 className="hidden"
//               />
//             </div>

//             {/* Document Back */}
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//               <h3 className="font-medium mb-3">Document Back (Optional)</h3>
//               {documentBackPreview ? (
//                 <div className="space-y-3">
//                   <img 
//                     src={documentBackPreview} 
//                     alt="Document back" 
//                     className="w-full max-w-md mx-auto rounded-lg"
//                   />
//                   <button
//                     onClick={() => docBackInputRef.current?.click()}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full"
//                   >
//                     Change Image
//                   </button>
//                 </div>
//               ) : (
//                 <div
//                   onClick={() => docBackInputRef.current?.click()}
//                   className="cursor-pointer text-center py-8"
//                 >
//                   <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
//                   <p className="text-sm text-gray-600">Click to upload document back</p>
//                 </div>
//               )}
//               <input
//                 ref={docBackInputRef}
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleFileSelect(e, 'docBack')}
//                 className="hidden"
//               />
//             </div>

//             <div className="bg-blue-50 p-4 rounded-lg">
//               <p className="text-sm text-blue-800 font-medium mb-2">📄 Document Guidelines:</p>
//               <ul className="text-sm text-blue-700 space-y-1">
//                 <li>✓ The photo should clearly show your document</li>
//                 <li>✓ Capture the whole document, all 4 corners must be visible</li>
//                 <li>✓ The text must be clear and easy to read</li>
//                 <li>✓ Everything must be clear, not photos must be clear</li>
//               </ul>
//             </div>
//           </div>
//         );

//       case 5:
//         return (
//           <div className="space-y-4 text-center py-8">
//             <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
//               <AlertCircle className="w-12 h-12 text-blue-600" />
//             </div>
//             <h2 className="text-2xl font-bold">Review Your Information</h2>
//             <p className="text-gray-600 mb-6">
//               Please review your details before submission
//             </p>

//             <div className="bg-gray-50 p-6 rounded-lg text-left space-y-3">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-600">Name</p>
//                   <p className="font-medium">{formData.firstName} {formData.lastName}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Date of Birth</p>
//                   <p className="font-medium">{formData.dateOfBirth}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Gender</p>
//                   <p className="font-medium capitalize">{formData.gender}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Blood Group</p>
//                   <p className="font-medium">{formData.bloodGroup}</p>
//                 </div>
//                 <div className="col-span-2">
//                   <p className="text-sm text-gray-600">Document Type</p>
//                   <p className="font-medium capitalize">{formData.documentType}</p>
//                 </div>
//                 <div className="col-span-2">
//                   <p className="text-sm text-gray-600">Document Number</p>
//                   <p className="font-medium">{formData.documentNumber}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-2 justify-center mt-6">
//               {profilePhotoPreview && (
//                 <div className="text-center">
//                   <p className="text-sm text-gray-600 mb-2">Profile Photo</p>
//                   <img 
//                     src={profilePhotoPreview} 
//                     alt="Profile" 
//                     className="w-20 h-20 rounded-full object-cover mx-auto"
//                   />
//                 </div>
//               )}
//               {documentFrontPreview && (
//                 <div className="text-center">
//                   <p className="text-sm text-gray-600 mb-2">Document Front</p>
//                   <img 
//                     src={documentFrontPreview} 
//                     alt="Doc front" 
//                     className="w-20 h-20 rounded object-cover mx-auto"
//                   />
//                 </div>
//               )}
//               {documentBackPreview && (
//                 <div className="text-center">
//                   <p className="text-sm text-gray-600 mb-2">Document Back</p>
//                   <img 
//                     src={documentBackPreview} 
//                     alt="Doc back" 
//                     className="w-20 h-20 rounded object-cover mx-auto"
//                   />
//                 </div>
//               )}
//             </div>

//             <p className="text-sm text-gray-500 mt-4">
//               By clicking Submit, you agree that all information provided is accurate.
//             </p>
//           </div>
//         );

//       case 6:
//         return (
//           <div className="space-y-4 text-center py-12">
//             <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
//               <CheckCircle className="w-12 h-12 text-green-600" />
//             </div>
//             <h2 className="text-3xl font-bold text-green-600">Success!</h2>
//             <h3 className="text-xl font-semibold">Document Uploaded Successfully</h3>
//             <p className="text-gray-600 max-w-md mx-auto">
//               Our Team will review all the documents carefully and updates you within 72 hours.
//             </p>
//             <p className="text-gray-500">Thanks for your time.</p>
            
//             <button
//               onClick={() => navigate('/rider/dashboard')}
//               className="mt-6 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
//             >
//               Go Back to Home
//             </button>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4">
//       <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
//         {/* Header */}
//         {currentStep < 6 && (
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-center mb-2">KYC Verification</h1>
//             <p className="text-center text-gray-600">
//               {currentStep === 1 && "Verify your identity in 3 easy steps"}
//               {currentStep === 2 && "Step 2: Document Details"}
//               {currentStep === 3 && "Step 3: Upload Selfie"}
//               {currentStep === 4 && "Step 4: Upload Document"}
//               {currentStep === 5 && "Step 5: Review & Submit"}
//             </p>
//           </div>
//         )}

//         {/* Progress Steps */}
//         {currentStep < 6 && (
//           <div className="flex items-center justify-center mb-8">
//             {[1, 2, 3, 4, 5].map((step) => (
//               <React.Fragment key={step}>
//                 <div
//                   className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
//                     currentStep >= step
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-gray-200 text-gray-500'
//                   }`}
//                 >
//                   {step}
//                 </div>
//                 {step < 5 && (
//                   <div
//                     className={`w-12 h-1 ${
//                       currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
//                     }`}
//                   />
//                 )}
//               </React.Fragment>
//             ))}
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//             <p className="text-red-800">{error}</p>
//           </div>
//         )}

//         {/* Step Content */}
//         {renderStepContent()}

//         {/* Navigation Buttons */}
//         {currentStep < 6 && (
//           <div className="flex gap-4 mt-8">
//             {currentStep > 1 && (
//               <button
//                 onClick={handlePrevious}
//                 disabled={loading}
//                 className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Previous
//               </button>
//             )}
//             {currentStep < 5 ? (
//               <button
//                 onClick={handleNext}
//                 disabled={loading}
//                 className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
//               >
//                 Continue
//               </button>
//             ) : (
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Submitting...
//                   </>
//                 ) : (
//                   'Submit KYC'
//                 )}
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default KYCUploadPage;

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, AlertCircle, Loader2, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { getToken } from '../utils/CookieUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const KYCUploadPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    email: '',
    gender: 'male',
    nationalIdentityNumber: '',
    bloodGroup: 'O+',
    documentType: 'citizenship',
    documentNumber: '',
    issuedDate: '',
    expiryDate: ''
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [documentFront, setDocumentFront] = useState(null);
  const [documentFrontPreview, setDocumentFrontPreview] = useState(null);
  const [documentBack, setDocumentBack] = useState(null);
  const [documentBackPreview, setDocumentBackPreview] = useState(null);

  const profileInputRef = useRef(null);
  const docFrontInputRef = useRef(null);
  const docBackInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e, type) => {
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

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'profile') {
        setProfilePhoto(file);
        setProfilePhotoPreview(reader.result);
      } else if (type === 'docFront') {
        setDocumentFront(file);
        setDocumentFrontPreview(reader.result);
      } else if (type === 'docBack') {
        setDocumentBack(file);
        setDocumentBackPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const validateStep = () => {
    setError('');
    
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError('Please enter your full name');
        return false;
      }
      if (!formData.dateOfBirth) {
        setError('Please enter your date of birth');
        return false;
      }
      if (!formData.address) {
        setError('Please enter your address');
        return false;
      }
      if (!formData.nationalIdentityNumber) {
        setError('Please enter your national identity number');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.documentNumber) {
        setError('Please enter document number');
        return false;
      }
      if (!formData.issuedDate) {
        setError('Please enter issued date');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!profilePhoto) {
        setError('Please upload your selfie');
        return false;
      }
    }

    if (currentStep === 4) {
      if (!documentFront) {
        setError('Please upload document front image');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      if (!token) {
        setError('Please login first');
        navigate('/login');
        return;
      }

      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      if (profilePhoto) submitData.append('profilePhoto', profilePhoto);
      if (documentFront) submitData.append('documentFront', documentFront);
      if (documentBack) submitData.append('documentBack', documentBack);

      const response = await fetch(`${API_URL}/api/kyc/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentStep(6);
      } else {
        setError(data.message || 'KYC submission failed');
      }
    } catch (error) {
      console.error('❌ KYC submission error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Step 1: Personal Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="John"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter your full address"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">National Identity Number *</label>
              <input
                type="text"
                name="nationalIdentityNumber"
                value={formData.nationalIdentityNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="12345678"
                required
              />
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Step 2: Document Details</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                required
              >
                <option value="citizenship">Citizenship</option>
                <option value="passport">Passport</option>
                <option value="nin">National ID</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Number *</label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="123456789"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issued Date *</label>
                <input
                  type="date"
                  name="issuedDate"
                  value={formData.issuedDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Step 3: Take a Selfie</h2>
            <p className="text-gray-600 mb-6">Please upload a clear selfie</p>

            <div 
              className="border-2 border-dashed border-blue-400 rounded-xl p-8 text-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition-all"
              onClick={() => !profilePhotoPreview && profileInputRef.current?.click()}
            >
              {profilePhotoPreview ? (
                <div className="space-y-4">
                  <img 
                    src={profilePhotoPreview} 
                    alt="Profile preview" 
                    className="w-40 h-40 mx-auto rounded-full object-cover border-4 border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      profileInputRef.current?.click();
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <Camera className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                  <p className="text-gray-900 font-semibold mb-2">Take a Selfie</p>
                  <p className="text-gray-600 text-sm">Click to upload photo</p>
                </div>
              )}
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => handleFileSelect(e, 'profile')}
                className="hidden"
              />
            </div>

            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-900 font-semibold mb-2">📸 Guidelines:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Good lighting</li>
                <li>✓ Face clearly visible</li>
                <li>✓ No filters</li>
              </ul>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Step 4: Upload Documents</h2>
            <p className="text-gray-600 mb-6">Upload front and back of your document</p>

            {/* Document Front */}
            <div 
              className="border-2 border-dashed border-green-400 rounded-xl p-6 bg-green-50 mb-4 cursor-pointer hover:bg-green-100 transition-all"
              onClick={() => !documentFrontPreview && docFrontInputRef.current?.click()}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Document Front *</h3>
              {documentFrontPreview ? (
                <div className="space-y-3">
                  <img 
                    src={documentFrontPreview} 
                    alt="Document front" 
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-green-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      docFrontInputRef.current?.click();
                    }}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Upload className="w-12 h-12 mx-auto text-green-600 mb-3" />
                  <p className="text-gray-600">Click to upload document front</p>
                </div>
              )}
          
              <input
                ref={docFrontInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'docFront')}
                className="hidden"
              />
            </div>

            {/* Document Back */}
            <div 
              className="border-2 border-dashed border-purple-400 rounded-xl p-6 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-all"
              onClick={() => !documentBackPreview && docBackInputRef.current?.click()}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Document Back (Optional)</h3>
              {documentBackPreview ? (
                <div className="space-y-3">
                  <img 
                    src={documentBackPreview} 
                    alt="Document back" 
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      docBackInputRef.current?.click();
                    }}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Upload className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                  <p className="text-gray-600">Click to upload document back</p>
                </div>
              )}
              <input
                ref={docBackInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'docBack')}
                className="hidden"
              />
            </div>
          </>
        );

      case 5:
        return (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Information</h2>
              <p className="text-gray-600">Please verify all details</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">DOB</p>
                  <p className="font-semibold text-gray-900">{formData.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gender</p>
                  <p className="font-semibold text-gray-900 capitalize">{formData.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Blood</p>
                  <p className="font-semibold text-gray-900">{formData.bloodGroup}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Document</p>
                  <p className="font-semibold text-gray-900 capitalize">{formData.documentType} - {formData.documentNumber}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              {profilePhotoPreview && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">Profile</p>
                  <img 
                    src={profilePhotoPreview} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  />
                </div>
              )}
              {documentFrontPreview && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">Front</p>
                  <img 
                    src={documentFrontPreview} 
                    alt="Front" 
                    className="w-16 h-16 rounded object-cover border-2 border-green-500"
                  />
                </div>
              )}
              {documentBackPreview && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">Back</p>
                  <img 
                    src={documentBackPreview} 
                    alt="Back" 
                    className="w-16 h-16 rounded object-cover border-2 border-purple-500"
                  />
                </div>
              )}
            </div>
          </>
        );

      case 6:
        return (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">Success!</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents Uploaded</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Our team will review your documents within 24-72 hours. Thank you!
            </p>
            
            <button
              onClick={() => navigate('/driver/dashboard')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 pb-20" style={{ position: 'relative', zIndex: 1000 }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Close Button */}
          {currentStep < 6 && (
            <button
              onClick={() => navigate('/driver/dashboard')}
              className="float-right p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          )}

          {/* Header */}
          {currentStep < 6 && (
            <div className="text-center mb-8 clear-both">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                KYC Verification
              </h1>
              <p className="text-gray-600">Verify your identity in 5 easy steps</p>
            </div>
          )}

          {/* Progress Steps */}
          {currentStep < 6 && (
            <div className="flex items-center justify-center mb-10">
              {[1, 2, 3, 4, 5].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep >= step
                        ? 'bg-blue-600 text-white scale-110 shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 5 && (
                    <div className={`w-12 h-1 mx-2 rounded ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 6 && (
            <div className="flex gap-4">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Previous
                </button>
              )}
              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit KYC'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCUploadPage;