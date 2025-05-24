import React from 'react';
import { Link } from 'react-router-dom';
import './ExploreDestinationsSection.css';

const ExploreDestinationsSection = () => {
  const destinations = [
    {
      img: "https://images.unsplash.com/photo-1501183638714-1f0a64c6ad9b?auto=format&fit=crop&w=400&q=80",
      title: "Ultimate Guide to Marbella",
      description: "Discover the luxury and beauty of Marbella on the Costa del Sol",
      link: "/destinations/marbella"
    },
    {
      img: "https://images.unsplash.com/photo-1560448070-8a1e0a7a1a0e?auto=format&fit=crop&w=300&q=80",
      title: "Exploring Malaga City",
      description: "The cultural capital of Costa del Sol with rich history and vibrant arts scene",
      link: "/destinations/malaga"
    },
    {
      img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=80",
      title: "Hidden Gems of Estepona",
      description: "Discover the charming coastal town with authentic Spanish character",
      link: "/destinations/estepona"
    },
    {
      img: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=300&q=80",
      title: "Alicante City Insider Guide",
      description: "Explore the vibrant capital of Costa Blanca with its beaches and historic sites",
      link: "/destinations/alicante"
    },
    {
      img: "https://images.unsplash.com/photo-1501183638714-1f0a64c6ad9b?auto=format&fit=crop&w=400&q=80",
      title: "Benidorm Beyond the Beaches",
      description: "There is more to Benidorm than just its famous sandy shores",
      link: "/destinations/benidorm"
    },
    {
      img: "https://images.unsplash.com/photo-1560448070-8a1e0a7a1a0e?auto=format&fit=crop&w=300&q=80",
      title: "Javea: The Jewel of Costa Blanca",
      description: "Discover this authentic Spanish town with spectacular scenery",
      link: "/destinations/javea"
    },
    {
      img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=80",
      title: "Cadaqués and Salvador Dalí Legacy",
      description: "Explore the whitewashed town that inspired the famous surrealist artist",
      link: "/destinations/cadaques"
    },
    {
      img: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=300&q=80",
      title: "Tossa de Mar: Medieval Beauty",
      description: "Discover the only fortified medieval town still standing on the Catalan coast",
      link: "/destinations/tossa-de-mar"
    },
    {
      img: "https://images.unsplash.com/photo-1501183638714-1f0a64c6ad9b?auto=format&fit=crop&w=400&q=80",
      title: "Girona: Gateway to Costa Brava",
      description: "The historic city with colorful houses and rich Jewish heritage",
      link: "/destinations/girona"
    },
    {
      img: "https://images.unsplash.com/photo-1560448070-8a1e0a7a1a0e?auto=format&fit=crop&w=300&q=80",
      title: "Seville: Heart of Andalusia",
      description: "Experience the passionate soul of southern Spain in this historic city",
      link: "/destinations/seville"
    },
    {
      img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=80",
      title: "Granada and the Majestic Alhambra",
      description: "Discover the Moorish jewel of Andalusia with its spectacular palace complex",
      link: "/destinations/granada"
    },
    {
      img: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=300&q=80",
      title: "White Villages of Andalusia",
      description: "Journey through the picturesque pueblos blancos nestled in the mountains",
      link: "/destinations/white-villages"
    }
  ];

  return (
    <section className="explore-destinations-section">
      <h2>Explore Spanish Destinations</h2>
      <p>Discover the lifestyle, culture, and attractions of Spain's most beautiful regions</p>
      <div className="destinations-grid">
        {destinations.map((dest) => (
          <div key={dest.title} className="destination-card">
            <img src={dest.img} alt={dest.title} className="destination-image" />
            <h3>{dest.title}</h3>
            <p>{dest.description}</p>
            <Link to={dest.link} className="read-city-guide-link">Read City Guide {'>'}</Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExploreDestinationsSection;
