import Airtable from 'airtable';
import { AIRTABLE_CONFIG } from '../config/airtable';

// Initialize Airtable with your token
const base = new Airtable({
  apiKey: AIRTABLE_CONFIG.apiKey
}).base(AIRTABLE_CONFIG.baseId);

// Single function to fetch data from Airtable
export const fetchAirtableData = async (tableName = AIRTABLE_CONFIG.defaultTable, pageSize = 100) => {
  try {

    //pageSize is 100 because that is the max number of records we can get in one request
    const records = [];
    let pageCount = 0; //we are using this in eachPage becuase airtable limits the number of records we can get in one request
    
    await base(tableName).select({
      // Fetch all fields by default
      view: 'Grid view',
      pageSize: pageSize
    }).eachPage((pageRecords, fetchNextPage) => {
      //eachPage handles the pagination automatically so we can keep requesting 100 records till we get the total number of records
      pageRecords.forEach(record => {
        records.push({
          id: record.id,
          fields: record.fields
        });
      });
      pageCount++;
      console.log(`📄 Loaded page ${pageCount} (${records.length} records so far)`);
      fetchNextPage();
    });
    
    console.log(`✅ Airtable data loaded: ${records.length} records in ${pageCount} pages`);
    return records;
  } catch (error) {
    console.error('Error fetching Airtable data:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    });
    return [];
  }
};

// Progressive loading function for better UX
export const fetchAirtableDataProgressive = async (tableName = AIRTABLE_CONFIG.defaultTable, onProgress) => {
  try {
    const records = [];
    let pageCount = 0;
    let totalRecords = 0;
    
    // Start progress immediately with estimated total
    if (onProgress) {
      onProgress({
        loaded: 0,
        total: 1000, // Estimated total, will update as we go
        page: 0,
        isComplete: false
      });
    }
    
    await base(tableName).select({
      view: 'Grid view',
      pageSize: 50 // Smaller pages for smoother progress
    }).eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(record => {
        records.push({
          id: record.id,
          fields: record.fields
        });
      });
      pageCount++;
      
      // Update total as we discover more records
      totalRecords = Math.max(totalRecords, records.length + 50); // Estimate remaining
      
      // Call progress callback
      if (onProgress) {
        onProgress({
          loaded: records.length,
          total: totalRecords,
          page: pageCount,
          isComplete: false
        });
      }
      
      fetchNextPage();
    });
    
    // Final progress update with actual total
    if (onProgress) {
      onProgress({
        loaded: records.length,
        total: records.length,
        page: pageCount,
        isComplete: true
      });
    }
    
    console.log(`✅ Progressive loading complete: ${records.length} records`);
    return records;
  } catch (error) {
    console.error('Error in progressive loading:', error);
    return [];
  }
};

export default fetchAirtableData;
