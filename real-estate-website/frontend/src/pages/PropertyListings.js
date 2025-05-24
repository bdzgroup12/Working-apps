import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import './PropertyListings.css';

const PropertyListings = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/properties`);
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="property-listings">
      <h2>Property Listings</h2>
      <div className="properties-grid">
        {properties.map((property) => (
          <div key={property.id} className="property-card">
            <img src={property.image} alt={property.title} className="property-image" />
            <h3>{property.title}</h3>
            <p>{property.description}</p>
            <p>Price: €{property.price.toLocaleString()}</p>
            <button className="explore-button">Explore</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyListings;
