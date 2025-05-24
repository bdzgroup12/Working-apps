import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './Dashboard.css';
import { FaHome, FaBuilding, FaMapMarkerAlt, FaUsers, FaCog, FaSignOutAlt, FaUserCircle, FaChartLine, FaInbox } from 'react-icons/fa';

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);
  const [stats, setStats] = useState({
    properties: 0,
    regions: 0,
    agencies: 0,
    leads: 0,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [activePage, setActivePage] = useState('dashboard');
  const navigate = useNavigate();

  // Function to refresh token
  const refreshToken = async () => {
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

  useEffect(() => {
    // Fetch user info and stats from backend API
    async function fetchDashboardData() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      try {
        console.log('Fetching dashboard data...');
        let token = localStorage.getItem('token');
        
        // First fetch user profile to get avatar
        let userResponse = await fetch(`${config.apiUrl}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        // Handle token expiration for user profile request
        if (userResponse.status === 401) {
          const responseData = await userResponse.json();
          
          if (responseData.expired) {
            // Try to refresh token
            const newToken = await refreshToken();
            if (!newToken) return;
            
            token = newToken;
            
            // Retry with new token
            userResponse = await fetch(`${config.apiUrl}/api/users/profile`, {
              headers: {
                'Authorization': `Bearer ${newToken}`,
              },
            });
          }
        }
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.profile_dashboard) {
            setUserAvatar(`${config.apiUrl}/uploads/${userData.profile_dashboard}`);
          } else if (userData.profile_thumbnail) {
            setUserAvatar(`${config.apiUrl}/uploads/${userData.profile_thumbnail}`);
          } else if (userData.profile_image) {
            setUserAvatar(`${config.apiUrl}/uploads/${userData.profile_image}`);
          }
        }
        
        // Then fetch dashboard data
        let response = await fetch(`${config.apiUrl}/api/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        // Handle token expiration for dashboard request
        if (response.status === 401) {
          const responseData = await response.json();
          
          if (responseData.expired) {
            // Try to refresh token if not already refreshed
            if (token === localStorage.getItem('token')) {
              const newToken = await refreshToken();
              if (!newToken) return;
              
              token = newToken;
            }
            
            // Retry with new token
            response = await fetch(`${config.apiUrl}/api/dashboard`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
          }
        }
        
        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard data received:', data);
          setUserRole(data.role);
          setUserName(data.name);
          setDisplayName(data.displayName || `${data.role.charAt(0).toUpperCase() + data.role.slice(1)} User`);
          setStats({
            properties: data.propertiesCount,
            regions: data.regionsCount,
            agencies: data.agenciesCount,
            leads: data.leadsCount,
          });
          setRecentLeads(data.recentLeads);
        } else {
          console.error('Dashboard fetch failed with status:', response.status);
          // If unauthorized, redirect to auth page
          navigate('/auth');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        navigate('/auth');
      }
    }
    fetchDashboardData();
  }, [navigate]);

  // Role-based access control helpers
  const canManageListings = userRole === 'admin' || userRole === 'agency' || userRole === 'client';
  const canManageContent = userRole === 'admin';
  const canManageUsers = userRole === 'admin' || userRole === 'agency';
  const canManageSettings = userRole === 'admin';

  // Handle sign out
  const handleSignOut = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    // Redirect to the login page
    navigate('/auth');
  };

  const handleMyProfile = () => {
    navigate('/dashboard/profile');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, show: true },
    { id: 'properties', label: 'Properties', icon: FaHome, show: canManageListings },
    { id: 'regions', label: 'Regions', icon: FaMapMarkerAlt, show: canManageContent },
    { id: 'agencies', label: 'Agencies', icon: FaBuilding, show: canManageUsers },
    { id: 'leads', label: 'Leads', icon: FaInbox, show: true },
    { id: 'users', label: 'Users', icon: FaUsers, show: canManageUsers },
    { id: 'settings', label: 'Settings', icon: FaCog, show: canManageSettings },
  ];

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-content">
          <div className="user-info">
            <div className="avatar">
              {userAvatar ? (
                <img src={userAvatar} alt={userName || 'User'} />
              ) : (
                <FaUserCircle className="default-avatar" />
              )}
            </div>
            <div className="user-details">
              <span className="user-name">{displayName}</span>
              <span className="user-role">{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Loading...'}</span>
            </div>
          </div>

          <nav className="nav-links">
            {navigationItems.map(item => (
              item.show && (
                <button
                  key={item.id}
                  className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage(item.id);
                    if (item.id !== 'dashboard') {
                      navigate(`/dashboard/${item.id}`);
                    } else {
                      navigate('/dashboard');
                    }
                  }}
                >
                  <item.icon className="nav-icon" />
                  <span>{item.label}</span>
                </button>
              )
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="profile-btn" onClick={handleMyProfile}>
              <FaUserCircle className="btn-icon" />
              <span>My Profile</span>
            </button>
            <button className="sign-out" onClick={handleSignOut}>
              <FaSignOutAlt className="btn-icon" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        <div className="main-header">
          <h1>Welcome back, {displayName}!</h1>
          <p>Here's what's happening with your properties today.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card properties">
            <div className="stat-icon">
              <FaHome />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.properties}</span>
              <span className="stat-label">Properties</span>
            </div>
          </div>

          <div className="stat-card regions">
            <div className="stat-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.regions}</span>
              <span className="stat-label">Regions</span>
            </div>
          </div>

          <div className="stat-card agencies">
            <div className="stat-icon">
              <FaBuilding />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.agencies}</span>
              <span className="stat-label">Agencies</span>
            </div>
          </div>

          <div className="stat-card leads">
            <div className="stat-icon">
              <FaInbox />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.leads}</span>
              <span className="stat-label">New Leads</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="recent-leads-card">
            <h2>Recent Leads</h2>
            {recentLeads.length > 0 ? (
              <ul>
                {recentLeads.map((lead, index) => (
                  <li key={index} className="lead-item">
                    <div className="lead-info">
                      <span className="lead-name">{lead.name}</span>
                      <span className="lead-email">{lead.email}</span>
                    </div>
                    <span className="lead-date">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-leads">No recent leads to display</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
