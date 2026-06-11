import React from 'react';
import './Loader.css';

const Loader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
      </div>
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default Loader;
