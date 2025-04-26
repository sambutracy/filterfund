import React from 'react';
// No need to import CSS module when using global.css
interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="progressContainer">
      <div 
        className={`progressBar progress-${clampedProgress}`}
        role="progressbar"
        aria-label={`${clampedProgress}% complete`}
      ></div>
    </div>
  );
};

export default ProgressBar;