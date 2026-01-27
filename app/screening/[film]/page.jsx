"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import ImagesExport from "../../components/Images";
import Vimeo from "@u-wave/react-vimeo";
import Image from "next/image";

const HIDE_CONTROLS_DELAY = 2000;

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

  const videoContainerRef = useRef(null);
  const timeoutRef = useRef(null);
  const pauseButtonTimeoutRef = useRef(null);
  const initialTimerActiveRef = useRef(false);

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
      playerInstance.on("timeupdate", (data) => {
        if (!isSeeking) setCurrentTime(data.seconds);
      });
      playerInstance.on("loaded", () =>
        playerInstance.getDuration().then(setDuration),
      );
      playerInstance.getDuration().then((dur) => dur && setDuration(dur));
    },
    [isSeeking],
  );

  const handleSeek = useCallback(
    async (e) => {
      if (!player || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
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
        if (!getFullscreenElement() && videoContainerRef.current) {
          await requestFullscreen(videoContainerRef.current)?.catch(() => {});
          setIsFullscreen(true);
        }
        await player.play();
      } catch (error) {
        console.error("Play error:", error);
      }
    }
  }, [player, isPlaying]);

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
      console.error("Fullscreen error:", error);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const nowFullscreen = !!getFullscreenElement();
      setIsFullscreen(nowFullscreen);
      if (nowFullscreen) {
        setShowControls(true);
        setShowPauseButton(false);
        clearTimeout(pauseButtonTimeoutRef.current);
      } else {
        setShowControls(false);
      }
    };

    const handleMouseMove = () => {
      if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

      if (isFullscreen) {
        setShowControls(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (isPlaying) setShowControls(false);
        }, HIDE_CONTROLS_DELAY);
      } else if (isPlaying && !initialTimerActiveRef.current) {
        setShowPauseButton(true);
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
  }, [isFullscreen, isPlaying]);

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
    if (isPlaying) return "opacity-0 md:group-hover:opacity-100";
    return "opacity-0";
  }, [isFullscreen, showControls, isPlaying]);

  if (loading || !currentAsset) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-primary">
        {/* <h1 className="text-2xl font-basis mb-4">Loading film...</h1> */}
      </div>
    );
  }

  return (
    <div className="w-screen min-h-[calc(100vh-200px)] flex flex-col items-center font-basis justify-center bg-background text-primary relative py-8">
      <div
        ref={videoContainerRef}
        className={`relative flex items-center justify-center group ${
          isFullscreen 
            ? "fixed inset-0 w-screen h-screen z-50 p-0" 
            : "w-full max-w-7xl p-4 md:p-8"
        }`}
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

        {/* Hover detection layer - captures hover for group-hover to work over iframe */}
        {isFullscreen && (
          <div className="absolute inset-0 z-10" />
        )}

        {/* Custom Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <button
            onClick={handlePlayPause}
            className={`pointer-events-auto rounded-full p-6 transition-all z-10 ${
              isFullscreen
                ? showControls
                  ? "opacity-100"
                  : "opacity-0"
                : isPlaying
                  ? bottomControlsOpacity
                  : "opacity-0 md:group-hover:opacity-100"
            }`}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <Image
              src={isPlaying ? "/icons/Pause Icon.png" : "/icons/Play Icon.png"}
              width={256}
              height={256}
              alt={isPlaying ? "pause" : "play"}
            />
          </button>
        </div>

        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pb-8 pointer-events-none z-30 ${bottomControlsOpacity} transition-opacity`}
        >
          <div
            className="h-1 bg-white/30 rounded-full cursor-pointer pointer-events-auto mb-2"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-[#C4B0EC] rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[#C4B0EC] text-sm font-avenir">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <button
              onClick={handleFullscreen}
              className="rounded p-2 transition-all pointer-events-auto hover:bg-white/10"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#C4B0EC"
                >
                  <path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#C4B0EC"
                >
                  <path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full sm:w-[80%] lg:w-[50%] px-4 md:px-8 pb-4 pt-4 font-avenir">
        <h1 className="pb-8 font-frontage block">{`${currentAsset.title}, ${currentAsset.year}`}</h1>
        <button
          onClick={() => setShowReadMore(!showReadMore)}
          className="text-primary font-bold uppercase hover:text-[#C4B0EC] transition-colors flex items-center gap-2"
        >
          About Film
        </button>
        {showReadMore && currentAsset.description && (
          <div className="mt-4 p-4 rounded text-base">
            <div className="pt-2 font-avenir">
              <span className="text-[#C4B0EC]">Description:</span>
              <p className="mt-1">{currentAsset.description}</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full sm:w-[80%] lg:w-[50%] px-4 md:px-8 pb-8 font-avenir">
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="text-primary font-bold uppercase hover:text-[#C4B0EC] transition-colors flex items-center gap-2"
        >
          Archive
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
