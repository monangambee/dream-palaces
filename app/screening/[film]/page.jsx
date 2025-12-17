"use client";


import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ImagesExport from "../../components/Images";
import Image from "next/image";

import Vimeo from '@u-wave/react-vimeo'

export default function ScreeningPage() {
  const params = useParams();
  const filmSlug = params.film; // This is the title slug
  const [currentAsset, setCurrentAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReadMore, setShowReadMore] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const videoContainerRef = useRef(null);
  // const iframeRef = useRef(null);
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

  // Format time to MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle player ready and setup
  const handlePlayerReady = (playerInstance) => {
    setPlayer(playerInstance);
    
    // Set up event listeners
    playerInstance.on('play', () => {
      setIsPlaying(true);
      setHasStartedPlaying(true);
    });
    
    playerInstance.on('pause', () => {
      setIsPlaying(false);
    });

    playerInstance.on('timeupdate', (data) => {
      if (!isSeeking) {
        setCurrentTime(data.seconds);
      }
    });

    playerInstance.on('loaded', () => {
      playerInstance.getDuration().then((dur) => {
        setDuration(dur);
      });
    });

    playerInstance.getDuration().then((dur) => {
      if (dur) setDuration(dur);
    });
  };

  // Handle seeking
  const handleSeek = async (e) => {
    if (!player || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    setIsSeeking(true);
    setCurrentTime(newTime);
    try {
      await player.setCurrentTime(newTime);
    } catch (error) {
      console.error('Seek error:', error);
    }
    setTimeout(() => setIsSeeking(false), 100);
  };

  // Cross-browser fullscreen helpers
  const getFullscreenElement = () => {
    return document.fullscreenElement || 
           document.webkitFullscreenElement || 
           document.mozFullScreenElement || 
           document.msFullscreenElement || 
           null;
  };

  const requestFullscreen = async (element) => {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      return element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      return element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      return element.msRequestFullscreen();
    }
    throw new Error('Fullscreen API not supported');
  };

  const exitFullscreen = async () => {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      return document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      return document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      return document.msExitFullscreen();
    }
    throw new Error('Fullscreen API not supported');
  };

  // Handle custom play/pause
  const handlePlayPause = async () => {
    if (!player) return;
    
    if (isPlaying) {
      player.pause();
    } else {
      try {
        // Enter fullscreen first, then play
        if (!getFullscreenElement() && videoContainerRef.current) {
          try {
            await requestFullscreen(videoContainerRef.current);
            setIsFullscreen(true);
          } catch (error) {
            console.log('Fullscreen not available:', error);
          }
        }
        // Play the video
        await player.play();
      } catch (error) {
        console.error('Play error:', error);
      }
    }
  };

  // Handle fullscreen toggle
  const handleFullscreen = async () => {
    if (!videoContainerRef.current) return;
    
    try {
      const isCurrentlyFullscreen = !!getFullscreenElement();
      
      if (isCurrentlyFullscreen) {
        await exitFullscreen();
        setIsFullscreen(false);
      } else {
        await requestFullscreen(videoContainerRef.current);
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const nowFullscreen = !!getFullscreenElement();
      setIsFullscreen(nowFullscreen);
      if (nowFullscreen) {
        setShowControls(true);
      } else {
        setShowControls(false);
      }
    };

    const handleMouseMove = () => {
      if (isFullscreen) {
        setShowControls(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (isPlaying) {
            setShowControls(false);
          }
        }, 3000);
      }
    };

    // Listen to all browser-specific fullscreen events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isFullscreen, isPlaying]);

  if (loading || !currentAsset) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-primary">
        <h1 className="text-2xl font-basis mb-4">Loading film...</h1>
        {/* <p className="font-basis text-sm">Playback ID: {playbackId}</p> */}
      </div>
    );
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center font-basis justify-center bg-background text-primary relative py-8">
        {/* {!isPlaying && (
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
    )} */}
      <div 
        ref={videoContainerRef}
        className="w-full max-w-7xl h-full flex items-center justify-center p-4 md:p-8 relative group"
      >
        <Vimeo 
          className="w-full aspect-video rounded-lg"
          video={currentAsset.id} 
          autoplay={false}
          width="100%"
          height="100%"
          showTitle={false}
          showByline={false}
          showPortrait={false}
          color="FACC15"
          responsive={true}
          loop={false}
          background={false}
          controls={false}
          onReady={handlePlayerReady}
        />

        {/* Custom Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {/* {!isPlaying && (  
            <Image alt="Fannie's Film" src='/thumbnails/FANNIE’S FILM.gif' fill className=" absolute inset-0 w-full h-full object-cover z-1"></Image>
          )} */}
          {/* Center Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className={`pointer-events-auto rounded-full p-6 transition-all z-10 ${
              isFullscreen
                ? (showControls ? 'opacity-100' : 'opacity-0')
                : (isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100')
            }`}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
             <svg xmlns="http://www.w3.org/2000/svg" height="128px" viewBox="0 -960 960 960" width="128px" fill="#FACC15"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg>

            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" height="128px" viewBox="0 -960 960 960" width="128px" fill="#FACC15"><path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"/></svg>
            )}
          </button>
        </div>

        {/* Progress Bar and Controls */}
        <div className={`absolute bottom-0 left-0 right-0 px-4 pb-8 pointer-events-none z-30 ${
          isFullscreen
            ? (showControls ? 'opacity-100' : 'opacity-0')
            : 'opacity-0 group-hover:opacity-100'
        } transition-opacity`}>
          {/* Progress Slider */}
          <div 
            className="h-1 bg-white/30 rounded-full cursor-pointer pointer-events-auto mb-2"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-yellow-400 rounded-full transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          
          {/* Time Display and Fullscreen Button */}
          <div className="flex items-center justify-between">
            <div className="text-yellow-400 text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <button
              onClick={handleFullscreen}
              className="rounded p-2 transition-all pointer-events-auto hover:bg-white/10"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FACC15"><path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FACC15"><path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-[50%] px-4 md:px-8 pb-4 pt-4 font-avenir">
        <h1 className="pb-4 font-frontage">{`${currentAsset.title}, ${currentAsset.year}`}</h1>
        <button
          onClick={() => setShowReadMore(!showReadMore)}
          className="text-primary hover:text-yellow-400 transition-colors flex items-center gap-2"
        >
          Read more {showReadMore ? "^" : "⌄"}
        </button>
        {showReadMore && (
          <div className="mt-4 p-4  rounded text-base ">
          
            {currentAsset.description && (
              <div className="pt-2 font-avenir">
                <span className="text-yellow-400 ">Description:</span>
                <p className="mt-1 ">{currentAsset.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-[50%] px-4 md:px-8 pb-8 font-avenir">
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
