import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import './Testimonials.css';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/testimonials`);
        setTestimonials(response.data);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="testimonials">
      <h2>User Testimonials</h2>
      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <img src={testimonial.image} alt={testimonial.name} className="testimonial-image" />
            <blockquote>"{testimonial.quote}"</blockquote>
            <p>- {testimonial.name}, {testimonial.country}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
