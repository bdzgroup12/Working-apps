import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import './News.css';

const News = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/news`);
        setArticles(response.data);
      } catch (error) {
        console.error('Error fetching news articles:', error);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="news">
      <h2>News and Blog</h2>
      <div className="articles-grid">
        {articles.map((article) => (
          <div key={article.id} className="article-card">
            <img src={article.image} alt={article.title} className="article-image" />
            <h3>{article.title}</h3>
            <p>Category: {article.category}</p>
            <p>{article.summary}</p>
            <a href={article.link} className="read-article-link">Read Article</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
