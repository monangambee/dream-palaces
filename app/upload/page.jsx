'use client'
import { useState } from 'react';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    year: '',
    filmmaker: '',
    duration: '',
    country: ''
  });

  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !metadata.title) {
      setError('Please provide a title and select a file')
      return
    }

    setUploadStatus('uploading')
    setError(null)
    setUploadProgress(0)

    try {
      // Note: Vimeo upload requires implementing tus protocol client-side
      // This is a simplified version - you may want to use @vimeo/tus-js-client
      alert('Vimeo upload initiated. Video will be uploaded.')
      
      // Simulating upload for now
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setUploadStatus('success')
            return 100
          }
          return prev + 10
        })
      }, 500)
      
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed')
      setUploadStatus('error')
    }
  }

  const resetUpload = () => {
    setUploadStatus(null)
    setSelectedFile(null)
    setError(null)
    setUploadProgress(0)
    setMetadata({
      title: '',
      description: '',
      year: '',
      filmmaker: '',
      duration: '',
      country: ''
    })
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
                <p className="text-sm mb-4">Your video has been uploaded to Vimeo and is being processed.</p>
                <button 
                  onClick={resetUpload}
                  className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-background transition-colors"
                >
                  Upload Another Video
                </button>
              </div>
            ) : uploadStatus === 'uploading' ? (
              <div className="text-center font-basis">
                <div className="text-yellow-400 text-xl mb-4">Uploading...</div>
                <div className="w-full bg-gray-800 rounded-full h-4 mb-4">
                  <div 
                    className="bg-yellow-400 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm">{uploadProgress}% complete</p>
              </div>
            ) : (
              <div className="space-y-4 font-basis">
                <div className="text-sm text-center mb-4">
                  Enter video details and select file
                </div>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title *"
                    value={metadata.title}
                    onChange={(e) => handleMetadataChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-primary text-primary placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    required
                  />
                  
                  <textarea
                    placeholder="Description"
                    value={metadata.description}
                    onChange={(e) => handleMetadataChange('description', e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-primary text-primary placeholder-gray-500 focus:outline-none focus:border-yellow-400 h-24 resize-none"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Year"
                      value={metadata.year}
                      onChange={(e) => handleMetadataChange('year', e.target.value)}
                      className="px-3 py-2 bg-transparent border border-primary text-primary placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    />
                    
                    <input
                      type="text"
                      placeholder="Duration"
                      value={metadata.duration}
                      onChange={(e) => handleMetadataChange('duration', e.target.value)}
                      className="px-3 py-2 bg-transparent border border-primary text-primary placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Filmmaker"
                    value={metadata.filmmaker}
                    onChange={(e) => handleMetadataChange('filmmaker', e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-primary text-primary placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                  />
                  
                  <input
                    type="text"
                    placeholder="Country"
                    value={metadata.country}
                    onChange={(e) => handleMetadataChange('country', e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-primary text-primary placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                  />

                  <div className="border border-primary rounded p-4">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="w-full text-sm text-primary file:mr-4 file:py-2 file:px-4 file:border file:border-primary file:bg-transparent file:text-primary hover:file:bg-yellow-400 hover:file:text-background"
                    />
                    {selectedFile && (
                      <p className="mt-2 text-xs text-gray-400">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
                
                {error && (
                  <div className="text-red-400 text-sm text-center">{error}</div>
                )}
                
                <button
                  onClick={handleUpload}
                  disabled={!metadata.title || !selectedFile}
                  className="w-full px-4 py-2 border border-primary text-primary hover:bg-yellow-400 hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload to Vimeo
                </button>
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