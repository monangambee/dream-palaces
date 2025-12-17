import Airtable from 'airtable';
import { AIRTABLE_CONFIG } from '../config/airtable';

const base = new Airtable({ apiKey: AIRTABLE_CONFIG.apiKey }).base(AIRTABLE_CONFIG.baseId);

export const fetchAirtableData = async (tableName = AIRTABLE_CONFIG.defaultTable, pageSize = 100) => {
  try {
    const records = [];
    await base(tableName).select({
      view: 'Grid view',
      pageSize
    }).eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(record => {
        records.push({ id: record.id, fields: record.fields });
      });
      fetchNextPage();
    });
    return records;
  } catch (error) {
    console.error('Error fetching Airtable data:', error);
    return [];
  }
};

export const fetchAirtableDataProgressive = async (tableName = AIRTABLE_CONFIG.defaultTable, onProgress) => {
  try {
    const records = [];
    let pageCount = 0;
    let totalRecords = 0;
    
    if (onProgress) {
      onProgress({ loaded: 0, total: 1000, page: 0, isComplete: false });
    }
    
    await base(tableName).select({
      view: 'Grid view',
      pageSize: 50
    }).eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(record => {
        records.push({ id: record.id, fields: record.fields });
      });
      pageCount++;
      totalRecords = Math.max(totalRecords, records.length + 50);
      
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
    
    if (onProgress) {
      onProgress({
        loaded: records.length,
        total: records.length,
        page: pageCount,
        isComplete: true
      });
    }
    
    return records;
  } catch (error) {
    console.error('Error in progressive loading:', error);
    return [];
  }
};

export default fetchAirtableData;
