import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './UsersManagement.css';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    accountType: 'client',
    isVerified: true,
    adminApproved: true
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    // Decode token to get user role
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decodedToken = JSON.parse(jsonPayload);
      setUserRole(decodedToken.role);
      
      // Redirect clients away from this page
      if (decodedToken.role === 'client') {
        navigate('/dashboard');
      }
    } catch (e) {
      console.error('Error decoding token:', e);
      navigate('/auth');
    }

    fetchUsers();
  }, [navigate]);

  const refreshToken = async (navigate) => {
    try {
      // Get user ID from stored token to request a new one
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return null;
      }

      // Decode token to get user ID
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decodedToken = JSON.parse(jsonPayload);
      const userId = decodedToken.id;

      // Request new token
      const response = await fetch(`${config.apiUrl}/api/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        // If token refresh fails, redirect to login
        navigate('/auth');
        return null;
      }

      const data = await response.json();
      
      // Store new token
      localStorage.setItem('token', data.token);
      
      // Return the new token
      return data.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      navigate('/auth');
      return null;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      
      let response = await fetch(`${config.apiUrl}/api/users/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Handle token expiration
      if (response.status === 401) {
        const responseData = await response.json();
        
        if (responseData.expired) {
          // Try to refresh token
          const newToken = await refreshToken(navigate);
          if (!newToken) return;
          
          token = newToken;
          
          // Retry with new token
          response = await fetch(`${config.apiUrl}/api/users/all`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      accountType: 'client',
      isVerified: true,
      adminApproved: true
    });
    setSelectedUser(null);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      let token = localStorage.getItem('token');
      let response = await fetch(`${config.apiUrl}/api/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          accountType: formData.accountType
        })
      });
      
      // Handle token expiration
      if (response.status === 401) {
        const responseData = await response.json();
        
        if (responseData.expired) {
          // Try to refresh token
          const newToken = await refreshToken(navigate);
          if (!newToken) return;
          
          // Retry with new token
          response = await fetch(`${config.apiUrl}/api/users/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`
            },
            body: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              password: formData.password,
              accountType: formData.accountType
            })
          });
        }
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }
      
      setSuccessMessage('User created successfully');
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setErrorMessage(err.message || 'Failed to create user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!selectedUser) return;
    
    try {
      let token = localStorage.getItem('token');
      let response = await fetch(`${config.apiUrl}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          accountType: formData.accountType,
          isVerified: formData.isVerified,
          adminApproved: formData.adminApproved
        })
      });
      
      // Handle token expiration
      if (response.status === 401) {
        const responseData = await response.json();
        
        if (responseData.expired) {
          // Try to refresh token
          const newToken = await refreshToken(navigate);
          if (!newToken) return;
          
          // Retry with new token
          response = await fetch(`${config.apiUrl}/api/users/${selectedUser.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`
            },
            body: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              accountType: formData.accountType,
              isVerified: formData.isVerified,
              adminApproved: formData.adminApproved
            })
          });
        }
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }
      
      setSuccessMessage('User updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setErrorMessage(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      let token = localStorage.getItem('token');
      let response = await fetch(`${config.apiUrl}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Handle token expiration
      if (response.status === 401) {
        const responseData = await response.json();
        
        if (responseData.expired) {
          // Try to refresh token
          const newToken = await refreshToken(navigate);
          if (!newToken) return;
          
          // Retry with new token
          response = await fetch(`${config.apiUrl}/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${newToken}`
            }
          });
        }
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      setSuccessMessage('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setErrorMessage(err.message || 'Failed to delete user');
    }
  };

  const handleToggleApproval = async (userId, currentStatus) => {
    try {
      let token = localStorage.getItem('token');
      let response = await fetch(`${config.apiUrl}/api/users/toggle-approval/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Handle token expiration
      if (response.status === 401) {
        const responseData = await response.json();
        
        if (responseData.expired) {
          // Try to refresh token
          const newToken = await refreshToken(navigate);
          if (!newToken) return;
          
          // Retry with new token
          response = await fetch(`${config.apiUrl}/api/users/toggle-approval/${userId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${newToken}`
            }
          });
        }
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle approval status');
      }
      
      setSuccessMessage(currentStatus ? 'User disapproved successfully' : 'User approved successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error toggling approval status:', err);
      setErrorMessage(err.message || 'Failed to toggle approval status');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      password: '',
      accountType: user.account_type,
      isVerified: user.is_verified,
      adminApproved: user.admin_approved
    });
    setShowEditModal(true);
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      'admin': 'Admin',
      'client': 'Client',
      'agency': 'Agency'
    };
    return roleMap[role] || role;
  };

  const getAgencyName = (user) => {
    if (!user.agency_first_name && !user.agency_last_name) return 'None';
    return `${user.agency_first_name || ''} ${user.agency_last_name || ''}`.trim();
  };

  // Helper function to render user avatar
  const renderUserAvatar = (user) => {
    if (user.profile_dashboard) {
      return (
        <img 
          src={`${config.apiUrl}/uploads/${user.profile_dashboard}`} 
          alt={`${user.first_name} ${user.last_name}`}
          className="user-avatar"
        />
      );
    } else if (user.profile_thumbnail) {
      return (
        <img 
          src={`${config.apiUrl}/uploads/${user.profile_thumbnail}`} 
          alt={`${user.first_name} ${user.last_name}`}
          className="user-avatar"
        />
      );
    } else if (user.profile_image) {
      return (
        <img 
          src={`${config.apiUrl}/uploads/${user.profile_image}`} 
          alt={`${user.first_name} ${user.last_name}`}
          className="user-avatar"
        />
      );
    } else {
      return (
        <div className="user-avatar-placeholder">
          {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
        </div>
      );
    }
  };

  return (
    <div className="users-management">
      <h1>User Management</h1>
      <p>{userRole === 'admin' ? 'Manage all users in the system' : 'Manage your client accounts'}</p>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="control-panel">
        <button className="btn add-user-btn" onClick={() => setShowAddModal(true)}>
          Add New {userRole === 'agency' ? 'Client' : 'User'}
        </button>
        <button className="btn refresh-btn" onClick={fetchUsers}>
          Refresh List
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                {userRole === 'admin' && <th>Agency</th>}
                <th>Verified</th>
                <th>Approved</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'admin' ? "9" : "8"} className="no-users">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {renderUserAvatar(user)}
                    </td>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.account_type}`}>
                        {getRoleLabel(user.account_type)}
                      </span>
                    </td>
                    {userRole === 'admin' && (
                      <td>
                        {user.account_type === 'client' ? getAgencyName(user) : 'N/A'}
                      </td>
                    )}
                    <td>
                      <span className={user.is_verified ? "status verified" : "status not-verified"}>
                        {user.is_verified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <span className={user.admin_approved ? "status approved" : "status not-approved"}>
                        {user.admin_approved ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button 
                        className="btn edit-btn" 
                        onClick={() => openEditModal(user)}
                      >
                        Edit
                      </button>
                      {userRole === 'admin' && (
                        <button 
                          className={`btn ${user.admin_approved ? 'disapprove-btn' : 'approve-btn'}`} 
                          onClick={() => handleToggleApproval(user.id, user.admin_approved)}
                        >
                          {user.admin_approved ? 'Disapprove' : 'Approve'}
                        </button>
                      )}
                      <button 
                        className="btn delete-btn" 
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New {userRole === 'agency' ? 'Client' : 'User'}</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              {userRole === 'admin' && (
                <div className="form-group">
                  <label>Account Type</label>
                  <select 
                    name="accountType" 
                    value={formData.accountType} 
                    onChange={handleInputChange}
                  >
                    <option value="client">Client</option>
                    <option value="agency">Agency</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
              <div className="modal-buttons">
                <button type="submit" className="btn save-btn">Save</button>
                <button type="button" className="btn cancel-btn" onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit User</h2>
            <form onSubmit={handleEditUser}>
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              {userRole === 'admin' && (
                <div className="form-group">
                  <label>Account Type</label>
                  <select 
                    name="accountType" 
                    value={formData.accountType} 
                    onChange={handleInputChange}
                  >
                    <option value="client">Client</option>
                    <option value="agency">Agency</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
              {userRole === 'admin' && (
                <>
                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      name="isVerified" 
                      id="isVerified" 
                      checked={formData.isVerified} 
                      onChange={handleInputChange}
                    />
                    <label htmlFor="isVerified">Email Verified</label>
                  </div>
                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      name="adminApproved" 
                      id="adminApproved" 
                      checked={formData.adminApproved} 
                      onChange={handleInputChange}
                    />
                    <label htmlFor="adminApproved">Admin Approved</label>
                  </div>
                </>
              )}
              <div className="modal-buttons">
                <button type="submit" className="btn save-btn">Save</button>
                <button type="button" className="btn cancel-btn" onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement; 