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
const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'
const TEXT_DATA_TABLE = 'textdataforwebsite'

/**
 * Fetch the full set of cinema records.
 * @param {string|null} tableName  – reserved for future multi-table support
 * @param {number|null} pageSize   – unused (endpoint returns all records)
 * @returns {Array<{id: string, fields: object}>}
 */




const fetchRecords = async () => {
  const response = await fetch(API_ENDPOINT, { next: { revalidate: 86400 } })
  if (response.status >= 400) throw new Error(`HTTP error! status: ${response.status}`)

  const records = await response.json()
  if (Array.isArray(records)) return records

  throw new Error('Expected array of records from API')
}

const fetchAirtableRecords = async (tableName) => {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
  const baseId =  process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID

  if (!apiKey || !baseId) {
    throw new Error('Missing Airtable credentials. Ensure NEXT_PUBLIC_AIRTABLE_API_KEY and NEXT_PUBLIC_AIRTABLE_BASE_ID are set in .env.local')
  }

  const params = new URLSearchParams({ pageSize: '100' })

  const response = await fetch(
    `${AIRTABLE_API_BASE}/${baseId}/${encodeURIComponent(tableName)}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 86400 },
    }
  )

  if (response.status >= 400) {
    throw new Error(`Airtable HTTP error! status: ${response.status}`)
  }

  const payload = await response.json()
  if (!Array.isArray(payload.records)) {
    throw new Error('Expected Airtable payload with records array')
  }

  return payload.records
}

export const fetchData = async (tableName = null, onProgress) => {

  
  try {
    onProgress?.({ loaded: 0, total: 1000, page: 0, isComplete: false })

    const records = await fetchRecords()

    onProgress?.({
      loaded: records.length,
      total: records.length,
      page: 1,
      isComplete: true
    })

    return records
  } catch (error) {
    console.error('Error in progressive loading:', error)
    onProgress?.({ loaded: 0, total: 0, page: 0, isComplete: true, error: error.message })
    return []
  }
}

export const fetchTextDataForWebsite = async () => {
  try {
    return await fetchAirtableRecords(TEXT_DATA_TABLE)
  } catch (error) {
    console.error('Error fetching textdataforwebsite from Airtable:', error)
    return []
  }
}

