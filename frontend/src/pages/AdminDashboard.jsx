// import React, { useState, useEffect } from 'react';
// import { CheckCircle, XCircle, Eye, User, FileText, Calendar, MapPin, Loader2, RefreshCw } from 'lucide-react';
// import { getToken } from '../utils/CookieUtils';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// const AdminKYCDashboard = () => {
//   const [pendingKYCs, setPendingKYCs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedKYC, setSelectedKYC] = useState(null);
//   const [viewingDetails, setViewingDetails] = useState(false);
//   const [processing, setProcessing] = useState(false);

//   useEffect(() => {
//     fetchPendingKYCs();
//   }, []);

//   const fetchPendingKYCs = async () => {
//     try {
//       setLoading(true);
//       const token = getToken();
//       const response = await fetch(`${API_URL}/api/kyc/pending`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       const data = await response.json();
//       if (data.success) {
//         setPendingKYCs(data.data.pendingKYCs || []);
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch pending KYCs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const viewKYCDetails = async (kyc) => {
//     try {
//       const token = getToken();
//       const response = await fetch(`${API_URL}/api/kyc/${kyc.user_id}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       const data = await response.json();
//       if (data.success) {
//         setSelectedKYC(data.data);
//         setViewingDetails(true);
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch KYC details:', error);
//     }
//   };

//   const handleVerifyKYC = async (userId, approved) => {
//     try {
//       setProcessing(true);
//       const token = getToken();
      
//       const response = await fetch(`${API_URL}/api/kyc/verify/${userId}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           approved: approved,
//           remarks: approved ? 'Documents verified successfully' : 'Documents rejected'
//         })
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         alert(approved ? '✅ KYC Approved! Driver profile created.' : '❌ KYC Rejected');
//         setViewingDetails(false);
//         setSelectedKYC(null);
//         fetchPendingKYCs(); // Refresh list
//       } else {
//         alert('Error: ' + data.message);
//       }
//     } catch (error) {
//       console.error('❌ Verification error:', error);
//       alert('Failed to verify KYC');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       {/* Header */}
//       <div className="max-w-7xl mx-auto mb-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Admin KYC Dashboard</h1>
//             <p className="text-gray-600 mt-1">Review and approve driver verification documents</p>
//           </div>
//           <button
//             onClick={fetchPendingKYCs}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
//           >
//             <RefreshCw size={20} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Stats Card */}
//       <div className="max-w-7xl mx-auto mb-6">
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <div className="flex items-center gap-4">
//             <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
//               <FileText size={32} className="text-orange-600" />
//             </div>
//             <div>
//               <div className="text-3xl font-bold text-gray-900">{pendingKYCs.length}</div>
//               <div className="text-gray-600">Pending KYC Approvals</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Pending KYCs List */}
//       <div className="max-w-7xl mx-auto">
//         {loading ? (
//           <div className="bg-white rounded-xl shadow-md p-12 text-center">
//             <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
//             <p className="text-gray-600">Loading pending KYCs...</p>
//           </div>
//         ) : pendingKYCs.length === 0 ? (
//           <div className="bg-white rounded-xl shadow-md p-12 text-center">
//             <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
//             <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
//             <p className="text-gray-600">No pending KYC verifications at the moment.</p>
//           </div>
//         ) : (
//           <div className="grid gap-4">
//             {pendingKYCs.map((kyc) => (
//               <div key={kyc.kyc_id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-start gap-4 flex-1">
//                     {/* Avatar */}
//                     <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
//                       {kyc.first_name?.charAt(0)}{kyc.last_name?.charAt(0)}
//                     </div>

//                     {/* Info */}
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2">
//                         <h3 className="text-xl font-bold text-gray-900">
//                           {kyc.first_name} {kyc.last_name}
//                         </h3>
//                         <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                           kyc.role === 'driver' 
//                             ? 'bg-purple-100 text-purple-800' 
//                             : 'bg-blue-100 text-blue-800'
//                         }`}>
//                           {kyc.role.toUpperCase()}
//                         </span>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4 mt-3">
//                         <div className="flex items-center gap-2 text-gray-600">
//                           <User size={16} />
//                           <span className="text-sm">{kyc.email}</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-gray-600">
//                           <FileText size={16} />
//                           <span className="text-sm">{kyc.phone_number}</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-gray-600">
//                           <Calendar size={16} />
//                           <span className="text-sm">
//                             Submitted: {new Date(kyc.updated_at).toLocaleDateString()}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-2 text-gray-600">
//                           <FileText size={16} />
//                           <span className="text-sm">{kyc.document_count} Documents</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Action Button */}
//                   <button
//                     onClick={() => viewKYCDetails(kyc)}
//                     className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold"
//                   >
//                     <Eye size={20} />
//                     Review KYC
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* KYC Details Modal */}
//       {viewingDetails && selectedKYC && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             {/* Modal Header */}
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">
//                   KYC Verification Review
//                 </h2>
//                 <p className="text-gray-600 text-sm mt-1">
//                   {selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setViewingDetails(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <XCircle size={28} />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6">
//               {/* Personal Information */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
//                 <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
//                   <div>
//                     <div className="text-sm text-gray-600">Full Name</div>
//                     <div className="font-semibold text-gray-900">
//                       {selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-sm text-gray-600">Email</div>
//                     <div className="font-semibold text-gray-900">{selectedKYC.kyc.email}</div>
//                   </div>
//                   <div>
//                     <div className="text-sm text-gray-600">Phone Number</div>
//                     <div className="font-semibold text-gray-900">{selectedKYC.kyc.phone_number}</div>
//                   </div>
//                   <div>
//                     <div className="text-sm text-gray-600">Date of Birth</div>
//                     <div className="font-semibold text-gray-900">
//                       {new Date(selectedKYC.kyc.date_of_birth).toLocaleDateString()}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-sm text-gray-600">Gender</div>
//                     <div className="font-semibold text-gray-900 capitalize">{selectedKYC.kyc.gender}</div>
//                   </div>
//                   <div>
//                     <div className="text-sm text-gray-600">Blood Group</div>
//                     <div className="font-semibold text-gray-900">{selectedKYC.kyc.blood_group}</div>
//                   </div>
//                   <div className="col-span-2">
//                     <div className="text-sm text-gray-600">Address</div>
//                     <div className="font-semibold text-gray-900">{selectedKYC.kyc.address}</div>
//                   </div>
//                   <div className="col-span-2">
//                     <div className="text-sm text-gray-600">National Identity Number</div>
//                     <div className="font-semibold text-gray-900">{selectedKYC.kyc.national_identity_number}</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Profile Photo */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Photo</h3>
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <img
//                     src={selectedKYC.kyc.profile_url}
//                     alt="Profile"
//                     className="w-48 h-48 object-cover rounded-lg border-4 border-white shadow-lg mx-auto"
//                   />
//                 </div>
//               </div>

//               {/* Documents */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-bold text-gray-900 mb-4">Uploaded Documents</h3>
//                 {selectedKYC.documents.map((doc, index) => (
//                   <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
//                     <div className="grid grid-cols-2 gap-4 mb-4">
//                       <div>
//                         <div className="text-sm text-gray-600">Document Type</div>
//                         <div className="font-semibold text-gray-900 capitalize">{doc.document_type}</div>
//                       </div>
//                       <div>
//                         <div className="text-sm text-gray-600">Document Number</div>
//                         <div className="font-semibold text-gray-900">{doc.document_number}</div>
//                       </div>
//                       <div>
//                         <div className="text-sm text-gray-600">Issued Date</div>
//                         <div className="font-semibold text-gray-900">
//                           {new Date(doc.issued_date).toLocaleDateString()}
//                         </div>
//                       </div>
//                       {doc.expiry_date && (
//                         <div>
//                           <div className="text-sm text-gray-600">Expiry Date</div>
//                           <div className="font-semibold text-gray-900">
//                             {new Date(doc.expiry_date).toLocaleDateString()}
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <div className="text-sm text-gray-600 mb-2">Document Front</div>
//                         <img
//                           src={doc.document_front_url}
//                           alt="Document Front"
//                           className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
//                         />
//                       </div>
//                       {doc.document_back_url && (
//                         <div>
//                           <div className="text-sm text-gray-600 mb-2">Document Back</div>
//                           <img
//                             src={doc.document_back_url}
//                             alt="Document Back"
//                             className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-4 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
//                 <button
//                   onClick={() => handleVerifyKYC(selectedKYC.kyc.user_id, false)}
//                   disabled={processing}
//                   className="flex-1 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2"
//                 >
//                   {processing ? (
//                     <>
//                       <Loader2 className="animate-spin" size={20} />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <XCircle size={20} />
//                       Reject KYC
//                     </>
//                   )}
//                 </button>
                
//                 <button
//                   onClick={() => handleVerifyKYC(selectedKYC.kyc.user_id, true)}
//                   disabled={processing}
//                   className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2"
//                 >
//                   {processing ? (
//                     <>
//                       <Loader2 className="animate-spin" size={20} />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle size={20} />
//                       Approve KYC & Create Driver Profile
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminKYCDashboard;



import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, User, FileText, Calendar, Loader2, RefreshCw, X } from 'lucide-react';
import { getToken } from '../utils/CookieUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminKYCDashboard = () => {
  const [pendingKYCs, setPendingKYCs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingKYCs();
  }, []);

  const fetchPendingKYCs = async () => {
    try {
      setLoading(true);
      const token = getToken();
      console.log('📡 Fetching pending KYCs...');
      
      const response = await fetch(`${API_URL}/api/kyc/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📥 Response:', data);
      
      if (data.success) {
        setPendingKYCs(data.data.pendingKYCs || []);
        console.log('✅ Loaded', data.data.pendingKYCs?.length || 0, 'pending KYCs');
      }
    } catch (error) {
      console.error('❌ Failed to fetch pending KYCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewKYCDetails = async (kyc) => {
    try {
      console.log('🔍 Fetching details for user:', kyc.user_id);
      const token = getToken();
      
      const response = await fetch(`${API_URL}/api/kyc/${kyc.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📄 KYC Details:', data);
      
      if (data.success) {
        setSelectedKYC(data.data);
        setViewingDetails(true);
        console.log('✅ Showing KYC modal');
      } else {
        console.error('❌ Failed to load details:', data.message);
        alert('Failed to load KYC details: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Failed to fetch KYC details:', error);
      alert('Error loading KYC details');
    }
  };

  const handleVerifyKYC = async (userId, approved) => {
    if (!confirm(approved ? '✅ Approve this KYC and create driver profile?' : '❌ Reject this KYC?')) {
      return;
    }

    try {
      setProcessing(true);
      const token = getToken();
      
      console.log(`${approved ? '✅' : '❌'} Verifying KYC for user:`, userId);
      
      const response = await fetch(`${API_URL}/api/kyc/verify/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved: approved,
          remarks: approved ? 'Documents verified successfully' : 'Documents rejected'
        })
      });

      const data = await response.json();
      console.log('📥 Verification response:', data);
      
      if (data.success) {
        alert(approved 
          ? '✅ KYC Approved! Driver profile created.' 
          : '❌ KYC Rejected'
        );
        setViewingDetails(false);
        setSelectedKYC(null);
        fetchPendingKYCs(); // Refresh list
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      alert('Failed to verify KYC');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin KYC Dashboard</h1>
            <p className="text-blue-200">Review and approve driver verification documents</p>
          </div>
          <button
            onClick={fetchPendingKYCs}
            className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 flex items-center gap-2 border border-white/20 transition-all"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText size={40} className="text-white" />
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-1">{pendingKYCs.length}</div>
              <div className="text-blue-200 text-lg">Pending KYC Approvals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending KYCs List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-16 text-center border border-white/20">
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-white mb-4" />
            <p className="text-blue-200 text-lg">Loading pending KYCs...</p>
          </div>
        ) : pendingKYCs.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-16 text-center border border-white/20">
            <CheckCircle className="w-20 h-20 mx-auto text-green-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-blue-200">No pending KYC verifications at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingKYCs.map((kyc) => (
              <div 
                key={kyc.kyc_id} 
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 hover:bg-white/20 transition-all border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {kyc.first_name?.charAt(0)}{kyc.last_name?.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-white">
                          {kyc.first_name} {kyc.last_name}
                        </h3>
                        <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                          kyc.role === 'driver' 
                            ? 'bg-purple-500/80 text-white' 
                            : 'bg-blue-500/80 text-white'
                        }`}>
                          {kyc.role.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-blue-200">
                          <User size={18} />
                          <span>{kyc.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-200">
                          <FileText size={18} />
                          <span>{kyc.phone_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-200">
                          <Calendar size={18} />
                          <span>
                            {new Date(kyc.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-200">
                          <FileText size={18} />
                          <span>{kyc.document_count} Documents</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      console.log('🖱️ Review button clicked for:', kyc.first_name, kyc.last_name);
                      viewKYCDetails(kyc);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 flex items-center gap-3 font-bold text-lg shadow-lg transition-all"
                  >
                    <Eye size={24} />
                    Review KYC
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL - Blurred Background with Card */}
      {viewingDetails && selectedKYC && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
          onClick={() => {
            console.log('🖱️ Backdrop clicked - closing modal');
            setViewingDetails(false);
          }}
        >
          {/* Card - Landscape Style */}
          <div 
            className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => {
              e.stopPropagation(); // Prevent closing when clicking inside card
              console.log('🖱️ Card clicked - keeping modal open');
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  KYC Verification Review
                </h2>
                <p className="text-blue-100">
                  {selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🖱️ Close button clicked');
                  setViewingDetails(false);
                }}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
              >
                <X size={28} className="text-white" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-8">
              <div className="grid grid-cols-3 gap-6">
                {/* LEFT: Personal Info */}
                <div className="col-span-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={24} className="text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Full Name</div>
                      <div className="font-bold text-gray-900 text-lg">
                        {selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Email</div>
                      <div className="font-bold text-gray-900">{selectedKYC.kyc.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Phone</div>
                      <div className="font-bold text-gray-900">{selectedKYC.kyc.phone_number}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Date of Birth</div>
                      <div className="font-bold text-gray-900">
                        {new Date(selectedKYC.kyc.date_of_birth).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Gender</div>
                      <div className="font-bold text-gray-900 capitalize">{selectedKYC.kyc.gender}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Blood Group</div>
                      <div className="font-bold text-gray-900">{selectedKYC.kyc.blood_group}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500 mb-1">Address</div>
                      <div className="font-bold text-gray-900">{selectedKYC.kyc.address}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500 mb-1">National ID</div>
                      <div className="font-bold text-gray-900">{selectedKYC.kyc.national_identity_number}</div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Profile Photo */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h3>
                  <img
                    src={selectedKYC.kyc.profile_url}
                    alt="Profile"
                    className="w-full aspect-square object-cover rounded-2xl border-4 border-blue-500 shadow-xl"
                  />
                </div>
              </div>

              {/* Documents */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={24} className="text-purple-600" />
                  Uploaded Documents
                </h3>
                {selectedKYC.documents.map((doc, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 mb-4">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Type</div>
                        <div className="font-bold text-gray-900 capitalize">{doc.document_type}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Number</div>
                        <div className="font-bold text-gray-900">{doc.document_number}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Issued</div>
                        <div className="font-bold text-gray-900">
                          {new Date(doc.issued_date).toLocaleDateString()}
                        </div>
                      </div>
                      {doc.expiry_date && (
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Expiry</div>
                          <div className="font-bold text-gray-900">
                            {new Date(doc.expiry_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">Document Front</div>
                        <img
                          src={doc.document_front_url}
                          alt="Document Front"
                          className="w-full aspect-video object-cover rounded-xl border-2 border-gray-300 shadow-md"
                        />
                      </div>
                      {doc.document_back_url && (
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2">Document Back</div>
                          <img
                            src={doc.document_back_url}
                            alt="Document Back"
                            className="w-full aspect-video object-cover rounded-xl border-2 border-gray-300 shadow-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer - Action Buttons */}
            <div className="bg-gray-50 px-8 py-6 flex gap-4 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVerifyKYC(selectedKYC.kyc.user_id, false);
                }}
                disabled={processing}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all"
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle size={24} />
                    Reject KYC
                  </>
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVerifyKYC(selectedKYC.kyc.user_id, true);
                }}
                disabled={processing}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all"
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={24} />
                    Approve & Create Driver Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYCDashboard;