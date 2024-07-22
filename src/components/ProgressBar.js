import React from 'react';
import '../styles/ProgressBar.css';

const ProgressBar = () => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div className="progress-bar-fill"></div>
      </div>
    </div>
  );
};

export default ProgressBar;
