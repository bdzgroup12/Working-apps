import React from 'react';
import { Link } from 'react-router-dom';
import './LatestNewsSection.css';

const LatestNewsSection = () => {
  const articles = [
    {
      img: "https://images.unsplash.com/photo-1501183638714-1f0a64c6ad9b?auto=format&fit=crop&w=400&q=80",
      title: "Market Trends: Spanish Property in 2023",
      description: "Analysis of the current state of the Spanish real estate market and predictions for the future",
      category: "Market Analysis",
      time: "about 21 hours ago",
      link: "/news/market-trends-spanish-property-2023"
    },
    {
      img: "https://images.unsplash.com/photo-1560448070-8a1e0a7a1a0e?auto=format&fit=crop&w=300&q=80",
      title: "Guide to Buying Property in Spain as a Foreigner",
      description: "Everything you need to know about the process, legalities, and costs",
      category: "Guides",
      time: "about 21 hours ago",
      link: "/news/guide-buying-property-spain-foreigner"
    },
    {
      img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=80",
      title: "Top 5 Renovation Tips for Spanish Properties",
      description: "How to modernize traditional Spanish homes while preserving their character",
      category: "Renovations",
      time: "about 21 hours ago",
      link: "/news/top-5-renovation-tips-spanish-properties"
    }
  ];

  return (
    <section className="latest-news-section">
      <h2>Latest News & Insights</h2>
      <p>Stay informed with the latest market trends, legal updates, and investment opportunities</p>
      <div className="news-articles-grid">
        {articles.map((article) => (
          <div key={article.title} className="news-article-card">
            <img src={article.img} alt={article.title} className="news-article-image" />
            <div className="news-article-content">
              <div className="news-article-meta">
                <span className="news-article-time">{article.time}</span> | <span className="news-article-category">{article.category}</span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <Link to={article.link} className="read-article-link">Read Article</Link>
            </div>
          </div>
        ))}
      </div>
      <div className="view-all-articles-container">
        <Link to="/news" className="view-all-articles-button">View All Articles</Link>
      </div>
    </section>
  );
};

export default LatestNewsSection;
