// import React, { useState, useEffect } from 'react';
// import { 
//   Users, Search, Plus, Edit2, Trash2, Eye, X, Loader2, 
//   CheckCircle, XCircle, Mail, Phone, Calendar, Shield, Car,
//   DollarSign, TrendingUp, UserCheck, UserX, RefreshCw
// } from 'lucide-react';
// import { getToken } from '../utils/CookieUtils';
// import './AdminUserManagement.css';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// const AdminUserManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [modalMode, setModalMode] = useState('view'); // view, edit, create
//   const [processing, setProcessing] = useState(false);

//   const [formData, setFormData] = useState({
//     email: '',
//     role: 'rider',
//     status: 'active',
//     firstName: '',
//     lastName: '',
//     phoneNumber: ''
//   });

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const token = getToken();
//       const response = await fetch(`${API_URL}/api/admin/manage/users`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setUsers(data.data.users || []);
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleRoleFilter = (e) => {
//     setRoleFilter(e.target.value);
//   };

//   const filteredUsers = users.filter(user => {
//     const matchesSearch = 
//       user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.phone_number?.includes(searchTerm);
    
//     const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
//     return matchesSearch && matchesRole;
//   });

//   const openViewModal = async (user) => {
//     setSelectedUser(user);
//     setModalMode('view');
//     setShowModal(true);
//   };

//   const openEditModal = (user) => {
//     setSelectedUser(user);
//     setFormData({
//       email: user.email,
//       role: user.role,
//       status: user.status || 'active',
//       firstName: user.first_name || '',
//       lastName: user.last_name || '',
//       phoneNumber: user.phone_number || ''
//     });
//     setModalMode('edit');
//     setShowModal(true);
//   };

//   const openCreateModal = () => {
//     setSelectedUser(null);
//     setFormData({
//       email: '',
//       role: 'rider',
//       status: 'active',
//       firstName: '',
//       lastName: '',
//       phoneNumber: ''
//     });
//     setModalMode('create');
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedUser(null);
//     setFormData({
//       email: '',
//       role: 'rider',
//       status: 'active',
//       firstName: '',
//       lastName: '',
//       phoneNumber: ''
//     });
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };

//   const handleCreateUser = async (e) => {
//     e.preventDefault();
//     setProcessing(true);

//     try {
//       const token = getToken();
//       const response = await fetch(`${API_URL}/api/admin/manage/users`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         alert('✅ User created successfully!');
//         closeModal();
//         fetchUsers();
//       } else {
//         alert('❌ Error: ' + data.message);
//       }
//     } catch (error) {
//       console.error('❌ Create user error:', error);
//       alert('Failed to create user');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleUpdateUser = async (e) => {
//     e.preventDefault();
//     setProcessing(true);

//     try {
//       const token = getToken();
//       const response = await fetch(`${API_URL}/api/admin/manage/users/${selectedUser.id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         alert('✅ User updated successfully!');
//         closeModal();
//         fetchUsers();
//       } else {
//         alert('❌ Error: ' + data.message);
//       }
//     } catch (error) {
//       console.error('❌ Update user error:', error);
//       alert('Failed to update user');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleDeleteUser = async (userId) => {
//     if (!confirm('⚠️ Are you sure you want to delete this user? This action cannot be undone!')) {
//       return;
//     }

//     setProcessing(true);

//     try {
//       const token = getToken();
//       const response = await fetch(`${API_URL}/api/admin/manage/users/${userId}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         alert('✅ User deleted successfully!');
//         closeModal();
//         fetchUsers();
//       } else {
//         alert('❌ Error: ' + data.message);
//       }
//     } catch (error) {
//       console.error('❌ Delete user error:', error);
//       alert('Failed to delete user');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const getRoleBadge = (role) => {
//     const badges = {
//       admin: { bg: '#dc2626', label: 'Admin' },
//       driver: { bg: '#2563eb', label: 'Driver' },
//       rider: { bg: '#059669', label: 'Rider' }
//     };
//     const badge = badges[role] || badges.rider;
//     return (
//       <span className="role-badge" style={{ background: badge.bg }}>
//         {badge.label}
//       </span>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="users-loading">
//         <Loader2 className="spinner" size={48} />
//         <p>Loading users...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="user-management-container">
//       {/* Header */}
//       <div className="users-header">
//         <div>
//           <h1><Users size={32} /> User Management</h1>
//           <p>Manage all users, roles, and permissions</p>
//         </div>
//         <button onClick={openCreateModal} className="btn-create-user">
//           <Plus size={20} />
//           Create New User
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="users-stats">
//         <div className="stat-box">
//           <Users size={24} />
//           <div>
//             <div className="stat-value">{users.length}</div>
//             <div className="stat-label">Total Users</div>
//           </div>
//         </div>
//         <div className="stat-box">
//           <UserCheck size={24} />
//           <div>
//             <div className="stat-value">{users.filter(u => u.role === 'driver').length}</div>
//             <div className="stat-label">Drivers</div>
//           </div>
//         </div>
//         <div className="stat-box">
//           <UserX size={24} />
//           <div>
//             <div className="stat-value">{users.filter(u => u.role === 'rider').length}</div>
//             <div className="stat-label">Riders</div>
//           </div>
//         </div>
//         <div className="stat-box">
//           <Shield size={24} />
//           <div>
//             <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
//             <div className="stat-label">Admins</div>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="users-filters">
//         <div className="search-box">
//           <Search size={20} />
//           <input
//             type="text"
//             placeholder="Search by email, name, or phone..."
//             value={searchTerm}
//             onChange={handleSearch}
//           />
//         </div>

//         <select value={roleFilter} onChange={handleRoleFilter} className="role-filter">
//           <option value="all">All Roles</option>
//           <option value="admin">Admin</option>
//           <option value="driver">Driver</option>
//           <option value="rider">Rider</option>
//         </select>

//         <button onClick={fetchUsers} className="btn-refresh">
//           <RefreshCw size={20} />
//         </button>
//       </div>

//       {/* Users Table */}
//       <div className="users-table-container">
//         <table className="users-table">
//           <thead>
//             <tr>
//               <th>User</th>
//               <th>Email</th>
//               <th>Phone</th>
//               <th>Role</th>
//               <th>KYC Status</th>
//               <th>Created</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredUsers.length === 0 ? (
//               <tr>
//                 <td colSpan="7" className="no-users">
//                   No users found
//                 </td>
//               </tr>
//             ) : (
//               filteredUsers.map(user => (
//                 <tr key={user.id}>
//                   <td>
//                     <div className="user-cell">
//                       <div className="user-avatar">
//                         {user.profile_url ? (
//                           <img src={user.profile_url} alt={user.first_name} />
//                         ) : (
//                           <Users size={20} />
//                         )}
//                       </div>
//                       <div>
//                         <div className="user-name">
//                           {user.first_name || user.last_name 
//                             ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
//                             : 'N/A'}
//                         </div>
//                         <div className="user-id">ID: {user.id.slice(0, 8)}...</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td>{user.email || 'N/A'}</td>
//                   <td>{user.phone_number || 'N/A'}</td>
//                   <td>{getRoleBadge(user.role)}</td>
//                   <td>
//                     {user.kyc_status === 'approved' ? (
//                       <span className="status-badge approved">✅ Approved</span>
//                     ) : user.kyc_status === 'pending' ? (
//                       <span className="status-badge pending">⏳ Pending</span>
//                     ) : (
//                       <span className="status-badge rejected">❌ Not Submitted</span>
//                     )}
//                   </td>
//                   <td>{new Date(user.created_at).toLocaleDateString()}</td>
//                   <td>
//                     <div className="action-buttons">
//                       <button 
//                         onClick={() => openViewModal(user)}
//                         className="btn-action view"
//                         title="View Details"
//                       >
//                         <Eye size={16} />
//                       </button>
//                       <button 
//                         onClick={() => openEditModal(user)}
//                         className="btn-action edit"
//                         title="Edit User"
//                       >
//                         <Edit2 size={16} />
//                       </button>
//                       <button 
//                         onClick={() => handleDeleteUser(user.id)}
//                         className="btn-action delete"
//                         title="Delete User"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={closeModal}>
//           <div className="user-modal" onClick={(e) => e.stopPropagation()}>
//             {/* Modal Header */}
//             <div className="modal-header">
//               <h2>
//                 {modalMode === 'create' && '➕ Create New User'}
//                 {modalMode === 'edit' && '✏️ Edit User'}
//                 {modalMode === 'view' && '👤 User Details'}
//               </h2>
//               <button onClick={closeModal} className="modal-close">
//                 <X size={24} />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="modal-content">
//               {modalMode === 'view' && selectedUser && (
//                 <div className="user-details">
//                   <div className="detail-section">
//                     <h3>Personal Information</h3>
//                     <div className="detail-grid">
//                       <div className="detail-item">
//                         <label>Name</label>
//                         <div>{selectedUser.first_name} {selectedUser.last_name}</div>
//                       </div>
//                       <div className="detail-item">
//                         <label>Email</label>
//                         <div>{selectedUser.email}</div>
//                       </div>
//                       <div className="detail-item">
//                         <label>Phone</label>
//                         <div>{selectedUser.phone_number || 'N/A'}</div>
//                       </div>
//                       <div className="detail-item">
//                         <label>Role</label>
//                         <div>{getRoleBadge(selectedUser.role)}</div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="detail-section">
//                     <h3>Account Status</h3>
//                     <div className="detail-grid">
//                       <div className="detail-item">
//                         <label>KYC Status</label>
//                         <div>{selectedUser.kyc_status || 'Not Submitted'}</div>
//                       </div>
//                       <div className="detail-item">
//                         <label>Created At</label>
//                         <div>{new Date(selectedUser.created_at).toLocaleString()}</div>
//                       </div>
//                       <div className="detail-item">
//                         <label>Last Updated</label>
//                         <div>{new Date(selectedUser.updated_at).toLocaleString()}</div>
//                       </div>
//                     </div>
//                   </div>

//                   {selectedUser.profile_url && (
//                     <div className="detail-section">
//                       <h3>Profile Picture</h3>
//                       <img src={selectedUser.profile_url} alt="Profile" className="profile-image" />
//                     </div>
//                   )}
//                 </div>
//               )}

//               {(modalMode === 'create' || modalMode === 'edit') && (
//                 <form onSubmit={modalMode === 'create' ? handleCreateUser : handleUpdateUser}>
//                   <div className="form-group">
//                     <label>Email *</label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       required
//                       disabled={modalMode === 'edit'}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Role *</label>
//                     <select
//                       name="role"
//                       value={formData.role}
//                       onChange={handleInputChange}
//                       required
//                     >
//                       <option value="rider">Rider</option>
//                       <option value="driver">Driver</option>
//                       <option value="admin">Admin</option>
//                     </select>
//                   </div>

//                   {modalMode === 'create' && (
//                     <>
//                       <div className="form-group">
//                         <label>First Name</label>
//                         <input
//                           type="text"
//                           name="firstName"
//                           value={formData.firstName}
//                           onChange={handleInputChange}
//                           placeholder="User's first name"
//                         />
//                       </div>

//                       <div className="form-group">
//                         <label>Last Name</label>
//                         <input
//                           type="text"
//                           name="lastName"
//                           value={formData.lastName}
//                           onChange={handleInputChange}
//                           placeholder="User's last name"
//                         />
//                       </div>

//                       <div className="form-group">
//                         <label>Phone Number</label>
//                         <input
//                           type="tel"
//                           name="phoneNumber"
//                           value={formData.phoneNumber}
//                           onChange={handleInputChange}
//                           placeholder="9841234567"
//                         />
//                       </div>
//                     </>
//                   )}

//                   <div className="form-group">
//                     <label>Status *</label>
//                     <select
//                       name="status"
//                       value={formData.status}
//                       onChange={handleInputChange}
//                       required
//                     >
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                       <option value="suspended">Suspended</option>
//                       <option value="banned">Banned</option>
//                     </select>
//                   </div>

//                   <div className="modal-footer">
//                     <button type="button" onClick={closeModal} className="btn-cancel">
//                       Cancel
//                     </button>
//                     <button type="submit" disabled={processing} className="btn-save">
//                       {processing ? (
//                         <>
//                           <Loader2 className="spinner" size={20} />
//                           Processing...
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle size={20} />
//                           {modalMode === 'create' ? 'Create User' : 'Update User'}
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminUserManagement;

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Edit2, Trash2, Eye, X, Loader2, 
  CheckCircle, XCircle, Mail, Phone, Calendar, Shield, Car,
  DollarSign, TrendingUp, UserCheck, UserX, RefreshCw
} from 'lucide-react';
import { getToken } from '../utils/CookieUtils';
import './AdminUserManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, create
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    role: 'rider',
    status: 'active',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    nationalIdentityNumber: '',
    bloodGroup: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/manage/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const openViewModal = async (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      role: user.role,
      status: user.user_status || 'active',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      phoneNumber: user.phone_number || '',
      dateOfBirth: user.date_of_birth || '',
      gender: user.gender || 'male',
      address: user.address || '',
      nationalIdentityNumber: user.national_identity_number || '',
      bloodGroup: user.blood_group || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      role: 'rider',
      status: 'active',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      nationalIdentityNumber: '',
      bloodGroup: ''
    });
    setModalMode('create');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      role: 'rider',
      status: 'active',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      nationalIdentityNumber: '',
      bloodGroup: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/manage/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ User created successfully!');
        closeModal();
        fetchUsers();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Create user error:', error);
      alert('Failed to create user');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/manage/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ User updated successfully!');
        closeModal();
        fetchUsers();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Update user error:', error);
      alert('Failed to update user');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('⚠️ Are you sure you want to delete this user? This action cannot be undone!')) {
      return;
    }

    setProcessing(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/manage/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ User deleted successfully!');
        closeModal();
        fetchUsers();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Delete user error:', error);
      alert('Failed to delete user');
    } finally {
      setProcessing(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: '#dc2626', label: 'Admin' },
      driver: { bg: '#2563eb', label: 'Driver' },
      rider: { bg: '#059669', label: 'Rider' }
    };
    const badge = badges[role] || badges.rider;
    return (
      <span className="role-badge" style={{ background: badge.bg }}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="users-loading">
        <Loader2 className="spinner" size={48} />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      {/* Header */}
      <div className="users-header">
        <div>
          <h1><Users size={32} /> User Management</h1>
          <p>Manage all users, roles, and permissions</p>
        </div>
        <button onClick={openCreateModal} className="btn-create-user">
          <Plus size={20} />
          Create New User
        </button>
      </div>

      {/* Stats */}
      <div className="users-stats">
        <div className="stat-box">
          <Users size={24} />
          <div>
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-box">
          <UserCheck size={24} />
          <div>
            <div className="stat-value">{users.filter(u => u.role === 'driver').length}</div>
            <div className="stat-label">Drivers</div>
          </div>
        </div>
        <div className="stat-box">
          <UserX size={24} />
          <div>
            <div className="stat-value">{users.filter(u => u.role === 'rider').length}</div>
            <div className="stat-label">Riders</div>
          </div>
        </div>
        <div className="stat-box">
          <Shield size={24} />
          <div>
            <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
            <div className="stat-label">Admins</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="users-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by email, name, or phone..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <select value={roleFilter} onChange={handleRoleFilter} className="role-filter">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="driver">Driver</option>
          <option value="rider">Rider</option>
        </select>

        <button onClick={fetchUsers} className="btn-refresh">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>KYC Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-users">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.profile_url ? (
                          <img src={user.profile_url} alt={user.first_name} />
                        ) : (
                          <Users size={20} />
                        )}
                      </div>
                      <div>
                        <div className="user-name">
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : 'N/A'}
                        </div>
                        <div className="user-id">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.phone_number || 'N/A'}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    {user.kyc_status === 'verified' ? (
                      <span className="status-badge approved">✅ Verified</span>
                    ) : user.kyc_status === 'pending' ? (
                      <span className="status-badge pending">⏳ Pending Review</span>
                    ) : user.kyc_status === 'rejected' ? (
                      <span className="status-badge rejected">❌ Rejected</span>
                    ) : user.kyc_status === 'submitted' ? (
                      <span className="status-badge pending">📝 Submitted</span>
                    ) : (
                      <span className="status-badge rejected">❌ Not Submitted</span>
                    )}
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => openViewModal(user)}
                        className="btn-action view"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => openEditModal(user)}
                        className="btn-action edit"
                        title="Edit User"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn-action delete"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <h2>
                {modalMode === 'create' && '➕ Create New User'}
                {modalMode === 'edit' && '✏️ Edit User'}
                {modalMode === 'view' && '👤 User Details'}
              </h2>
              <button onClick={closeModal} className="modal-close">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              {modalMode === 'view' && selectedUser && (
                <div className="user-details">
                  <div className="detail-section">
                    <h3>Personal Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Name</label>
                        <div>{selectedUser.first_name} {selectedUser.last_name}</div>
                      </div>
                      <div className="detail-item">
                        <label>Email</label>
                        <div>{selectedUser.email || 'N/A'}</div>
                      </div>
                      <div className="detail-item">
                        <label>Phone</label>
                        <div>{selectedUser.phone_number || 'N/A'}</div>
                      </div>
                      <div className="detail-item">
                        <label>Role</label>
                        <div>{getRoleBadge(selectedUser.role)}</div>
                      </div>
                      <div className="detail-item">
                        <label>Date of Birth</label>
                        <div>{selectedUser.date_of_birth ? new Date(selectedUser.date_of_birth).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <div className="detail-item">
                        <label>Gender</label>
                        <div>{selectedUser.gender || 'N/A'}</div>
                      </div>
                      <div className="detail-item full">
                        <label>Address</label>
                        <div>{selectedUser.address || 'N/A'}</div>
                      </div>
                      <div className="detail-item">
                        <label>National Identity</label>
                        <div>{selectedUser.national_identity_number || 'N/A'}</div>
                      </div>
                      <div className="detail-item">
                        <label>Blood Group</label>
                        <div>{selectedUser.blood_group || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Account Status</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>User Status</label>
                        <div>
                          <span className={`status-badge ${selectedUser.user_status === 'active' ? 'approved' : 'rejected'}`}>
                            {selectedUser.user_status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <label>KYC Status</label>
                        <div>
                          {selectedUser.kyc_status === 'verified' ? (
                            <span className="status-badge approved">✅ Verified</span>
                          ) : selectedUser.kyc_status === 'pending' ? (
                            <span className="status-badge pending">⏳ Pending Review</span>
                          ) : selectedUser.kyc_status === 'rejected' ? (
                            <span className="status-badge rejected">❌ Rejected</span>
                          ) : selectedUser.kyc_status === 'submitted' ? (
                            <span className="status-badge pending">📝 Submitted</span>
                          ) : (
                            <span className="status-badge rejected">❌ Not Submitted</span>
                          )}
                        </div>
                      </div>
                      {selectedUser.kyc_rejection_reason && (
                        <div className="detail-item full">
                          <label>Rejection Reason</label>
                          <div style={{ color: '#991b1b' }}>{selectedUser.kyc_rejection_reason}</div>
                        </div>
                      )}
                      {selectedUser.kyc_reviewed_at && (
                        <div className="detail-item">
                          <label>KYC Reviewed At</label>
                          <div>{new Date(selectedUser.kyc_reviewed_at).toLocaleString()}</div>
                        </div>
                      )}
                      {selectedUser.last_login_at && (
                        <div className="detail-item">
                          <label>Last Login</label>
                          <div>{new Date(selectedUser.last_login_at).toLocaleString()}</div>
                        </div>
                      )}
                      <div className="detail-item">
                        <label>Created At</label>
                        <div>{new Date(selectedUser.created_at).toLocaleString()}</div>
                      </div>
                      <div className="detail-item">
                        <label>Last Updated</label>
                        <div>{new Date(selectedUser.updated_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {(selectedUser.citizenship_front || selectedUser.citizenship_back) && (
                    <div className="detail-section">
                      <h3>KYC Documents</h3>
                      <div className="document-images">
                        {selectedUser.citizenship_front && (
                          <div className="doc-image">
                            <label>Citizenship Front</label>
                            <img src={selectedUser.citizenship_front} alt="Citizenship Front" />
                          </div>
                        )}
                        {selectedUser.citizenship_back && (
                          <div className="doc-image">
                            <label>Citizenship Back</label>
                            <img src={selectedUser.citizenship_back} alt="Citizenship Back" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedUser.profile_url && (
                    <div className="detail-section">
                      <h3>Profile Picture</h3>
                      <img src={selectedUser.profile_url} alt="Profile" className="profile-image" />
                    </div>
                  )}
                </div>
              )}

              {(modalMode === 'create' || modalMode === 'edit') && (
                <form onSubmit={modalMode === 'create' ? handleCreateUser : handleUpdateUser}>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'edit'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="rider">Rider</option>
                      <option value="driver">Driver</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Personal Information - Show for both create and edit */}
                  <div className="form-group">
                    <label>First Name {modalMode === 'create' && '*'}</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="User's first name"
                      required={modalMode === 'create'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name {modalMode === 'create' && '*'}</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="User's last name"
                      required={modalMode === 'create'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="9841234567"
                    />
                  </div>

                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                    </select>
                  </div>

                  <div className="form-group full">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Full address"
                      rows="2"
                    />
                  </div>

                  <div className="form-group">
                    <label>National Identity Number</label>
                    <input
                      type="text"
                      name="nationalIdentityNumber"
                      value={formData.nationalIdentityNumber}
                      onChange={handleInputChange}
                      placeholder="Citizenship number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Blood Group</option>
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

                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>

                  <div className="modal-footer">
                    <button type="button" onClick={closeModal} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" disabled={processing} className="btn-save">
                      {processing ? (
                        <>
                          <Loader2 className="spinner" size={20} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          {modalMode === 'create' ? 'Create User' : 'Update User'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;