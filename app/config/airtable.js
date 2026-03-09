/**
 * Airtable Configuration
 *
 * Credentials and table settings for the Dream Palaces Airtable base.
 * The actual data fetching bypasses Airtable's API in favour of a cached
 * JSON endpoint hosted on Render (see utils/data.js). These env vars are
 * kept for any future direct-Airtable queries.
 */
export const AIRTABLE_CONFIG = {
  apiKey: process.env.AIRTABLE_API_KEY,
  baseId: process.env.AIRTABLE_BASE_ID,
  defaultTable: 'Dream Palaces',
}

// Resolve a human-readable field name from AIRTABLE_CONFIG.fieldMappings
export const getFieldNameForGroup = (groupIndex) => {
  return AIRTABLE_CONFIG.fieldMappings[`group${groupIndex}`] || `Field ${groupIndex + 1}`
}

// Resolve a display-friendly group label
export const getGroupName = (groupIndex) => {
  return AIRTABLE_CONFIG.groupNames[groupIndex] || `Group ${groupIndex}`
}
