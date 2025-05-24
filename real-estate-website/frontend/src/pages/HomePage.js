import React, { useState } from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import RegionsSection from '../components/RegionsSection';
import FeaturedPropertiesSection from '../components/FeaturedPropertiesSection';
import InquiryFormSection from '../components/InquiryFormSection';
import FeaturedAgenciesSection from '../components/FeaturedAgenciesSection';
import ExploreDestinationsSection from '../components/ExploreDestinationsSection';
import LatestNewsSection from '../components/LatestNewsSection';
import ClientSuccessStoriesSection from '../components/ClientSuccessStoriesSection';
import Footer from '../components/Footer';
import FindYourDreamHomeSection from '../components/FindYourDreamHomeSection';

const HomePage = () => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleRegions = () => setRegionsOpen(!regionsOpen);
  const toggleProperties = () => setPropertiesOpen(!propertiesOpen);

  return (
    <div className="homepage">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <span className="logo-blue">Spain</span><span className="logo-red">Undiscovered</span>
        </div>
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
        </button>
        <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li className="dropdown" onMouseEnter={() => setRegionsOpen(true)} onMouseLeave={() => setRegionsOpen(false)}>
            <button className="dropdown-toggle" onClick={toggleRegions} aria-expanded={regionsOpen}>
              Regions
            </button>
            <ul className={`dropdown-menu ${regionsOpen ? 'open' : ''}`}>
              <li><Link to="/regional-guides/costa-del-sol" onClick={() => setMenuOpen(false)}>Costa del Sol</Link></li>
              <li><Link to="/regional-guides/costa-blanca" onClick={() => setMenuOpen(false)}>Costa Blanca</Link></li>
              <li><Link to="/regional-guides/costa-brava" onClick={() => setMenuOpen(false)}>Costa Brava</Link></li>
            </ul>
          </li>
          <li className="dropdown" onMouseEnter={() => setPropertiesOpen(true)} onMouseLeave={() => setPropertiesOpen(false)}>
            <button className="dropdown-toggle" onClick={toggleProperties} aria-expanded={propertiesOpen}>
              Properties
            </button>
            <ul className={`dropdown-menu ${propertiesOpen ? 'open' : ''}`}>
              <li><Link to="/properties?category=beachfront-villas" onClick={() => setMenuOpen(false)}>Beachfront Villas</Link></li>
              <li><Link to="/properties?category=city-apartments" onClick={() => setMenuOpen(false)}>City Apartments</Link></li>
              <li><Link to="/properties?category=rural-fincas" onClick={() => setMenuOpen(false)}>Rural Fincas</Link></li>
              <li><Link to="/properties?category=investment-properties" onClick={() => setMenuOpen(false)}>Investment Properties</Link></li>
            </ul>
          </li>
          <li><Link to="/news" onClick={() => setMenuOpen(false)}>News & Blog</Link></li>
          <li><Link to="/magazine" onClick={() => setMenuOpen(false)}>Magazine</Link></li>
        </ul>
        <Link to="/contact" className="contact-button">Contact Us</Link>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Regions Section */}
      <RegionsSection />

      {/* Featured Properties Section */}
      <FeaturedPropertiesSection />

      {/* Featured Agencies Section */}
      <FeaturedAgenciesSection />

      {/* Find Your Ideal Property Section */}
      <FindYourDreamHomeSection />


      {/* Explore Destinations Section */}

      <ExploreDestinationsSection />

      {/* Latest News Section */}
      <LatestNewsSection />

      {/* Client Success Stories Section */}
      <ClientSuccessStoriesSection />

      {/* Inquiry Form Section */}
      <InquiryFormSection />

      {/* Footer Section */}
      <Footer />

    </div>
  );
};

export default HomePage;
