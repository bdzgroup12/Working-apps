import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './ProfilePage.css';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userRole, setUserRole] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    zipCode: '',
    phoneNumber: '',
    whatsapp: '',
    teams: '',
    telegram: '',
    discord: '',
    bio: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

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

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      // Get user role from token
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        setUserRole(decodedToken.role);
      } catch (e) {
        console.error('Error decoding token:', e);
      }

      // Fetch profile data
      let response = await fetch(`${config.apiUrl}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Handle token expiration
      if (response.status === 401) {
        const responseData = await response.json();
        
        if (responseData.expired) {
          // Try to refresh token
          const newToken = await refreshToken();
          if (!newToken) return;
          
          // Retry with new token
          response = await fetch(`${config.apiUrl}/api/users/profile`, {
            headers: {
              'Authorization': `Bearer ${newToken}`
            }
          });
        }
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await response.json();
      
      // Set form data from profile
      setFormData({
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        email: profileData.email || '',
        address: profileData.address || '',
        zipCode: profileData.zip_code || '',
        phoneNumber: profileData.phone_number || '',
        whatsapp: profileData.whatsapp || '',
        teams: profileData.teams || '',
        telegram: profileData.telegram || '',
        discord: profileData.discord || '',
        bio: profileData.bio || ''
      });

      // Set profile image if exists (use thumbnail for profile page)
      if (profileData.profile_thumbnail) {
        setImagePreview(`${config.apiUrl}/uploads/${profileData.profile_thumbnail}`);
      } else if (profileData.profile_image) {
        // Fall back to original image if thumbnail doesn't exist
        setImagePreview(`${config.apiUrl}/uploads/${profileData.profile_image}`);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again later.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/tiff'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, GIF, WebP, BMP, SVG, or TIFF)');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size exceeds 2MB limit');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError(null);
    
    try {
      let token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      console.log('Submitting profile update');
      console.log('Current user role:', userRole);
      
      // Decode token to check role
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        console.log('Token decoded in submit:', decodedToken);
      } catch (e) {
        console.error('Error decoding token in submit:', e);
      }
      
      const formDataToSend = new FormData();
      
      // Append text fields - ensure nothing is undefined
      formDataToSend.append('firstName', formData.firstName || '');
      formDataToSend.append('lastName', formData.lastName || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('zipCode', formData.zipCode || '');
      formDataToSend.append('phoneNumber', formData.phoneNumber || '');
      formDataToSend.append('whatsapp', formData.whatsapp || '');
      formDataToSend.append('teams', formData.teams || '');
      formDataToSend.append('telegram', formData.telegram || '');
      formDataToSend.append('discord', formData.discord || '');
      formDataToSend.append('bio', formData.bio || '');
      
      console.log('Form data prepared with fields:', Object.keys(formData));
      console.log('Form values:', {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        address: formData.address || '',
        zipCode: formData.zipCode || '',
        phoneNumber: formData.phoneNumber || ''
      });
      
      // Append image if selected
      if (profileImage) {
        console.log('Adding image to form data:', profileImage.name);
        formDataToSend.append('profileImage', profileImage);
      }

      console.log('Sending profile update request to:', `${config.apiUrl}/api/users/profile`);
      console.log('With authorization token:', `Bearer ${token.substring(0, 15)}...`);
      
      // Important: Don't set Content-Type header when sending FormData
      let response = await fetch(`${config.apiUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      console.log('Profile update response status:', response.status);
      
      // Handle token expiration
      if (response.status === 401) {
        const responseData = await response.json();
        console.log('401 response data:', responseData);
        
        if (responseData.expired) {
          // Try to refresh token
          console.log('Token expired, attempting to refresh');
          const newToken = await refreshToken();
          if (!newToken) {
            console.log('Failed to refresh token');
            setError('Session expired. Please log in again.');
            navigate('/auth');
            return;
          }
          
          // Retry with new token
          console.log('Retrying with new token');
          response = await fetch(`${config.apiUrl}/api/users/profile`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${newToken}`
            },
            body: formDataToSend
          });
          
          console.log('Retry response status:', response.status);
        }
      }

      if (response.status === 403) {
        const data = await response.json();
        console.error('Access denied error:', data);
        console.error('User role during 403 error:', userRole);
        setError(`Permission error: ${data.error || 'Access denied'}`);
        return;
      }

      // Try to get response text first to see if it's valid JSON
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Invalid server response format');
      }

      if (!response.ok) {
        console.error('Error response:', result);
        throw new Error(result.error || 'Failed to update profile');
      }

      console.log('Profile updated successfully:', result);
      
      // Update the preview with the new thumbnail if available
      if (result.user && result.user.profile_thumbnail) {
        setImagePreview(`${config.apiUrl}/uploads/${result.user.profile_thumbnail}`);
      }

      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const renderRequiredLabel = () => (
    <span className="required-label">*</span>
  );

  if (loading) {
    return <div className="profile-loading">Loading profile data...</div>;
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="back-button" onClick={handleBack}>Back to Dashboard</button>
        <h1>My Profile</h1>
        <p>Update your personal information</p>
      </header>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-sections">
          <div className="profile-section">
            <h2>Personal Information</h2>
            
            <div className="profile-image-container">
              <div className="profile-image">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" />
                ) : (
                  <div className="profile-placeholder">
                    {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="profile-image-upload">
                <label htmlFor="profile-image-input" className="upload-button">
                  Upload Photo
                </label>
                <input 
                  id="profile-image-input" 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <p className="image-hint">JPG, PNG, GIF, WebP, BMP, SVG or TIFF, max 2MB</p>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>First Name {renderRequiredLabel()}</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name {renderRequiredLabel()}</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Email Address {renderRequiredLabel()}</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange}
                required
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Address {renderRequiredLabel()}</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ZIP Code {renderRequiredLabel()}</label>
                <input 
                  type="text" 
                  name="zipCode" 
                  value={formData.zipCode} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number {renderRequiredLabel()}</label>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  value={formData.phoneNumber} 
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <h2>Additional Contact Information</h2>
            <p className="section-description">Optional contact methods</p>

            <div className="form-row">
              <div className="form-group">
                <label>WhatsApp</label>
                <input 
                  type="text" 
                  name="whatsapp" 
                  value={formData.whatsapp} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Microsoft Teams</label>
                <input 
                  type="text" 
                  name="teams" 
                  value={formData.teams} 
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Telegram</label>
                <input 
                  type="text" 
                  name="telegram" 
                  value={formData.telegram} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Discord</label>
                <input 
                  type="text" 
                  name="discord" 
                  value={formData.discord} 
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleInputChange}
                rows={5}
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button">Save Changes</button>
              <button type="button" className="cancel-button" onClick={handleBack}>Cancel</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage; 