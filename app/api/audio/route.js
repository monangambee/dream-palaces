/**
 * GET /api/audio?id=<driveFileId>
 *
 * Proxies Google Drive audio files to bypass cross-origin restrictions.
 * Extracts the file ID from the query string and streams the audio back.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new Response(JSON.stringify({ error: 'Invalid file ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const driveUrl = `https://drive.google.com/uc?export=download&id=${id}`

  const res = await fetch(driveUrl, { redirect: 'follow' })

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch audio' }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate'
    }
  })
}
