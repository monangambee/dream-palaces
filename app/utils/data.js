/**
 * Cinema Data Fetching
 *
 * All cinema records come from a Render-hosted JSON endpoint that mirrors
 * the Airtable base. This avoids Airtable rate-limits and keeps the
 * client payload under a single fetch.
 *
 * Each record follows the shape: { id: string, fields: { Country, City, … } }
 */
const API_ENDPOINT = 'https://dreampalacemapapp.onrender.com/api/record.json'

/**
 * Fetch the full set of cinema records.
 * @param {string|null} tableName  – reserved for future multi-table support
 * @param {number|null} pageSize   – unused (endpoint returns all records)
 * @returns {Array<{id: string, fields: object}>}
 */
export const fetchAirtableData = async (tableName = null, pageSize = null) => {
  try {
    const response = await fetch(API_ENDPOINT)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const records = await response.json()

    if (!Array.isArray(records)) {
      throw new Error('Expected array of records from API')
    }

    return records
  } catch (error) {
    console.error('Error fetching data from API:', error)
    return []
  }
}

/**
 * Fetch cinema records with progress reporting.
 * Used by the constellation page to drive the loading-bar UI.
 * @param {string|null} tableName  – reserved for future multi-table support
 * @param {Function}    onProgress – callback receiving { loaded, total, page, isComplete }
 * @returns {Array<{id: string, fields: object}>}
 */
export const fetchAirtableDataProgressive = async (tableName = null, onProgress) => {
  try {
    if (onProgress) {
      onProgress({ loaded: 0, total: 1000, page: 0, isComplete: false })
    }

    const response = await fetch(API_ENDPOINT)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const records = await response.json()

    if (!Array.isArray(records)) {
      throw new Error('Expected array of records from API')
    }

    if (onProgress) {
      onProgress({
        loaded: records.length,
        total: records.length,
        page: 1,
        isComplete: true
      })
    }

    return records
  } catch (error) {
    console.error('Error in progressive loading:', error)
    if (onProgress) {
      onProgress({
        loaded: 0,
        total: 0,
        page: 0,
        isComplete: true,
        error: error.message
      })
    }
    return []
  }
}

export default fetchAirtableData
