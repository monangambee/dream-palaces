import Constellation from "../components/Constellation";
import { fetchAirtableDataProgressive } from "../utils/data";
import { AIRTABLE_CONFIG } from '../config/airtable';

export default async function ConstellationPage() {
  let fullData = [];
  let error = null;

  try {
    if (process.env.NODE_ENV === 'development') {
      fullData = [];
    } else {
      fullData = await fetchAirtableDataProgressive(AIRTABLE_CONFIG.defaultTable);
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

