import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './AuthPage.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [agencies, setAgencies] = useState([]);

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    accountType: 'client',
    agencyId: 'none',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/agencies`);
        if (response.ok) {
          const data = await response.json();
          setAgencies(data);
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
      }
    };
    fetchAgencies();
  }, []);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    // Clear messages when user starts typing
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    // Clear messages when user starts typing
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const dataToSend = {
        ...registerData,
        agencyId: registerData.accountType === 'agency' ? null : registerData.agencyId,
        adminApproved: registerData.accountType === 'client', // Only clients are auto-approved
        isVerified: registerData.accountType === 'client' // Only clients are auto-verified
      };
      
      const response = await fetch(`${config.apiUrl}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      const data = await response.json();
      if (response.ok) {
        if (registerData.accountType === 'agency') {
          setSuccessMessage('Registration successful! Please wait for admin approval before you can log in.');
        } else {
          setSuccessMessage('Registration successful! Please check your email to verify your account.');
        }
        setRegisterData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          accountType: 'client',
          agencyId: 'none',
        });
      } else {
        setErrorMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setErrorMessage('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        navigate('/dashboard');
      } else {
        if (data.needsVerification) {
          setErrorMessage('Please verify your email before logging in.');
        } else if (data.awaitingApproval) {
          setErrorMessage('Your account is pending admin approval. Please try again later.');
        } else {
          setErrorMessage(data.error || 'Login failed');
        }
      }
    } catch (error) {
      setErrorMessage('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-tabs">
            <button
              className={activeTab === 'login' ? 'active' : ''}
              onClick={() => handleTabClick('login')}
            >
              Login
            </button>
            <button
              className={activeTab === 'register' ? 'active' : ''}
              onClick={() => handleTabClick('register')}
            >
              Register
            </button>
          </div>

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="form">
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="********"
                  required
                />
              </div>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              {successMessage && <p className="success-message">{successMessage}</p>}
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="form">
              <div className="name-fields">
                <div>
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={registerData.firstName}
                    onChange={handleRegisterChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={registerData.lastName}
                    onChange={handleRegisterChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="********"
                  required
                />
              </div>
              <div>
                <label>Account Type</label>
                <select
                  name="accountType"
                  value={registerData.accountType}
                  onChange={handleRegisterChange}
                  required
                >
                  <option value="client">Client</option>
                  <option value="agency">Agency</option>
                </select>
              </div>

              {registerData.accountType === 'client' && (
                <div>
                  <label>Select Agency (Optional)</label>
                  <select
                    name="agencyId"
                    value={registerData.agencyId}
                    onChange={handleRegisterChange}
                  >
                    <option value="none">None</option>
                    {agencies.map(agency => (
                      <option key={agency.id} value={agency.id}>
                        {agency.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {registerData.accountType === 'agency' && (
                <p className="info-message">
                  Note: Agency accounts require admin approval before they can be used.
                  You will be notified once your account is approved.
                </p>
              )}

              {errorMessage && <p className="error-message">{errorMessage}</p>}
              {successMessage && <p className="success-message">{successMessage}</p>}
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
        <div className="auth-info">
          <h2>Discover Spanish Real Estate</h2>
          <p>
            Join our platform to explore exclusive properties in Spain's most beautiful regions.
            Whether you're a client looking for your dream home or an agency showcasing your listings,
            Spain Undiscovered provides all the tools you need.
          </p>
          <ul>
            <li>Browse properties across Spain's top regions</li>
            <li>Connect with reputable agencies</li>
            <li>Access exclusive travel guides</li>
            <li>Stay updated with the latest market trends</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
