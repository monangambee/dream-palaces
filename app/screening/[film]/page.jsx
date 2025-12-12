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
    <div className="w-screen h-screen flex flex-col items-center font-basis justify-center bg-background text-primary overflow-hidden relative">
      <div className="w-full h-full flex items-center justify-center p-4 md:p-8 relative">
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${currentAsset.id}?title=0&byline=0&portrait=0`}
          className="w-full max-w-7xl aspect-video rounded-lg"
          frameBorder="0"
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
