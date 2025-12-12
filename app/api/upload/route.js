import { Vimeo } from 'vimeo';

const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { metadata = {} } = body;

    // Create Vimeo upload
    return new Promise((resolve, reject) => {
      client.upload(
        null,
        {
          name: metadata.title || 'Untitled',
          description: metadata.description || '',
          privacy: {
            view: 'anybody'
          }
        },
        (uri) => {
          const videoId = uri.split('/').pop();
          
          // Update video metadata with custom fields
          const customMetadata = {
            year: metadata.year || '',
            filmmaker: metadata.filmmaker || '',
            duration: metadata.duration || '',
            country: metadata.country || ''
          };
          
          // Store custom metadata in video description (append as JSON)
          const fullDescription = metadata.description 
            ? `${metadata.description}\n\n---METADATA---\n${JSON.stringify(customMetadata)}`
            : `---METADATA---\n${JSON.stringify(customMetadata)}`;
          
          client.request(
            {
              method: 'PATCH',
              path: uri,
              query: {
                name: metadata.title || 'Untitled',
                description: fullDescription
              }
            },
            (error) => {
              if (error) {
                console.warn('Failed to update metadata:', error);
              }
            }
          );
          
          resolve(Response.json({
            success: true,
            videoId: videoId,
            uri: uri
          }));
        },
        (bytes_uploaded, bytes_total) => {
          const percentage = (bytes_uploaded / bytes_total * 100).toFixed(2);
          console.log(percentage + '% uploaded');
        },
        (error) => {
          console.error('Vimeo upload failed:', error);
          reject(Response.json(
            {
              success: false,
              error: error.message || 'Failed to create upload'
            },
            { status: 500 }
          ));
        }
      );
    });
  } catch (error) {
    console.error('Vimeo upload creation failed:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to create upload URL'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Create direct upload for GET requests (simpler)
    const directUpload = await client.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public'],
      },
    });

    return Response.json({
      success: true,
      upload: directUpload,
      uploadUrl: directUpload.url
    });
  } catch (error) {
    console.error('Mux upload creation failed:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to create upload URL'
      },
      { status: 500 }
    );
  }
}