"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import type { Video } from "@/src/modules/list/types";

export type PlaybackState = {
  currentTime: number;
  isMuted: boolean;
  isPlaying: boolean;
  volume: number;
};

export const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  currentTime: 0,
  isMuted: false,
  isPlaying: false,
  volume: 1,
};

type PersistentPlayerContextValue = {
  activeVideo: Video | null;
  playbackState: PlaybackState;
  clearPlayer: () => void;
  persistPlayback: (nextState: PlaybackState) => void;
  setActiveVideo: (video: Video) => void;
};

const PersistentPlayerContext = createContext<PersistentPlayerContextValue | null>(null);

type PersistentPlayerProviderProps = {
  children: ReactNode;
};

export function PersistentPlayerProvider({ children }: PersistentPlayerProviderProps) {
  const [activeVideo, setActiveVideoState] = useState<Video | null>(null);
  const [playbackState, setPlaybackState] = useState(DEFAULT_PLAYBACK_STATE);
  const activeVideoIdRef = useRef<string | null>(null);

  const setActiveVideo = useCallback((video: Video) => {
    const isNewVideo = activeVideoIdRef.current !== video.id;
    activeVideoIdRef.current = video.id;
    setActiveVideoState((currentVideo) => (currentVideo?.id === video.id ? currentVideo : video));
    if (isNewVideo) {
      setPlaybackState(DEFAULT_PLAYBACK_STATE);
    }
  }, []);

  const persistPlayback = useCallback((nextState: PlaybackState) => {
    setPlaybackState({
      currentTime: Number.isFinite(nextState.currentTime) ? Math.max(0, nextState.currentTime) : 0,
      isMuted: nextState.isMuted,
      isPlaying: nextState.isPlaying,
      volume: Number.isFinite(nextState.volume) ? Math.min(Math.max(nextState.volume, 0), 1) : 1,
    });
  }, []);

  const clearPlayer = useCallback(() => {
    activeVideoIdRef.current = null;
    setActiveVideoState(null);
    setPlaybackState(DEFAULT_PLAYBACK_STATE);
  }, []);

  return (
    <PersistentPlayerContext.Provider value={{ activeVideo, playbackState, clearPlayer, persistPlayback, setActiveVideo }}>
      {children}
    </PersistentPlayerContext.Provider>
  );
}

export function usePersistentPlayer() {
  const context = useContext(PersistentPlayerContext);

  if (!context) {
    throw new Error("usePersistentPlayer must be used inside PersistentPlayerProvider");
  }

  return context;
}
