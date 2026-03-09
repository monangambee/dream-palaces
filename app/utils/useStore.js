/**
 * Global State Store (Zustand)
 *
 * Single source of truth for cinema data, active filters,
 * the currently-selected cinema, and loading / progress state.
 *
 * Key concepts:
 *  - `data`         – the raw cinema records from the API
 *  - `normalizedData` – same records with every field value lowercased
 *                       for fast, case-insensitive filter comparisons
 *  - `filteredData`  – the subset of records that pass every active filter
 *  - `filterUpdate`  – boolean toggle; flipping it tells the 3D scene
 *                       to re-animate particles into their new positions
 *  - `animateParticles` – a callback injected by scene.jsx so the store
 *                         can trigger GSAP particle animations on filter change
 */
import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────
  data: null,              // Raw records from API
  airtableData: null,      // Mirror kept for d3 analysis
  filters: null,           // Current filter selections { Country: 'all', City: 'x', … }
  filteredData: null,      // Records matching active filters (drives the 3D scene)
  selectedCinema: null,    // Record shown in the CinemaInfo detail panel
  filterUpdate: false,     // Toggled on every meaningful filter change
  animateParticles: null,  // GSAP animation callback injected by scene.jsx
  loading: {
    isDataLoading: false,
    progress: { loaded: 0, total: 0, percentage: 0 },
    error: null
  },
  preparedData: null,
  imageUrls: [],

  // ── Actions ────────────────────────────────────────────────

  /**
   * Store raw data AND build a normalizedData copy where every field
   * value is lowercased for instant filter matching.
   */
  setData: (data) => set({
    data: data,
    filteredData: data,
    normalizedData: data.map(record => ({
      ...record,
      normalizedFields: Object.keys(record.fields).reduce((acc, key) => {
        acc[key] = record.fields[key]?.toString().trim().toLowerCase() || ''
        return acc
      }, {})
    }))
  }),

  setAirtableData: (data) => set({ airtableData: data }),
  setPreparedData: (prepared) => set({ preparedData: prepared }),
  setFilters: (filters) => set({ filters: filters }),
  setSelectedCinema: (cinema) => set({ selectedCinema: cinema }),
  clearSelectedCinema: () => set({ selectedCinema: null }),
  setUpdateFilter: () => set(!filterUpdate),
  setAnimateParticles: (animateFn) => set({ animateParticles: animateFn }),
  setImageUrls: (urls) => set({ imageUrls: urls }),

  // ── Filter Logic ────────────────────────────────────────────

  /**
   * Update a single filter field and recompute filteredData.
   * Only triggers a particle re-animation when the value actually changes.
   */
  updateFilters: (field, value) => set((state) => {
    const currentValue = state.filters?.[field]
    const hasChanged = currentValue !== value

    const newFilters = {
      ...state.filters,
      [field]: value
    }

    const filteredData = get().applyFilters(state.normalizedData, newFilters)

    // Trigger GSAP particle animation only when filter meaningfully changed
    if (hasChanged) {
      if (state.animateParticles) {
        state.animateParticles()
      }
      return {
        filters: newFilters,
        filteredData: filteredData,
        filterUpdate: !state.filterUpdate
      }
    }

    return { filters: newFilters, filteredData: filteredData }
  }),


  /** Reset every filter to 'all' and restore the full dataset */
  clearFilters: () => set((state) => {
    if (!state.filters) {
      return {
        filters: {},
        filteredData: state.data || state.normalizedData
      }
    }

    const clearedFilters = {}
    Object.keys(state.filters).forEach(key => {
      clearedFilters[key] = 'all'
    })

    const resetData = state.data || state.normalizedData

    if (state.animateParticles) {
      state.animateParticles()
    }

    return {
      filters: clearedFilters,
      filteredData: resetData,
      filterUpdate: !state.filterUpdate
    }
  }),


  /**
   * Core filter engine.
   * 1. Handles `selectedYear` specially — a cinema is "active" in a year
   *    if it was created on or before that year AND not closed before it.
   * 2. All other filters do an exact (normalised) string match.
   */
  applyFilters: (data, filters) => {
    if (!filters || !data) return data

    let filteredData = data

    // Year-range filter: cinema must have been operating in the selected year
    if (filters.selectedYear && filters.selectedYear !== 'all') {
      const year = parseInt(filters.selectedYear)
      if (!isNaN(year)) {
        filteredData = filteredData.filter(record => {
          const creationRaw = record.fields?.Creation
          const closureRaw = record.fields?.Closure
          const creation = creationRaw ? parseInt(creationRaw) : null
          const closure = closureRaw ? parseInt(closureRaw) : null

          const createdByYear = creation === null || creation <= year
          const activeInYear = closure === null || closure >= year
          return createdByYear && activeInYear
        })
      }
    }

    // Categorical filters — match against pre-normalised field values
    Object.entries(filters).forEach(([field, value]) => {
      if (field === 'selectedYear') return
      if (value !== 'all') {
        const normalizedValue = value.toString().trim().toLowerCase()
        filteredData = filteredData.filter(record => {
          return record.normalizedFields[field] === normalizedValue
        })
      }
    })

    return filteredData
  },

  // ── Loading State Helpers ────────────────────────────────────
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