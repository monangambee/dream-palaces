import React from 'react';
import { useStore } from '../utils/useStore';
import Image from 'next/image';

const CinemaInfo = () => {
  const { selectedCinema, clearSelectedCinema } = useStore();

  if (!selectedCinema) return null;


  return (
    <div className="fixed bottom-10 text-primary right-5 z-50 bg-background bg-opacity-90  p-8 w-[30vw] max-h-[50vh]  overflow-y-scroll no-scrollbar  border-primary border-[0.5px] rounded-xl shadow-2xl font-basis ">
      <div className="font-bold  mb-3 ">{selectedCinema.fields.Name}</div>
      <div className="text-xs mb-2 ">
        {selectedCinema.fields.City}, {selectedCinema.fields.Country}
      </div>
      <div className=" mb-2 text-xs">
        {selectedCinema.fields.Creation} - {selectedCinema.fields.Closure}
      </div>
      <div className="text-gray-400 text-xs mb-2">
        {selectedCinema.fields.Condition}
      </div>
      {selectedCinema.fields.Images && selectedCinema.fields.Images.length > 0 && (
        <Image
          src={selectedCinema.fields.Images[0].url}
          alt={selectedCinema.fields.Name}
          width={200}
          height={200}
          className="object-cover mb-2"
        />
      )}
      <div className='text-xs font-primary'>
        <p>{selectedCinema.fields.Notes}</p>
      </div>
      <button
        onClick={clearSelectedCinema}
        className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
      >
        ×
      </button>
    </div>
  );
};

export default CinemaInfo;
