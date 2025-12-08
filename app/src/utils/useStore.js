
import { create } from 'zustand'

export const useStore = create((set, get) => ({
  //state
  data: null,
  airtableData: null,
  filters: null,
  filteredData: null,
  selectedCinema: null,
  filterUpdate: false,
  animateParticles: null,
  loading: {
    isDataLoading: false,
    progress: { loaded: 0, total: 0, percentage: 0 },
    error: null
  },
  preparedData: null,
  imageUrls:[],

//actions
setData: (data) => set({ 
  data: data,
  filteredData: data,
  normalizedData: data.map(record => ({
    ...record,
    normalizedFields: Object.keys(record.fields).reduce((acc, key) => {
      acc[key] = record.fields[key]?.toString().trim().toLowerCase() || '';
      return acc;
    }, {})
  }))
}),


setAirtableData: (data) => set({ airtableData: data }),
setPreparedData: (prepared) => set({ preparedData: prepared }),
setFilters: (filters) => set({ filters: filters }),
setSelectedCinema: (cinema) => set({ selectedCinema: cinema }),
clearSelectedCinema: () => set({ selectedCinema: null }),
setUpdateFilter: () => set(!filterUpdate),
setAnimateParticles: (animateFn) => set({animateParticles: animateFn}),
setImageUrls: (urls) => set({imageUrls: urls}),

  // Filter actions
  updateFilters: (field, value) => set((state) => {
   
    
   // Check if the value is actually different from current
   const currentValue = state.filters?.[field];
   const hasChanged = currentValue !== value;
   
   const newFilters = {
    ...state.filters,
    [field]: value
   }

   const filteredData = get().applyFilters(state.normalizedData, newFilters);
   
   // Only trigger filterUpdate if the value actually changed
   if (hasChanged) {
    if (state.animateParticles) {
      state.animateParticles(); // 
    }
     return { 
       filters: newFilters, 
       filteredData: filteredData,
       filterUpdate: !state.filterUpdate // Toggle the filterUpdate state
     };
   }
   
   return { filters: newFilters, filteredData: filteredData };
  }),


  
clearFilters: () => set((state) => {

  if (!state.filters) {
    return { 
      filters: {}, 
      filteredData: state.data || state.normalizedData 
    };
  }

  const clearedFilters = {};
  Object.keys(state.filters).forEach(key => {
    clearedFilters[key] = 'all';
  });

  // Use original data
  const resetData = state.data || state.normalizedData;
  

  if (state.animateParticles) {
    state.animateParticles();
  }

  return { 
    filters: clearedFilters, 
    filteredData: resetData,
    filterUpdate: !state.filterUpdate 
  };
}),


  applyFilters: (data, filters) =>{
    if(!filters || !data) return data;

    let filteredData = data;

    // Handle selectedYear filter specially (if present)
    if (filters.selectedYear && filters.selectedYear !== 'all') {
      const year = parseInt(filters.selectedYear);
      if (!isNaN(year)) {
        filteredData = filteredData.filter(record => {
          const creationRaw = record.fields?.Creation;
          const closureRaw = record.fields?.Closure;
          const creation = creationRaw ? parseInt(creationRaw) : null;
          const closure = closureRaw ? parseInt(closureRaw) : null;

          // Cinema was active in the selected year if:
          // created on or before the year AND (not closed or closed on or after the year)
          const createdByYear = creation === null || creation <= year;
          const activeInYear = closure === null || closure >= year;
          return createdByYear && activeInYear;
        });
      }
    }

    // Apply other filters (skip selectedYear since handled)
    Object.entries(filters).forEach(([field, value]) => {
      if (field === 'selectedYear') return;
      if(value !== 'all'){
        const normalizedValue = value.toString().trim().toLowerCase();
        filteredData = filteredData.filter(record => {
          // Use pre-normalized data for faster comparison
          return record.normalizedFields[field] === normalizedValue;
        });
      }
    });

    return filteredData;
  },

  // Loading actions
  setLoading: (isLoading) => set((state) => ({
    loading: { ...state.loading, isDataLoading: isLoading }
  })),

  setProgress: (progress) => set((state) => ({
    loading: { ...state.loading, progress }
  })),

  setError: (error) => set((state) => ({
    loading: { ...state.loading, error }
  }))

 }));