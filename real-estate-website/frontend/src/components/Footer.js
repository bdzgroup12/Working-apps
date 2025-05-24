import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-about">
          <h2><span className="logo-blue">Spain</span><span className="logo-red">Undiscovered</span></h2>
          <p>Revealing Spain's hidden treasures - from exclusive real estate to authentic experiences in the country's most enchanting regions and undiscovered corners.</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-icon facebook">F</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon instagram">I</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-icon linkedin">L</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-icon youtube">Y</a>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/properties">Properties</Link></li>
              <li><Link to="/regions">Regions</Link></li>
              <li><Link to="/agencies">Agencies</Link></li>
              <li><Link to="/news">News</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Popular Regions</h3>
            <ul>
              <li>Costa del Sol</li>
              <li>Balearic Islands</li>
              <li>Costa Blanca</li>
              <li>Canary Islands</li>
              <li>Madrid</li>
              <li>Barcelona</li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Resources</h3>
            <ul>
              <li>Buyer's Guide</li>
              <li>Seller's Guide</li>
              <li>Mortgage Calculator</li>
              <li>Golden Visa Information</li>
              <li>Tax Guides</li>
              <li>Relocation Services</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Spain Undiscovered. All rights reserved.</p>
        <div className="footer-policies">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
          <Link to="/cookie-policy">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
