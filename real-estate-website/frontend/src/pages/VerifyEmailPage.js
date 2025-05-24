import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../config';
import './VerifyEmailPage.css';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const id = params.get('id');

      if (!token || !id) {
        setStatus('error');
        setMessage('Missing verification parameters. Please check your verification link.');
        return;
      }

      try {
        const response = await fetch(`${config.apiUrl}/api/users/verify-email?token=${token}&id=${id}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again later.');
      }
    };

    verifyEmail();
  }, [location.search]);

  const handleResendVerification = async () => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    
    try {
      setStatus('resending');
      setMessage('Sending verification email...');
      
      // We need to get the email first
      const emailResponse = await fetch(`${config.apiUrl}/api/users/get-email?id=${id}`);
      const emailData = await emailResponse.json();
      
      if (!emailResponse.ok) {
        throw new Error(emailData.error || 'Could not retrieve email');
      }
      
      const email = emailData.email;
      
      const response = await fetch(`${config.apiUrl}/api/users/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('resent');
        setMessage('Verification email has been resent. Please check your inbox.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to resend verification email.');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="verify-email-page">
      <div className="verify-container">
        <h1>Email Verification</h1>
        
        {status === 'verifying' && (
          <div className="verify-status verifying">
            <div className="loading-spinner"></div>
            <p>{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="verify-status success">
            <div className="verify-icon success-icon">✓</div>
            <p>{message}</p>
            <button 
              className="action-button primary"
              onClick={handleLoginRedirect}
            >
              Go to Login
            </button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="verify-status error">
            <div className="verify-icon error-icon">✕</div>
            <p>{message}</p>
            <button 
              className="action-button secondary"
              onClick={handleResendVerification}
            >
              Resend Verification Email
            </button>
            <button 
              className="action-button outline"
              onClick={handleLoginRedirect}
            >
              Back to Login
            </button>
          </div>
        )}
        
        {status === 'resending' && (
          <div className="verify-status verifying">
            <div className="loading-spinner"></div>
            <p>{message}</p>
          </div>
        )}
        
        {status === 'resent' && (
          <div className="verify-status success">
            <div className="verify-icon success-icon">✓</div>
            <p>{message}</p>
            <button 
              className="action-button outline"
              onClick={handleLoginRedirect}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage; 