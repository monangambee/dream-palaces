import Constellation from "../components/Constellation";
import { fetchAirtableDataProgressive } from "../../src/utils/data";
import { AIRTABLE_CONFIG } from '../../src/config/airtable';




export default async function ConstellationPage() {

  // Server-side data fetching
  let fullData = [];
  let error = null;

  try {
    // Skip API calls in development to avoid wasting API quota
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using empty data, client will handle caching');
      fullData = [];
    } else {
      console.log('Fetching Airtable data at build time...');
      
      // Fetch full data
      fullData = await fetchAirtableDataProgressive(
        AIRTABLE_CONFIG.defaultTable
      );
      
      // Cache the fetched data

    }
  } catch (err) {
    console.error('Error fetching Airtable data:', err);
    error = err.message;
  }



  return (
    <Constellation 
      fullData={fullData}
      error={error}
    />
  );
}

// Enable static generation with revalidation
// export const revalidate = 3600; // Revalidate every hour

