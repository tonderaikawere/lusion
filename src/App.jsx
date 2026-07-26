import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Menu from './components/Menu';
import ParticleBackground from './components/ParticleBackground';
import CustomCursor from './components/CustomCursor';
import FeaturedWorks from './components/FeaturedWorks';
import Services from './components/Services';
import About from './components/About';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import './App.css';

function App() {
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef(null);

  // Play subtle hover UI tick sound using Web Audio API (only if audio is enabled)
  const playTick = () => {
    if (!audioPlaying || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') return;
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
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
        e.target.classList.contains('interactive');
        
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
        masterGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2.0); // Smooth 2s fade-in
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

  return (
    <>
      {/* Show beautiful preloader screen until fully initialized */}
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}

      <CustomCursor />
      
      {/* Three.js interactive physics canvas */}
      <ParticleBackground />

      {/* Main UI layout container */}
      <div className="ui-overlay" style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        <Header 
          menuOpen={menuOpen} 
          setMenuOpen={setMenuOpen} 
          audioPlaying={audioPlaying}
          setAudioPlaying={setAudioPlaying}
        />

        <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <main id="home">
          {/* Hero section */}
          <section className="hero-section">
            <h1 className="hero-heading">
              We design and produce <span>3D visual storytelling</span>, immersive websites, and interactive digital experiences.
            </h1>
            <div className="scroll-indicator">
              Scroll to explore
            </div>
          </section>

          <About />
          <FeaturedWorks />
          <Services />
          <Footer />
        </main>
      </div>
    </>
  );
}

export default App;
