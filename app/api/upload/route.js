import Mux from '@mux/mux-node';

const client = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function POST(request) {
  try {
    // Get optional parameters from request body
    const body = await request.json().catch(() => ({}));
    const { corsOrigin = '*', playbackPolicy = ['public'] } = body;

    // Create direct upload
    const directUpload = await client.video.uploads.create({
      cors_origin: corsOrigin,
      new_asset_settings: {
        playback_policy: playbackPolicy,
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