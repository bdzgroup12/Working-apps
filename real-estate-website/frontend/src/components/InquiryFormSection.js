import React from 'react';
import './InquiryFormSection.css';

const InquiryFormSection = () => {
  return (
    <section className="inquiry-form-section">
      <div className="inquiry-form-container">
        <h2>Contact Us for More Information</h2>
        <p>Fill out the form below and our team will get back to you promptly.</p>
        <form className="inquiry-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>
          </div>
          <button type="submit" className="submit-inquiry-button">Submit Inquiry</button>
        </form>
      </div>
    </section>
  );
};

export default InquiryFormSection;
