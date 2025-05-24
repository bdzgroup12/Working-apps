import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailVerificationEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Error loading settings');
      setLoading(false);
    }
  };

  const handleToggleEmailVerification = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/settings/email-verification`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !settings.emailVerificationEnabled
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        emailVerificationEnabled: !prev.emailVerificationEnabled
      }));
      setSuccessMessage('Settings updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Error updating settings');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <div className="settings-page">Loading...</div>;
  }

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="settings-section">
        <h2>Email Verification</h2>
        <div className="setting-item">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.emailVerificationEnabled}
              onChange={handleToggleEmailVerification}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="setting-label">
            {settings.emailVerificationEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <p className="setting-description">
          When enabled, new users must verify their email address before accessing their account.
          In development mode, you may want to disable this to test without email verification.
        </p>
      </div>
    </div>
  );
};

export default Settings; 