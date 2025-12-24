const API_ENDPOINT = 'https://dreampalacemapapp.onrender.com/api/record.json';

export const fetchAirtableData = async (tableName = null, pageSize = null) => {
  try {
    const response = await fetch(API_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const records = await response.json();
    
    // Ensure the data is in the expected format: array of { id, fields }
    if (!Array.isArray(records)) {
      throw new Error('Expected array of records from API');
    }
    
    return records;
  } catch (error) {
    console.error('Error fetching data from API:', error);
    return [];
  }
};

export const fetchAirtableDataProgressive = async (tableName = null, onProgress) => {
  try {
    // Notify progress start
    if (onProgress) {
      onProgress({ loaded: 0, total: 1000, page: 0, isComplete: false });
    }
    
    const response = await fetch(API_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const records = await response.json();
    
    // Ensure the data is in the expected format: array of { id, fields }
    if (!Array.isArray(records)) {
      throw new Error('Expected array of records from API');
    }
    
    // Notify progress complete
    if (onProgress) {
      onProgress({
        loaded: records.length,
        total: records.length,
        page: 1,
        isComplete: true
      });
    }
    
    return records;
  } catch (error) {
    console.error('Error in progressive loading:', error);
    if (onProgress) {
      onProgress({
        loaded: 0,
        total: 0,
        page: 0,
        isComplete: true,
        error: error.message
      });
    }
    return [];
  }
};

export default fetchAirtableData;
