import React from 'react';
import './Loader.css';

const Loader = ({ text = "Generating" }: { text?: string }) => {
  // If the text is shorter than 10 letters, we pad or just map over it.
  const letters = Array.from(text);

  return (
    <div className="loader-container">
      <div className="loader-wrapper">
        {letters.map((letter, index) => (
          <span 
            key={index} 
            className="loader-letter" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {letter}
          </span>
        ))}
        <div className="loader" />
      </div>
    </div>
  );
};

export default Loader;
