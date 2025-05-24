import React from 'react';
import { Link } from 'react-router-dom';
import './RegionsSection.css';

const regions = [
  {
    img: 'https://example.com/costa-del-sol.jpg',
    title: 'Costa del Sol',
    description: 'Sunny coastal region in southern Spain known for beautiful beaches and resorts',
    propertiesLink: '/properties?region=costa-del-sol',
    exploreLink: '/regional-guides/costa-del-sol',
  },
  {
    img: 'https://example.com/costa-blanca.jpg',
    title: 'Costa Blanca',
    description: 'White coast region with stunning Mediterranean beaches and vibrant cities',
    propertiesLink: '/properties?region=costa-blanca',
    exploreLink: '/regional-guides/costa-blanca',
  },
  {
    img: 'https://example.com/costa-brava.jpg',
    title: 'Costa Brava',
    description: 'Rugged coastline with crystal-clear waters and charming coastal towns',
    propertiesLink: '/properties?region=costa-brava',
    exploreLink: '/regional-guides/costa-brava',
  },
];

const RegionsSection = () => {
  return (
    <section className="regions-section">
      <h2>Explore Spain's Most Sought-After Regions</h2>
      <p>Discover the unique charm and investment potential of Spain's diverse regions</p>
      <div className="regions-cards">
        {regions.map((region) => (
          <div key={region.title} className="region-card">
            <img src={region.img} alt={region.title} />
            <div className="region-content">
              <h3>{region.title}</h3>
              <p>{region.description}</p>
              <div className="region-links">
                <Link to={region.propertiesLink} className="properties-link">0+ Properties</Link>
                <Link to={region.exploreLink} className="explore-link">Explore Region</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="view-all-button-container">
        <Link to="/regions" className="view-all-button">View All Regions</Link>
      </div>
    </section>
  );
};

export default RegionsSection;
