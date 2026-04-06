/**
 * CinemaInfo – Detail Panel
 *
 * Slides up (mobile) or in from the right (desktop) when a cinema
 * particle is clicked in the constellation.
 *
 * Images are fetched from Google Drive using a 4-URL fallback chain
 * because Drive's sharing URLs are unreliable:
 *   1. /thumbnail?id=…&sz=w1000  (most reliable for public files)
 *   2. lh3.googleusercontent.com  (direct content CDN)
 *   3. /uc?export=download         (force download trick)
 *   4. /uc?export=view              (legacy viewer URL)
 *
 * The description field is rendered as Markdown via react-markdown.
 */
import React, { useMemo, useState, useEffect } from "react";
import { useStore } from "../utils/useStore";
import ReactMarkdown from "react-markdown";

const CinemaInfo = () => {
  const { selectedCinema, clearSelectedCinema } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Build an array of image objects, each with a primary URL + 3 fallbacks
  const imageUrls = useMemo(() => {
    if (!selectedCinema?.fields?.["Image Links"]) return [];

    return selectedCinema.fields["Image Links"]
      .split(",")
      .map((link) => link.trim())
      .filter((link) => link.includes("drive.google.com"))
      .map((link) => {
        // Extract file ID from various Google Drive URL formats
        const fileIdMatch = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (!fileIdMatch) {
          console.warn("Could not extract file ID from:", link);
          return null;
        }

        const fileId = fileIdMatch[1];

        // Build the 4-URL fallback chain (tried in order on <img> error)
        return {
          fileId,
          primary: `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,
          fallback1: `https://lh3.googleusercontent.com/d/${fileId}=w2000`,
          fallback2: `https://drive.google.com/uc?export=download&id=${fileId}`,
          fallback3: `https://drive.google.com/uc?export=view&id=${fileId}`,
        };
      })
      .filter(Boolean);
  }, [selectedCinema]);

  // Reset image index when cinema changes
  useEffect(() => {
    setCurrentImageIndex(0);
    // console.log(selectedCinema);
  }, [selectedCinema]);

  const imageCredits = useMemo(() => {
    if (!selectedCinema?.fields?.["Image credits"]) return [];
    return selectedCinema.fields["Image credits"]
      .split(/\n/)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }, [selectedCinema]);

  if (!selectedCinema) return null;

  return (
    <div
      className="fixed flex flex-col gap-2 text-primary z-50 bg-background bg-opacity-95 px-4 sm:px-8 pb-8 overflow-y-scroll no-scrollbar border-primary border-[0.5px] shadow-2xl font-avenir
      bottom-0 left-0 right-0 max-h-[60vh]
      sm:bottom-10 sm:right-5 sm:left-auto sm:max-w-[80vw] sm:min-w-[300px]
      md:max-w-[50vw] md:min-w-[20vw] md:max-h-[80vh]"
    >
      <div className="font-bold sticky text-lg mb-3 top-0 bg-black z-10 py-2 pt-8 pr-12">
        <button
          onClick={clearSelectedCinema}
          className="absolute top-2 right-2 text-gray-400 md:hover:text-white text-3xl p-2 min-w-[44px] min-h-[44px] flex items-center justify-center z-20"
          aria-label="Close"
        >
          ×
        </button>
        {selectedCinema.fields.Name}
        <div className="text-base font-light mb-2 pt-2">
          {selectedCinema.fields.City}, {selectedCinema.fields.Country}
        </div>
      </div>

      {selectedCinema.fields.Creation && (
        <div className="mb-2 text-xs">
          {selectedCinema.fields.Creation}
          {selectedCinema.fields.Closure &&
            ` - ${selectedCinema.fields.Closure}`}
        </div>
      )}
      <div className="text-gray-400 text-xs mb-2">
        {selectedCinema.fields.Condition}
      </div>

      {imageUrls.length > 0 && (
        <div className="relative mb-2 z-0">
          {/* Image gallery with fallback chain on error */}
          <div className="relative w-full aspect-square object-contain group">
            {imageUrls.map((urlObj, index) => {
              // Track how many fallback attempts have been made for this image
              let attemptCount = 0;
              const tryNextUrl = (e) => {
                attemptCount++;
                if (attemptCount === 1 && urlObj.fallback1) {
                  e.target.src = urlObj.fallback1;
                } else if (attemptCount === 2 && urlObj.fallback2) {
                  e.target.src = urlObj.fallback2;
                } else if (attemptCount === 3 && urlObj.fallback3) {
                  e.target.src = urlObj.fallback3;
                } else {
                  e.target.style.display = "none";
                }
              };

              return (
                <img
                  key={`${urlObj.fileId}-${index}`}
                  src={urlObj.primary}
                  quality={100}
                  alt={`${selectedCinema.fields.Name} - Image ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover rounded transition-opacity duration-300 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                  loading={index === currentImageIndex ? "eager" : "lazy"}
                  fetchPriority={index === currentImageIndex ? "high" : "low"}
                  decoding="async"
                  onError={tryNextUrl}
                />
              );
            })}

            {/* image credits */}
            {imageCredits[currentImageIndex] && (
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] sm:text-xs text-white bg-black/60 rounded-b font-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 prose prose-invert prose-sm max-w-none [&_a]:underline [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:ml-2">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-0">{children}</p>,
                  }}
                >
                  {imageCredits[currentImageIndex]}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Dots indicator */}
          {imageUrls.length > 1 && (
            <div className="flex justify-center relative items-center gap-2 mt-2 w-full ">
              {imageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-primary" : "bg-gray-500"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedCinema.fields["Sound Links"] && (
        <CustomAudioPlayer
          src={`https://pub-76a6487955584bb1b627db345b5850f7.r2.dev/Eyethu%20Interview%20Lerato%20Tshabalala.mp3`}
          credits={selectedCinema.fields["Sound Credits"]}
        />
      )}

      <div className="text-base font-primary prose prose-invert prose-sm max-w-none [&_a]:underline [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:ml-2">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-4">{children}</p>,
          }}
        >
          {selectedCinema.fields["Website description"]}
        </ReactMarkdown>
      </div>
      {selectedCinema.fields["Additional resources"] &&
        selectedCinema.fields["Additional resources"].trim().length > 0 && (
          <>
            <h3 className="text-base font-bold pt-4">Additional resources </h3>
            <div className="text-xs font-primary prose prose-invert prose-sm max-w-none [&_a]:underline [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:ml-2">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4">{children}</p>,
                }}
              >
                {selectedCinema.fields["Additional resources"]}
              </ReactMarkdown>
            </div>
          </>
        )}
    </div>
  );
};

const CustomAudioPlayer = ({ src, credits }) => {
  const audioRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = (e.target.value / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center mt-4 mb-2 w-full">
      <div className="flex flex-col w-full max-w-[85%] bg-black  px-4 py-3 gap-2">
        <div className="flex items-center gap-3 border min-h-10 border-[#FFD700]">
          <button
            onClick={togglePlayPause}
            className="text-[#FFD700] hover:opacity-80 transition-opacity focus:outline-none flex-shrink-0"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-2 flex-grow text-xs font-mono text-[#FFD700]">
            <span className="min-w-[32px] text-right">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-grow h-[4px] bg-black border-[0.5px] border-[#FFD700] rounded-sm overflow-hidden flex items-center group">
              <div
                className="absolute left-0 h-full bg-[#FFD700] pointer-events-none"
                style={{ width: `${currentPercent}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentPercent}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="min-w-[32px]">{formatTime(duration)}</span>
          </div>
        </div>

        {credits && (
          <p className="text-[10px] sm:text-xs text-[#FFD700] text-center mt-1 font-primary">
            {credits}
          </p>
        )}

        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CinemaInfo;
