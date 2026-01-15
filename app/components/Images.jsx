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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-4">
      {vimeoAssets.map((asset) => (
        <div 
          key={asset.id}
          onClick={() => handleImageClick(asset)}
          className="group cursor-pointer flex flex-col sm:flex-row items-center gap-4 sm:gap-8  md:hover:border-yellow-400 active:border-yellow-400 transition-colors p-3 sm:p-2 min-h-[44px]"
        >
          <img 
            src={asset.thumbnail}
            alt={asset.title}
            className="w-full sm:w-[50%] aspect-video object-cover grayscale md:group-hover:grayscale-0 border border-primary  group-active:grayscale-0 transition-all"
          />
          <p className="text-sm sm:text-xs mt-2 sm:mt-0 text-center font-frontage break-words whitespace-normal w-full sm:w-auto">{asset.title}</p>
        </div>
      ))}
    </div>
  )
}

export default ImagesExport