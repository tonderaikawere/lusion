import React from 'react';

const Menu = ({ isOpen, setIsOpen }) => {
  const links = [
    { label: 'Home', target: '#home' },
    { label: 'Works', target: '#works' },
    { label: 'Services', target: '#services' },
    { label: 'About', target: '#about' },
    { label: 'Contact', target: '#contact' },
  ];

  const handleLinkClick = (e, target) => {
    e.preventDefault();
    setIsOpen(false);
    
    const element = document.querySelector(target);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      }, 500); // Wait for menu close transition
    }
  };

  return (
    <div className={`menu-overlay ${isOpen ? 'open' : ''}`}>
      <nav className="menu-nav">
        {links.map((link, index) => (
          <a 
            key={index} 
            href={link.target} 
            className="menu-link" 
            onClick={(e) => handleLinkClick(e, link.target)}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default Menu;
