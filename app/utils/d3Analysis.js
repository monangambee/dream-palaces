/**
 * D3 Data Analysis
 *
 * Groups cinema records by key fields (Country, City, Condition, etc.)
 * so the filter sidebar can render its dropdown options.
 * Returns a map of field-name → [[value, records], …] pairs.
 */
import * as d3 from 'd3'

/**
 * Transform raw Airtable records into grouped arrays.
 * @param {Array} airtableData – array of { id, fields } records
 * @returns {Object|null} keyed by field name, values are d3.groups arrays
 */
export const analyzeAirtableData = (airtableData) => {
  if (!airtableData || airtableData.length === 0) {
    return null
  }

  // Flatten each record so fields sit at the top level for d3
  const data = airtableData.map(record => ({
    id: record.id,
    ...record.fields
  }))

  // Internal stats (unique-value counts per field) — used for debugging
  const stats = {
    totalRecords: data.length,
    fields: Object.keys(data[0] || {}),
    byCity: d3.group(data, d => d.City),
    byCountry: d3.group(data, d => d.Country),
    byCreation: d3.group(data, d => d.Creation),
    byClosure: d3.group(data, d => d.Closure),
    byCondition: d3.group(data, d => d.Condition),
    byState: d3.group(data, d => d['State / Province']),
    byFeature: d3.group(data, d => d.Feature),
  }

  stats.uniqueCounts = {}
  stats.fields.forEach(field => {
    if (field !== 'id') {
      const uniqueValues = d3.group(data, d => d[field])
      stats.uniqueCounts[field] = {
        count: uniqueValues.size,
        values: Array.from(uniqueValues.keys()).filter(Boolean)
      }
    }
  })

  // Each entry is [groupValue, recordsArray] — consumed by filter.jsx dropdowns
  const groups = {
    Country: d3.groups(data, d => d.Country),
    City: d3.groups(data, d => d.City),
    Condition: d3.groups(data, d => d.Condition),
    Creation: d3.groups(data, d => d.Creation),
    Closure: d3.groups(data, d => d.Closure),
    Feature: d3.groups(data, d => d.Feature),
  }

  return groups
}

export default {
  analyzeAirtableData,
}
