"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import ImagesExport from "../../components/Films";
import Vimeo from "@u-wave/react-vimeo";
import Image from "next/image";

const HIDE_CONTROLS_DELAY = 3000;

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const getFullscreenElement = () =>
  document.fullscreenElement ||
  document.webkitFullscreenElement ||
  document.mozFullScreenElement ||
  document.msFullscreenElement;

const requestFullscreen = (element) => {
  const fn =
    element.requestFullscreen ||
    element.webkitRequestFullscreen ||
    element.mozRequestFullScreen ||
    element.msRequestFullscreen;
  return fn?.call(element);
};

const exitFullscreen = () => {
  const fn =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen;
  return fn?.call(document);
};

export default function ScreeningPage() {
  const { film: filmSlug } = useParams();
  const [currentAsset, setCurrentAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReadMore, setShowReadMore] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showPauseButton, setShowPauseButton] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const videoContainerRef = useRef(null);
  const timeoutRef = useRef(null);
  const pauseButtonTimeoutRef = useRef(null);
  const initialTimerActiveRef = useRef(false);

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(isTouchDevice());
    const handleResize = () => setIsMobile(isTouchDevice());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadAsset = async () => {
      try {
        const response = await fetch("/api/vimeo-assets");
        const data = await response.json();

        if (data.success) {
          const toSlug = (title) =>
            title
              ?.toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
          const asset =
            data.assets.find((a) => toSlug(a.title) === filmSlug) ||
            data.assets.find((a) => a.id === filmSlug);
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
    if (isPlaying && isFullscreen) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, HIDE_CONTROLS_DELAY);
    }
  }, [isPlaying, isFullscreen]);

  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handlePlayerReady = useCallback(
    (playerInstance) => {
      setPlayer(playerInstance);
      playerInstance.on("play", () => setIsPlaying(true));
      playerInstance.on("pause", () => setIsPlaying(false));
      playerInstance.on("bufferstart", () => setIsBuffering(true));
      playerInstance.on("bufferend", () => setIsBuffering(false));
      playerInstance.on("timeupdate", (data) => {
        if (!isSeeking) setCurrentTime(data.seconds);
      });
      playerInstance.on("loaded", () => {
        playerInstance.getDuration().then(setDuration);
        setVideoReady(true);
      });
      playerInstance.getDuration().then((dur) => dur && setDuration(dur));
    },
    [isSeeking],
  );

  const handleSeek = useCallback(
    async (e) => {
      if (!player || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const percent = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      const newTime = percent * duration;
      setIsSeeking(true);
      setCurrentTime(newTime);
      try {
        await player.setCurrentTime(newTime);
      } catch (error) {
        console.error("Seek error:", error);
      }
      setTimeout(() => setIsSeeking(false), 100);
    },
    [player, duration],
  );

  const handlePlayPause = useCallback(async () => {
    if (!player) return;

    if (isPlaying) {
      player.pause();
    } else {
      try {
        // On mobile, try fullscreen but don't block playback if it fails
        if (!getFullscreenElement() && videoContainerRef.current && !isMobile) {
          await requestFullscreen(videoContainerRef.current)?.catch(() => {});
          setIsFullscreen(true);
        }
        await player.play();
      } catch (error) {
        console.error("Play error:", error);
      }
    }
  }, [player, isPlaying, isMobile]);

  const handleFullscreen = useCallback(async () => {
    if (!videoContainerRef.current) return;

    try {
      if (getFullscreenElement()) {
        await exitFullscreen();
        setIsFullscreen(false);
      } else {
        await requestFullscreen(videoContainerRef.current);
        setIsFullscreen(true);
      }
    } catch (error) {
      // iOS Safari fallback - simulate fullscreen with CSS
      if (isMobile) {
        setIsFullscreen(!isFullscreen);
      }
      console.error("Fullscreen error:", error);
    }
  }, [isMobile, isFullscreen]);

  // Handle touch tap to show/hide controls
  const handleVideoTap = useCallback(() => {
    if (!isMobile) return;

    if (isFullscreen || isPlaying) {
      setShowControls((prev) => !prev);
      clearTimeout(timeoutRef.current);
      if (!showControls) {
        timeoutRef.current = setTimeout(() => {
          if (isPlaying) setShowControls(false);
        }, HIDE_CONTROLS_DELAY);
      }
    }
  }, [isMobile, isFullscreen, isPlaying, showControls]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const nowFullscreen = !!getFullscreenElement();
      setIsFullscreen(nowFullscreen);
      if (nowFullscreen) {
        setShowControls(true);
        setShowPauseButton(false);
        clearTimeout(pauseButtonTimeoutRef.current);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (isPlaying) setShowControls(false);
        }, HIDE_CONTROLS_DELAY);
      } else {
        setShowControls(false);
      }
    };

    const handleMouseMove = () => {
      if (isMobile) return;

      if (isFullscreen) {
        setShowControls(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (isPlaying) setShowControls(false);
        }, HIDE_CONTROLS_DELAY);
      } else if (isPlaying && !initialTimerActiveRef.current) {
        setShowPauseButton(true);
        setShowControls(false);
        clearTimeout(pauseButtonTimeoutRef.current);
        pauseButtonTimeoutRef.current = setTimeout(
          () => setShowPauseButton(false),
          HIDE_CONTROLS_DELAY,
        );
      }
    };

    const fsEvents = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ];
    fsEvents.forEach((e) =>
      document.addEventListener(e, handleFullscreenChange),
    );
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      fsEvents.forEach((e) =>
        document.removeEventListener(e, handleFullscreenChange),
      );
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeoutRef.current);
      clearTimeout(pauseButtonTimeoutRef.current);
    };
  }, [isFullscreen, isPlaying, isMobile]);

  useEffect(() => {
    if (!isPlaying || getFullscreenElement()) {
      setShowPauseButton(false);
      clearTimeout(pauseButtonTimeoutRef.current);
      initialTimerActiveRef.current = false;
      return;
    }

    initialTimerActiveRef.current = true;
    setShowPauseButton(true);
    clearTimeout(pauseButtonTimeoutRef.current);
    pauseButtonTimeoutRef.current = setTimeout(() => {
      setShowPauseButton(false);
      initialTimerActiveRef.current = false;
    }, HIDE_CONTROLS_DELAY);
  }, [isPlaying]);

  const progressPercent = useMemo(
    () => (duration > 0 ? (currentTime / duration) * 100 : 0),
    [currentTime, duration],
  );

  const bottomControlsOpacity = useMemo(() => {
    if (isFullscreen) return showControls ? "opacity-100" : "opacity-0";
    if (isMobile && isPlaying)
      return showControls ? "opacity-100" : "opacity-0";
    if (isPlaying) return "opacity-0 md:group-hover:opacity-100";
    return "opacity-0";
  }, [isFullscreen, showControls, isPlaying, isMobile]);

  const centerButtonOpacity = useMemo(() => {
    if (!videoReady || isBuffering) return "opacity-0 pointer-events-none";
    if (isPlaying) {
      if (isFullscreen) return showControls ? "opacity-100" : "opacity-0";
      if (isMobile) return showControls ? "opacity-100" : "opacity-0";
      return bottomControlsOpacity;
    }
    return "opacity-100 md:opacity-0 md:group-hover:opacity-100";
  }, [
    videoReady,
    isBuffering,
    isPlaying,
    isFullscreen,
    showControls,
    isMobile,
    bottomControlsOpacity,
  ]);

  if (loading || !currentAsset) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-primary" />
    );
  }

  return (
    <div className="w-screen min-h-[calc(100vh-200px)] flex flex-col items-center font-basis justify-center bg-background text-primary relative py-4 sm:py-8">
      <div
        ref={videoContainerRef}
        onClick={handleVideoTap}
        className={`relative flex items-center justify-center group ${
          isFullscreen
            ? "fixed inset-0 w-screen h-screen z-50 p-0 bg-black"
            : "w-full max-w-7xl px-2 sm:px-4 md:px-8"
        }`}
      >
        <Vimeo
          className={`w-full aspect-video rounded-lg duration-1000 transition-opacity ease-in-out ${videoReady ? "opacity-100" : "opacity-0"} ${isFullscreen ? "rounded-none" : ""}`}
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

        {/* Hover/Touch detection layer */}
        {(isFullscreen || (isMobile && isPlaying)) && (
          <div className="absolute inset-0 z-10" />
        )}

        {/* Custom Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {/* Thumbnail background until video ready */}
          {!videoReady && currentAsset.thumbnail && (
            <img
              src={currentAsset.thumbnail}
              alt={currentAsset.title}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            className={`pointer-events-auto rounded-full p-4 sm:p-6  duration-300 transition-all z-10 ${centerButtonOpacity}`}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <Image
              src={isPlaying ? "/icons/pause2.png" : "/icons/play2.png"}
              width={512}
              height={512}
              alt={isPlaying ? "pause" : "play"}
              className="w-16 h-16 sm:w-24 sm:h-24 md:w-72 md:h-72 object-contain"
            />
          </button>
        </div>

        {/* Bottom Controls */}
        <div
          className={`absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 duration-1000 ease-in-out w-[calc(100%-1rem)] sm:w-full max-w-2xl px-2 sm:px-4 pb-4 sm:pb-8 pointer-events-none z-30 ${bottomControlsOpacity} ease-in-out duration-1000 transition-opacity`}
        >
          <div
            className="h-2 sm:h-1 bg-white/30 rounded-full cursor-pointer pointer-events-auto mb-2 touch-none"
            onClick={(e) => {
              e.stopPropagation();
              handleSeek(e);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleSeek(e);
            }}
          >
            <div
              className="h-full bg-[#C4B0EC] rounded-full ease-in-out transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[#C4B0EC] text-xs sm:text-sm font-avenir">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFullscreen();
              }}
              className="rounded p-1 sm:p-2 transition-all duration-1000 ease-in-out pointer-events-auto hover:bg-white/10"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#C4B0EC"
                  className="sm:w-6 sm:h-6"
                >
                  <path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#C4B0EC"
                  className="sm:w-6 sm:h-6"
                >
                  <path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Film Info Section */}
      <div className="w-full sm:w-[80%] lg:w-[50%] px-4 md:px-8 pb-4 pt-6 sm:pt-4 font-avenir">
        <h1 className="pb-4 sm:pb-8 font-frontage text-lg sm:text-xl md:text-2xl">{`${currentAsset.title}, ${currentAsset.year}`}</h1>
        <button
          onClick={() => setShowReadMore(!showReadMore)}
          className="group text-primary font-bold uppercase text-sm sm:text-base hover:text-[#C4B0EC] ease-in-out duration-500 transition-colors flex items-center gap-2"
        >
          About Film <span className="invisible text-sm group-hover:visible">{showReadMore ? '▲' : '▼'}</span>
        </button>
        {showReadMore && currentAsset.description && (
          <div className="mt-4 p-2 sm:p-4 rounded text-sm sm:text-base">
            <div className="pt-2 font-avenir">
              <span className="text-[#C4B0EC]">Description:</span>
              <p className="mt-1">{currentAsset.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Archive Section */}
      <div className="w-full sm:w-[80%] lg:w-[50%] px-4 md:px-8 pb-8 font-avenir">
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="group text-primary font-bold uppercase text-sm sm:text-base hover:text-[#C4B0EC] ease-in-out transition-colors duration-500 flex items-center gap-2"
        >
         Archive <span className="invisible group-hover:visible text-sm">{showArchive ? '▲' : '▼'}</span>
        </button>
        {showArchive && (
          <div className="mt-4 w-full">
            <ImagesExport />
          </div>
        )}
      </div>
    </div>
  );
}
