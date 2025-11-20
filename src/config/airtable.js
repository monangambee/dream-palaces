// Airtable Configuration
export const AIRTABLE_CONFIG = {
  //Airtable token from environment variables
  apiKey: process.env.VITE_AIRTABLE_API_KEY,
  
  // Base ID from environment variables
  baseId: process.env.VITE_AIRTABLE_BASE_ID,
  
  // Default table name 
  defaultTable:'Dream Palaces',

};

// Helper function to get field name for a group
export const getFieldNameForGroup = (groupIndex) => {
  return AIRTABLE_CONFIG.fieldMappings[`group${groupIndex}`] || `Field ${groupIndex + 1}`;
};

// Helper function to get group name for display
export const getGroupName = (groupIndex) => {
  return AIRTABLE_CONFIG.groupNames[groupIndex] || `Group ${groupIndex}`;
};
