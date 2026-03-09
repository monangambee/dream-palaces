/**
 * Constellation Page (Server Component)
 *
 * Fetches cinema data server-side and hands it to the <Constellation>
 * client component which manages the Three.js canvas.
 * In development the fetch is skipped (data loads client-side instead)
 * to avoid slow cold-starts from the Render API.
 */
import Constellation from "../components/Constellation"
import { fetchAirtableDataProgressive } from "../utils/data"
import { AIRTABLE_CONFIG } from '../config/airtable'

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

