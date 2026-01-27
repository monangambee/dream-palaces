import { Vimeo } from 'vimeo'

const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
)
  const DREAM_PALACES_FOLDER_ID ='27904211'


export async function GET() {
  try {
    return new Promise((resolve, reject) => {
      client.request(
        {
          method: 'GET',
          path: `/me/folders/${DREAM_PALACES_FOLDER_ID}/videos`,
          query: {
            per_page: 100,
            fields: 'uri,name,description,duration,created_time,pictures,link,privacy,stats'
          }
        },
        (error, body) => {
          if (error) {
            console.error('Failed to fetch Vimeo videos:', error)
            reject(Response.json(
              {
                success: false,
                error: error.message
              },
              { status: 500 }
            ))
            return
          }

          const assets = body.data.map(video => {
            const videoId = video.uri.split('/').pop()
            
            // Extract custom metadata from description
            let customMetadata = {}
            let cleanDescription = video.description || ''
            
            if (cleanDescription.includes('---METADATA---')) {
              const parts = cleanDescription.split('---METADATA---')
              cleanDescription = parts[0].trim()
              try {
                customMetadata = JSON.parse(parts[1].trim())
              } catch (e) {
                console.warn('Failed to parse metadata:', e)
              }
            }

            return {
              id: videoId,
              playbackId: videoId,
              thumbnail: video.pictures?.sizes?.[video.pictures.sizes.length - 1]?.link || video.pictures?.base_link || '',
              status: 'ready',
              createdAt: video.created_time,
              duration: video.duration,
              aspectRatio: video.pictures?.sizes?.[0]?.width / video.pictures?.sizes?.[0]?.height || 16/9,
              title: video.name || 'Untitled',
              description: cleanDescription,
              year: customMetadata.year || '',
              filmmaker: customMetadata.filmmaker || '',
              country: customMetadata.country || '',
              link: video.link,
              views: video.stats?.plays || 0
            }
          })

          resolve(Response.json({
            success: true,
            assets: assets,
            total: assets.length
          }, {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }))
        }
      )
    })
  } catch (error) {
    console.error('Failed to fetch Vimeo assets:', error)
    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
