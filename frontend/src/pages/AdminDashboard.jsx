



// import React, { useState, useEffect } from 'react';
// import { CheckCircle, XCircle, Eye, User, FileText, Calendar, Loader2, RefreshCw, X } from 'lucide-react';
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
//       console.log('📡 Fetching pending KYCs...');
      
//       const response = await fetch(`${API_URL}/api/kyc/pending`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       const data = await response.json();
//       console.log('📥 Response:', data);
      
//       if (data.success) {
//         setPendingKYCs(data.data.pendingKYCs || []);
//         console.log('✅ Loaded', data.data.pendingKYCs?.length || 0, 'pending KYCs');
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch pending KYCs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const viewKYCDetails = async (kyc) => {
//     try {
//       console.log('🔍 Fetching details for user:', kyc.user_id);
//       const token = getToken();
      
//       const response = await fetch(`${API_URL}/api/kyc/${kyc.user_id}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       const data = await response.json();
//       console.log('📄 KYC Details:', data);
      
//       if (data.success) {
//         setSelectedKYC(data.data);
//         setViewingDetails(true);
//         console.log('✅ Showing KYC modal');
//       } else {
//         console.error('❌ Failed to load details:', data.message);
//         alert('Failed to load KYC details: ' + data.message);
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch KYC details:', error);
//       alert('Error loading KYC details');
//     }
//   };

//   const handleVerifyKYC = async (userId, approved) => {
//     if (!confirm(approved ? '✅ Approve this KYC and create driver profile?' : '❌ Reject this KYC?')) {
//       return;
//     }

//     try {
//       setProcessing(true);
//       const token = getToken();
      
//       console.log(`${approved ? '✅' : '❌'} Verifying KYC for user:`, userId);
      
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
//       console.log('📥 Verification response:', data);
      
//       if (data.success) {
//         alert(approved 
//           ? '✅ KYC Approved! Driver profile created.' 
//           : '❌ KYC Rejected'
//         );
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
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
//       {/* Header */}
//       <div className="max-w-7xl mx-auto mb-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-4xl font-bold text-white mb-2">Admin KYC Dashboard</h1>
//             <p className="text-blue-200">Review and approve driver verification documents</p>
//           </div>
//           <button
//             onClick={fetchPendingKYCs}
//             className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 flex items-center gap-2 border border-white/20 transition-all"
//           >
//             <RefreshCw size={20} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Stats Card */}
//       <div className="max-w-7xl mx-auto mb-6">
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
//           <div className="flex items-center gap-6">
//             <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
//               <FileText size={40} className="text-white" />
//             </div>
//             <div>
//               <div className="text-5xl font-bold text-white mb-1">{pendingKYCs.length}</div>
//               <div className="text-blue-200 text-lg">Pending KYC Approvals</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Pending KYCs List */}
//       <div className="max-w-7xl mx-auto">
//         {loading ? (
//           <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-16 text-center border border-white/20">
//             <Loader2 className="w-16 h-16 animate-spin mx-auto text-white mb-4" />
//             <p className="text-blue-200 text-lg">Loading pending KYCs...</p>
//           </div>
//         ) : pendingKYCs.length === 0 ? (
//           <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-16 text-center border border-white/20">
//             <CheckCircle className="w-20 h-20 mx-auto text-green-400 mb-4" />
//             <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
//             <p className="text-blue-200">No pending KYC verifications at the moment.</p>
//           </div>
//         ) : (
//           <div className="grid gap-6">
//             {pendingKYCs.map((kyc) => (
//               <div 
//                 key={kyc.kyc_id} 
//                 className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 hover:bg-white/20 transition-all border border-white/20"
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-6 flex-1">
//                     {/* Avatar */}
//                     <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
//                       {kyc.first_name?.charAt(0)}{kyc.last_name?.charAt(0)}
//                     </div>

//                     {/* Info */}
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-3">
//                         <h3 className="text-2xl font-bold text-white">
//                           {kyc.first_name} {kyc.last_name}
//                         </h3>
//                         <span className={`px-4 py-1 rounded-full text-xs font-bold ${
//                           kyc.role === 'driver' 
//                             ? 'bg-purple-500/80 text-white' 
//                             : 'bg-blue-500/80 text-white'
//                         }`}>
//                           {kyc.role.toUpperCase()}
//                         </span>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="flex items-center gap-2 text-blue-200">
//                           <User size={18} />
//                           <span>{kyc.email}</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-blue-200">
//                           <FileText size={18} />
//                           <span>{kyc.phone_number}</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-blue-200">
//                           <Calendar size={18} />
//                           <span>
//                             {new Date(kyc.updated_at).toLocaleDateString()}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-2 text-blue-200">
//                           <FileText size={18} />
//                           <span>{kyc.document_count} Documents</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Action Button */}
//                   <button
//                     onClick={() => {
//                       console.log('🖱️ Review button clicked for:', kyc.first_name, kyc.last_name);
//                       viewKYCDetails(kyc);
//                     }}
//                     className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 flex items-center gap-3 font-bold text-lg shadow-lg transition-all"
//                   >
//                     <Eye size={24} />
//                     Review KYC
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* MODAL - Blurred Background with Card */}
//       {viewingDetails && selectedKYC && (
//         <div 
//           className="fixed inset-0 z-50 flex items-center justify-center p-4"
//           style={{
//             backdropFilter: 'blur(12px)',
//             backgroundColor: 'rgba(0, 0, 0, 0.7)'
//           }}
//           onClick={() => {
//             console.log('🖱️ Backdrop clicked - closing modal');
//             setViewingDetails(false);
//           }}
//         >
//           {/* Card - Landscape Style */}
//           <div 
//             className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
//             onClick={(e) => {
//               e.stopPropagation(); // Prevent closing when clicking inside card
//               console.log('🖱️ Card clicked - keeping modal open');
//             }}
//           >
//             {/* Header */}
//             <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 flex items-center justify-between">
//               <div>
//                 <h2 className="text-3xl font-bold text-white mb-1">
//                   KYC Verification Review
//                 </h2>
//                 <p className="text-blue-100">
//                   {selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}
//                 </p>
//               </div>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   console.log('🖱️ Close button clicked');
//                   setViewingDetails(false);
//                 }}
//                 className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
//               >
//                 <X size={28} className="text-white" />
//               </button>
//             </div>

//             {/* Content - Scrollable */}
//             <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-8">
//               <div className="grid grid-cols-3 gap-6">
//                 {/* LEFT: Personal Info */}
//                 <div className="col-span-2">
//                   <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//                     <User size={24} className="text-blue-600" />
//                     Personal Information
//                   </h3>
//                   <div className="bg-gray-50 rounded-xl p-6 grid grid-cols-2 gap-4">
//                     <div>
//                       <div className="text-sm text-gray-500 mb-1">Full Name</div>
//                       <div className="font-bold text-gray-900 text-lg">
//                         {selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500 mb-1">Email</div>
//                       <div className="font-bold text-gray-900">{selectedKYC.kyc.email}</div>
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500 mb-1">Phone</div>
//                       <div className="font-bold text-gray-900">{selectedKYC.kyc.phone_number}</div>
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500 mb-1">Date of Birth</div>
//                       <div className="font-bold text-gray-900">
//                         {new Date(selectedKYC.kyc.date_of_birth).toLocaleDateString()}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500 mb-1">Gender</div>
//                       <div className="font-bold text-gray-900 capitalize">{selectedKYC.kyc.gender}</div>
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500 mb-1">Blood Group</div>
//                       <div className="font-bold text-gray-900">{selectedKYC.kyc.blood_group}</div>
//                     </div>
//                     <div className="col-span-2">
//                       <div className="text-sm text-gray-500 mb-1">Address</div>
//                       <div className="font-bold text-gray-900">{selectedKYC.kyc.address}</div>
//                     </div>
//                     <div className="col-span-2">
//                       <div className="text-sm text-gray-500 mb-1">National ID</div>
//                       <div className="font-bold text-gray-900">{selectedKYC.kyc.national_identity_number}</div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* RIGHT: Profile Photo */}
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h3>
//                   <img
//                     src={selectedKYC.kyc.profile_url}
//                     alt="Profile"
//                     className="w-full aspect-square object-cover rounded-2xl border-4 border-blue-500 shadow-xl"
//                   />
//                 </div>
//               </div>

//               {/* Documents */}
//               <div className="mt-8">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//                   <FileText size={24} className="text-purple-600" />
//                   Uploaded Documents
//                 </h3>
//                 {selectedKYC.documents.map((doc, index) => (
//                   <div key={index} className="bg-gray-50 rounded-xl p-6 mb-4">
//                     <div className="grid grid-cols-4 gap-4 mb-4">
//                       <div>
//                         <div className="text-sm text-gray-500 mb-1">Type</div>
//                         <div className="font-bold text-gray-900 capitalize">{doc.document_type}</div>
//                       </div>
//                       <div>
//                         <div className="text-sm text-gray-500 mb-1">Number</div>
//                         <div className="font-bold text-gray-900">{doc.document_number}</div>
//                       </div>
//                       <div>
//                         <div className="text-sm text-gray-500 mb-1">Issued</div>
//                         <div className="font-bold text-gray-900">
//                           {new Date(doc.issued_date).toLocaleDateString()}
//                         </div>
//                       </div>
//                       {doc.expiry_date && (
//                         <div>
//                           <div className="text-sm text-gray-500 mb-1">Expiry</div>
//                           <div className="font-bold text-gray-900">
//                             {new Date(doc.expiry_date).toLocaleDateString()}
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-2 gap-6">
//                       <div>
//                         <div className="text-sm font-semibold text-gray-700 mb-2">Document Front</div>
//                         <img
//                           src={doc.document_front_url}
//                           alt="Document Front"
//                           className="w-full aspect-video object-cover rounded-xl border-2 border-gray-300 shadow-md"
//                         />
//                       </div>
//                       {doc.document_back_url && (
//                         <div>
//                           <div className="text-sm font-semibold text-gray-700 mb-2">Document Back</div>
//                           <img
//                             src={doc.document_back_url}
//                             alt="Document Back"
//                             className="w-full aspect-video object-cover rounded-xl border-2 border-gray-300 shadow-md"
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Footer - Action Buttons */}
//             <div className="bg-gray-50 px-8 py-6 flex gap-4 border-t border-gray-200">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleVerifyKYC(selectedKYC.kyc.user_id, false);
//                 }}
//                 disabled={processing}
//                 className="flex-1 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all"
//               >
//                 {processing ? (
//                   <>
//                     <Loader2 className="animate-spin" size={24} />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <XCircle size={24} />
//                     Reject KYC
//                   </>
//                 )}
//               </button>
              
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleVerifyKYC(selectedKYC.kyc.user_id, true);
//                 }}
//                 disabled={processing}
//                 className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all"
//               >
//                 {processing ? (
//                   <>
//                     <Loader2 className="animate-spin" size={24} />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle size={24} />
//                     Approve & Create Driver Profile
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminKYCDashboard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, TrendingUp, TrendingDown, DollarSign, Clock, LogOut,
  CheckCircle, XCircle, Eye, User, FileText, Calendar, Loader2, RefreshCw, X
} from 'lucide-react';
import { getToken, clearAuthData } from '../utils/CookieUtils';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // KYC State
  const [pendingKYCs, setPendingKYCs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (activeSection === 'kyc') {
      fetchPendingKYCs();
    }
  }, [activeSection]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      clearAuthData();
      navigate('/login');
    }
  };

  const fetchPendingKYCs = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`${API_URL}/api/kyc/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingKYCs(data.data.pendingKYCs || []);
      }
    } catch (error) {
      console.error('❌ Failed to fetch pending KYCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewKYCDetails = async (kyc) => {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_URL}/api/kyc/${kyc.user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedKYC(data.data);
        setViewingDetails(true);
      } else {
        alert('Failed to load KYC details: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Failed to fetch KYC details:', error);
      alert('Error loading KYC details');
    }
  };

  const handleVerifyKYC = async (userId, approved) => {
    if (!confirm(approved ? '✅ Approve this KYC?' : '❌ Reject this KYC?')) {
      return;
    }

    try {
      setProcessing(true);
      const token = getToken();
      
      const response = await fetch(`${API_URL}/api/kyc/verify/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved: approved,
          remarks: approved ? 'Documents verified' : 'Documents rejected'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(approved ? '✅ KYC Approved!' : '❌ KYC Rejected');
        setViewingDetails(false);
        setSelectedKYC(null);
        fetchPendingKYCs();
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

  const renderDashboard = () => {
    const activities = [
      { text: 'All Hands Meeting', dot: 'red' },
      { text: 'Yet another one', time: '15:00 PM', dot: 'yellow' },
      { text: 'Build the production release', badge: 'NEW', dot: 'green' },
      { text: 'Something not important', dot: 'blue', showAvatars: true },
      { text: 'This dot has an info state', dot: 'cyan' },
    ];

    return (
      <>
        {/* Portfolio Performance */}
        <div className="card">
          <div className="card-header">
            <h2>Portfolio Performance</h2>
            <button className="link">View All</button>
          </div>
          
          <div className="card-body">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-top">
                  <div className="stat-icon orange">
                    <DollarSign size={28} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">Cash Deposits</div>
                    <div className="stat-value">1,7M</div>
                  </div>
                </div>
                <div className="stat-change negative">
                  <TrendingDown size={16} />
                  <span>54.1% less earnings</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-top">
                  <div className="stat-icon red">
                    <TrendingUp size={28} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">Invested Dividends</div>
                    <div className="stat-value">9M</div>
                  </div>
                </div>
                <div className="stat-change">
                  <span>Grow Rate: </span>
                  <span className="positive">▼ 14.1%</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-top">
                  <div className="stat-icon green">
                    <Activity size={28} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">Capital Gains</div>
                    <div className="stat-value">$563</div>
                  </div>
                </div>
                <div className="stat-change">
                  <span>Increased by </span>
                  <TrendingUp size={16} className="orange-icon" />
                  <span className="orange">7.38%</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button className="btn-report">👁 View Complete Report</button>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="bottom-grid">
          <div className="card">
            <div className="card-header">
              <div className="header-with-icon">
                <Activity className="blue-icon" size={20} />
                <h3>Technical Support</h3>
              </div>
            </div>
            
            <div className="card-body">
              <div className="chart-header">
                <div className="chart-label">NEW ACCOUNTS SINCE 2018</div>
                <div className="chart-value">
                  <TrendingUp className="green-icon" size={28} />
                  <span className="big-number">78</span>
                  <span className="big-percent">%</span>
                  <span className="green-badge">+14</span>
                </div>
              </div>

              <div className="chart-container">
                <svg viewBox="0 0 400 150" className="chart-svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.5"/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,120 L 30,110 L 60,90 L 90,95 L 120,75 L 150,80 L 180,60 L 210,65 L 240,50 L 270,55 L 300,40 L 330,45 L 360,30 L 400,35"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                  <path
                    d="M 0,120 L 30,110 L 60,90 L 90,95 L 120,75 L 150,80 L 180,60 L 210,65 L 240,50 L 270,55 L 300,40 L 330,45 L 360,30 L 400,35 L 400,150 L 0,150 Z"
                    fill="url(#chartGradient)"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="header-with-icon">
                <Clock className="pink-icon" size={20} />
                <h3>Timeline Example</h3>
              </div>
            </div>

            <div className="card-body">
              <div className="timeline">
                {activities.map((activity, idx) => (
                  <div key={idx} className="timeline-item">
                    <span className={`timeline-dot ${activity.dot}`}></span>
                    <div className="timeline-content">
                      <div className="timeline-text">
                        {activity.text}
                        {activity.badge && <span className="badge">{activity.badge}</span>}
                        {activity.time && <span className="time">{activity.time}</span>}
                      </div>
                      {activity.showAvatars && (
                        <div className="avatars">
                          {[1,2,3,4,5,6,7].map((i) => (
                            <div key={i} className="avatar"></div>
                          ))}
                          <div className="avatar-more">+</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderKYC = () => (
    <>
      {/* KYC Stats */}
      <div className="kyc-stats-card">
        <div className="kyc-stat-icon">
          <FileText size={40} />
        </div>
        <div className="kyc-stat-info">
          <div className="kyc-stat-number">{pendingKYCs.length}</div>
          <div className="kyc-stat-label">Pending KYC Approvals</div>
        </div>
        <button onClick={fetchPendingKYCs} className="btn-refresh">
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* KYC List */}
      {loading ? (
        <div className="kyc-loading">
          <Loader2 className="spinner" size={48} />
          <p>Loading pending KYCs...</p>
        </div>
      ) : pendingKYCs.length === 0 ? (
        <div className="kyc-empty">
          <CheckCircle size={64} className="empty-icon" />
          <h3>All Caught Up!</h3>
          <p>No pending KYC verifications at the moment.</p>
        </div>
      ) : (
        <div className="kyc-list">
          {pendingKYCs.map((kyc) => (
            <div key={kyc.kyc_id} className="kyc-card">
              <div className="kyc-avatar">
                {kyc.first_name?.charAt(0)}{kyc.last_name?.charAt(0)}
              </div>
              <div className="kyc-info">
                <div className="kyc-name">
                  <h3>{kyc.first_name} {kyc.last_name}</h3>
                  <span className={`role-badge ${kyc.role}`}>{kyc.role.toUpperCase()}</span>
                </div>
                <div className="kyc-details">
                  <div className="detail-item">
                    <User size={16} />
                    <span>{kyc.email}</span>
                  </div>
                  <div className="detail-item">
                    <FileText size={16} />
                    <span>{kyc.phone_number}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{new Date(kyc.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <FileText size={16} />
                    <span>{kyc.document_count} Documents</span>
                  </div>
                </div>
              </div>
              <button onClick={() => viewKYCDetails(kyc)} className="btn-review">
                <Eye size={20} />
                Review KYC
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>MENU</h2>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-title">MAIN</div>
            <button 
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-item ${activeSection === 'kyc' ? 'active' : ''}`}
              onClick={() => setActiveSection('kyc')}
            >
              KYC Verification
            </button>
            <button className="nav-item logout" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-content">
            <div className="header-left">
              {activeSection === 'dashboard' ? (
                <>
                  <Activity className="header-icon" size={36} />
                  <div>
                    <h1>Analytics Dashboard</h1>
                    <p>This is an example dashboard created using build-in elements and components.</p>
                  </div>
                </>
              ) : (
                <>
                  <FileText className="header-icon" size={36} />
                  <div>
                    <h1>KYC Verification</h1>
                    <p>Review and approve driver verification documents</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className="tab active">Main View</button>
        </div>

        {/* Content */}
        <div className="admin-content">
          {activeSection === 'dashboard' ? renderDashboard() : renderKYC()}
        </div>
      </main>

      {/* KYC Details Modal */}
      {viewingDetails && selectedKYC && (
        <div className="modal-overlay" onClick={() => setViewingDetails(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div>
                <h2>KYC Verification Review</h2>
                <p>{selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}</p>
              </div>
              <button onClick={() => setViewingDetails(false)} className="modal-close">
                <X size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="modal-content">
              <div className="modal-grid">
                <div className="modal-info">
                  <h3><User size={20} /> Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <div>{selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}</div>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <div>{selectedKYC.kyc.email}</div>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <div>{selectedKYC.kyc.phone_number}</div>
                    </div>
                    <div className="info-item">
                      <label>Date of Birth</label>
                      <div>{new Date(selectedKYC.kyc.date_of_birth).toLocaleDateString()}</div>
                    </div>
                    <div className="info-item">
                      <label>Gender</label>
                      <div>{selectedKYC.kyc.gender}</div>
                    </div>
                    <div className="info-item">
                      <label>Blood Group</label>
                      <div>{selectedKYC.kyc.blood_group}</div>
                    </div>
                    <div className="info-item full">
                      <label>Address</label>
                      <div>{selectedKYC.kyc.address}</div>
                    </div>
                    <div className="info-item full">
                      <label>National ID</label>
                      <div>{selectedKYC.kyc.national_identity_number}</div>
                    </div>
                  </div>
                </div>

                <div className="modal-photo">
                  <h3>Profile Photo</h3>
                  <img src={selectedKYC.kyc.profile_url} alt="Profile" />
                </div>
              </div>

              {/* Documents */}
              <div className="modal-documents">
                <h3><FileText size={20} /> Uploaded Documents</h3>
                {selectedKYC.documents.map((doc, idx) => (
                  <div key={idx} className="document-card">
                    <div className="document-info">
                      <div><label>Type:</label> {doc.document_type}</div>
                      <div><label>Number:</label> {doc.document_number}</div>
                      <div><label>Issued:</label> {new Date(doc.issued_date).toLocaleDateString()}</div>
                      {doc.expiry_date && (
                        <div><label>Expiry:</label> {new Date(doc.expiry_date).toLocaleDateString()}</div>
                      )}
                    </div>
                    <div className="document-images">
                      <div className="doc-image">
                        <label>Front</label>
                        <img src={doc.document_front_url} alt="Front" />
                      </div>
                      {doc.document_back_url && (
                        <div className="doc-image">
                          <label>Back</label>
                          <img src={doc.document_back_url} alt="Back" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button 
                onClick={() => handleVerifyKYC(selectedKYC.kyc.user_id, false)}
                disabled={processing}
                className="btn-reject"
              >
                {processing ? <Loader2 className="spinner" size={20} /> : <XCircle size={20} />}
                Reject
              </button>
              <button 
                onClick={() => handleVerifyKYC(selectedKYC.kyc.user_id, true)}
                disabled={processing}
                className="btn-approve"
              >
                {processing ? <Loader2 className="spinner" size={20} /> : <CheckCircle size={20} />}
                Approve & Create Driver Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;