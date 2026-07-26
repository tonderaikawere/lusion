import React from 'react';

const Services = () => {
  const items = [
    {
      title: 'Creative Direction',
      desc: 'Defining unified brand stories through conceptual thinking, art direction, and meticulous graphic design standards.'
    },
    {
      title: '3D & WebGL Development',
      desc: 'Building immersive real-time 3D experiences, particle dynamics, and custom vertex shaders using Three.js and custom GLSL code.'
    },
    {
      title: 'Creative Frontend Engineering',
      desc: 'Coding high-performance frontend interfaces with ultra-smooth scroll timelines, GSAP micro-animations, and fluid transitions.'
    },
    {
      title: 'Creative Technology',
      desc: 'Fusing hardware, sensors, and interactive audio with real-time browser dynamics to deliver cinematic installations.'
    }
  ];

  return (
    <section id="services" className="services-section">
      <h2 className="interactive-physics-obstacle">Capabilities</h2>
      <div className="services-list">
        {items.map((item, index) => (
          <div key={index} className="service-item">
            <span className="service-title">{item.title}</span>
            <p className="service-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
