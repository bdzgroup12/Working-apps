import React from 'react';
import { Link } from 'react-router-dom';
import './FindYourDreamHomeSection.css';

const propertyCategories = [
  {
    title: "Beachfront Villas",
    description: "Luxurious villas with direct access to beautiful Spanish beaches",
    exploreLink: "/properties?category=beachfront-villas",
    img: "https://images.unsplash.com/photo-1501183638714-1f0a64c6ad9b?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "City Apartments",
    description: "Modern apartments in vibrant Spanish cities and towns",
    exploreLink: "/properties?category=city-apartments",
    img: "https://images.unsplash.com/photo-1560448070-8a1e0a7a1a0e?auto=format&fit=crop&w=300&q=80"
  },
  {
    title: "Rural Fincas",
    description: "Traditional Spanish countryside properties with land and privacy",
    exploreLink: "/properties?category=rural-fincas",
    img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=80"
  },
  {
    title: "Investment Properties",
    description: "Properties with excellent rental potential and investment returns",
    exploreLink: "/properties?category=investment-properties",
    img: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=300&q=80"
  }
];

const FindYourDreamHomeSection = () => {
  return (
    <section className="find-your-dream-home">
      <h2>Find Your Ideal Property</h2>
      <p>Browse our exclusive selection of properties by category</p>
      <div className="property-cards">
        {propertyCategories.map((property) => (
          <div key={property.title} className="property-card">
            <img src={property.img} alt={property.title} className="property-image" />
            <div className="property-content">
              <h3>{property.title}</h3>
              <p>{property.description}</p>
              <Link to={property.exploreLink} className="explore-link">
                Explore {property.title} Properties {'>'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FindYourDreamHomeSection;
