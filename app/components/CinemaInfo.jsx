import React, { useState } from "react";
import { useStore } from "../utils/useStore";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

const CinemaInfo = () => {
  const { selectedCinema, clearSelectedCinema } = useStore();
  // const [imageError, setImageError] = useState(false);

  if (!selectedCinema) return null;


  return (
    <div className="fixed flex flex-col gap-2 bottom-10 text-primary right-5 z-50 bg-background bg-opacity-90  p-8 max-w-[50vw] lg:max-w-[50vw] min-w-[20vw] max-h-[50vh]  overflow-y-scroll no-scrollbar  border-primary border-[0.5px] shadow-2xl font-avenir ">
      <div className="font-bold text-lg  mb-3 ">{selectedCinema.fields.Name}</div>
      <div className="text-base mb-2 ">
        {selectedCinema.fields.City}, {selectedCinema.fields.Country}
      </div>
      <div className=" mb-2 text-xs">
        {selectedCinema.fields.Creation} - {selectedCinema.fields.Closure}
      </div>
      <div className="text-gray-400 text-xs mb-2">
        {selectedCinema.fields.Condition}
      </div>
      {selectedCinema.fields.Images &&
        selectedCinema.fields.Images.length > 0 && 
        // !imageError && (
          <Image
            src={selectedCinema.fields.Images[0].url}
            alt={selectedCinema.fields.Name}
            width={300}
            height={300}
            className="object-cover mb-2"
            // onError={() => setImageError(true)}
          />
        }
      <p>{selectedCinema.fields["Image Credits"]}</p>

      {/* <audio src={selectedCinema.fields["Sound Links"]}/> */}
      {/* <p>{selectedCinema.fields["Sound Credits"]}</p> */}
      <div className="text-base font-primary prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>{selectedCinema.fields["Website description"]}</ReactMarkdown>
      </div>
      <h3 className="text-base font-bold pt-4">Additional resources </h3>
      <div className="text-xs font-primary underline">
        <ReactMarkdown>{selectedCinema.fields["Additional resources"]}</ReactMarkdown>
      </div>
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
