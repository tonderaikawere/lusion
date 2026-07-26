import React from 'react';

const Footer = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-main">
        <p className="contact-label interactive-physics-obstacle">Let's collaborate</p>
        <a href="mailto:hello@lusion.co" className="contact-email interactive-physics-obstacle">
          hello@lusion.co
        </a>
      </div>

      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Lusion. All rights reserved.</span>
        <div className="footer-socials">
          <a href="https://twitter.com/lusionltd" target="_blank" rel="noreferrer" className="social-link">Twitter</a>
          <a href="https://instagram.com/lusion.co" target="_blank" rel="noreferrer" className="social-link">Instagram</a>
          <a href="https://linkedin.com/company/lusionltd" target="_blank" rel="noreferrer" className="social-link">LinkedIn</a>
        </div>
      </div>
    </section>
  );
};

export default Footer;
