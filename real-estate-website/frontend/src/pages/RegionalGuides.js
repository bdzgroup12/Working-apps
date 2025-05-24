import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import './RegionalGuides.css';

const RegionalGuides = () => {
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/regional-guides`);
        setGuides(response.data);
      } catch (error) {
        console.error('Error fetching regional guides:', error);
      }
    };
    fetchGuides();
  }, []);

  return (
    <div className="regional-guides">
      <h2>Regional Guides</h2>
      <div className="guides-grid">
        {guides.map((guide) => (
          <div key={guide.id} className="guide-card">
            <img src={guide.image} alt={guide.region} className="guide-image" />
            <h3>{guide.region}</h3>
            <p>{guide.description}</p>
            <a href={guide.link} className="read-guide-link">Read Guide</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionalGuides;
