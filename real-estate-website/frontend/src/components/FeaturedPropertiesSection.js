import React from 'react';
import { Link } from 'react-router-dom';
import './FeaturedPropertiesSection.css';

const FeaturedPropertiesSection = () => {
  return (
    <section className="featured-properties-section">
      <h2>Featured Properties</h2>
      <p>Handpicked luxury properties and investment opportunities across Spain</p>
      <p>No featured properties available at the moment.</p>
      <Link to="/properties" className="view-all-button">View All Properties</Link>
    </section>
  );
};

export default FeaturedPropertiesSection;
