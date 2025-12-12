'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const ImagesExport = () => {
  const router = useRouter()
  const [vimeoAssets, setVimeoAssets] = useState([])

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await fetch('/api/vimeo-assets')
        const data = await response.json()
        
        if (data.success) {
          setVimeoAssets(data.assets)
        } else {
          console.error('Failed to load assets:', data.error)
        }
      } catch (error) {
        console.error('Error loading assets:', error)
      }
    }
    
    loadAssets()
  }, [])

  const handleImageClick = (asset) => {
    const titleSlug = asset.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    router.push(`/screening/${titleSlug}`)
  }

  if (!vimeoAssets || vimeoAssets.length === 0) {
    return <p className="text-sm text-gray-400">Loading films...</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
      {vimeoAssets.map((asset) => (
        <div 
          key={asset.id}
          onClick={() => handleImageClick(asset)}
          className="group cursor-pointer border border-primary hover:border-yellow-400 transition-colors p-2"
        >
          <img 
            src={asset.thumbnail}
            alt={asset.title}
            className="w-full aspect-video object-cover grayscale group-hover:grayscale-0 transition-all"
          />
          <p className="text-xs mt-2 text-center truncate">{asset.title}</p>
        </div>
      ))}
    </div>
  )
}

export default ImagesExport