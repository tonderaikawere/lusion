import React, { useEffect, useState } from 'react';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const duration = 2500; // 2.5s load time
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      const nextProgress = Math.min(Math.round((stepCount / steps) * 100), 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setExit(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 800); // Wait for exit animation
        }, 300);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`preloader-overlay ${exit ? 'exit' : ''}`}>
      <div className="preloader-content">
        <h1 className="preloader-logo">
          {"LUSION".split("").map((letter, idx) => (
            <span 
              key={idx} 
              style={{ animationDelay: `${idx * 0.15}s` }}
              className="preloader-letter"
            >
              {letter}
            </span>
          ))}
        </h1>
        <div className="preloader-progress-container">
          <div 
            className="preloader-progress-bar" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="preloader-percentage">{progress}%</div>
      </div>
    </div>
  );
};

export default Preloader;
