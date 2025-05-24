import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const response = await axios.post(`${config.apiUrl}/api/contact`, formData);
      setStatus(response.data.message);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setStatus('Error sending message. Please try again later.');
      console.error('Contact form submission error:', error);
    }
  };

  return (
    <div className="contact">
      <h2>Contact Us</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <label>
          Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>
        <label>
          Phone:
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
        </label>
        <label>
          Message:
          <textarea name="message" value={formData.message} onChange={handleChange} required />
        </label>
        <button type="submit">Send</button>
      </form>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default Contact;
