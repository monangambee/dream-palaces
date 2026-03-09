/**
 * Screening Page – Custom Vimeo Player
 *
 * Dynamic route: /screening/[film] where [film] is a URL slug derived
 * from the video's Vimeo title.
 *
 * Features:
 *  - Custom play/pause, seek bar, and fullscreen controls (Vimeo's
 *    native controls are hidden).
 *  - Fullscreen uses the Vimeo SDK's player.requestFullscreen() first,
 *    falling back to the DOM Fullscreen API for broader support.
 *  - Auto-hides controls after 3 s of inactivity during playback.
 *  - Automatically enables the first English subtitle track on load.
 *  - Collapsible "About Film" and "Archive" sections below the player.
 */
"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import ImagesExport from "../../components/Films"
import Vimeo from "@u-wave/react-vimeo"

const HIDE_CONTROLS_DELAY = 3000 // ms before controls auto-hide

// Cross-browser fullscreen helpers (DOM API fallback)
const getFullscreenElement = () =>
  document.fullscreenElement || document.webkitFullscreenElement

const requestFullscreen = (element) => {
  const fn = element.requestFullscreen || element.webkitRequestFullscreen
  return fn?.call(element)
}

const exitFullscreen = () => {
  const fn = document.exitFullscreen || document.webkitExitFullscreen
  return fn?.call(document)
}

export default function ScreeningPage() {
  const { film: filmSlug } = useParams()
  const [currentAsset, setCurrentAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReadMore, setShowReadMore] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [player, setPlayer] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [videoReady, setVideoReady] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
    const [isLatestFilm, setIsLatestFilm] = useState(false)

  const videoContainerRef = useRef(null)
  const timeoutRef = useRef(null)
  const isSeekingRef = useRef(false)
  const isPlayingRef = useRef(false)

  useEffect(() => {
    setIsMobile(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    )
  }, [])

  // Find the matching video by comparing slugified titles
  useEffect(() => {
    const loadAsset = async () => {
      try {
        const response = await fetch("/api/vimeo-assets")
        const data = await response.json()

        if (data.success) {
          const toSlug = (title) =>
            title
              ?.toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
          const asset =
            data.assets.find((a) => toSlug(a.title) === filmSlug) ||
            data.assets.find((a) => a.id === filmSlug)
          setCurrentAsset(asset)

          // First asset in the list is the latest film
          setIsLatestFilm(
            !!(asset && data.assets[0] && asset.id === data.assets[0].id),
          )
        } else {
          console.error("Failed to load assets:", data.error)
        }
      } catch (error) {
        console.error("Error loading assets:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAsset()
  }, [filmSlug])

  // Auto-enable English subtitles once the player is ready
  useEffect(() => {
    if (videoReady && player) {
      player
        .getTextTracks?.()
        .then((tracks) => {
          if (!tracks || tracks.length === 0) return
          const track =
            tracks.find((item) => item.language === "en") || tracks[0]
          return player.enableTextTrack(track.language, track.kind)
        })
        .catch((err) => console.log("Subtitle auto-enable:", err))
    }
  }, [videoReady, player])

  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  const scheduleHideControls = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setShowControls(true)
    timeoutRef.current = setTimeout(() => {
      if (isPlayingRef.current) setShowControls(false)
    }, HIDE_CONTROLS_DELAY)
  }, [])

  /** Bind Vimeo player events: play, pause, buffer, time, fullscreen */
  const handlePlayerReady = useCallback((playerInstance) => {
    setPlayer(playerInstance)
    playerInstance.on("play", () => {
      setIsPlaying(true)
      isPlayingRef.current = true
    })
    playerInstance.on("pause", () => {
      setIsPlaying(false)
      isPlayingRef.current = false
    })
    playerInstance.on("bufferstart", () => setIsBuffering(true))
    playerInstance.on("bufferend", () => setIsBuffering(false))
    playerInstance.on("timeupdate", (data) => {
      if (!isSeekingRef.current) setCurrentTime(data.seconds)
    })
    playerInstance.on("loaded", () => {
      playerInstance.getDuration().then(setDuration)
      setVideoReady(true)
    })
    playerInstance.on("fullscreenchange", (data) => {
      const nowFullscreen =
        typeof data === "boolean" ? data : !!data?.fullscreen
      setIsFullscreen(nowFullscreen)
      if (nowFullscreen) {
        scheduleHideControls()
      } else {
        setShowControls(false)
      }
    })
  }, [scheduleHideControls])

  /** Seek to a position based on click/touch location on the progress bar */
  const handleSeek = useCallback(
    async (e) => {
      if (!player || !duration) return
      const rect = e.currentTarget.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const percent = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      )
      const newTime = percent * duration
      isSeekingRef.current = true
      setCurrentTime(newTime)
      try {
        await player.setCurrentTime(newTime)
      } catch (error) {
        console.error("Seek error:", error)
      }
      setTimeout(() => { isSeekingRef.current = false }, 100)
    },
    [player, duration],
  )

  /**
   * Enter native fullscreen.
   * Mobile: use Vimeo SDK for the best native experience.
   * Desktop: fullscreen the container div so our custom controls
   * overlay stays visible (the Vimeo SDK would fullscreen the
   * iframe alone, hiding everything outside it).
   */
  const requestNativeFullscreen = useCallback(async () => {
    if (isMobile && player?.requestFullscreen) {
      await player.requestFullscreen()
      return
    }

    if (videoContainerRef.current) {
      await requestFullscreen(videoContainerRef.current)
    }
  }, [player, isMobile])

  /** Exit native fullscreen — mirror the enter strategy */
  const exitNativeFullscreen = useCallback(async () => {
    if (isMobile && player?.exitFullscreen) {
      await player.exitFullscreen()
      return
    }

    if (getFullscreenElement()) {
      await exitFullscreen()
    }
  }, [player, isMobile])

  /**
   * Play/Pause toggle.
   * On desktop, auto-enters fullscreen when playback starts.
   * Exiting play also exits fullscreen.
   */
  const handlePlayPause = useCallback(async () => {
    if (!player) return

    if (isPlaying) {
      if (isFullscreen) {
        try {
          await exitNativeFullscreen()
        } catch (error) {
          console.warn("Fullscreen exit error:", error)
        }
        setIsFullscreen(false)
      }
      player.pause()
    } else {
      try {
        if (!isMobile && !isFullscreen) {
          try {
            await requestNativeFullscreen()
            setIsFullscreen(true)
          } catch (error) {
            console.warn("Auto fullscreen error:", error)
          }
        }
        await player.play()
      } catch (error) {
        console.error("Play error:", error)
      }
    }
  }, [
    player,
    isPlaying,
    isMobile,
    isFullscreen,
    exitNativeFullscreen,
    requestNativeFullscreen,
  ])

  /** Toggle fullscreen state and schedule control auto-hide on mobile */
  const handleFullscreen = useCallback(async () => {
    if (!videoContainerRef.current) return

    try {
      if (isFullscreen || getFullscreenElement()) {
        await exitNativeFullscreen()
        setIsFullscreen(false)
      } else {
        await requestNativeFullscreen()
        setIsFullscreen(true)
        if (isMobile) {
          scheduleHideControls()
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
    }
  }, [
    isFullscreen,
    isMobile,
    exitNativeFullscreen,
    requestNativeFullscreen,
    scheduleHideControls,
  ])

  /** Mobile: tap to toggle controls visibility while playing */
  const handleVideoTap = useCallback(() => {
    if (!isMobile) return

    if (isFullscreen || isPlaying) {
      setShowControls((prev) => {
        if (!prev) scheduleHideControls()
        return !prev
      })
    }
  }, [isMobile, isFullscreen, isPlaying, scheduleHideControls])

  // Sync fullscreen state with browser events and auto-hide on mouse move
  useEffect(() => {
    const handleFullscreenChange = () => {
      const nowFullscreen = !!getFullscreenElement()
      setIsFullscreen(nowFullscreen)
      if (nowFullscreen) {
        scheduleHideControls()
      } else {
        setShowControls(false)
      }
    }

    const handleMouseMove = () => {
      if (isMobile) return
      if (isFullscreen) {
        scheduleHideControls()
      }
    }

    const fsEvents = ["fullscreenchange", "webkitfullscreenchange"]
    fsEvents.forEach((e) =>
      document.addEventListener(e, handleFullscreenChange),
    )
    document.addEventListener("mousemove", handleMouseMove)

    return () => {
      fsEvents.forEach((e) =>
        document.removeEventListener(e, handleFullscreenChange),
      )
      document.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(timeoutRef.current)
    }
  }, [isFullscreen, isMobile, scheduleHideControls])

  const progressPercent = useMemo(
    () => (duration > 0 ? (currentTime / duration) * 100 : 0),
    [currentTime, duration],
  )

  const bottomControlsOpacity = useMemo(() => {
    if (isFullscreen) return showControls ? "opacity-100" : "opacity-0"
    if (isMobile && isPlaying)
      return showControls ? "opacity-100" : "opacity-0"
    if (isPlaying) return "opacity-0 md:group-hover:opacity-100"
    return "opacity-0"
  }, [isFullscreen, showControls, isPlaying, isMobile])

  const centerButtonOpacity = useMemo(() => {
    if (!videoReady || isBuffering) return "opacity-0 pointer-events-none"
    if (isPlaying) {
      if (isFullscreen) return showControls ? "opacity-100" : "opacity-0"
      if (isMobile) return showControls ? "opacity-100" : "opacity-0"
      return bottomControlsOpacity
    }
    return "opacity-100 md:opacity-0 md:group-hover:opacity-100"
  }, [
    videoReady,
    isBuffering,
    isPlaying,
    isFullscreen,
    showControls,
    isMobile,
    bottomControlsOpacity,
  ])

  if (loading || !currentAsset) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-primary" />
    )
  }

  return (
    <div className="w-screen min-h-[calc(100vh-200px)] flex flex-col items-center font-basis justify-center bg-background text-primary relative py-4 sm:py-8">
      <div
        ref={videoContainerRef}
        onClick={handleVideoTap}
        className={`flex items-center justify-center group ${
          isFullscreen
            ? "object-contain fixed inset-0 w-full h-full z-50 p-0 bg-black"
            : "w-full max-w-7xl px-2 sm:px-4 md:px-8"
        }`}
      >
        <div
          className={
            isFullscreen
              ? "flex w-full h-full items-center justify-center"
              : "relative w-full aspect-auto h-full"
          }
        >
          <Vimeo
            className={`vimeo-player ${isFullscreen ? "w-full h-full rounded-none" : "w-full h-full aspect-video rounded-lg"} duration-1000 flex items-center justify-center transition-opacity ease-in-out ${videoReady ? "opacity-100" : "opacity-0"}`}
            video={currentAsset.id}
            autoplay={false}
            // width="100%"
            // height="100%"
            showTitle={false}
            showByline={false}
            showPortrait={false}
            color="FACC15"
            responsive={false}
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
          <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-20">
            {/* Thumbnail background until video ready */}
            {!isPlaying && !isBuffering && currentAsset.thumbnail && isLatestFilm && (
              <img
                src={'https://videoapi-muybridge.vimeocdn.com/animated-thumbnails/image/1d8f168a-b823-4d54-96db-c437ec81aa53.gif?ClientID=sulu&Date=1772467095&Signature=aeece7e2e99bb38a6e18e7e8e655946ccbd14dab'}
                alt={currentAsset.title}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePlayPause()
              }}
              className={`pointer-events-auto rounded-full p-4 sm:p-6 duration-300 transition-all z-10 ${centerButtonOpacity}`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  className="w-16 h-16 md:w-64 md:h-64 text-movieAccent"
                  viewBox="0 0 211.34 400"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <rect fill="currentColor" width="80" height="400" />
                    <rect
                      fill="currentColor"
                      x="131.34"
                      width="80"
                      height="400"
                    />
                  </g>
                </svg>
              ) : (
                <svg
                  className="w-16 h-16 md:w-64 md:h-64 text-movieAccent"
                  viewBox="0 0 295.52 400"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <polygon
                      fill="currentColor"
                      points="0 0 0 400 295.52 200 0 0"
                    />
                  </g>
                </svg>
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div
            className={`absolute bottom-0 sm:bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-full max-w-2xl px-2 sm:px-4 pb-4 sm:pb-2 pointer-events-none z-30 ${bottomControlsOpacity} ease-in-out duration-1000 transition-opacity`}
          >
            <div
              className="h-2 sm:h-1 bg-white/30 cursor-pointer pointer-events-auto mb-2 touch-none"
              onClick={(e) => {
                e.stopPropagation()
                handleSeek(e)
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
                handleSeek(e)
              }}
            >
              <div
                className="h-full bg-[#C4B0EC]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[#C4B0EC] text-xs sm:text-sm font-avenir">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFullscreen()
                }}
                className="rounded p-1 sm:p-2 pointer-events-auto"
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
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
      </div>

      {/* Film Info Section */}
      <div className="w-full sm:w-[80%] lg:w-[50%] px-5 md:px-8 pb-4 pt-6 sm:pt-4 font-avenir">
        <h1 className="pb-4 sm:pb-8 font-frontage text-lg sm:text-xl md:text-2xl">{`${currentAsset.title}`}</h1>
        <button
          onClick={() => setShowReadMore(!showReadMore)}
          className="group text-primary font-bold uppercase text-sm sm:text-base hover:text-[#C4B0EC] ease-in-out duration-500 transition-colors flex items-center gap-2"
        >
          About Film{" "}
          <span className="invisible text-sm group-hover:visible">
            {showReadMore ? "▲" : "▼"}
          </span>
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
      <div className="w-full sm:w-[80%] lg:w-[50%] px-5 md:px-8 pb-8 font-avenir">
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="group text-primary font-bold uppercase text-sm sm:text-base hover:text-[#C4B0EC] ease-in-out transition-colors duration-500 flex items-center gap-2"
        >
          Archive{" "}
          <span className="invisible group-hover:visible text-sm">
            {showArchive ? "▲" : "▼"}
          </span>
        </button>
        {showArchive && (
          <div className="mt-4 w-full">
            <ImagesExport />
          </div>
        )}
      </div>
    </div>
  )
}