import { fetchAirtableDataProgressive } from '../../../src/utils/data';
import { AIRTABLE_CONFIG } from '../../../src/config/airtable';

export async function GET() {
  // Set cache headers for better performance
  const headers = {
    'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    'Content-Type': 'application/json',
  };
  
  try {
    const data = await fetchAirtableDataProgressive(
      AIRTABLE_CONFIG.defaultTable
    );
    
    return new Response(JSON.stringify({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
