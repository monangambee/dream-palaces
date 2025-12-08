'use client'
import Image from "next/image";
import { useStore } from "../../src/utils/useStore";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";

export default function ScreeningPage() {
  const params = useParams()
  const playbackId = params.film // This is the playback ID
  const [currentAsset, setCurrentAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const playerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Load assets from API and find the matching one
  useEffect(() => {
    const loadAsset = async () => {
      try {
        const response = await fetch('/api/mux-assets');
        const data = await response.json();
        
        if (data.success) {
          const asset = data.assets.find(a => a.playbackId === playbackId);
          setCurrentAsset(asset);
        } else {
          console.error('Failed to load assets:', data.error);
        }
      } catch (error) {
        console.error('Error loading assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [playbackId]);

  const handlePlay = () => {
    setIsPlaying(true)
    setShowButton(false)
    if (playerRef.current) {
      playerRef.current.requestFullscreen?.() || 
      playerRef.current.webkitRequestFullscreen?.() ||
      playerRef.current.mozRequestFullScreen?.() ||
      playerRef.current.msRequestFullscreen?.()
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause()
      } else {
        playerRef.current.play()
      }
    }
  }

  const handleMouseMove = () => {
    setShowButton(true)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setShowButton(false)
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (loading || !currentAsset) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-primary">
        <h1 className="text-2xl font-basis mb-4">Loading film...</h1>
        {/* <p className="font-basis text-sm">Playback ID: {playbackId}</p> */}
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center font-basis justify-center bg-background text-primary overflow-hidden relative">
      <Link href="/screening" className="absolute top-4 left-4 text-sm z-10">← Featured films </Link>
      
      <div 
        className="w-full h-full flex items-center justify-center p-4 md:p-8 relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowButton(false)}
      >
        <MuxPlayer
          ref={playerRef}
          playbackId={currentAsset.playbackId}
          poster={`https://image.mux.com/${currentAsset.playbackId}/animated.gif?width=640&fps=15`}
          controls
          streamType="on-demand"
          className="w-full max-w-7xl aspect-video rounded-lg"
          primaryColor="white"
          accentColor="black"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handlePause}
          metadata={{
            videoTitle: 'film'
          }}
          style={{
            "--play-button": "none",
            "--seek-backward-button": "none",
            "--seek-forward-button": "none",
            "--playback-rate-button": "none"
          }}
        />
        
        {showButton && (
          <button 
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors pointer-events-auto"
          >
            <div className="w-50 h-50 rounded-full 
           flex items-center justify-center text-5xl transition-all hover:scale-110">
              {isPlaying ? '⏸' : '▶'}
            </div>
          </button>
        )}
      </div>
      <div className="text-center max-w-2xl">
        {/* <p className="text-xs mb-2">
          <strong>Asset ID:</strong> {currentAsset.id}
        </p>
        <p className="text-xs">
          <strong>File:</strong> {currentAsset.originalPath}
        </p> */}
      </div>
    </div>
  );
}
