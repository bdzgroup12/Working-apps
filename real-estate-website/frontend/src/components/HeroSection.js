import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <header className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-text">
        <p className="hero-subtitle">EXPERIENCE SPAIN LIKE NEVER BEFORE</p>
        <h1 className="hero-title">Uncover Spain's Hidden Treasures</h1>
        <p>From exclusive coastal villas to authentic inland retreats, discover the undiscovered Spain</p>
        <div className="search-form-container">
          <form className="search-form-hero">
            <select name="region" defaultValue="">
              <option value="">All Regions</option>
              <option value="costa-del-sol">Costa del Sol</option>
              <option value="costa-blanca">Costa Blanca</option>
              <option value="costa-brava">Costa Brava</option>
            </select>
            <select name="property-type" defaultValue="">
              <option value="">All Types</option>
              <option value="beachfront-villas">Beachfront Villas</option>
              <option value="city-apartments">City Apartments</option>
              <option value="rural-fincas">Rural Fincas</option>
              <option value="investment-properties">Investment Properties</option>
            </select>
            <select name="price-range" defaultValue="">
              <option value="">Any Price</option>
              <option value="0-100000">Up to €100,000</option>
              <option value="100000-300000">€100,000 - €300,000</option>
              <option value="300000-500000">€300,000 - €500,000</option>
              <option value="500000+">€500,000+</option>
            </select>
            <button type="submit">Search Properties</button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
