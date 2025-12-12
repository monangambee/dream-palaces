import React, { useState, useMemo, useEffect } from "react";

import { useStore } from "../utils/useStore";


const Filter = ({}) => {
  const { data, filters, clearFilters, updateFilters } = useStore();
  
  // Check if mobile on initial load
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Start closed by default
  
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      // Only set isOpen to true on desktop if not already set by user interaction
      if (!mobile && !isOpen) {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!data) return null;

  // Compute date extent from data for slider
  const dateExtent = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    data.forEach(record => {
      const creation = parseInt(record.fields?.Creation);
      const closure = parseInt(record.fields?.Closure);
      if (!isNaN(creation)) min = Math.min(min, creation);
      if (!isNaN(closure)) max = Math.max(max, closure);
    });
    if (min === Infinity) min = 1800;
    if (max === -Infinity) max = new Date().getFullYear();
    return { min, max };
  }, [data]);

  const [selectedYear, setSelectedYear] = useState(dateExtent.max + 1); // Start at "All" (beyond max)

  // console.log(originalData)
  const handleFilterChange = (field, value) => {
    if (field === "clear") {
      clearFilters();
      setSelectedYear(dateExtent.max + 1); // Reset slider to "All"
    } else {
      // If country changes, clear city filter
      if (field === "Country") {
        updateFilters("City", "all"); // Clear city when country changes
      }
      updateFilters(field, value);
    }
    // Close cinema info when filter changes
    const { clearSelectedCinema } = useStore.getState();
    clearSelectedCinema();
  };

  const handleYearChange = (value) => {
    const year = parseInt(value);
    setSelectedYear(year);
    // If year is beyond the max, treat as "All"
    if (year > dateExtent.max) {
      updateFilters('selectedYear', 'all');
    } else {
      updateFilters('selectedYear', year);
    }
    // Close cinema info when year filter changes
    const { clearSelectedCinema } = useStore.getState();
    clearSelectedCinema();
  };

  // Get values for each field with country-city dependency
  const getFieldValues = (field) => {
    let filteredData = data;
    
    // If getting cities and a country is selected, filter by that country first
    if (field === "City" && filters?.Country && filters.Country !== "all") {
      filteredData = data.filter(record => 
        record.fields.Country === filters.Country
      );
    }
    
    const fields = new Set();
    filteredData.forEach((record) => {
      if (record.fields[field]) {
        const normalizedField = record.fields[field].toString().trim();
        fields.add(normalizedField);
      }
    });
    return Array.from(fields).sort();
  };

  // Determine if city filter should be disabled
  const isCityDisabled = !filters?.Country || filters.Country === "all";

  if (!filters) return null;
  const fieldNames = Object.keys(filters).filter(name => name !== 'selectedYear');

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`flex flex-col font-basis gap-4 ${
        isOpen 
          ? isMobile ? "w-full" : "w-1/6" 
          : isMobile ? "w-12" : "w-16"
      } h-[100vh]  font-basis border-primary justify-start overflow-hidden items-center bg-background z-50 p-4 transition-all duration-300 ease-in-out ${
        isMobile && isOpen ? "fixed inset-0 z-50" : ""
      }`}
      pointerEvents="auto"
    >
      {/* Toggle Button */}
      {/* <button
        onClick={toggleFilter}
        className={`text-primary mb-2 transition-colors duration-200 ${
          isOpen ? "self-end text-sm" : "self-center text-lg"
        }`}
        title={isOpen ? "Close Filter" : "Open Filter"}
      >
        {isOpen ? (isMobile ? "✕" : "◀") : (isMobile ? "☰" : "▶")}
      </button> */}

      {isOpen && (
        <>
          <p className="text-yellow-400 text-xs text-center pb-8 pt-4">
            Pan around to explore then click on a cinema to view details.
          </p>
          <h2 className="text-primary text-xs text-center pb-4">Filter cinemas</h2>
          
          {/* Year slider */}
          <div className="mb-4 w-full">
            <div className="text-primary text-xs mb-1 text-center">
              Year: {selectedYear > dateExtent.max ? 'All' : selectedYear}
            </div>
            <input
              type="range"
              min={dateExtent.min}
              max={dateExtent.max + 1}
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full h-2  rounded-lg appearance-none cursor-pointer slider-black"
            />
          </div>
          <div className="flex flex-col w-full h-full">
            {fieldNames.map((field) => (
              <div
                key={field}
                className="mb-4 flex flex-row gap-4 justify-center w-full h-[5vh]"
              >
                {/* <label htmlFor={field} className='text-white text-xs text-center'>
                        {field}
                    </label> */}

                <select
                  className={`p-2 m-2 cursor-pointer border-primary border-[0.5px] w-full h-full text-xs text-center ${
                    field === "City" && isCityDisabled
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-black bg-opacity-20 text-primary hover:bg-primary hover:text-black"
                  }`}
                  value={filters[field] || "all"}
                  onChange={(e) => handleFilterChange(field, e.target.value)}
                  disabled={field === "City" && isCityDisabled}
                  hidden={field === "Feature" || field === "Creation" || field === "Closure"}
                >
                  <option value="all">
                    {field === "City" && isCityDisabled 
                      ? "City" 
                      : field
                    }
                  </option>
                  {getFieldValues(field).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

        

          <button
            className=" mt-4 bg-slate-900 bg-opacity-50 border-primary border-[0.5px] text-primary text-xs px-4 py-2 rounded pointer"
            onClick={() => handleFilterChange("clear", "all")}
          >
            Reset
          </button>
        </>
      )}
    </div>
  );
};

export default Filter;
