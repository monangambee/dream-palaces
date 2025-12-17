// Data optimization utilities to reduce payload size

/**
 * Compress Airtable data by removing unnecessary fields and optimizing structure
 */
export const compressAirtableData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(record => {
    // Only keep essential fields - customize this based on your needs
    const compressed = {
      id: record.id,
      // Add only the fields you actually use in your visualization
      fields: {
        // Example fields - adjust based on your actual data structure
        name: record.fields?.name || record.fields?.Name || '',
        location: record.fields?.location || record.fields?.Location || '',
        type: record.fields?.type || record.fields?.Type || '',
        // Add other essential fields here
        ...Object.keys(record.fields || {}).reduce((acc, key) => {
          // Only include fields that are actually used
          if (isFieldUsed(key)) {
            acc[key] = record.fields[key];
          }
          return acc;
        }, {})
      }
    };
    
    return compressed;
  });
};

/**
 * Check if a field is actually used in the application
 * Customize this based on your actual field usage
 */
const isFieldUsed = (fieldName) => {
  const usedFields = [
    'name', 'Name', 'title', 'Title',
    'location', 'Location', 'address', 'Address',
    'type', 'Type', 'category', 'Category',
    'status', 'Status', 'active', 'Active',
    // Add other fields you actually use
  ];
  
  return usedFields.some(used => 
    fieldName.toLowerCase().includes(used.toLowerCase())
  );
};

/**
 * Create a minimal dataset for initial page load
 */
export const createMinimalDataset = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  // Take only first 100 records for initial load
  const minimalData = data.slice(0, 100);
  
  return {
    records: compressAirtableData(minimalData),
    totalCount: data.length,
    hasMore: data.length > 100
  };
};

/**
 * Calculate data size in KB
 */
export const getDataSize = (data) => {
  const jsonString = JSON.stringify(data);
  const sizeInBytes = new Blob([jsonString]).size;
  return Math.round(sizeInBytes / 1024);
};




