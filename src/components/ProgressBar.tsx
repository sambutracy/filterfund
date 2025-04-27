import React from 'react';

interface ProgressBarProps { 
  progress: number;
  showLabel?: boolean;
  className?: string;
  height?: 'thin' | 'normal' | 'thick';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  showLabel = false,
  className = "",
  height = "normal"
}) => {
  // Ensure progress is a valid number between 0-100
  const clampedProgress = Math.min(Math.max(0, progress), 100);
  
  // Map height values to CSS classes
  const heightClass = `progress-container-${height}`;
  
  return (
    <div className={`progress-wrapper ${className}`}>
      {showLabel && (
        <div className="progress-label">
          <span className="progress-label-collected">{clampedProgress}%</span>
          <span className="progress-label-target">of 100%</span>
        </div>
      )}
      
      <div className={`progress-container ${heightClass}`}>
        <div 
          className="progress-bar"
          style={{ width: `${clampedProgress}%` }} // Use inline style for width
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;