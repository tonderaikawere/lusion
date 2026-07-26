import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Menu from './components/Menu';
import ParticleBackground from './components/ParticleBackground';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import './App.css';

function App() {
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef(null);

  const [theme, setTheme] = useState('light');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [hoveredBg, setHoveredBg] = useState(null);

  // Hook scroll events and update active theme and background color dynamically
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Select section nodes
      const hero = document.getElementById('home-hero');
      const reel = document.getElementById('home-reel');
      const featured = document.getElementById('home-featured');
      const goal = document.getElementById('home-goal');
      const end = document.getElementById('end-section');
      const footer = document.getElementById('footer-section');

      let targetBg = '#ffffff';
      let targetTheme = 'light';

      if (hero && scrollY < hero.offsetHeight - vh * 0.45) {
        targetBg = '#ffffff';
        targetTheme = 'light';
      } else if (reel && scrollY < reel.offsetTop + reel.offsetHeight - vh * 0.45) {
        targetBg = '#0a0a0b';
        targetTheme = 'dark';
      } else if (featured && scrollY < featured.offsetTop + featured.offsetHeight - vh * 0.45) {
        targetBg = hoveredBg || '#0a0a0b';
        targetTheme = 'dark';
      } else if (goal && scrollY < goal.offsetTop + goal.offsetHeight - vh * 0.45) {
        targetBg = '#0a0a0b';
        targetTheme = 'dark';
      } else if (end && scrollY < end.offsetTop + end.offsetHeight - vh * 0.45) {
        targetBg = '#ffffff';
        targetTheme = 'light';
      } else {
        targetBg = '#0a0a0b';
        targetTheme = 'dark';
      }

      setBgColor(targetBg);
      setTheme(targetTheme);

      // Add appropriate class to HTML tag to let general CSS adapt colors smoothly
      if (targetTheme === 'light') {
        document.documentElement.classList.add('is-white-bg');
        document.documentElement.classList.remove('is-black-bg');
      } else {
        document.documentElement.classList.add('is-black-bg');
        document.documentElement.classList.remove('is-white-bg');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hoveredBg]);

  // Play subtle hover UI tick sound using Web Audio API (only if audio is enabled)
  const playTick = () => {
    if (!audioPlaying || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') return;
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.015, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Ignore audio synthesis errors
    }
  };

  // Add global event listeners to synthesize ticks on interactive hover
  useEffect(() => {
    if (!audioPlaying) return;

    const handleMouseOver = (e) => {
      const isInteractive = 
        e.target.tagName === 'A' || 
        e.target.tagName === 'BUTTON' || 
        e.target.closest('a') || 
        e.target.closest('button') ||
        e.target.classList.contains('interactive') ||
        e.target.classList.contains('project-item') ||
        e.target.closest('.project-item');
        
      if (isInteractive) {
        playTick();
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [audioPlaying]);

  // Handle ambient drone synthesis using Web Audio API
  useEffect(() => {
    if (audioPlaying) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        // Master output gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2.0); // Smooth 2s fade-in
        masterGain.connect(ctx.destination);

        // Warm lowpass filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, ctx.currentTime);
        filter.connect(masterGain);

        // Harmonious drone minor frequencies
        const frequencies = [110, 165, 220, 330];
        const oscillators = frequencies.map((freq, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          // Subtle detuning for spatial chorus width
          osc.detune.setValueAtTime((idx - 1.5) * 6, ctx.currentTime);

          // Voice volume levels
          oscGain.gain.setValueAtTime(0.18, ctx.currentTime);

          // Low-frequency oscillator volume modulation
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.06 + idx * 0.02, ctx.currentTime);
          lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);

          lfo.connect(lfoGain.gain);
          oscGain.connect(filter);
          osc.connect(oscGain);

          lfo.start();
          osc.start();

          return { osc, lfo };
        });

        synthNodesRef.current = { masterGain, oscillators, ctx };
      } catch (err) {
        console.warn('Web Audio API blocked or not supported:', err);
      }
    } else {
      // Fade out active synthesizer
      const activeSynth = synthNodesRef.current;
      if (activeSynth) {
        const { masterGain, oscillators, ctx } = activeSynth;
        try {
          masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
          masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6); // smooth fade-out

          setTimeout(() => {
            oscillators.forEach(({ osc, lfo }) => {
              try { osc.stop(); } catch(e){}
              try { lfo.stop(); } catch(e){}
            });
            ctx.close();
          }, 700);
        } catch (e) {
          console.error(e);
        }
        synthNodesRef.current = null;
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (synthNodesRef.current) {
        const { oscillators, ctx } = synthNodesRef.current;
        oscillators.forEach(({ osc, lfo }) => {
          try { osc.stop(); } catch(e){}
          try { lfo.stop(); } catch(e){}
        });
        ctx.close();
      }
    };
  }, [audioPlaying]);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const projects = [
    { id: 'oryzo_ai', title: 'Oryzo AI', tags: 'concept • web • design • development • 3d • animation', bg: '#1a1411', text: '#ffedd7' },
    { id: 'of_the_oak', title: 'Of The Oak', tags: 'web • design • development • 3d • animation', bg: '#111a13', text: '#d9f3de' },
    { id: 'devin_ai', title: 'Devin AI', tags: 'web • design • development • 3d', bg: '#121414', text: '#ffffff' },
    { id: 'porsche_dream_machine', title: 'Porsche: Dream Machine', tags: 'concept • 3D illustration • mograph • video', bg: '#efd5d3', text: '#000000' },
    { id: 'synthetic_human', title: 'Synthetic Human', tags: 'web • design • development • 3d', bg: '#17141f', text: '#ffffff' },
    { id: 'spatial_fusion', title: 'Meta: Spatial Fusion', tags: 'web • design • development • 3d', bg: '#1a1523', text: '#ffffff' },
    { id: 'spaace', title: 'Spaace - NFT Marketplace', tags: 'web • design • development • 3d • web3', bg: '#010a16', text: '#ffece2' },
    { id: 'ddd_2024', title: 'DDD 2024', tags: 'web • design • development • 3d', bg: '#1c152a', text: '#ffffff' },
    { id: 'choo_choo_world', title: 'Choo Choo World', tags: 'concept • web • game design • 3d', bg: '#1a1e26', text: '#ffffff' },
    { id: 'soda_experience', title: 'Soda Experience', tags: 'AR • development • 3d', bg: '#222325', text: '#ffffff' }
  ];

  return (
    <>
      {/* Show preloader screen until fully initialized */}
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}

      <CustomCursor />
      
      {/* Three.js interactive physics canvas */}
      <ParticleBackground theme={theme} bgColor={bgColor} />

      {/* Main UI layout container */}
      <div id="ui" style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        <Header 
          menuOpen={menuOpen} 
          setMenuOpen={setMenuOpen} 
          audioPlaying={audioPlaying}
          setAudioPlaying={setAudioPlaying}
        />

        <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div id="page-container">
          <div id="page-container-inner">
            <div id="home" className="page">
              
              {/* Hero section */}
              <div id="home-hero" className="section">
                <h1 id="home-hero-title" className="interactive-physics-obstacle">
                  We create 3D visual storytelling and interactive web experiences that help brands stand out
                </h1>
                <div id="home-hero-visual-container"></div>
                <div id="home-hero-scroll-container">
                  <div id="home-hero-scroll-container-crosses">
                    <div className="home-hero-scroll-container-cross"></div>
                    <div className="home-hero-scroll-container-cross"></div>
                    <div className="home-hero-scroll-container-cross"></div>
                    <div className="home-hero-scroll-container-cross"></div>
                  </div>
                  <div id="home-hero-scroll">scroll to explore</div>
                </div>
              </div>

              {/* Show Reel section */}
              <div id="home-reel" className="section">
                <h4 id="home-reel-title" className="interactive-physics-obstacle">
                  <div id="home-reel-title-inner">
                    <div id="home-reel-title-line-1">Bold Ideas,</div>
                    <div id="home-reel-title-line-2">Brought to Life</div>
                  </div>
                </h4>
                <div id="home-reel-content">
                  <h2 id="home-reel-desc" className="interactive-physics-obstacle">
                    We combine design, motion, 3D, and development to create digital experiences that feel visually striking and technically seamless. From campaign launches to immersive brand worlds, we build work that captures attention and invites interaction.
                  </h2>
                  <a id="home-reel-cta" href="/about" onClick={(e) => e.preventDefault()}>
                    <span id="home-reel-cta-dot"></span>
                    <span id="home-reel-cta-text">Our Approach</span>
                    <span id="home-reel-cta-arrow">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                        <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.343 8h11.314m0 0L8.673 3.016M13.657 8l-4.984 4.984" />
                      </svg>
                    </span>
                  </a>
                </div>

                <div id="home-reel-thumb-wrapper">
                  <div id="home-reel-thumb"></div>
                </div>

                <div id="home-reel-container">
                  <div id="home-reel-container-inner">
                    <div id="home-reel-video-container">
                      <div id="home-reel-video-container-decoration">
                        <div id="home-reel-video-container-top">
                          <div id="home-reel-video-container-crosses">
                            <div className="home-reel-video-container-cross"></div>
                            <div className="home-reel-video-container-cross"></div>
                            <div className="home-reel-video-container-cross"></div>
                            <div className="home-reel-video-container-cross"></div>
                            <div className="home-reel-video-container-cross"></div>
                          </div>
                          <div className="home-reel-video-container-svgs">
                            <div className="home-reel-video-container-svg-wrapper">
                              <div style={{ color: '#fff', fontSize: '10px', letterSpacing: '1px', opacity: 0.3 }}>LUSION SYSTEM OK</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div id="home-reel-video-placeholder">
                        <div id="home-reel-video-title">Play Reel</div>
                      </div>
                      <button id="home-reel-video-watch-btn" aria-label="Watch reel button">
                        <div id="home-reel-video-watch-btn-base"></div>
                        <div id="home-reel-video-watch-btn-background"></div>
                        <svg id="home-reel-video-watch-btn-svg" xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 36 36">
                          <path fill="currentColor" d="M7 7.29c0-1.5 1.59-2.466 2.92-1.776l20.656 10.71c1.439.747 1.439 2.805 0 3.552L9.92 30.486C8.589 31.176 7 30.21 7 28.71V7.29Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Work section */}
              <div id="home-featured" className="section">
                <div id="home-featured-title-top">
                  <div id="home-featured-title-wrapper">
                    <h4 id="home-featured-title" className="interactive-physics-obstacle">Featured Work</h4>
                  </div>
                  <div id="home-featured-disclaimer">
                    A selection of immersive digital experiences created for ambitious brands and forward thinking teams.
                  </div>
                </div>

                <div className="project-list">
                  {projects.map((proj, index) => (
                    <a 
                      key={index}
                      className={`project-item project-type-website`}
                      href={`https://lusion.co/project/${proj.id}`}
                      target="_blank"
                      rel="noreferrer"
                      data-id={proj.id}
                      data-color-bg={proj.bg}
                      data-color-text={proj.text}
                      onMouseEnter={() => setHoveredBg(proj.bg)}
                      onMouseLeave={() => setHoveredBg(null)}
                    >
                      <div className="project-item-main">
                        <div className="project-item-image" style={{ background: `linear-gradient(135deg, ${proj.bg}bb 0%, #0a0a0b 100%)` }}>
                          <div className="card-wireframe">
                            <div className="line-h"></div>
                            <div className="line-v"></div>
                            <div className="circle-node"></div>
                          </div>
                        </div>
                      </div>
                      <div className="project-item-footer">
                        <div className="project-item-line-1">{proj.tags}</div>
                        <div className="project-item-line-2">
                          <div className="project-item-line-2-icon"></div>
                          <div className="project-item-line-2-inner">{proj.title}</div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                <a id="home-featured-cta" href="https://lusion.co/projects" target="_blank" rel="noreferrer">
                  <span id="home-featured-cta-dot"></span>
                  <span id="home-featured-cta-text">See all projects</span>
                  <span id="home-featured-cta-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.343 8h11.314m0 0L8.673 3.016M13.657 8l-4.984 4.984" />
                    </svg>
                  </span>
                </a>
              </div>

              {/* Goal / Philosophy section */}
              <div id="home-goal" className="section">
                <div id="home-goal-context">
                  <div id="home-goal-context-inner">
                    <div id="home-goal-title" className="interactive-physics-obstacle">Where Creative Ideas Become Immersive Experiences</div>
                    <div id="home-goal-texts">
                      <div className="home-goal-texts-paragraph">
                        We do not chase trends or produce work that looks like everyone else. We focus on creating visually distinctive digital experiences that reflect your brand, engage your audience, and make people remember what they saw.
                      </div>
                      <div className="home-goal-texts-paragraph">
                        Our process blends creative direction, 3D craft, and interactive development to build tailored digital journeys that feel original, polished, and built for impact.
                      </div>
                    </div>
                  </div>
                </div>

                <div id="home-goal-tunnel-title" className="interactive-physics-obstacle">
                  <div className="home-goal-tunnel-title-line">Step into a new world</div>
                  <div className="home-goal-tunnel-title-line">and let your</div>
                  <div className="home-goal-tunnel-title-line">imagination run wild</div>
                </div>

                <div id="home-goal-image-in-outer">
                  <div id="home-goal-image-in-inner">
                    <div id="home-goal-image-in"></div>
                  </div>
                </div>
                <div id="home-goal-image-out-outer">
                  <div id="home-goal-image-out-inner">
                    <div id="home-goal-image-out"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Extra Sections & Footer */}
        <div id="page-extra-sections">
          <div id="end-section" className="section">
            <div id="end-section-outer">
              <div id="end-section-inner">
                <div id="end-section-content">
                  <div id="end-section-content-crosses">
                    <div className="end-section-content-cross"></div>
                    <div className="end-section-content-cross"></div>
                    <div className="end-section-content-cross"></div>
                    <div className="end-section-content-cross"></div>
                    <div className="end-section-content-cross"></div>
                  </div>
                  <div id="end-section-subtitle">
                    <div id="end-section-subtitle-text" className="interactive-physics-obstacle">Is Your Big Idea Ready to Go Wild?</div>
                  </div>
                  <div id="end-section-title">
                    <a id="end-section-title-link" className="interactive-physics-obstacle" href="mailto:hello@lusion.co">
                      Let's work <br /> together!
                    </a>
                    <span id="end-section-title-top-decoration"></span>
                    <span id="end-section-title-bottom-left-decoration"></span>
                    <span id="end-section-title-bottom-right-decoration"></span>
                  </div>
                </div>
                
                <div id="end-bottom">
                  <div className="end-bottom-arrow-container">
                    <div className="end-bottom-arrow"></div>
                    <div className="end-bottom-arrow"></div>
                  </div>
                  <div id="end-bottom-text-container">
                    <div id="end-bottom-text">CONTINUE TO SCROLL</div>
                    <div id="end-bottom-text">CONTINUE TO SCROLL</div>
                  </div>
                  <div className="end-bottom-arrow-container">
                    <div className="end-bottom-arrow"></div>
                    <div className="end-bottom-arrow"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div id="footer-section" className="section">
            <div id="footer-bg"></div>
            <div id="footer-top"></div>
            
            <div id="footer-middle">
              <div id="footer-middle-contact">
                <a id="footer-contact-address" className="interactive-physics-obstacle" href="https://goo.gl/maps/x9evc1NxZocjrM947" target="_blank" rel="noreferrer">
                  <div className="footer-address-line">Suite 2</div>
                  <div className="footer-address-line">9 Marsh Street</div>
                  <div className="footer-address-line">Bristol, BS1 4AA</div>
                  <div className="footer-address-line">United Kingdom</div>
                </a>

                <div id="footer-contact-socials">
                  <a className="footer-socials-line" href="https://twitter.com/lusionltd/" target="_blank" rel="noreferrer">
                    <svg className="footer-socials-line-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path fill="currentColor" fillRule="evenodd" d="M6.948 18.113a.75.75 0 0 1-1.06-1.06l9.885-9.886H8.65a.75.75 0 1 1 0-1.5h9.682v9.682a.75.75 0 0 1-1.5 0v-7.12l-9.884 9.884Z" clip-rule="evenodd" />
                    </svg>
                    <span className="footer-socials-text">Twitter / X</span>
                  </a>
                  <a className="footer-socials-line" href="https://www.instagram.com/lusionltd/" target="_blank" rel="noreferrer">
                    <svg className="footer-socials-line-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path fill="currentColor" fillRule="evenodd" d="M6.948 18.113a.75.75 0 0 1-1.06-1.06l9.885-9.886H8.65a.75.75 0 1 1 0-1.5h9.682v9.682a.75.75 0 0 1-1.5 0v-7.12l-9.884 9.884Z" clip-rule="evenodd" />
                    </svg>
                    <span className="footer-socials-text">Instagram</span>
                  </a>
                  <a className="footer-socials-line" href="https://www.linkedin.com/company/lusionltd/" target="_blank" rel="noreferrer">
                    <svg className="footer-socials-line-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path fill="currentColor" fillRule="evenodd" d="M6.948 18.113a.75.75 0 0 1-1.06-1.06l9.885-9.886H8.65a.75.75 0 1 1 0-1.5h9.682v9.682a.75.75 0 0 1-1.5 0v-7.12l-9.884 9.884Z" clip-rule="evenodd" />
                    </svg>
                    <span className="footer-socials-text">Linkedin</span>
                  </a>
                </div>

                <div id="footer-contact-enquires">
                  <div id="footer-enquires-header">General enquiries</div>
                  <a id="footer-enquires-link" className="interactive-physics-obstacle" href="mailto:hello@lusion.co">hello@lusion.co</a>
                </div>

                <div id="footer-contact-business">
                  <div id="footer-business-header">New business</div>
                  <a id="footer-business-link" className="interactive-physics-obstacle" href="mailto:business@lusion.co">business@lusion.co</a>
                </div>
              </div>

              <div id="footer-middle-newsletter">
                <div id="footer-newsletter-header">
                  <span className="footer-newsletter-line">Subscribe to</span>
                  <span className="footer-newsletter-line">our newsletter</span>
                </div>
                <div id="footer-newsletter-input">
                  <div id="footer-newsletter-bg"></div>
                  <form id="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                    <input id="footer-newsletter-input-field" type="email" name="EMAIL" autoComplete="email" placeholder="Your email" />
                    <button type="submit" id="footer-newsletter-input-arrow" aria-label="Send newsletter form button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.9999 11.9998C1.9999 12.552 2.44762 12.9997 2.9999 12.9997H18.9757C18.8901 13.148 18.7838 13.2876 18.657 13.4144L12.2931 19.7784C11.9025 20.1689 11.9025 20.8021 12.2931 21.1926C12.6836 21.5831 13.3168 21.5831 13.7073 21.1926L22.1926 12.7073C22.5831 12.3168 22.5831 11.6836 22.1926 11.2931L22.1924 11.293L13.7071 2.80767C13.3166 2.41715 12.6834 2.41715 12.2929 2.80767C11.9024 3.1982 11.9024 3.83136 12.2929 4.22189L18.657 10.586C18.7836 10.7126 18.8896 10.8518 18.9752 10.9998H2.9999C2.44762 10.9997 1.9999 11.4475 1.9999 11.9998Z" fill="currentColor" />
                      </svg>
                    </button>
                  </form>
                  <div id="footer-newsletter-feedback-message"></div>
                </div>
              </div>
            </div>

            <div id="footer-bottom">
              <div id="footer-bottom-copyright">©2026 LUSION Creative Studio</div>
              <a id="footer-bottom-labs" href="https://labs.lusion.co" target="_blank" rel="noreferrer"> R&D: labs.lusion.co</a>
              <div id="footer-bottom-tagline">Built by Lusion with ❤️</div>
              <button id="footer-bottom-up" onClick={handleBackToTop} aria-label="Scroll back to top button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path fill="#fff" fillRule="evenodd" d="M12 22a1 1 0 0 1-1-1V5.857l-6.223 6.224a1 1 0 0 1-1.415-1.415l7.9-7.9a1 1 0 0 1 1.414 0v.001l7.9 7.9a1 1 0 0 1-1.414 1.414L13 5.919V21a1 1 0 0 1-1 1Z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path fill="#fff" fillRule="evenodd" d="M12 22a1 1 0 0 1-1-1V5.857l-6.223 6.224a1 1 0 0 1-1.415-1.415l7.9-7.9a1 1 0 0 1 1.414 0v.001l7.9 7.9a1 1 0 0 1-1.414 1.414L13 5.919V21a1 1 0 0 1-1 1Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scroll Nav Section */}
          <div id="scroll-nav-section" className="section" data-path="/about">
            <div id="scroll-nav-content">
              <div id="scroll-nav-subtitle">Keep Scrolling<br />to Learn More</div>
              <div id="scroll-nav-main">
                <div id="scroll-nav-text">About Us</div>
                <div id="scroll-nav-next">
                  <div id="scroll-nav-next-text">Next Page</div>
                  <div id="scroll-nav-next-bar">
                    <div id="scroll-nav-next-bar-inner"></div>
                  </div>
                  <div id="scroll-nav-next-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M1.9999 11.9998C1.9999 12.552 2.44762 12.9997 2.9999 12.9997H18.9757C18.8901 13.148 18.7838 13.2876 18.657 13.4144L12.2931 19.7784C11.9025 20.1689 11.9025 20.8021 12.2931 21.1926C12.6836 21.5831 13.3168 21.5831 13.7073 21.1926L22.1926 12.7073C22.5831 12.3168 22.5831 11.6836 22.1926 11.2931L22.1924 11.293L13.7071 2.80767C13.3166 2.41715 12.6834 2.41715 12.2929 2.80767C11.9024 3.1982 11.9024 3.83136 12.2929 4.22189L18.657 10.586C18.7836 10.7126 18.8896 10.8518 18.9752 10.9998H2.9999C2.44762 10.9997 1.9999 11.4475 1.9999 11.9998Z" fill="#fff" />
                    </svg>
                  </div>
                </div>
              </div>
              <div id="scroll-nav-cross-line">
                <div className="scroll-nav-cross"></div>
                <div className="scroll-nav-cross"></div>
                <div className="scroll-nav-cross"></div>
                <div className="scroll-nav-cross"></div>
                <div className="scroll-nav-cross"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    );
  }

  export default App;
