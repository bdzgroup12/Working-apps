import React from 'react';
import './ClientSuccessStoriesSection.css';

const ClientSuccessStoriesSection = () => {
  const stories = [
    {
      quote: "I found my dream villa on Costa del Sol through Spain Undiscovered. The process was smooth, and their local expertise was invaluable. Highly recommended!",
      name: "James Wilson",
      country: "United Kingdom",
      img: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: "As a first-time buyer in Spain, I was nervous about the process, but the team guided me through every step. My apartment in Costa Blanca exceeded my expectations.",
      name: "Maria Schmidt",
      country: "Germany",
      img: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      quote: "After searching for months, Spain Undiscovered helped me find the perfect investment property. Their knowledge of the different regions made all the difference.",
      name: "Pierre Dupont",
      country: "France",
      img: "https://randomuser.me/api/portraits/men/65.jpg"
    }
  ];

  return (
    <section className="client-success-stories-section">
      <h2>Client Success Stories</h2>
      <p>Hear from buyers and sellers who found their perfect Spanish property match</p>
      <div className="stories-cards">
        {stories.map((story, index) => (
          <div key={index} className="story-card">
            <div className="quote-mark">“</div>
            <p className="quote-text">{story.quote}</p>
            <div className="client-info">
              <img src={story.img} alt={story.name} className="client-photo" />
              <div>
                <h4 className="client-name">{story.name}</h4>
                <p className="client-country">{story.country}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ClientSuccessStoriesSection;
