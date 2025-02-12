import * as React from 'react';
import { useEffect, useState } from "react";

export const GalleryProgressBar = ({
  isPlaying,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrameId = null;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 2000;

      if (elapsed < duration) {
        const currentProgress = (elapsed / duration) * 100;
        setProgress(currentProgress);
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setProgress(100);
        if (isPlaying) {
          startTime = null;
          onComplete?.();
          setProgress(0);
          animationFrameId = requestAnimationFrame(animate);
        }
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      setProgress(0);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, onComplete]);

  return (
    <div className="progress-bar-container">
      <div
        className="progress-bar"
        style={{
          transform: `scaleX(${progress / 100})`,
          transition: progress === 0 ? 'none' : 'transform 16.67ms linear',
          willChange: 'transform'
        }}
      />
    </div>
  );
};