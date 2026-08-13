import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>Experience the best coffee, snacks, and customer service at our cozy cafeteria.</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="#nav1" onClick={(e) => handleLinkClick(e, 'nav1')}>Home</a>
          <a href="#nav2" onClick={(e) => handleLinkClick(e, 'nav2')}>Menu</a>
          <a href="#nav3" onClick={(e) => handleLinkClick(e, 'nav3')}>Offers</a>
          <a href="#nav4" onClick={(e) => handleLinkClick(e, 'nav4')}>Explore</a>
          <a href="#nav5" onClick={(e) => handleLinkClick(e, 'nav5')}>About</a>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: brewtopia@gmail.com</p>
          <p>Phone: +91 6356349549</p>
          <p>Location: 123 Coffee Street, City</p>
        </div>
        <div className="footer-section">
          <h3>Opening Hours</h3>
          <p>Monday - Friday: 8 AM - 10 PM</p>
          <p>Saturday - Sunday: 9 AM - 11 PM</p>
        </div>
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" /></a>
          </div>
          <div className="download-buttons">
            <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" /></a>
            <a href="#"><img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Brewtopia &copy; 2025 Cafeteria. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
