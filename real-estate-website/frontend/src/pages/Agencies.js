import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import './Agencies.css';

const Agencies = () => {
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/agencies`);
        setAgencies(response.data);
      } catch (error) {
        console.error('Error fetching agencies:', error);
      }
    };
    fetchAgencies();
  }, []);

  return (
    <div className="agencies">
      <h2>Real Estate Agencies</h2>
      <div className="agencies-grid">
        {agencies.map((agency) => (
          <div key={agency.id} className="agency-card">
            <img src={agency.image} alt={agency.name} className="agency-image" />
            <h3>{agency.name}</h3>
            <p>Specialty: {agency.specialty}</p>
            <p>Contact: {agency.contact}</p>
            <p>Phone: {agency.phone}</p>
            <button className="contact-button">Contact</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Agencies;
