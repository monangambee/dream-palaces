/**
 * GET /api/airtable
 *
 * Client-side fallback for fetching cinema records when the server-side
 * prop isn't available (e.g. the constellation page's localStorage miss).
 * Returns the full dataset with a 1-hour CDN cache (stale-while-revalidate).
 */
import { fetchData } from '../../utils/data'
import { AIRTABLE_CONFIG } from '../../config/airtable'

export async function GET() {
  const headers = {
    'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    'Content-Type': 'application/json',
  }

  try {
    const data = await fetchData(
      AIRTABLE_CONFIG.defaultTable
    )
 
    return new Response(JSON.stringify({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('API Error:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }
}

