import Mux from '@mux/mux-node';
import fs from 'fs';
import path from 'path';

const client = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function GET() {
  try {
    // Method 1: Read from local JSON files in videos folder (development only)
    const videosDir = path.join(process.cwd(), 'videos');
    const localAssets = [];
    
    // Only read local files in development
    if (process.env.NODE_ENV === 'development' && fs.existsSync(videosDir)) {
      const files = fs.readdirSync(videosDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of jsonFiles) {
        try {
          const filePath = path.join(videosDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const asset = JSON.parse(content);
          
          if (asset.providerMetadata?.mux?.playbackId) {
            localAssets.push({
              id: asset.providerMetadata.mux.assetId,
              playbackId: asset.providerMetadata.mux.playbackId,
              thumbnail: asset.poster,
              originalPath: asset.originalFilePath,
              uploadId: asset.providerMetadata.mux.uploadId,
              status: asset.status,
              createdAt: asset.createdAt,
              size: asset.size,
              sources: asset.sources
            });
          }
        } catch (error) {
          console.warn(`Failed to parse ${file}:`, error.message);
        }
      }
    }

    // Method 2: Fetch from Mux API (optional, requires API credentials)
    let muxAssets = [];
    if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) {
      try {
        const response = await client.video.assets.list({ limit: 100 });
        
        muxAssets = await Promise.all(
          response.data
            .filter(asset => asset.status === 'ready' && asset.playback_ids?.length > 0)
            .map(async (asset) => {
              // Parse passthrough for custom metadata
              let customMetadata = {};
              if (asset.passthrough) {
                try {
                  customMetadata = JSON.parse(asset.passthrough);
                  console.log('Passthrough data for', asset.id, ':', customMetadata);
                } catch (e) {
                  console.warn('Failed to parse passthrough:', e);
                }
              } else {
                console.log('No passthrough data for', asset.id);
              }
              
              // Fetch detailed asset info to get the title
              let detailedAsset = asset;
              try {
                detailedAsset = await client.video.assets.retrieve(asset.id);
                console.log('Detailed asset fields for', asset.id, ':', JSON.stringify(detailedAsset, null, 2));
              } catch (e) {
                console.warn('Failed to fetch detailed asset:', e);
              }
              
              return {
                id: asset.id,
                playbackId: asset.playback_ids[0].id,
                thumbnail: `https://image.mux.com/${asset.playback_ids[0].id}/thumbnail.webp`,
                status: asset.status,
                createdAt: asset.created_at,
                duration: asset.duration,
                aspectRatio: asset.aspect_ratio,
                title: customMetadata.title || detailedAsset.video_title || detailedAsset.master?.name || 'Untitled',
                description: customMetadata.description || detailedAsset.video_description || '',
                year: customMetadata.year || '',
                filmmaker: customMetadata.filmmaker || '',
                country: customMetadata.country || ''
              };
            })
        );
      } catch (error) {
        console.warn('Failed to fetch from Mux API:', error.message);
      }
    }

    // Combine and deduplicate assets (prefer local data)
    const combined = [...localAssets];
    muxAssets.forEach(muxAsset => {
      if (!combined.find(local => local.id === muxAsset.id)) {
        combined.push(muxAsset);
      }
    });

    // Filter out Mux's default test videos
    const filtered = combined.filter(asset => {
      // Filter out common Mux test/example video IDs and patterns
      const isTestVideo = 
        asset.id === '3fMT5ZqYShCbiI00Um3K00eGAqf7d6xmylwDKVEYAl4Ck' || // Known test video ID
        asset.playbackId === 'sxY31L6Opl02RWPpm3Gro9XTe7fRHBjs92x93kiB1vpc' || // Known test playback ID
        asset.originalPath?.includes('get-started') ||
        asset.originalPath?.includes('test') ||
        asset.originalPath?.includes('example') ||
        asset.originalPath?.includes('sample');
      
      return !isTestVideo;
    });

    return Response.json({
      success: true,
      assets: filtered,
      sources: {
        local: localAssets.length,
        mux: muxAssets.length,
        total: filtered.length,
        filtered: combined.length - filtered.length
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to fetch Mux assets:', error);
    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}