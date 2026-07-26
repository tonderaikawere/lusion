import React from 'react';

const Menu = ({ isOpen, setIsOpen }) => {
  const links = [
    { label: 'Home', page: 'home', href: '/' },
    { label: 'About us', page: 'about', href: '/about' },
    { label: 'Projects', page: 'projects', href: '/projects' },
  ];

  const handleLinkClick = (e, target) => {
    if (target === 'contact') {
      e.preventDefault();
      setIsOpen(false);
      const element = document.querySelector('#footer-section');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    } else {
      // Direct navigation or custom handle
      setIsOpen(false);
    }
  };

  return (
    <div id="header-menu" className={isOpen ? 'open' : ''}>
      <div id="header-menu-links">
        {links.map((link, index) => (
          <a 
            key={index}
            className="header-menu-link" 
            data-page={link.page} 
            href={link.href}
            onClick={(e) => handleLinkClick(e, link.page)}
          >
            <div className="header-menu-link-background"></div>
            <div className="header-menu-link-inner">
              <span className="header-menu-link-text">{link.label}</span>
              <span className="header-menu-link-text-clone">{link.label}</span>
              <svg className="header-menu-link-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.515 12h16.97m0 0L13.01 4.525M20.485 12l-7.475 7.476" />
              </svg>
            </div>
          </a>
        ))}

        <button 
          className="header-menu-link" 
          data-scroll-to="contact"
          onClick={(e) => handleLinkClick(e, 'contact')}
        >
          <div className="header-menu-link-background"></div>
          <div className="header-menu-link-inner">
            <span className="header-menu-link-text">Contact</span>
            <span className="header-menu-link-text-clone">Contact</span>
            <svg className="header-menu-link-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.515 12h16.97m0 0L13.01 4.525M20.485 12l-7.475 7.476" />
            </svg>
          </div>
        </button>
      </div>

      <div id="header-menu-newsletter">
        <h3 id="header-menu-newsletter-title">
          <div className="header-menu-newsletter-title-line">Subscribe to</div>
          <div className="header-menu-newsletter-title-line">our newsletter</div>
        </h3>
        <div id="header-menu-newsletter-input">
          <div id="header-menu-newsletter-input-bg"></div>
          <form id="header-menu-newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input id="header-menu-newsletter-input-field" type="email" name="EMAIL" autoComplete="email" placeholder="Your email" />
            <button type="submit" id="header-menu-newsletter-input-arrow" aria-label="Submit button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" d="M4.11 12.75a.75.75 0 0 1 0-1.5h13.978l-5.036-5.036a.75.75 0 1 1 1.06-1.06l6.316 6.315.53.53-.53.53-6.316 6.317a.75.75 0 0 1-1.06-1.061l5.035-5.035H4.109Z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
          <div id="header-menu-newsletter-feedback-message"></div>
        </div>
      </div>

      <button id="header-menu-talk">
        <a href="mailto:hello@lusion.co"></a>
        <div id="header-menu-text">Let's talk</div>
        <svg id="header-menu-talk-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path fill="#fff" d="M0 0h24v24H0z" />
          <rect width="18" height="18" x="3" y="3" stroke="#000" strokeWidth="1.5" rx="2" />
          <rect width="12" height="4" x="6" y="14" fill="#000" rx="2" />
          <path stroke="#000" strokeLinecap="round" strokeWidth="1.5" d="M7 7h10M7 10h10" />
        </svg>
      </button>

      <a id="header-menu-labs" target="_blank" rel="noreferrer" href="https://labs.lusion.co/">
        <div id="header-menu-labs-inner">
          <div id="header-menu-labs-lucy">
            <svg id="header-menu-labs-lucy-svg" xmlns="http://www.w3.org/2000/svg" width="28" height="38" fill="none" viewBox="0 0 28 38">
              <path stroke="#fff" strokeWidth="5" d="M20.128 29.65C18.584 31.217 16.532 32 13.972 32c-2.56 0-4.612-.783-6.156-2.35C6.272 28.05 5.5 26 5.5 23.5c0-2.5.772-4.533 2.316-6.1 1.544-1.6 3.596-2.4 6.156-2.4 2.56 0 4.612.8 6.156 2.4C21.71 18.967 22.5 21 22.5 23.5c0 2.5-.79 4.55-2.372 6.15Z" />
              <path fill="#fff" d="M23.5 4.25a3.25 3.25 0 1 0-6.5 0 3.25 3.25 0 0 0 6.5 0ZM11 4.25a3.25 3.25 0 1 0-6.5 0 3.25 3.25 0 0 0 6.5 0Z" />
            </svg>
          </div>
          <div id="header-menu-labs-texts">
            <div id="header-menu-labs-text">Labs</div>
            <div id="header-menu-labs-text-clone">Labs</div>
          </div>
          <svg id="header-menu-labs-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 20 20 4m0 0v14.096M20 4H5.904" />
          </svg>
          <svg id="header-menu-labs-arrow2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 20 20 4m0 0v14.096M20 4H5.904" />
          </svg>
        </div>
      </a>
    </div>
  );
};

export default Menu;
