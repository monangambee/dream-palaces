import React, { useMemo, useState, useEffect } from "react";
import { useStore } from "../utils/useStore";
import ReactMarkdown from "react-markdown";

const CinemaInfo = () => {
  const { selectedCinema, clearSelectedCinema } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Convert Google Drive links to direct image URLs using thumbnail API
  const imageUrls = useMemo(() => {
    if (!selectedCinema?.fields?.["Image Links"]) return [];
    
    return selectedCinema.fields["Image Links"]
      .split(',')
      .map(link => link.trim())
      .filter(link => link.includes('drive.google.com'))
      .map(link => {
        // Extract file ID from various Google Drive URL formats
        // Handles: /d/FILE_ID/view, /d/FILE_ID, /file/d/FILE_ID/view?usp=drive_link
        const fileIdMatch = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (!fileIdMatch) {
          console.warn('Could not extract file ID from:', link);
          return null;
        }
        
        const fileId = fileIdMatch[1];
        // Use thumbnail API as primary method (most reliable for public files)
        return {
          fileId,
          primary: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
          fallback1: `https://lh3.googleusercontent.com/d/${fileId}=w1000`,
          fallback2: `https://drive.google.com/uc?export=download&id=${fileId}`,
          fallback3: `https://drive.google.com/uc?export=view&id=${fileId}`
        };
      })
      .filter(Boolean);
  }, [selectedCinema]);

  // Reset image index when cinema changes
 useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedCinema]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  if (!selectedCinema) return null;

  return (
    <div className="fixed flex flex-col gap-2 text-primary z-50 bg-background bg-opacity-95 px-4 sm:px-8 pb-8 overflow-y-scroll no-scrollbar border-primary border-[0.5px] shadow-2xl font-avenir
      bottom-0 left-0 right-0 max-h-[60vh]
      sm:bottom-10 sm:right-5 sm:left-auto sm:max-w-[80vw] sm:min-w-[300px]
      md:max-w-[50vw] md:min-w-[20vw] md:max-h-[50vh]">
      <button
        onClick={clearSelectedCinema}
        className="absolute top-2 right-2 text-gray-400 hover:text-white text-3xl p-2 min-w-[44px] min-h-[44px] flex items-center justify-center z-20"
        aria-label="Close"
      >
        ×
      </button>
      <div className="font-bold text-lg mb-3 sticky top-0 bg-black z-10 py-2 pt-8 pr-12">
        {selectedCinema.fields.Name}
        <div className="text-base font-light mb-2 pt-2">
          {selectedCinema.fields.City}, {selectedCinema.fields.Country}
        </div>
      </div>

      <div className=" mb-2 text-xs">
        {selectedCinema.fields.Creation} - {selectedCinema.fields.Closure}
      </div>
      <div className="text-gray-400 text-xs mb-2">
        {selectedCinema.fields.Condition}
      </div>
      {imageUrls.length > 0 && (
        <div className="relative mb-2 z-0">
          {/* Image container */}
          <div className="relative w-full max-w-[300px] aspect-square">
            {imageUrls.map((urlObj, index) => {
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
                  e.target.style.display = 'none';
                }
              };
              
              return (
                <img
                  key={`${urlObj.fileId}-${index}`}
                  src={urlObj.primary}
                  alt={`${selectedCinema.fields.Name} - Image ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover rounded transition-opacity duration-300 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading={index === currentImageIndex ? 'eager' : 'lazy'}
                  fetchPriority={index === currentImageIndex ? 'high' : 'low'}
                  decoding="async"
                  onError={tryNextUrl}
                />
              );
            })}
            
            {/* Navigation arrows */}
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-all"
                  aria-label="Previous image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-all"
                  aria-label="Next image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Dots indicator */}
          {imageUrls.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-2 w-full max-w-[300px]">
              {imageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-primary' : 'bg-gray-500'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <p>{selectedCinema.fields["Image Credits"]}</p>

      {/* <audio src={selectedCinema.fields["Sound Links"]}/> */}
      {/* <p>{selectedCinema.fields["Sound Credits"]}</p> */}
      <div className="text-base font-primary prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>
          {selectedCinema.fields["Website description"]}
        </ReactMarkdown>
      </div>
      {selectedCinema.fields["Additional resources"] && 
       selectedCinema.fields["Additional resources"].trim().length > 0 && (
        <>
          <h3 className="text-base font-bold pt-4">Additional resources </h3>
          <div className="text-xs font-primary prose prose-invert prose-sm max-w-none [&_a]:underline [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:ml-2">
            <ReactMarkdown>
              {selectedCinema.fields["Additional resources"]}
            </ReactMarkdown>
          </div>
        </>
      )}
      </div>
  );
};

export default CinemaInfo;
