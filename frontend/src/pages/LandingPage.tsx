import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const options = [
    { id: 'dashboard', label: '1. Dashboard' },
    { id: 'upload', label: '2. Upload a fresh dataset to analyze' }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % options.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        console.log('Selected:', options[selectedIndex].label);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, options.length]);

  return (
    <div className="landing-container">
      <h1 className="landing-header">
        <span className="cli-prompt">{'>'}</span> FairLens-AI
      </h1>
      <div className="options-container">
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          return (
            <div
              key={option.id}
              className={`option-row ${isSelected ? 'selected' : ''}`}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => console.log('Clicked:', option.label)}
            >
              <span className="option-content">
                {option.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LandingPage;
