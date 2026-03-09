/**
 * Vimeo Utilities (server-side only)
 *
 * Provides helpers for fetching video metadata from the
 * Dream Palaces Vimeo folder (ID 27904211).
 * Used primarily by the root layout to resolve the first film
 * slug for the "Screening" navigation link.
 */
import { Vimeo } from 'vimeo'

/**
 * Fetch the first video in the Dream Palaces folder and return
 * a URL-safe slug (derived from the video title) plus its thumbnail.
 *
 * @returns {{ slug: string, thumbnail: string }}
 */
export async function getFirstFilmSlug() {
  try {
    const client = new Vimeo(
      process.env.VIMEO_CLIENT_ID,
      process.env.VIMEO_CLIENT_SECRET,
      process.env.VIMEO_ACCESS_TOKEN,
    )

    const DREAM_PALACES_FOLDER_ID = '27904211'

    const videos = await new Promise((resolve, reject) => {
      client.request(
        {
          method: 'GET',
          path: `/me/folders/${DREAM_PALACES_FOLDER_ID}/videos`,
          query: { per_page: 1, fields: 'uri,name,pictures' },
        },
        (error, body) => (error ? reject(error) : resolve(body)),
      )
    })

    if (videos.data?.[0]) {
      const video = videos.data[0]
      return {
        // Convert title to URL slug: lowercase, replace non-alphanumeric runs with hyphens
        slug: video.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        thumbnail:
          video.pictures?.sizes?.[video.pictures.sizes.length - 1]?.link || '',
      }
    }
  } catch (error) {
    console.error('Error fetching Vimeo videos:', error)
  }
  return { slug: '', thumbnail: '' }
}
