import React from 'react';
import { Link } from 'react-router-dom';
import './FeaturedAgenciesSection.css';

const FeaturedAgenciesSection = () => {
  const agencies = [
    {
      img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=80&q=80",
      name: "Sunshine Properties",
      subtitle: "Luxury Properties",
      description: "Premier real estate agency specializing in luxury beachfront properties",
      tags: ["Luxury", "Professional", "Multilingual"],
      listings: "0+ Listings",
      viewLink: "/agencies/sunshine-properties"
    },
    {
      img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=80&q=80",
      name: "Mediterranean Homes",
      subtitle: "Family Homes",
      description: "Expert agency focusing on family homes and investment opportunities",
      tags: ["Investment", "Reliable", "English-Speaking"],
      listings: "0+ Listings",
      viewLink: "/agencies/mediterranean-homes"
    },
    {
      img: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=80&q=80",
      name: "Spanish Life Realty",
      subtitle: "Traditional Properties",
      description: "Specialists in authentic Spanish properties with a focus on local lifestyle",
      tags: ["Traditional", "Cultural", "Experience"],
      listings: "0+ Listings",
      viewLink: "/agencies/spanish-life-realty"
    }
  ];

  return (
    <section className="featured-agencies-section">
      <h2>Featured Agencies</h2>
      <p>Partner with Spain's leading real estate agencies for exceptional service and expertise</p>
      <div className="agencies-cards">
        {agencies.map((agency) => (
          <div key={agency.name} className="agency-card">
            <img src={agency.img} alt={agency.name} className="agency-image" />
            <div className="agency-info">
              <h3>{agency.name}</h3>
              <h4>{agency.subtitle}</h4>
              <p>{agency.description}</p>
              <div className="agency-tags">
                {agency.tags.map((tag) => (
                  <span key={tag} className="agency-tag">{tag}</span>
                ))}
              </div>
              <div className="agency-footer">
                <Link to="#" className="listings-link">{agency.listings}</Link>
                <Link to={agency.viewLink} className="view-agency-link">View Agency</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="view-all-agencies-container">
        <Link to="/agencies" className="view-all-agencies-button">View All Agencies</Link>
      </div>
    </section>
  );
};

export default FeaturedAgenciesSection;
