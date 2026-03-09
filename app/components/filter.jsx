/**
 * Filter – Collapsible Sidebar
 *
 * Provides cascading dropdown filters (Country → City, Condition)
 * and a year-range slider that determines which cinemas were "active"
 * during the selected year (creation ≤ year ≤ closure).
 *
 * Country → City dependency: selecting a country narrows the city
 * dropdown to only cities within that country.
 *
 * On mobile the sidebar is a full-screen overlay triggered by a
 * hamburger icon; on desktop it's a slim left panel that can collapse.
 */
import React, { useState, useMemo, useEffect } from "react"

import { useStore } from "../utils/useStore"


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

  // Compute the full year range (min creation → max closure) for the slider
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

  /**
   * Handle filter selection or "clear all".
   * Resets the City filter whenever Country changes to keep them in sync.
   */
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

  /** Slide the year slider — values above dateExtent.max map to "All" */
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

  /**
   * Build the sorted list of unique values for a given field.
   * When field is "City", only cities within the selected Country are shown.
   */
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

  // City dropdown is locked until a country is selected
  const isCityDisabled = !filters?.Country || filters.Country === "all"

  if (!filters) return null;
  const fieldNames = Object.keys(filters).filter(name => name !== 'selectedYear');

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`flex flex-col font-avenir gap-4 max-w-[300px] ${
        isOpen 
          ? isMobile ? "w-full h-full" : "w-1/5 max-w-[300px]" 
          : isMobile ? "w-14" : "w-16"
      } h-screen font-avenir border-primary border-r-[0.5px] justify-start overflow-y-auto overflow-x-hidden items-center bg-background z-50 p-4 transition-all duration-300 ease-in-out ${
        isMobile && isOpen 
          ? "fixed inset-0 z-50" 
          : isMobile 
            ? "fixed left-0 top-0 h-auto py-2" 
            : "absolute left-0 top-0"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleFilter}
        className={`text-primary mb-2 transition-colors duration-200 z-50 min-w-[44px] min-h-[44px] flex items-center justify-center ${
          isOpen ? "self-end text-base" : "self-center text-base"
        }`}
        title={isOpen ? "Close Filter" : "Open Filter"}
        aria-label={isOpen ? "Close Filter" : "Open Filter"}
      >
        {isOpen ? (isMobile ? "✕" : "◀") : (isMobile ? "☰" : "▶")}
      </button>

      {isOpen && (
        <>
          <p className="text-yellow-400 text-xs text-center pb-8 pt-4">
            Pan around and zoom in and out to explore then click on a cinema to view details.
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
            className=" mt-4 bg-black hover:bg-primary hover:text-black bg-opacity-50 border-primary border-[0.5px] transition-all duration-200 ease-in-out text-primary text-xs px-8 py-4  pointer"
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
