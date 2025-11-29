'use client'
import Image from "next/image";
import { useStore } from "../../../src/utils/useStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";

export default function ScreeningPage() {
  const params = useParams()
  const playbackId = params.film // This is the playback ID
  const [currentAsset, setCurrentAsset] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !currentAsset) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-primary">
        <h1 className="text-2xl font-basis mb-4">Loading film...</h1>
        {/* <p className="font-basis text-sm">Playback ID: {playbackId}</p> */}
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center font-basis gap-4 justify-center bg-background text-primary overflow-hidden relative">
      <Link href="/screening" className="absolute top-4 left-4  text-sm z-10">← Featured films </Link>
      <h1 className="text-2xl mb-6">
        {/* {currentAsset.originalPath?.split('/').pop()?.replace('.mp4', '') || 'Video'} */}

      </h1>
      <div className="relative w-full h-full  aspect-video">
        <MuxPlayer
          playbackId={currentAsset.playbackId}
          poster={currentAsset.thumbnail}
          controls
          autoPlay="any"
          streamType="on-demand"
          className="w-full h-full s rounded-lg {seek-backward-button:none"
          primaryColor="white"
          accentColor="black"
          metadata={{
            videoTitle: 'film'
          }}
          style={{
            "--seek-backward-button": "none",
            "--seek-forward-button": "none",
            "--playback-rate-button": "none",
            hover:{
              "--play-button":""
            }

          }}
        />
      </div>
      <div className="text-center max-w-2xl">
        <p className="text-xs mb-2">
          <strong>Asset ID:</strong> {currentAsset.id}
        </p>
        <p className="text-xs">
          <strong>File:</strong> {currentAsset.originalPath}
        </p>
      </div>
    </div>
  );
}
