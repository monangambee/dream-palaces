import React, { useMemo } from "react";
import { useStore } from "../utils/useStore";
import ReactMarkdown from "react-markdown";

const CinemaInfo = () => {
  const { selectedCinema, clearSelectedCinema } = useStore();

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

  if (!selectedCinema) return null;

  return (
    <div className="fixed flex flex-col gap-2 bottom-10 text-primary right-5 z-50 bg-background bg-opacity-90  p-8 max-w-[50vw] lg:max-w-[50vw] min-w-[20vw] max-h-[50vh]  overflow-y-scroll no-scrollbar  border-primary border-[0.5px] shadow-2xl font-avenir ">
      <div className="font-bold text-lg mb-3 sticky top-0 bg-black py-4">
        {selectedCinema.fields.Name}
      </div>
      <div className="text-base mb-2 ">
        {selectedCinema.fields.City}, {selectedCinema.fields.Country}
      </div>
      <div className=" mb-2 text-xs">
        {selectedCinema.fields.Creation} - {selectedCinema.fields.Closure}
      </div>
      <div className="text-gray-400 text-xs mb-2">
        {selectedCinema.fields.Condition}
      </div>
      {imageUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
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
                // All attempts failed, hide the image
                e.target.style.display = 'none';
                console.warn(`Failed to load image ${index + 1} for ${selectedCinema.fields.Name}, fileId: ${urlObj.fileId}`);
              }
            };
            
            return (
              <img
                key={`${urlObj.fileId}-${index}`}
                src={urlObj.primary}
                alt={`${selectedCinema.fields.Name} - Image ${index + 1}`}
                className="object-cover max-w-[300px] max-h-[300px]"
                loading="lazy"
                fetchPriority="low"
                decoding="async"
                onError={tryNextUrl}
              />
            );
          })}
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
          <div className="text-xs font-primary [&_a]:underline">
            <ReactMarkdown>
              {selectedCinema.fields["Additional resources"]}
            </ReactMarkdown>
          </div>
        </>
      )}
      <button
        onClick={clearSelectedCinema}
        className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
      >
        ×
      </button>
    </div>
  );
};

export default CinemaInfo;
