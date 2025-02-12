import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { CiPlay1, CiPause1 } from "react-icons/ci";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { IoCloseOutline } from "react-icons/io5";
import { GalleryProgressBar } from "./GalleryProgressBar.jsx";

const Gallery = ({ items, initialIndex = 0 }) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [stripTranslate, setStripTranslate] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    if (!isOverlayVisible) {
      setIsPlaying(false);
    }
  }, [isOverlayVisible]);

  useEffect(() => {
    let animationFrameId;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 2000;

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        if (isPlaying) {
          startTime = null;
          setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
          animationFrameId = requestAnimationFrame(animate);
        }
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, items.length]);

  useEffect(() => {
    const thumbnailWidth = 55;
    const containerWidth = Math.min(window.innerWidth, 500);
    const centerPosition = containerWidth / 2;
    const selectedThumbnailPosition = currentIndex * thumbnailWidth + thumbnailWidth / 2;
    const newTranslate = centerPosition - selectedThumbnailPosition;

    setStripTranslate(newTranslate);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const handlePrevious = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  }, [items.length]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleProgressComplete = useCallback(() => {
    setCurrentIndex((prevIndex) => prevIndex % items.length);
  }, [items.length]);

  const handleScroll = (event) => {
    event.preventDefault();
    if (event.deltaY > 0) {
      handleNext();
    } else {
      handlePrevious();
    }
  };

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches[0].clientX);
  };

  const handleTouchMove = (event) => {
    if (touchStartX !== null) {
      const currentX = event.touches[0].clientX;
      const deltaX = touchStartX - currentX;

      if (deltaX > 20) {
        handleNext();
        setTouchStartX(null);
      } else if (deltaX < -20) {
        handlePrevious();
        setTouchStartX(null);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        setIsOverlayVisible(false);
      } else if (event.key === "ArrowLeft") {
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    },
    [handlePrevious, handleNext]
  );

  useEffect(() => {
    if (isOverlayVisible) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOverlayVisible, handleKeyDown]);

  return (
    <div className="main">
      <div className="gallery-grid">
        {items.map((item, index) => (
          <div
            key={index}
            className="gallery-item"
            onClick={() => {
              setCurrentIndex(index);
              setIsOverlayVisible(true);
            }}
          >
            {item.type === "video" ? (
              <div className="video-container">
                <iframe
                  src={item.src}
                  title={item.title || `Video ${index + 1}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <img
                src={item.src}
                alt={item.title || `Image ${index + 1}`}
                width={400}
                height={400}
                className="gallery-image"
              />
            )}
          </div>
        ))}
      </div>

      {isOverlayVisible && (
        <>
          <GalleryProgressBar
            isPlaying={isPlaying}
            onComplete={handleProgressComplete}
          />
          <div
            className="overlay"
            onClick={() => setIsOverlayVisible(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overlay-content">
              {items[currentIndex].type === "video" ? (
                <div
                  className="video-overlay"
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <iframe
                    src={items[currentIndex].src}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={items[currentIndex].src}
                  alt={items[currentIndex].title || `Image ${currentIndex + 1}`}
                  className="overlay-image"
                  width={500}
                  height={500}
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                />
              )}
            </div>

            <div
              className="controls-top"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <button
                onClick={togglePlay}
                className="control-button"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <CiPause1 size={24} /> : <CiPlay1 size={24} />}
              </button>

              <button
                className="control-button"
                onClick={() => setIsOverlayVisible(false)}
              >
                <IoCloseOutline size={24} />
              </button>
            </div>

            <div
              className="controls-side"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <button
                onClick={handlePrevious}
                className="control-button prev-button"
                aria-label="Previous image"
              >
                <FaAngleLeft className="nav-icon" />
              </button>
              <button
                onClick={handleNext}
                className="control-button next-button"
                aria-label="Next image"
              >
                <FaAngleRight className="nav-icon" />
              </button>
            </div>

            <div
              className="thumbnail-strip-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="thumbnail-strip"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onWheel={isHovered ? handleScroll : undefined}
                style={{
                  transform: `translateX(${stripTranslate}px)`,
                }}
              >
                {items.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`thumbnail-button ${
                      index === currentIndex ? "active" : ""
                    }`}
                    aria-label={`View ${item.title || `Item ${index + 1}`}`}
                  >
                    {item.type === "video" ? (
                      <iframe
                        src={item.src}
                        title={item.title || `Video ${index + 1}`}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className="thumbnail-iframe"
                      />
                    ) : (
                      <img
                        src={item.src}
                        alt={item.title || `Image ${index + 1}`}
                        width={90}
                        height={90}
                        className="thumbnail-image"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Gallery;