// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Activity, TrendingUp, TrendingDown, DollarSign, Clock, LogOut, Car,
//   CheckCircle, XCircle, Eye, User, FileText, Calendar, Loader2, RefreshCw, X
// } from 'lucide-react';
// import { getToken, clearAuthData } from '../utils/CookieUtils';
// import { io } from 'socket.io-client';
// import './AdminDashboard.css';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [activeSection, setActiveSection] = useState('dashboard');
  
//   // KYC State
//   const [pendingKYCs, setPendingKYCs] = useState([]);
//   const [loadingKYC, setLoadingKYC] = useState(false);
//   const [selectedKYC, setSelectedKYC] = useState(null);
//   const [viewingKYCDetails, setViewingKYCDetails] = useState(false);
//   const [processingKYC, setProcessingKYC] = useState(false);

//   // Driver Applications State
//   const [pendingDriverApps, setPendingDriverApps] = useState([]);
//   const [loadingDriverApps, setLoadingDriverApps] = useState(false);
//   const [selectedDriverApp, setSelectedDriverApp] = useState(null);
//   const [viewingDriverAppDetails, setViewingDriverAppDetails] = useState(false);
//   const [processingDriverApp, setProcessingDriverApp] = useState(false);

//   // Fetch data when section changes
//   useEffect(() => {
//     if (activeSection === 'kyc') {
//       fetchPendingKYCs();
//     } else if (activeSection === 'driver-apps') {
//       fetchPendingDriverApps();
//     }
//   }, [activeSection]);

//   // ✅ SOCKET LISTENERS
//   useEffect(() => {
//     const token = getToken();
//     if (!token) return;

//     const socket = io(API_URL, { 
//       auth: { token },
//       transports: ['websocket', 'polling']
//     });

//     socket.on('connect', () => {
//       console.log('✅ Admin socket connected');
//     });

//     socket.on('connect_error', (error) => {
//       console.error('❌ Socket connection error:', error);
//     });

//     // Listen for new KYC submissions
//     socket.on('kyc:new_submission', (data) => {
//       console.log('🔔 NEW KYC SUBMISSION:', data);
//       alert(`🔔 New KYC Submission!\n\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}`);
//       if (activeSection === 'kyc') fetchPendingKYCs();
//     });

//     // ✅ Listen for new driver applications
//     socket.on('driver:application:new', (data) => {
//       console.log('🔔 NEW DRIVER APPLICATION:', data);
//       alert(`🚗 New Driver Application!\n\nEmail: ${data.email}\nVehicle: ${data.vehicleMake} ${data.vehicleModel}`);
//       if (activeSection === 'driver-apps') fetchPendingDriverApps();
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [activeSection]);

//   const handleLogout = () => {
//     if (confirm('Are you sure you want to logout?')) {
//       clearAuthData();
//       navigate('/login');
//     }
//   };

//   // ========== KYC FUNCTIONS ==========
//   const fetchPendingKYCs = async () => {
//     try {
//       setLoadingKYC(true);
//       const token = getToken();
      
//       const response = await fetch(`${API_URL}/api/kyc/pending`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setPendingKYCs(data.data.pendingKYCs || []);
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch pending KYCs:', error);
//     } finally {
//       setLoadingKYC(false);
//     }
//   };

//   const viewKYCDetails = async (kyc) => {
//     try {
//       const token = getToken();
      
//       const response = await fetch(`${API_URL}/api/kyc/${kyc.user_id}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setSelectedKYC(data.data);
//         setViewingKYCDetails(true);
//       } else {
//         alert('Failed to load KYC details: ' + data.message);
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch KYC details:', error);
//       alert('Error loading KYC details');
//     }
//   };

//   const handleVerifyKYC = async (userId, approved) => {
//     if (!confirm(approved ? '✅ Approve this KYC?' : '❌ Reject this KYC?')) {
//       return;
//     }

//     try {
//       setProcessingKYC(true);
//       const token = getToken();
      
//       const response = await fetch(`${API_URL}/api/kyc/verify/${userId}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           approved: approved,
//           remarks: approved ? 'Documents verified' : 'Documents rejected'
//         })
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         alert(approved ? '✅ KYC Approved!' : '❌ KYC Rejected');
//         setViewingKYCDetails(false);
//         setSelectedKYC(null);
//         fetchPendingKYCs();
//       } else {
//         alert('Error: ' + data.message);
//       }
//     } catch (error) {
//       console.error('❌ Verification error:', error);
//       alert('Failed to verify KYC');
//     } finally {
//       setProcessingKYC(false);
//     }
//   };

//   // ========== DRIVER APPLICATION FUNCTIONS ==========
//   const fetchPendingDriverApps = async () => {
//     try {
//       setLoadingDriverApps(true);
//       const token = getToken();
      
//       const response = await fetch(`${API_URL}/api/driver-applications/pending`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       const data = await response.json();
//       console.log('📋 Driver apps response:', data);
      
//       if (data.success) {
//         // CLEAN controller returns { count, applications }
//         setPendingDriverApps(data.data?.applications || data.data || []);
//       } else {
//         console.error('❌ Error response:', data);
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch pending driver applications:', error);
//     } finally {
//       setLoadingDriverApps(false);
//     }
//   };

//   const viewDriverAppDetails = async (app) => {
//     try {
//       const token = getToken();
      
//       const response = await fetch(`${API_URL}/api/driver-applications/${app.id}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setSelectedDriverApp(data.data);
//         setViewingDriverAppDetails(true);
//       } else {
//         alert('Failed to load application details: ' + data.message);
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch application details:', error);
//       alert('Error loading application details');
//     }
//   };

//   const handleReviewDriverApp = async (applicationId, approved) => {
//     if (!confirm(approved ? '✅ Approve this driver application?' : '❌ Reject this application?')) {
//       return;
//     }

//     try {
//       setProcessingDriverApp(true);
//       const token = getToken();
      
//       const response = await fetch(`${API_URL}/api/driver-applications/${applicationId}/review`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           approved: approved,
//           remarks: approved ? 'Application approved' : 'Application rejected'
//         })
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         alert(approved ? '✅ Application Approved! User is now a driver.' : '❌ Application Rejected');
//         setViewingDriverAppDetails(false);
//         setSelectedDriverApp(null);
//         fetchPendingDriverApps();
//       } else {
//         alert('Error: ' + data.message);
//       }
//     } catch (error) {
//       console.error('❌ Review error:', error);
//       alert('Failed to review application');
//     } finally {
//       setProcessingDriverApp(false);
//     }
//   };

//   // ========== RENDER FUNCTIONS ==========
//   const renderDashboard = () => {
//     const activities = [
//       { text: 'All Hands Meeting', dot: 'red' },
//       { text: 'Yet another one', time: '15:00 PM', dot: 'yellow' },
//       { text: 'Build the production release', badge: 'NEW', dot: 'green' },
//       { text: 'Something not important', dot: 'blue', showAvatars: true },
//       { text: 'This dot has an info state', dot: 'cyan' },
//     ];

//     return (
//       <>
//         {/* Portfolio Performance */}
//         <div className="card">
//           <div className="card-header">
//             <h2>Portfolio Performance</h2>
//             <button className="link">View All</button>
//           </div>
          
//           <div className="card-body">
//             <div className="stats-grid">
//               <div className="stat-item">
//                 <div className="stat-top">
//                   <div className="stat-icon orange">
//                     <DollarSign size={28} />
//                   </div>
//                   <div className="stat-info">
//                     <div className="stat-label">Cash Deposits</div>
//                     <div className="stat-value">1,7M</div>
//                   </div>
//                 </div>
//                 <div className="stat-change negative">
//                   <TrendingDown size={16} />
//                   <span>54.1% less earnings</span>
//                 </div>
//               </div>

//               <div className="stat-item">
//                 <div className="stat-top">
//                   <div className="stat-icon red">
//                     <TrendingUp size={28} />
//                   </div>
//                   <div className="stat-info">
//                     <div className="stat-label">Invested Dividends</div>
//                     <div className="stat-value">9M</div>
//                   </div>
//                 </div>
//                 <div className="stat-change">
//                   <span>Grow Rate: </span>
//                   <span className="positive">▼ 14.1%</span>
//                 </div>
//               </div>

//               <div className="stat-item">
//                 <div className="stat-top">
//                   <div className="stat-icon green">
//                     <Activity size={28} />
//                   </div>
//                   <div className="stat-info">
//                     <div className="stat-label">Capital Gains</div>
//                     <div className="stat-value">$563</div>
//                   </div>
//                 </div>
//                 <div className="stat-change">
//                   <span>Increased by </span>
//                   <TrendingUp size={16} className="orange-icon" />
//                   <span className="orange">7.38%</span>
//                 </div>
//               </div>
//             </div>

//             <div className="text-center">
//               <button className="btn-report">👁 View Complete Report</button>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Grid */}
//         <div className="bottom-grid">
//           <div className="card">
//             <div className="card-header">
//               <div className="header-with-icon">
//                 <Activity className="blue-icon" size={20} />
//                 <h3>Technical Support</h3>
//               </div>
//             </div>
            
//             <div className="card-body">
//               <div className="chart-header">
//                 <div className="chart-label">NEW ACCOUNTS SINCE 2018</div>
//                 <div className="chart-value">
//                   <TrendingUp className="green-icon" size={28} />
//                   <span className="big-number">78</span>
//                   <span className="big-percent">%</span>
//                   <span className="green-badge">+14</span>
//                 </div>
//               </div>

//               <div className="chart-container">
//                 <svg viewBox="0 0 400 150" className="chart-svg">
//                   <defs>
//                     <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
//                       <stop offset="0%" stopColor="#10b981" stopOpacity="0.5"/>
//                       <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
//                     </linearGradient>
//                   </defs>
//                   <path
//                     d="M 0,120 L 30,110 L 60,90 L 90,95 L 120,75 L 150,80 L 180,60 L 210,65 L 240,50 L 270,55 L 300,40 L 330,45 L 360,30 L 400,35"
//                     fill="none"
//                     stroke="#10b981"
//                     strokeWidth="3"
//                   />
//                   <path
//                     d="M 0,120 L 30,110 L 60,90 L 90,95 L 120,75 L 150,80 L 180,60 L 210,65 L 240,50 L 270,55 L 300,40 L 330,45 L 360,30 L 400,35 L 400,150 L 0,150 Z"
//                     fill="url(#chartGradient)"
//                   />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="card">
//             <div className="card-header">
//               <div className="header-with-icon">
//                 <Clock className="pink-icon" size={20} />
//                 <h3>Timeline Example</h3>
//               </div>
//             </div>

//             <div className="card-body">
//               <div className="timeline">
//                 {activities.map((activity, idx) => (
//                   <div key={idx} className="timeline-item">
//                     <span className={`timeline-dot ${activity.dot}`}></span>
//                     <div className="timeline-content">
//                       <div className="timeline-text">
//                         {activity.text}
//                         {activity.badge && <span className="badge">{activity.badge}</span>}
//                         {activity.time && <span className="time">{activity.time}</span>}
//                       </div>
//                       {activity.showAvatars && (
//                         <div className="avatars">
//                           {[1,2,3,4,5,6,7].map((i) => (
//                             <div key={i} className="avatar"></div>
//                           ))}
//                           <div className="avatar-more">+</div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   };

//   const renderKYC = () => (
//     <>
//       <div className="kyc-stats-card">
//         <div className="kyc-stat-icon">
//           <FileText size={40} />
//         </div>
//         <div className="kyc-stat-info">
//           <div className="kyc-stat-number">{pendingKYCs.length}</div>
//           <div className="kyc-stat-label">Pending KYC Approvals</div>
//         </div>
//         <button onClick={fetchPendingKYCs} className="btn-refresh">
//           <RefreshCw size={20} />
//           Refresh
//         </button>
//       </div>

//       {loadingKYC ? (
//         <div className="kyc-loading">
//           <Loader2 className="spinner" size={48} />
//           <p>Loading pending KYCs...</p>
//         </div>
//       ) : pendingKYCs.length === 0 ? (
//         <div className="kyc-empty">
//           <CheckCircle size={64} className="empty-icon" />
//           <h3>All Caught Up!</h3>
//           <p>No pending KYC verifications at the moment.</p>
//         </div>
//       ) : (
//         <div className="kyc-list">
//           {pendingKYCs.map((kyc) => (
//             <div key={kyc.kyc_id} className="kyc-card">
//               <div className="kyc-avatar">
//                 {kyc.first_name?.charAt(0)}{kyc.last_name?.charAt(0)}
//               </div>
//               <div className="kyc-info">
//                 <div className="kyc-name">
//                   <h3>{kyc.first_name} {kyc.last_name}</h3>
//                   <span className={`role-badge ${kyc.role}`}>{kyc.role.toUpperCase()}</span>
//                 </div>
//                 <div className="kyc-details">
//                   <div className="detail-item">
//                     <User size={16} />
//                     <span>{kyc.email}</span>
//                   </div>
//                   <div className="detail-item">
//                     <FileText size={16} />
//                     <span>{kyc.phone_number}</span>
//                   </div>
//                   <div className="detail-item">
//                     <Calendar size={16} />
//                     <span>{new Date(kyc.updated_at).toLocaleDateString()}</span>
//                   </div>
//                   <div className="detail-item">
//                     <FileText size={16} />
//                     <span>{kyc.document_count} Documents</span>
//                   </div>
//                 </div>
//               </div>
//               <button onClick={() => viewKYCDetails(kyc)} className="btn-review">
//                 <Eye size={20} />
//                 Review KYC
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   );

//   const renderDriverApps = () => (
//     <>
//       {/* Stats Card */}
//       <div className="kyc-stats-card">
//         <div className="kyc-stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
//           <Car size={40} />
//         </div>
//         <div className="kyc-stat-info">
//           <div className="kyc-stat-number">{pendingDriverApps.length}</div>
//           <div className="kyc-stat-label">Pending Driver Applications</div>
//         </div>
//         <button onClick={fetchPendingDriverApps} className="btn-refresh">
//           <RefreshCw size={20} />
//           Refresh
//         </button>
//       </div>

//       {/* Loading / Empty / List */}
//       {loadingDriverApps ? (
//         <div className="kyc-loading">
//           <Loader2 className="spinner" size={48} />
//           <p>Loading pending applications...</p>
//         </div>
//       ) : pendingDriverApps.length === 0 ? (
//         <div className="kyc-empty">
//           <CheckCircle size={64} className="empty-icon" />
//           <h3>All Caught Up!</h3>
//           <p>No pending driver applications at the moment.</p>
//         </div>
//       ) : (
//         <div className="kyc-list">
//           {pendingDriverApps.map((app) => (
//             <div key={app.id} className="kyc-card">
//               <div className="kyc-avatar" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
//                 <Car size={32} color="white" />
//               </div>
//               <div className="kyc-info">
//                 <div className="kyc-name">
//                   <h3>{app.full_name || app.email}</h3>
//                   <span className="role-badge driver">DRIVER APPLICATION</span>
//                 </div>
//                 <div className="kyc-details">
//                   <div className="detail-item">
//                     <User size={16} />
//                     <span>{app.email}</span>
//                   </div>
//                   <div className="detail-item">
//                     <Car size={16} />
//                     <span>{app.vehicle_type} - {app.make} {app.model}</span>
//                   </div>
//                   <div className="detail-item">
//                     <FileText size={16} />
//                     <span>{app.license_plate}</span>
//                   </div>
//                   <div className="detail-item">
//                     <Calendar size={16} />
//                     <span>{new Date(app.created_at).toLocaleDateString()}</span>
//                   </div>
//                 </div>
//               </div>
//               <button onClick={() => viewDriverAppDetails(app)} className="btn-review" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
//                 <Eye size={20} />
//                 Review Application
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   );

//   return (
//     <div className="admin-container">
//       {/* Sidebar */}
//       <aside className="admin-sidebar">
//         <div className="sidebar-header">
//           <h2>MENU</h2>
//         </div>
        
//         <nav className="sidebar-nav">
//           <div className="nav-section">
//             <div className="nav-title">MAIN</div>
//             <button 
//               className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
//               onClick={() => setActiveSection('dashboard')}
//             >
//               Dashboard
//             </button>
//             <button 
//               className={`nav-item ${activeSection === 'kyc' ? 'active' : ''}`}
//               onClick={() => setActiveSection('kyc')}
//             >
//               KYC Verification
//             </button>
//             <button 
//               className={`nav-item ${activeSection === 'driver-apps' ? 'active' : ''}`}
//               onClick={() => setActiveSection('driver-apps')}
//             >
//               Driver Applications
//             </button>
//             <button className="nav-item logout" onClick={handleLogout}>
//               <LogOut size={16} />
//               Logout
//             </button>
//           </div>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="admin-main">
//         {/* Header */}
//         <header className="admin-header">
//           <div className="header-content">
//             <div className="header-left">
//               {activeSection === 'dashboard' ? (
//                 <>
//                   <Activity className="header-icon" size={36} />
//                   <div>
//                     <h1>Analytics Dashboard</h1>
//                     <p>This is an example dashboard created using build-in elements and components.</p>
//                   </div>
//                 </>
//               ) : activeSection === 'kyc' ? (
//                 <>
//                   <FileText className="header-icon" size={36} />
//                   <div>
//                     <h1>KYC Verification</h1>
//                     <p>Review and approve user verification documents</p>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <Car className="header-icon" size={36} />
//                   <div>
//                     <h1>Driver Applications</h1>
//                     <p>Review and approve driver license and vehicle applications</p>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </header>

//         {/* Tabs */}
//         <div className="admin-tabs">
//           <button className="tab active">Main View</button>
//         </div>

//         {/* Content */}
//         <div className="admin-content">
//           {activeSection === 'dashboard' && renderDashboard()}
//           {activeSection === 'kyc' && renderKYC()}
//           {activeSection === 'driver-apps' && renderDriverApps()}
//         </div>
//       </main>

//       {/* KYC Details Modal */}
//       {viewingKYCDetails && selectedKYC && (
//         <div className="modal-overlay" onClick={() => setViewingKYCDetails(false)}>
//           <div className="modal-card" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h2>KYC Verification Review</h2>
//                 <p>{selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}</p>
//               </div>
//               <button onClick={() => setViewingKYCDetails(false)} className="modal-close">
//                 <X size={28} />
//               </button>
//             </div>

//             <div className="modal-content">
//               <div className="modal-grid">
//                 <div className="modal-info">
//                   <h3><User size={20} /> Personal Information</h3>
//                   <div className="info-grid">
//                     <div className="info-item">
//                       <label>Full Name</label>
//                       <div>{selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}</div>
//                     </div>
//                     <div className="info-item">
//                       <label>Email</label>
//                       <div>{selectedKYC.kyc.email}</div>
//                     </div>
//                     <div className="info-item">
//                       <label>Phone</label>
//                       <div>{selectedKYC.kyc.phone_number}</div>
//                     </div>
//                     <div className="info-item">
//                       <label>Date of Birth</label>
//                       <div>{new Date(selectedKYC.kyc.date_of_birth).toLocaleDateString()}</div>
//                     </div>
//                     <div className="info-item">
//                       <label>Gender</label>
//                       <div>{selectedKYC.kyc.gender}</div>
//                     </div>
//                     <div className="info-item">
//                       <label>Blood Group</label>
//                       <div>{selectedKYC.kyc.blood_group}</div>
//                     </div>
//                     <div className="info-item full">
//                       <label>Address</label>
//                       <div>{selectedKYC.kyc.address}</div>
//                     </div>
//                     <div className="info-item full">
//                       <label>National ID</label>
//                       <div>{selectedKYC.kyc.national_identity_number}</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="modal-photo">
//                   <h3>Profile Photo</h3>
//                   <img src={selectedKYC.kyc.profile_url} alt="Profile" />
//                 </div>
//               </div>

//               <div className="modal-documents">
//                 <h3><FileText size={20} /> Uploaded Documents</h3>
//                 {selectedKYC.documents.map((doc, idx) => (
//                   <div key={idx} className="document-card">
//                     <div className="document-info">
//                       <div><label>Type:</label> {doc.document_type}</div>
//                       <div><label>Number:</label> {doc.document_number}</div>
//                       <div><label>Issued:</label> {new Date(doc.issued_date).toLocaleDateString()}</div>
//                       {doc.expiry_date && (
//                         <div><label>Expiry:</label> {new Date(doc.expiry_date).toLocaleDateString()}</div>
//                       )}
//                     </div>
//                     <div className="document-images">
//                       <div className="doc-image">
//                         <label>Front</label>
//                         <img src={doc.document_front_url} alt="Front" />
//                       </div>
//                       {doc.document_back_url && (
//                         <div className="doc-image">
//                           <label>Back</label>
//                           <img src={doc.document_back_url} alt="Back" />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="modal-footer">
//               <button 
//                 onClick={() => handleVerifyKYC(selectedKYC.kyc.user_id, false)}
//                 disabled={processingKYC}
//                 className="btn-reject"
//               >
//                 {processingKYC ? <Loader2 className="spinner" size={20} /> : <XCircle size={20} />}
//                 Reject
//               </button>
//               <button 
//                 onClick={() => handleVerifyKYC(selectedKYC.kyc.user_id, true)}
//                 disabled={processingKYC}
//                 className="btn-approve"
//               >
//                 {processingKYC ? <Loader2 className="spinner" size={20} /> : <CheckCircle size={20} />}
//                 Approve
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Driver Application Details Modal */}
//       {viewingDriverAppDetails && selectedDriverApp && (
//         <div className="modal-overlay" onClick={() => setViewingDriverAppDetails(false)}>
//           <div className="modal-card" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
//               <div>
//                 <h2>Driver Application Review</h2>
//                 <p>{selectedDriverApp.application.full_name || selectedDriverApp.application.email}</p>
//               </div>
//               <button onClick={() => setViewingDriverAppDetails(false)} className="modal-close">
//                 <X size={28} />
//               </button>
//             </div>

//             <div className="modal-content">
//               {/* Personal Info */}
//               <div className="modal-grid">
//                 <div className="modal-info">
//                   <h3><User size={20} /> Applicant Information</h3>
//                   <div className="info-grid">
//                     <div className="info-item">
//                       <label>Name</label>
//                       <div>{selectedDriverApp.application.first_name} {selectedDriverApp.application.last_name}</div>
//                     </div>
//                     <div className="info-item">
//                       <label>Email</label>
//                       <div>{selectedDriverApp.application.email}</div>
//                     </div>
//                     <div className="info-item">
//                       <label>Phone</label>
//                       <div>{selectedDriverApp.application.phone_number}</div>
//                     </div>
//                     <div className="info-item">
//                       <label>Applied</label>
//                       <div>{new Date(selectedDriverApp.application.created_at).toLocaleDateString()}</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="modal-photo">
//                   <h3>Profile Photo</h3>
//                   <img src={selectedDriverApp.application.profile_url} alt="Profile" />
//                 </div>
//               </div>

//               {/* License Info */}
//               <div className="modal-documents">
//                 <h3><FileText size={20} /> Driver License</h3>
//                 <div className="document-card">
//                   <div className="document-info">
//                     <div><label>License Number:</label> {selectedDriverApp.application.license_number}</div>
//                     <div><label>Category:</label> {selectedDriverApp.application.license_category}</div>
//                     <div><label>Issued:</label> {new Date(selectedDriverApp.application.license_issued_date).toLocaleDateString()}</div>
//                     <div><label>Expiry:</label> {new Date(selectedDriverApp.application.license_expiry_date).toLocaleDateString()}</div>
//                   </div>
//                   <div className="document-images">
//                     <div className="doc-image">
//                       <label>License Front</label>
//                       <img src={selectedDriverApp.application.license_front_url} alt="License Front" />
//                     </div>
//                     {selectedDriverApp.application.license_back_url && (
//                       <div className="doc-image">
//                         <label>License Back</label>
//                         <img src={selectedDriverApp.application.license_back_url} alt="License Back" />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Vehicle Info */}
//               {selectedDriverApp.vehicle && (
//                 <div className="modal-documents">
//                   <h3><Car size={20} /> Vehicle Information</h3>
//                   <div className="document-card">
//                     <div className="document-info">
//                       <div><label>Type:</label> {selectedDriverApp.vehicle.vehicle_type}</div>
//                       <div><label>Make/Model:</label> {selectedDriverApp.vehicle.make} {selectedDriverApp.vehicle.model}</div>
//                       <div><label>Year:</label> {selectedDriverApp.vehicle.year}</div>
//                       <div><label>Color:</label> {selectedDriverApp.vehicle.color}</div>
//                       <div><label>Plate:</label> {selectedDriverApp.vehicle.license_plate}</div>
//                       <div><label>Seats:</label> {selectedDriverApp.vehicle.seat_capacity}</div>
//                     </div>
                    
//                     <div className="document-images" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
//                       <div className="doc-image">
//                         <label>Registration</label>
//                         <img src={selectedDriverApp.vehicle.registration_url} alt="Registration" />
//                       </div>
//                       <div className="doc-image">
//                         <label>Insurance</label>
//                         <img src={selectedDriverApp.vehicle.insurance_url} alt="Insurance" />
//                       </div>
//                       <div className="doc-image">
//                         <label>Vehicle Front</label>
//                         <img src={selectedDriverApp.vehicle.photo_front_url} alt="Vehicle Front" />
//                       </div>
//                       {selectedDriverApp.vehicle.photo_back_url && (
//                         <div className="doc-image">
//                           <label>Vehicle Back</label>
//                           <img src={selectedDriverApp.vehicle.photo_back_url} alt="Vehicle Back" />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="modal-footer">
//               <button 
//                 onClick={() => handleReviewDriverApp(selectedDriverApp.application.id, false)}
//                 disabled={processingDriverApp}
//                 className="btn-reject"
//               >
//                 {processingDriverApp ? <Loader2 className="spinner" size={20} /> : <XCircle size={20} />}
//                 Reject Application
//               </button>
//               <button 
//                 onClick={() => handleReviewDriverApp(selectedDriverApp.application.id, true)}
//                 disabled={processingDriverApp}
//                 className="btn-approve"
//               >
//                 {processingDriverApp ? <Loader2 className="spinner" size={20} /> : <CheckCircle size={20} />}
//                 Approve & Create Driver
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, TrendingUp, TrendingDown, DollarSign, Clock, LogOut, Car,
  CheckCircle, XCircle, Eye, User, FileText, Calendar, Loader2, RefreshCw, X
} from 'lucide-react';
import { getToken, clearAuthData } from '../utils/CookieUtils';
import { io } from 'socket.io-client';
import AdminDriverApplicationReview from './AdminDriverApplicationReview';
import './AdminDashboard.css';
import './AdminDriverApplicationReview.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // KYC State
  const [pendingKYCs, setPendingKYCs] = useState([]);
  const [loadingKYC, setLoadingKYC] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [viewingKYCDetails, setViewingKYCDetails] = useState(false);
  const [processingKYC, setProcessingKYC] = useState(false);

  // Driver Applications State
  const [pendingDriverApps, setPendingDriverApps] = useState([]);
  const [loadingDriverApps, setLoadingDriverApps] = useState(false);
  const [selectedDriverApp, setSelectedDriverApp] = useState(null);
  const [viewingDriverAppDetails, setViewingDriverAppDetails] = useState(false);
  const [processingDriverApp, setProcessingDriverApp] = useState(false);

  // Fetch data when section changes
  useEffect(() => {
    if (activeSection === 'kyc') {
      fetchPendingKYCs();
    } else if (activeSection === 'driver-apps') {
      fetchPendingDriverApps();
    }
  }, [activeSection]);

  // ✅ SOCKET LISTENERS
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(API_URL, { 
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Admin socket connected');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    // Listen for new KYC submissions
    socket.on('kyc:new_submission', (data) => {
      console.log('🔔 NEW KYC SUBMISSION:', data);
      alert(`🔔 New KYC Submission!\n\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}`);
      if (activeSection === 'kyc') fetchPendingKYCs();
    });

    // ✅ Listen for new driver applications
    socket.on('driver:application:new', (data) => {
      console.log('🔔 NEW DRIVER APPLICATION:', data);
      alert(`🚗 New Driver Application!\n\nEmail: ${data.email}\nVehicle: ${data.vehicleMake} ${data.vehicleModel}`);
      if (activeSection === 'driver-apps') fetchPendingDriverApps();
    });

    return () => {
      socket.disconnect();
    };
  }, [activeSection]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      clearAuthData();
      navigate('/login');
    }
  };

  // ========== KYC FUNCTIONS ==========
  const fetchPendingKYCs = async () => {
    try {
      setLoadingKYC(true);
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
      setLoadingKYC(false);
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
        setViewingKYCDetails(true);
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
      setProcessingKYC(true);
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
        setViewingKYCDetails(false);
        setSelectedKYC(null);
        fetchPendingKYCs();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      alert('Failed to verify KYC');
    } finally {
      setProcessingKYC(false);
    }
  };

  // ========== DRIVER APPLICATION FUNCTIONS ==========
  const fetchPendingDriverApps = async () => {
    try {
      setLoadingDriverApps(true);
      const token = getToken();
      
      const response = await fetch(`${API_URL}/api/driver-applications/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      console.log('📋 Driver apps response:', data);
      
      if (data.success) {
        // CLEAN controller returns { count, applications }
        setPendingDriverApps(data.data?.applications || data.data || []);
      } else {
        console.error('❌ Error response:', data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch pending driver applications:', error);
    } finally {
      setLoadingDriverApps(false);
    }
  };

  const viewDriverAppDetails = async (app) => {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_URL}/api/driver-applications/${app.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedDriverApp(data.data);
        setViewingDriverAppDetails(true);
      } else {
        alert('Failed to load application details: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Failed to fetch application details:', error);
      alert('Error loading application details');
    }
  };

  const handleDriverAppReviewed = () => {
    setViewingDriverAppDetails(false);
    setSelectedDriverApp(null);
    fetchPendingDriverApps();
  };

  const handleReviewDriverApp = async (applicationId, approved) => {
    if (!confirm(approved ? '✅ Approve this driver application?' : '❌ Reject this application?')) {
      return;
    }

    try {
      setProcessingDriverApp(true);
      const token = getToken();
      
      const response = await fetch(`${API_URL}/api/driver-applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved: approved,
          remarks: approved ? 'Application approved' : 'Application rejected'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(approved ? '✅ Application Approved! User is now a driver.' : '❌ Application Rejected');
        setViewingDriverAppDetails(false);
        setSelectedDriverApp(null);
        fetchPendingDriverApps();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Review error:', error);
      alert('Failed to review application');
    } finally {
      setProcessingDriverApp(false);
    }
  };

  // ========== RENDER FUNCTIONS ==========
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

      {loadingKYC ? (
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

  const renderDriverApps = () => (
    <>
      {/* Stats Card */}
      <div className="kyc-stats-card">
        <div className="kyc-stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
          <Car size={40} />
        </div>
        <div className="kyc-stat-info">
          <div className="kyc-stat-number">{pendingDriverApps.length}</div>
          <div className="kyc-stat-label">Pending Driver Applications</div>
        </div>
        <button onClick={fetchPendingDriverApps} className="btn-refresh">
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Loading / Empty / List */}
      {loadingDriverApps ? (
        <div className="kyc-loading">
          <Loader2 className="spinner" size={48} />
          <p>Loading pending applications...</p>
        </div>
      ) : pendingDriverApps.length === 0 ? (
        <div className="kyc-empty">
          <CheckCircle size={64} className="empty-icon" />
          <h3>All Caught Up!</h3>
          <p>No pending driver applications at the moment.</p>
        </div>
      ) : (
        <div className="kyc-list">
          {pendingDriverApps.map((app) => (
            <div key={app.id} className="kyc-card">
              <div className="kyc-avatar" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                <Car size={32} color="white" />
              </div>
              <div className="kyc-info">
                <div className="kyc-name">
                  <h3>{app.full_name || app.email}</h3>
                  <span className="role-badge driver">DRIVER APPLICATION</span>
                </div>
                <div className="kyc-details">
                  <div className="detail-item">
                    <User size={16} />
                    <span>{app.email}</span>
                  </div>
                  <div className="detail-item">
                    <Car size={16} />
                    <span>{app.vehicle_type} - {app.make} {app.model}</span>
                  </div>
                  <div className="detail-item">
                    <FileText size={16} />
                    <span>{app.license_plate}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => viewDriverAppDetails(app)} className="btn-review" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                <Eye size={20} />
                Review Application
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
            <button 
              className={`nav-item ${activeSection === 'driver-apps' ? 'active' : ''}`}
              onClick={() => setActiveSection('driver-apps')}
            >
              Driver Applications
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
              ) : activeSection === 'kyc' ? (
                <>
                  <FileText className="header-icon" size={36} />
                  <div>
                    <h1>KYC Verification</h1>
                    <p>Review and approve user verification documents</p>
                  </div>
                </>
              ) : (
                <>
                  <Car className="header-icon" size={36} />
                  <div>
                    <h1>Driver Applications</h1>
                    <p>Review and approve driver license and vehicle applications</p>
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
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'kyc' && renderKYC()}
          {activeSection === 'driver-apps' && renderDriverApps()}
        </div>
      </main>

      {/* KYC Details Modal */}
      {viewingKYCDetails && selectedKYC && (
        <div className="modal-overlay" onClick={() => setViewingKYCDetails(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>KYC Verification Review</h2>
                <p>{selectedKYC.kyc.first_name} {selectedKYC.kyc.last_name}</p>
              </div>
              <button onClick={() => setViewingKYCDetails(false)} className="modal-close">
                <X size={28} />
              </button>
            </div>

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

            <div className="modal-footer">
              <button 
                onClick={() => handleVerifyKYC(selectedKYC.kyc.user_id, false)}
                disabled={processingKYC}
                className="btn-reject"
              >
                {processingKYC ? <Loader2 className="spinner" size={20} /> : <XCircle size={20} />}
                Reject
              </button>
              <button 
                onClick={() => handleVerifyKYC(selectedKYC.kyc.user_id, true)}
                disabled={processingKYC}
                className="btn-approve"
              >
                {processingKYC ? <Loader2 className="spinner" size={20} /> : <CheckCircle size={20} />}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Application Details Modal */}
      {viewingDriverAppDetails && selectedDriverApp && (
        <AdminDriverApplicationReview
          application={selectedDriverApp.application}
          onClose={() => setViewingDriverAppDetails(false)}
          onReviewed={handleDriverAppReviewed}
        />
      )}
    </div>
  );
};

export default AdminDashboard;