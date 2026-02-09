// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   Users,
//   Car,
//   FileText,
//   MapPin,
//   DollarSign,
//   Settings,
//   LogOut,
//   TrendingUp,
//   TrendingDown,
//   Activity,
//   Clock,
//   Calendar,
//   ChevronDown,
//   Star
// } from 'lucide-react';
// import { getToken, clearAuthData } from '../utils/CookieUtils';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState('overview');
//   const [stats, setStats] = useState({
//     totalRevenue: 1700000,
//     revenueChange: -54.1,
//     investments: 9000000,
//     investmentGrowth: 14.1,
//     capitalGains: 563,
//     capitalGrowth: 7.38
//   });

//   const handleLogout = () => {
//     if (confirm('Are you sure you want to logout?')) {
//       clearAuthData();
//       navigate('/login');
//     }
//   };

//   const menuItems = [
//     { 
//       section: 'DASHBOARDS',
//       items: [
//         { id: 'analytics', label: 'Analytics', active: true },
//         { id: 'commerce', label: 'Commerce' },
//         { id: 'sales', label: 'Sales' },
//         { id: 'minimal', label: 'Minimal' },
//         { id: 'crm', label: 'CRM' },
//       ]
//     },
//     {
//       section: 'PAGES',
//       items: [
//         { id: 'pages', label: 'Pages' },
//         { id: 'applications', label: 'Applications' },
//       ]
//     },
//     {
//       section: 'UI COMPONENTS',
//       items: [
//         { id: 'elements', label: 'Elements' },
//         { id: 'components', label: 'Components' },
//         { id: 'tables', label: 'Tables' },
//       ]
//     },
//     {
//       section: 'DASHBOARD WIDGETS',
//       items: [
//         { id: 'chart-boxes-1', label: 'Chart Boxes 1' },
//         { id: 'chart-boxes-2', label: 'Chart Boxes 2' },
//         { id: 'chart-boxes-3', label: 'Chart Boxes 3' },
//         { id: 'profile-boxes', label: 'Profile Boxes' },
//       ]
//     },
//   ];

//   const recentActivities = [
//     { title: 'All Hands Meeting', time: '', color: 'red', type: 'meeting' },
//     { title: 'Yet another one', time: '15:00 PM', color: 'yellow', type: 'task' },
//     { title: 'Build the production release', badge: 'NEW', color: 'green', type: 'release' },
//     { title: 'Something not important', color: 'blue', type: 'note' },
//     { title: 'This dot has an info state', color: 'cyan', type: 'info' },
//     { title: 'This dot has a dark state', color: 'dark', type: 'other' },
//     { title: 'All Hands Meeting', color: 'red', type: 'meeting' },
//     { title: 'Yet another one', time: '15:00 PM', color: 'yellow', type: 'task' },
//     { title: 'Build the production release', badge: 'NEW', color: 'green', type: 'release' },
//   ];

//   return (
//     // ✅ FIXED: Added fixed positioning and full viewport height
//     <div className="fixed inset-0 flex overflow-hidden bg-gray-50">
//       {/* Sidebar */}
//       <div className="w-56 bg-gradient-to-b from-teal-400 to-teal-500 text-white overflow-y-auto flex-shrink-0">
//         {/* Logo/Title */}
//         <div className="p-4 font-bold text-white">
//           <button className="w-full text-left px-3 py-2 hover:bg-white/10 rounded flex items-center justify-between">
//             <span>MENU</span>
//           </button>
//         </div>

//         {/* Menu Sections */}
//         <div className="px-2 pb-4">
//           {menuItems.map((section, idx) => (
//             <div key={idx} className="mb-4">
//               <div className="px-3 py-2 text-xs font-semibold text-teal-100 uppercase tracking-wider">
//                 {section.section}
//               </div>
//               <div className="space-y-1">
//                 {section.items.map((item) => (
//                   <button
//                     key={item.id}
//                     onClick={() => setActiveTab(item.id)}
//                     className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
//                       item.active
//                         ? 'bg-white/20 text-white font-medium'
//                         : 'text-teal-50 hover:bg-white/10'
//                     }`}
//                   >
//                     {item.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ))}

//           {/* KYC & Logout - Custom additions */}
//           <div className="mb-4">
//             <div className="px-3 py-2 text-xs font-semibold text-teal-100 uppercase tracking-wider">
//               ADMIN TOOLS
//             </div>
//             <div className="space-y-1">
//               <button
//                 onClick={() => navigate('/admin/kyc')}
//                 className="w-full text-left px-3 py-2 rounded text-sm text-teal-50 hover:bg-white/10 transition-all"
//               >
//                 KYC Verification
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="w-full text-left px-3 py-2 rounded text-sm text-red-100 hover:bg-red-500/30 transition-all flex items-center gap-2"
//               >
//                 <LogOut size={16} />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content - ✅ FIXED: Added flex-1 and proper overflow */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top Header */}
//         <div className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Activity className="text-pink-500" size={32} />
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
//                 <p className="text-sm text-gray-500">This is an example dashboard created using build-in elements and components.</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <button className="p-2 hover:bg-gray-100 rounded">★</button>
//               <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
//                 Buttons
//                 <ChevronDown size={16} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white border-b border-gray-200 px-8 flex-shrink-0">
//           <div className="flex gap-1">
//             <button className="px-6 py-3 border-b-2 border-blue-600 text-blue-600 font-medium">
//               Variation 1
//             </button>
//             <button className="px-6 py-3 text-gray-600 hover:text-gray-900">
//               Variation 2
//             </button>
//           </div>
//         </div>

//         {/* Content Area - ✅ FIXED: Added overflow-y-auto */}
//         <div className="flex-1 overflow-y-auto p-8">
//           {/* Portfolio Performance */}
//           <div className="bg-white rounded-lg shadow-sm mb-6">
//             <div className="p-6 border-b border-gray-200 flex items-center justify-between">
//               <h2 className="text-lg font-bold text-gray-900">Portfolio Performance</h2>
//               <button className="text-sm text-gray-500 hover:text-gray-700">View All</button>
//             </div>
            
//             <div className="p-6">
//               <div className="grid grid-cols-3 gap-8 mb-6">
//                 {/* Cash Deposits */}
//                 <div>
//                   <div className="flex items-center gap-3 mb-2">
//                     <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
//                       <DollarSign className="text-orange-500" size={24} />
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500">Cash Deposits</div>
//                       <div className="text-3xl font-bold text-gray-900">1,7M</div>
//                     </div>
//                   </div>
//                   <div className="flex items-center text-sm text-red-600">
//                     <TrendingDown size={16} />
//                     <span className="ml-1">54.1% less earnings</span>
//                   </div>
//                 </div>

//                 {/* Invested Dividends */}
//                 <div>
//                   <div className="flex items-center gap-3 mb-2">
//                     <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                       <TrendingUp className="text-red-500" size={24} />
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500">Invested Dividends</div>
//                       <div className="text-3xl font-bold text-gray-900">9M</div>
//                     </div>
//                   </div>
//                   <div className="flex items-center text-sm">
//                     <span className="text-gray-600">Grow Rate:</span>
//                     <ChevronDown size={16} className="text-blue-500 ml-1" />
//                     <span className="text-blue-500 ml-1">14.1%</span>
//                   </div>
//                 </div>

//                 {/* Capital Gains */}
//                 <div>
//                   <div className="flex items-center gap-3 mb-2">
//                     <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                       <Activity className="text-green-500" size={24} />
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500">Capital Gains</div>
//                       <div className="text-3xl font-bold text-gray-900">$563</div>
//                     </div>
//                   </div>
//                   <div className="flex items-center text-sm">
//                     <span className="text-gray-600">Increased by</span>
//                     <TrendingUp size={16} className="text-orange-500 ml-1" />
//                     <span className="text-orange-500 ml-1">7.38%</span>
//                   </div>
//                 </div>
//               </div>

//               {/* View Complete Report Button */}
//               <div className="text-center">
//                 <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
//                   <Eye size={18} />
//                   View Complete Report
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Bottom Section */}
//           <div className="grid grid-cols-2 gap-6">
//             {/* Technical Support - Chart */}
//             <div className="bg-white rounded-lg shadow-sm">
//               <div className="p-6 border-b border-gray-200 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Activity className="text-blue-400" size={20} />
//                   <h3 className="font-bold text-gray-900">Technical Support</h3>
//                 </div>
//                 <button className="text-gray-400 hover:text-gray-600">
//                   <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
//                     <circle cx="2" cy="2" r="2"/>
//                     <circle cx="2" cy="8" r="2"/>
//                     <circle cx="2" cy="14" r="2"/>
//                   </svg>
//                 </button>
//               </div>
              
//               <div className="p-6">
//                 <div className="mb-4">
//                   <div className="text-sm text-gray-500 mb-2">NEW ACCOUNTS SINCE 2018</div>
//                   <div className="flex items-baseline gap-2">
//                     <TrendingUp className="text-green-500" size={24} />
//                     <span className="text-4xl font-bold text-gray-900">78</span>
//                     <span className="text-2xl text-gray-900">%</span>
//                     <span className="text-green-500 text-sm ml-2">+14</span>
//                   </div>
//                 </div>

//                 {/* Chart Area */}
//                 <div className="h-40 relative">
//                   <svg viewBox="0 0 300 100" className="w-full h-full">
//                     <path
//                       d="M 0,80 L 20,75 L 40,60 L 60,65 L 80,50 L 100,55 L 120,40 L 140,45 L 160,35 L 180,40 L 200,30 L 220,35 L 240,25 L 260,30 L 280,20 L 300,25"
//                       fill="none"
//                       stroke="#10b981"
//                       strokeWidth="3"
//                       className="drop-shadow-lg"
//                     />
//                     <path
//                       d="M 0,80 L 20,75 L 40,60 L 60,65 L 80,50 L 100,55 L 120,40 L 140,45 L 160,35 L 180,40 L 200,30 L 220,35 L 240,25 L 260,30 L 280,20 L 300,25 L 300,100 L 0,100 Z"
//                       fill="url(#gradient)"
//                       opacity="0.3"
//                     />
//                     <defs>
//                       <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
//                         <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
//                         <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
//                       </linearGradient>
//                     </defs>
//                   </svg>
//                 </div>

//                 {/* Dots indicator */}
//                 <div className="flex items-center justify-center gap-2 mt-4">
//                   <div className="w-2 h-2 rounded-full bg-blue-600"></div>
//                   <div className="w-2 h-2 rounded-full bg-gray-300"></div>
//                   <div className="w-2 h-2 rounded-full bg-gray-300"></div>
//                 </div>

//                 {/* Stats */}
//                 <div className="mt-6 pt-6 border-t border-gray-200">
//                   <div className="text-sm font-semibold text-gray-500 mb-3">SALES PROGRESS</div>
                  
//                   <div className="space-y-3">
//                     <div>
//                       <div className="flex justify-between text-sm mb-1">
//                         <span className="text-gray-900 font-medium">Total Orders</span>
//                         <span className="text-green-600 font-bold">$ 1896</span>
//                       </div>
//                       <div className="text-xs text-gray-500 mb-2">Last year expenses</div>
//                       <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                         <div className="h-full bg-blue-600 rounded-full" style={{width: '65%'}}></div>
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex justify-between text-sm mb-2">
//                         <span className="text-gray-500">YoY Growth</span>
//                         <span className="text-gray-500">100%</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Timeline Example */}
//             <div className="bg-white rounded-lg shadow-sm">
//               <div className="p-6 border-b border-gray-200 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Clock className="text-pink-400" size={20} />
//                   <h3 className="font-bold text-gray-900">Timeline Example</h3>
//                 </div>
//                 <button className="text-gray-400 hover:text-gray-600">
//                   <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
//                     <circle cx="2" cy="2" r="2"/>
//                     <circle cx="2" cy="8" r="2"/>
//                     <circle cx="2" cy="14" r="2"/>
//                   </svg>
//                 </button>
//               </div>

//               <div className="p-6">
//                 <div className="space-y-4 max-h-96 overflow-y-auto">
//                   {recentActivities.map((activity, idx) => (
//                     <div key={idx} className="flex items-start gap-3">
//                       <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
//                         activity.color === 'red' ? 'bg-red-500' :
//                         activity.color === 'yellow' ? 'bg-yellow-500' :
//                         activity.color === 'green' ? 'bg-green-500' :
//                         activity.color === 'blue' ? 'bg-blue-500' :
//                         activity.color === 'cyan' ? 'bg-cyan-500' :
//                         'bg-gray-800'
//                       }`}></div>
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2">
//                           <span className="text-sm text-gray-900">{activity.title}</span>
//                           {activity.badge && (
//                             <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
//                               {activity.badge}
//                             </span>
//                           )}
//                           {activity.time && (
//                             <span className="text-xs text-green-600">{activity.time}</span>
//                           )}
//                         </div>
//                         {activity.type === 'note' && (
//                           <div className="flex gap-1 mt-2">
//                             {[1,2,3,4,5,6,7].map((i) => (
//                               <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
//                             ))}
//                             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">+</div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-6 text-center">
//                   <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm">
//                     View All Messages
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Helper icon component
// const Eye = ({ size = 24 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
//     <circle cx="12" cy="12" r="3"></circle>
//   </svg>
// );

// export default AdminDashboard;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, TrendingDown, DollarSign, Clock, LogOut } from 'lucide-react';
import { clearAuthData } from '../utils/CookieUtils';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      clearAuthData();
      navigate('/login');
    }
  };

  const activities = [
    { text: 'All Hands Meeting', dot: 'red' },
    { text: 'Yet another one', time: '15:00 PM', dot: 'yellow' },
    { text: 'Build the production release', badge: 'NEW', dot: 'green' },
    { text: 'Something not important', dot: 'blue', showAvatars: true },
    { text: 'This dot has an info state', dot: 'cyan' },
    { text: 'This dot has a dark state', dot: 'dark' },
    { text: 'All Hands Meeting', dot: 'red' },
    { text: 'Yet another one', time: '15:00 PM', dot: 'yellow' },
    { text: 'Build the production release', badge: 'NEW', dot: 'green' },
  ];

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
            <button className="nav-item active">Dashboard</button>
            <button className="nav-item" onClick={() => navigate('/admin/kyc')}>
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
              <Activity className="header-icon" size={36} />
              <div>
                <h1>Analytics Dashboard</h1>
                <p>This is an example dashboard created using build-in elements and components.</p>
              </div>
            </div>
            <div className="header-right">
              <button className="btn-star">★</button>
              <button className="btn-primary">Buttons ▼</button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className="tab active">Variation 1</button>
          <button className="tab">Variation 2</button>
        </div>

        {/* Content */}
        <div className="admin-content">
          {/* Portfolio Performance */}
          <div className="card">
            <div className="card-header">
              <h2>Portfolio Performance</h2>
              <button className="link">View All</button>
            </div>
            
            <div className="card-body">
              {/* Stats Grid */}
              <div className="stats-grid">
                {/* Cash Deposits */}
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

                {/* Invested Dividends */}
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

                {/* Capital Gains */}
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

              {/* View Report Button */}
              <div className="text-center">
                <button className="btn-report">
                  👁 View Complete Report
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="bottom-grid">
            {/* Technical Support */}
            <div className="card">
              <div className="card-header">
                <div className="header-with-icon">
                  <Activity className="blue-icon" size={20} />
                  <h3>Technical Support</h3>
                </div>
                <button className="menu-dots">⋮</button>
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

                {/* Chart */}
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

                {/* Dots */}
                <div className="chart-dots">
                  <span className="dot active"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>

                {/* Sales Progress */}
                <div className="sales-progress">
                  <div className="progress-title">SALES PROGRESS</div>
                  
                  <div className="progress-item">
                    <div className="progress-row">
                      <span className="progress-label">Total Orders</span>
                      <span className="progress-value green">$ 1896</span>
                    </div>
                    <div className="progress-subtext">Last year expenses</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '65%'}}></div>
                    </div>
                  </div>

                  <div className="progress-row">
                    <span className="progress-label">YoY Growth</span>
                    <span className="progress-label">100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <div className="card-header">
                <div className="header-with-icon">
                  <Clock className="pink-icon" size={20} />
                  <h3>Timeline Example</h3>
                </div>
                <button className="menu-dots">⋮</button>
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

                <div className="text-center">
                  <button className="btn-dark">View All Messages</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;