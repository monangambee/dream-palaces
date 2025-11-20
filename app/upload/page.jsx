'use client'
import { useState, useEffect } from 'react';
import MuxUploader from '@mux/mux-uploader-react';

export default function UploadPage() {
  const [uploadUrl, setUploadUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Get upload URL from API
  useEffect(() => {
    const getUploadUrl = async () => {
      try {
        const response = await fetch('/api/upload');
        const data = await response.json();
        
        if (data.success) {
          setUploadUrl(data.uploadUrl);
        } else {
          setError(data.error || 'Failed to get upload URL');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getUploadUrl();
  }, []);

  const handleUploadStart = () => {
    setUploadStatus('uploading');
  };

  const handleUploadSuccess = (event) => {
    console.log('Upload successful:', event.detail);
    setUploadStatus('success');
  };

  const handleUploadError = (event) => {
    console.error('Upload failed:', event.detail);
    setUploadStatus('error');
    setError(event.detail?.message || 'Upload failed');
  };

  const resetUpload = async () => {
    setIsLoading(true);
    setUploadStatus(null);
    setError(null);
    
    // Get new upload URL
    try {
      const response = await fetch('/api/upload');
      const data = await response.json();
      
      if (data.success) {
        setUploadUrl(data.uploadUrl);
      } else {
        setError(data.error || 'Failed to get upload URL');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center">
        <div className="text-center font-basis">
          <h1 className="text-2xl mb-4">Loading uploader...</h1>
          <div className="text-sm">Getting upload URL from Mux</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center">
        <div className="text-center font-basis">
          <h1 className="text-2xl mb-4 text-red-400">Error</h1>
          <p className="text-sm mb-4">{error}</p>
          <button 
            onClick={resetUpload}
            className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-background transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-chillax text-center mb-8">Upload Video</h1>
          
          <div className="bg-background border border-primary rounded-lg p-6">
            {uploadStatus === 'success' ? (
              <div className="text-center font-basis">
                <div className="text-green-400 text-xl mb-4">✓ Upload Successful!</div>
                <p className="text-sm mb-4">Your video has been uploaded to Mux and is being processed.</p>
                <button 
                  onClick={resetUpload}
                  className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-background transition-colors"
                >
                  Upload Another Video
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="font-basis text-sm text-center mb-4">
                  Select a video file to upload to Mux
                </div>
                
                {uploadUrl && (
                  <MuxUploader
                    endpoint={uploadUrl}
                    onUploadStart={handleUploadStart}
                    onSuccess={handleUploadSuccess}
                    onError={handleUploadError}
                    style={{
                      '--uploader-font-family': 'var(--font-basis)',
                      '--uploader-background-color': 'transparent',
                      '--uploader-text-color': '#FDF9ED',
                      '--uploader-border-color': '#FDF9ED',
                    }}
                  />
                )}
                
                {uploadStatus === 'uploading' && (
                  <div className="text-center text-yellow-400 font-basis text-sm">
                    Uploading... Please wait
                  </div>
                )}
                
                {uploadStatus === 'error' && (
                  <div className="text-center">
                    <div className="text-red-400 text-sm mb-2">Upload failed</div>
                    <button 
                      onClick={resetUpload}
                      className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-background transition-colors text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <a 
              href="/screening" 
              className="text-primary hover:text-yellow-400 font-basis text-sm underline"
            >
              ← Back to Screening Room
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}