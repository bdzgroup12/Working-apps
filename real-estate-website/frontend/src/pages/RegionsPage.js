import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './RegionsPage.css';

const RegionsPage = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [newRegion, setNewRegion] = useState({ 
    name: '', 
    description: '', 
    isCustom: false,
    tourist_places: [''] 
  });
  const [editingRegion, setEditingRegion] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [availableRegions, setAvailableRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('custom');

  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    console.log("RegionsPage mounted");
    // Fetch regions data
    fetchRegions();
    
    // Get user role from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        console.log("User role from token:", decodedToken.role);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      console.log('Fetching regions, token:', token.substring(0, 15) + '...');
      
      const response = await fetch(`${config.apiUrl}/api/regions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Regions API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Regions data received:', data);
      
      setRegions(data.regions || []);
      
      // Create a list of available regions for the dropdown
      if (data.regions && data.regions.length > 0) {
        // Extract unique region names
        const regionNames = [...new Set(data.regions.map(r => r.name))];
        setAvailableRegions(regionNames);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      setError('Failed to load regions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingRegion) {
      setEditingRegion(prev => ({ ...prev, [name]: value }));
    } else {
      setNewRegion(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRegionSelectChange = (e) => {
    const value = e.target.value;
    setSelectedRegion(value);
    
    if (value === 'custom') {
      if (editingRegion) {
        setEditingRegion(prev => ({ ...prev, isCustom: true, name: '' }));
      } else {
        setNewRegion(prev => ({ ...prev, isCustom: true, name: '' }));
      }
    } else {
      if (editingRegion) {
        // Find the selected region to get its tourist places
        const selectedRegionData = regions.find(r => r.name === value);
        const tourist_places = selectedRegionData?.tourist_places || [''];
        
        setEditingRegion(prev => ({ 
          ...prev, 
          isCustom: false, 
          name: value,
          tourist_places: tourist_places.length > 0 ? tourist_places : [''] 
        }));
      } else {
        // Find the selected region to get its tourist places
        const selectedRegionData = regions.find(r => r.name === value);
        const tourist_places = selectedRegionData?.tourist_places || [''];
        
        setNewRegion(prev => ({ 
          ...prev, 
          isCustom: false, 
          name: value,
          tourist_places: tourist_places.length > 0 ? tourist_places : ['']
        }));
      }
    }
  };

  const addTouristPlaceField = () => {
    if (editingRegion) {
      setEditingRegion(prev => ({
        ...prev,
        tourist_places: [...prev.tourist_places, '']
      }));
    } else {
      setNewRegion(prev => ({
        ...prev,
        tourist_places: [...prev.tourist_places, '']
      }));
    }
  };

  const removeTouristPlaceField = (index) => {
    if (editingRegion) {
      setEditingRegion(prev => ({
        ...prev,
        tourist_places: prev.tourist_places.filter((_, i) => i !== index)
      }));
    } else {
      setNewRegion(prev => ({
        ...prev,
        tourist_places: prev.tourist_places.filter((_, i) => i !== index)
      }));
    }
  };

  const handleTouristPlaceChange = (index, value) => {
    if (editingRegion) {
      const newTouristPlaces = [...editingRegion.tourist_places];
      newTouristPlaces[index] = value;
      setEditingRegion(prev => ({
        ...prev,
        tourist_places: newTouristPlaces
      }));
    } else {
      const newTouristPlaces = [...newRegion.tourist_places];
      newTouristPlaces[index] = value;
      setNewRegion(prev => ({
        ...prev,
        tourist_places: newTouristPlaces
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setSuccessMessage('');
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      
      let url = `${config.apiUrl}/api/regions`;
      let method = 'POST';
      let body = {
        name: selectedRegion === 'custom' ? newRegion.name : selectedRegion,
        description: newRegion.description,
        tourist_places: newRegion.tourist_places.filter(place => place.trim() !== '')
      };
      
      // If editing, use PUT method and include region ID
      if (editingRegion) {
        url = `${url}/${editingRegion.id}`;
        method = 'PUT';
        body = {
          name: selectedRegion === 'custom' ? editingRegion.name : selectedRegion,
          description: editingRegion.description,
          tourist_places: editingRegion.tourist_places.filter(place => place.trim() !== '')
        };
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Refresh regions list
      fetchRegions();
      
      // Reset form
      setNewRegion({ 
        name: '', 
        description: '', 
        isCustom: false,
        tourist_places: [''] 
      });
      setSelectedRegion('custom');
      setEditingRegion(null);
      setShowForm(false);
      
      // Show success message
      setSuccessMessage(editingRegion ? 'Region updated successfully!' : 'Region added successfully!');
    } catch (error) {
      console.error('Error saving region:', error);
      setError('Failed to save region. Please try again.');
    }
  };

  const handleEdit = (region) => {
    if (!isAdmin) return;
    
    // Check if this region's name is in our available regions list
    if (availableRegions.includes(region.name)) {
      setSelectedRegion(region.name);
      setEditingRegion({
        ...region, 
        isCustom: false,
        tourist_places: region.tourist_places?.length > 0 ? region.tourist_places : ['']
      });
    } else {
      setSelectedRegion('custom');
      setEditingRegion({
        ...region, 
        isCustom: true,
        tourist_places: region.tourist_places?.length > 0 ? region.tourist_places : ['']
      });
    }
    
    setShowForm(true);
    setSuccessMessage('');
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    
    if (!window.confirm('Are you sure you want to delete this region?')) {
      return;
    }
    
    setSuccessMessage('');
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      
      const response = await fetch(`${config.apiUrl}/api/regions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Refresh regions list
      fetchRegions();
      setSuccessMessage('Region deleted successfully!');
    } catch (error) {
      console.error('Error deleting region:', error);
      setError('Failed to delete region. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRegion(null);
    setNewRegion({ 
      name: '', 
      description: '', 
      isCustom: false,
      tourist_places: [''] 
    });
    setSelectedRegion('custom');
    setSuccessMessage('');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="regions-page">
      <div className="regions-header">
        <button className="back-button" onClick={handleBack}>Back to Dashboard</button>
        <h1>Regions in Spain</h1>
        {isAdmin && !showForm && (
          <button 
            className="add-button" 
            onClick={() => {
              setShowForm(true);
              setSelectedRegion('custom');
              setNewRegion({ 
                name: '', 
                description: '', 
                isCustom: true,
                tourist_places: ['']
              });
            }}
          >
            Add New Region
          </button>
        )}
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && isAdmin && (
        <div className="region-form-container">
          <form className="region-form" onSubmit={handleSubmit}>
            <h2>{editingRegion ? 'Edit Region' : 'Add New Region'}</h2>
            <div className="form-group">
              <label htmlFor="region-select">Region Name *</label>
              <select
                id="region-select"
                value={selectedRegion}
                onChange={handleRegionSelectChange}
                className="region-select"
                required
              >
                <option value="custom">Custom region</option>
                {availableRegions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              
              {selectedRegion === 'custom' && (
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editingRegion ? editingRegion.name : newRegion.name}
                  onChange={handleInputChange}
                  placeholder="Enter custom region name"
                  className="custom-region-input"
                  required
                />
              )}
            </div>
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={editingRegion ? editingRegion.description : newRegion.description}
                onChange={handleInputChange}
                placeholder="Describe the region..."
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label>Tourist Places</label>
              <div className="tourist-places-container">
                {(editingRegion ? editingRegion.tourist_places : newRegion.tourist_places).map((place, index) => (
                  <div key={index} className="tourist-place-input-group">
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => handleTouristPlaceChange(index, e.target.value)}
                      placeholder="Enter tourist place name"
                      className="tourist-place-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeTouristPlaceField(index)}
                      className="remove-tourist-place-btn"
                      disabled={(editingRegion ? editingRegion.tourist_places : newRegion.tourist_places).length <= 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTouristPlaceField}
                  className="add-tourist-place-btn"
                >
                  + Add Tourist Place
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button">
                {editingRegion ? 'Update Region' : 'Add Region'}
              </button>
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="regions-list">
        {loading ? (
          <p>Loading regions...</p>
        ) : regions.length === 0 ? (
          <p>No regions found.</p>
        ) : (
          regions.map((region) => (
            <div key={region.id} className="region-card">
              <div className="region-content">
                <h2>{region.name}</h2>
                <p>{region.description}</p>
                
                {region.tourist_places && region.tourist_places.length > 0 && (
                  <div className="tourist-places">
                    <h3>Famous Tourist Places:</h3>
                    <ul className="tourist-places-list">
                      {region.tourist_places.map((place, index) => (
                        <li key={index} className="tourist-place-item">{place}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {isAdmin && (
                <div className="region-actions">
                  <button 
                    className="edit-button" 
                    onClick={() => handleEdit(region)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDelete(region.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RegionsPage; 