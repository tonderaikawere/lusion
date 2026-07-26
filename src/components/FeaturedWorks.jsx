import React from 'react';

const FeaturedWorks = () => {
  const works = [
    {
      title: 'Oryzo AI',
      category: 'Satirical AI Device Design & 3D WebGL Launch',
      gradient: 'linear-gradient(135deg, #1b161f 0%, #0c080e 100%)',
      glow: '#aa3bff',
      link: 'https://lusion.co/project/oryzo-ai'
    },
    {
      title: 'Porsche: Dream Machine',
      category: 'CG Short Film & Interactive Virtual Showroom',
      gradient: 'linear-gradient(135deg, #182a24 0%, #0a110f 100%)',
      glow: '#10b981',
      link: 'https://lusion.co/project/porsche-dream-machine'
    },
    {
      title: 'Devin AI',
      category: 'Interactive Brand Release & Virtual Visuals',
      gradient: 'linear-gradient(135deg, #1a2332 0%, #080d14 100%)',
      glow: '#3b82f6',
      link: 'https://lusion.co/project/devin-ai'
    },
    {
      title: 'Synthetic Human',
      category: 'Generative Real-time 3D Particle Character',
      gradient: 'linear-gradient(135deg, #2d1e1e 0%, #140d0d 100%)',
      glow: '#ef4444',
      link: 'https://lusion.co/project/synthetic-human'
    },
    {
      title: 'DDD 2024 Showcase',
      category: 'Dynamic Motion Typographic Exhibition',
      gradient: 'linear-gradient(135deg, #242217 0%, #0f0e0a 100%)',
      glow: '#eab308',
      link: 'https://lusion.co/project/ddd-24'
    },
    {
      title: 'Spaace Marketplace',
      category: 'NFT Immersive Platform & WebGL Art Direction',
      gradient: 'linear-gradient(135deg, #1c2626 0%, #0a0e0e 100%)',
      glow: '#06b6d4',
      link: 'https://lusion.co/project/spaace'
    }
  ];

  return (
    <section id="works" className="works-section">
      <div className="section-header">
        <span className="section-label">Selected Works</span>
        <h2>Creating technically inventive digital experiences</h2>
      </div>

      <div className="works-grid">
        {works.map((work, index) => (
          <a 
            key={index} 
            href={work.link} 
            target="_blank" 
            rel="noreferrer" 
            className="work-card"
          >
            <div className="work-image-container">
              <div 
                className="work-image-placeholder"
                style={{ 
                  background: work.gradient,
                  boxShadow: `inset 0 0 80px rgba(0,0,0,0.9)`
                }}
              >
                <div 
                  className="work-card-glow"
                  style={{
                    backgroundColor: work.glow,
                  }}
                />
                
                {/* Decorative Tech Wireframe Lines inside the card */}
                <div className="card-wireframe">
                  <div className="line-h"></div>
                  <div className="line-v"></div>
                  <div className="circle-node" style={{ borderColor: work.glow }}></div>
                </div>

                <div className="card-hover-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </div>
              </div>
            </div>
            <div className="work-info">
              <span className="work-title">{work.title}</span>
              <span className="work-category">{work.category}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default FeaturedWorks;
