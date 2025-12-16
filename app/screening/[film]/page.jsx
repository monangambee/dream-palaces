"use client";
import Image from "next/image";
import { useStore } from "../../src/utils/useStore";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ImagesExport from "../../components/Images";

export default function ScreeningPage() {
  const params = useParams();
  const filmSlug = params.film; // This is the title slug
  const [currentAsset, setCurrentAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReadMore, setShowReadMore] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  // Load assets from API and find the matching one
  useEffect(() => {
    const loadAsset = async () => {
      try {
        const response = await fetch("/api/vimeo-assets");
        const data = await response.json();

        if (data.success) {
          // Try to find by slug first, then fall back to video ID
          let asset = data.assets.find((a) => {
            if (!a.title) return false;
            const assetSlug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            return assetSlug === filmSlug;
          });
          
          // If not found by slug, try video ID
          if (!asset) {
            asset = data.assets.find((a) => a.id === filmSlug);
          }
          
          setCurrentAsset(asset);
        } else {
          console.error("Failed to load assets:", data.error);
        }
      } catch (error) {
        console.error("Error loading assets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [filmSlug]);



  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (loading || !currentAsset) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-primary">
        <h1 className="text-2xl font-basis mb-4">Loading film...</h1>
        {/* <p className="font-basis text-sm">Playback ID: {playbackId}</p> */}
      </div>
    );
  }

  return (
    <div className="w-screen h-full flex flex-col items-center font-basis justify-center bg-background text-primary relative">
        {!isPlaying && (
      <div 
        className="absolute inset-0 cursor-pointer z-10"
        onClick={() => setIsPlaying(true)}
      >
        <img 
          src={"https://videoapi-muybridge.vimeocdn.com/animated-thumbnails/image/80a07399-fe48-44e3-bd49-4ba7078dbdd9.gif?ClientID=sulu&Date=1765867514&Signature=e1557bf4d4aa218ddee0f285632a50d63449e492"} 
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-white/80 rounded-full p-4 hover:bg-white transition">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>
    )}
      <div className="w-full h-full flex items-center justify-center p-4 md:p-8 relative">
        <iframe

          ref={iframeRef}
          src={`https://player.vimeo.com/video/${currentAsset.id}?title=0&byline=0&portrait=0`}
          className="w-full max-w-7xl aspect-video rounded-lg"
         
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="w-[50%] px-4 md:px-8 pb-4">
        <h1 className="pb-4">{`${currentAsset.title}, ${currentAsset.year}`}</h1>
        <button
          onClick={() => setShowReadMore(!showReadMore)}
          className="text-primary hover:text-yellow-400 transition-colors flex items-center gap-2"
        >
          Read more {showReadMore ? "^" : "⌄"}
        </button>
        {showReadMore && (
          <div className="mt-4 p-4  rounded text-base ">
          
            {currentAsset.description && (
              <div className="pt-2">
                <span className="text-yellow-400">Description:</span>
                <p className="mt-1">{currentAsset.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-[50%] px-4 md:px-8 pb-8">
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="text-primary hover:text-yellow-400 transition-colors flex items-center gap-2"
        >
          Archive {showArchive ? "^" : "⌄"}
        </button>
        {showArchive && (
          <div className="mt-4">
            <ImagesExport />
          </div>
        )}
      </div>
    </div>
  );
}
