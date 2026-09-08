"use client";

import {
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatVideoTitle } from "@/lib/utils";
import type { Video } from "@/src/modules/list/types";

type VideoPlayerProps = {
  video: Video;
};

const SEEK_STEP_SECONDS = 5;
const CONTROLS_HIDE_DELAY_MS = 3000;

function formatTime(time: number) {
  if (!Number.isFinite(time) || time < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(time);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const displayTitle = formatVideoTitle(video.title);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressFrameRef = useRef<number | null>(null);
  const controlsHideTimeoutRef = useRef<number | null>(null);
  const lastVolumeRef = useRef(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(!video.streamUrl);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const player = videoRef.current;

    if (!player) {
      return;
    }

    setCurrentTime(0);
    setDuration(0);
    setHasError(!video.streamUrl);
    setIsPlaying(false);
    setShowControls(true);

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(player.duration) ? player.duration : 0);
      setHasError(false);
    };
    const stopProgressLoop = () => {
      if (progressFrameRef.current !== null) {
        cancelAnimationFrame(progressFrameRef.current);
        progressFrameRef.current = null;
      }
    };
    const updateProgress = () => {
      setCurrentTime(player.currentTime);

      if (!player.paused && !player.ended) {
        progressFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        progressFrameRef.current = null;
      }
    };
    const startProgressLoop = () => {
      if (progressFrameRef.current === null) {
        progressFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    const handleTimeUpdate = () => setCurrentTime(player.currentTime);
    const handlePlay = () => {
      setIsPlaying(true);
      startProgressLoop();
    };
    const handlePause = () => {
      setIsPlaying(false);
      setShowControls(true);
      stopProgressLoop();
      setCurrentTime(player.currentTime);
    };
    const handleVolumeChange = () => {
      setIsMuted(player.muted || player.volume === 0);
      setVolume(player.volume);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
      stopProgressLoop();
      setCurrentTime(player.currentTime);
    };
    const handleError = () => {
      setIsPlaying(false);
      setShowControls(true);
      setHasError(true);
      stopProgressLoop();
    };

    player.addEventListener("loadedmetadata", handleLoadedMetadata);
    player.addEventListener("timeupdate", handleTimeUpdate);
    player.addEventListener("play", handlePlay);
    player.addEventListener("pause", handlePause);
    player.addEventListener("volumechange", handleVolumeChange);
    player.addEventListener("ended", handleEnded);
    player.addEventListener("error", handleError);

    return () => {
      player.removeEventListener("loadedmetadata", handleLoadedMetadata);
      player.removeEventListener("timeupdate", handleTimeUpdate);
      player.removeEventListener("play", handlePlay);
      player.removeEventListener("pause", handlePause);
      player.removeEventListener("volumechange", handleVolumeChange);
      player.removeEventListener("ended", handleEnded);
      player.removeEventListener("error", handleError);
      stopProgressLoop();
    };
  }, [video.streamUrl]);

  const togglePlay = async () => {
    const player = videoRef.current;

    if (!player || hasError) {
      return;
    }

    if (player.paused) {
      try {
        await player.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      player.pause();
    }
  };

  const handleSeek = (value: string) => {
    const player = videoRef.current;
    const nextTime = Number(value);

    if (!player || !Number.isFinite(nextTime)) {
      return;
    }

    player.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolume = (value: string) => {
    const player = videoRef.current;
    const nextVolume = Number(value);

    if (!player || !Number.isFinite(nextVolume)) {
      return;
    }

    player.volume = nextVolume;
    player.muted = nextVolume === 0;

    if (nextVolume > 0) {
      lastVolumeRef.current = nextVolume;
    }
  };

  const toggleMute = () => {
    const player = videoRef.current;

    if (!player) {
      return;
    }

    if (player.muted || player.volume === 0) {
      player.muted = false;
      player.volume = lastVolumeRef.current || 1;
    } else {
      lastVolumeRef.current = player.volume;
      player.muted = true;
    }
  };

  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))
      ) {
        return;
      }

      const player = videoRef.current;

      if (!player || hasError) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();

        if (player.paused) {
          void player.play().catch(() => setIsPlaying(false));
        } else {
          player.pause();
        }

        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();

        const direction = event.key === "ArrowLeft" ? -1 : 1;
        const maxTime = Number.isFinite(player.duration) ? player.duration : Number.POSITIVE_INFINITY;
        const nextTime = Math.min(
          maxTime,
          Math.max(0, player.currentTime + direction * SEEK_STEP_SECONDS),
        );

        player.currentTime = nextTime;
        setCurrentTime(nextTime);
        return;
      }

      if (event.key.toLowerCase() === "m") {
        event.preventDefault();

        if (player.muted || player.volume === 0) {
          player.muted = false;
          player.volume = lastVolumeRef.current || 1;
        } else {
          lastVolumeRef.current = player.volume;
          player.muted = true;
        }
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcuts);
    return () => window.removeEventListener("keydown", handleKeyboardShortcuts);
  }, [hasError]);

  const clearControlsHideTimeout = () => {
    if (controlsHideTimeoutRef.current !== null) {
      window.clearTimeout(controlsHideTimeoutRef.current);
      controlsHideTimeoutRef.current = null;
    }
  };

  const revealControls = () => {
    setShowControls(true);
    clearControlsHideTimeout();

    if (isPlaying) {
      controlsHideTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
        controlsHideTimeoutRef.current = null;
      }, CONTROLS_HIDE_DELAY_MS);
    }
  };

  useEffect(() => {
    clearControlsHideTimeout();

    if (!isPlaying) {
      return;
    }

    controlsHideTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
      controlsHideTimeoutRef.current = null;
    }, CONTROLS_HIDE_DELAY_MS);

    return clearControlsHideTimeout;
  }, [isPlaying]);

  const toggleFullscreen = async () => {
    const container = playerContainerRef.current;

    if (!container) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (container.requestFullscreen) {
      await container.requestFullscreen();
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="group relative aspect-video overflow-hidden rounded-xl bg-black shadow-sm"
      onFocusCapture={revealControls}
      onMouseMove={revealControls}
      onTouchStart={revealControls}
      ref={playerContainerRef}
    >
      <video
        aria-label={`${displayTitle} video player`}
        className="absolute inset-0 h-full w-full cursor-pointer object-contain"
        key={video.streamUrl}
        onClick={togglePlay}
        playsInline
        poster={video.thumbnailUrl}
        preload="metadata"
        ref={videoRef}
        src={video.streamUrl}
      />

      {hasError && (
        <div
          aria-live="polite"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/65 p-6 text-center text-white"
          role="alert"
        >
          <div>
            <p className="font-semibold">Video unavailable</p>
            <p className="mt-1 text-sm text-white/75">
              This video could not be loaded.
            </p>
          </div>
        </div>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-3 pt-10 text-white transition-opacity duration-200 sm:px-4 ${
          showControls
            ? "opacity-90 group-hover:opacity-100 group-focus-within:opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="rounded-xl border border-white/10 bg-black/35 px-2.5 py-2 backdrop-blur-md">
          <div className="relative mb-1.5 h-3">
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-white/30" />
            <div
              className="pointer-events-none absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-red-500"
              style={{ width: `${progress}%` }}
            />
            <input
              aria-label="Video progress"
              className="video-progress-range relative h-3 w-full cursor-pointer disabled:cursor-default"
              disabled={hasError || duration === 0}
              max={duration || 0}
              min="0"
              onChange={(event) => handleSeek(event.currentTarget.value)}
              step="0.1"
              type="range"
              value={Math.min(currentTime, duration || 0)}
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              aria-label={isPlaying ? "Pause video" : "Play video"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={hasError}
              onClick={togglePlay}
              title={isPlaying ? "Pause video" : "Play video"}
              type="button"
            >
              {isPlaying ? (
                <Pause aria-hidden="true" className="h-4 w-4" fill="currentColor" />
              ) : (
                <Play aria-hidden="true" className="h-4 w-4" fill="currentColor" />
              )}
            </button>

            <button
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              aria-pressed={isMuted}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={hasError}
              onClick={toggleMute}
              title={isMuted ? "Unmute video" : "Mute video"}
              type="button"
            >
              {isMuted ? (
                <VolumeX aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Volume2 aria-hidden="true" className="h-4 w-4" />
              )}
            </button>

            <div className="relative hidden h-3 w-14 sm:block">
              <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-white/35" />
              <div
                className="pointer-events-none absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-red-500"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
              <input
                aria-label="Volume"
                className="video-volume-range absolute inset-0 h-3 w-full cursor-pointer"
                max="1"
                min="0"
                onChange={(event) => handleVolume(event.currentTarget.value)}
                step="0.05"
                type="range"
                value={isMuted ? 0 : volume}
              />
            </div>

            <span className="ml-1 whitespace-nowrap text-[11px] tabular-nums text-white/75 sm:text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <span className="flex-1" />

            <button
              aria-label="Enter fullscreen"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={hasError}
              onClick={toggleFullscreen}
              title="Enter fullscreen"
              type="button"
            >
              <Maximize aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
