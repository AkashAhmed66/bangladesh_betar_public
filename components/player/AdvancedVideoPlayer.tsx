"use client";

import {
  FastForward,
  Gauge,
  LoaderCircle,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Rewind,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

type AdvancedVideoPlayerProps = {
  src: string;
  title: string;
  poster?: string | null;
  autoPlay?: boolean;
};

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "00:00";
  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function AdvancedVideoPlayer({ src, title, poster, autoPlay = false }: AdvancedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPip, setIsPip] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPip = () => setIsPip(true);
    const handleLeavePip = () => setIsPip(false);
    video.addEventListener("enterpictureinpicture", handleEnterPip);
    video.addEventListener("leavepictureinpicture", handleLeavePip);
    return () => {
      video.removeEventListener("enterpictureinpicture", handleEnterPip);
      video.removeEventListener("leavepictureinpicture", handleLeavePip);
    };
  }, []);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    if (video.ended || (video.duration && video.currentTime >= video.duration)) video.currentTime = 0;
    try {
      await video.play();
    } catch {
      // Browsers may reject autoplay; the player remains ready for a user gesture.
    }
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
  };

  const seekTo = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const updateBuffered = () => {
    const video = videoRef.current;
    if (!video || video.buffered.length === 0 || !Number.isFinite(video.duration) || video.duration <= 0) return;
    setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const changeVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    if (value > 0) video.muted = false;
  };

  const changePlaybackRate = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = value;
    setPlaybackRate(value);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await containerRef.current.requestFullscreen();
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled || !("requestPictureInPicture" in video)) return;
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await video.requestPictureInPicture();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (["BUTTON", "INPUT", "SELECT"].includes(target.tagName)) return;

    const key = event.key.toLowerCase();
    if ([" ", "k", "arrowleft", "arrowright", "j", "l", "m", "f"].includes(key)) event.preventDefault();
    if (key === " " || key === "k") void togglePlayback();
    if (key === "arrowleft") seekBy(-5);
    if (key === "arrowright") seekBy(5);
    if (key === "j") seekBy(-10);
    if (key === "l") seekBy(10);
    if (key === "m") toggleMute();
    if (key === "f") void toggleFullscreen();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = Math.max(progress, buffered);
  const canUsePip = typeof document !== "undefined" && document.pictureInPictureEnabled;
  const controlClass = "grid size-9 shrink-0 place-items-center rounded-full text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:size-10";

  return (
    <div
      ref={containerRef}
      className="group/player relative size-full overflow-hidden bg-black text-white outline-none"
      tabIndex={0}
      role="region"
      aria-label={`${title} video player`}
      onKeyDown={handleKeyDown}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        controlsList="nodownload"
        className="size-full object-contain"
        onClick={() => void togglePlayback()}
        onDoubleClick={() => void toggleFullscreen()}
        onContextMenu={(event) => event.preventDefault()}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          setCurrentTime(event.currentTarget.currentTime);
          updateBuffered();
        }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onProgress={updateBuffered}
        onPlay={() => {
          setPaused(false);
          setHasError(false);
        }}
        onPlaying={() => setIsBuffering(false)}
        onPause={() => setPaused(true)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onEnded={() => setPaused(true)}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setMuted(event.currentTarget.muted);
        }}
        onRateChange={(event) => setPlaybackRate(event.currentTarget.playbackRate)}
        onError={() => {
          setHasError(true);
          setIsBuffering(false);
          setPaused(true);
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 pb-10 pt-4 opacity-0 transition-opacity group-hover/player:opacity-100 group-focus-within/player:opacity-100">
        <p className="truncate pr-4 text-xs font-bold text-white/85 sm:text-sm">{title}</p>
        <span className="shrink-0 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] backdrop-blur-md">Betar Watch</span>
      </div>

      {isBuffering && !hasError && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/15" aria-live="polite">
          <span className="grid size-14 place-items-center rounded-full bg-black/55 backdrop-blur-md"><LoaderCircle className="size-7 animate-spin" /></span>
          <span className="sr-only">Video is buffering</span>
        </div>
      )}

      {paused && !isBuffering && !hasError && (
        <button
          type="button"
          onClick={() => void togglePlayback()}
          className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/55 text-white shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-[var(--portal-color)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:size-20"
          aria-label={currentTime > 0 && currentTime < duration ? "Resume video" : "Play video"}
        >
          <Play className="ml-1 size-7 fill-current sm:size-8" />
        </button>
      )}

      {hasError && (
        <div className="absolute inset-0 grid place-items-center bg-black/80 p-6 text-center" role="alert">
          <div><p className="font-display text-xl font-bold">This video could not be played</p><p className="mt-2 text-sm text-white/65">Please check your connection or try again later.</p></div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent px-3 pb-3 pt-16 transition-opacity sm:px-5 sm:pb-4">
        <label className="block py-2" aria-label={`Seek video, ${formatTime(currentTime)} of ${formatTime(duration)}`}>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seekTo(Number(event.target.value))}
            className="advanced-video-seek block w-full"
            style={{ background: `linear-gradient(to right, var(--portal-color) 0% ${progress}%, rgba(255,255,255,.42) ${progress}% ${bufferedProgress}%, rgba(255,255,255,.18) ${bufferedProgress}% 100%)` }}
          />
        </label>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button type="button" onClick={() => void togglePlayback()} className={controlClass} aria-label={paused ? "Play video" : "Pause video"} title={paused ? "Play (K)" : "Pause (K)"}>
            {paused ? <Play className="size-4.5 fill-current" /> : <Pause className="size-4.5 fill-current" />}
          </button>
          <button type="button" onClick={() => seekBy(-10)} className={controlClass} aria-label="Skip back 10 seconds" title="Back 10 seconds (J)"><Rewind className="size-4.5" /></button>
          <button type="button" onClick={() => seekBy(10)} className={controlClass} aria-label="Skip forward 10 seconds" title="Forward 10 seconds (L)"><FastForward className="size-4.5" /></button>
          <div className="group/volume flex items-center">
            <button type="button" onClick={toggleMute} className={controlClass} aria-label={muted || volume === 0 ? "Unmute video" : "Mute video"} title="Mute (M)">
              {muted || volume === 0 ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
            </button>
            <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={(event) => changeVolume(Number(event.target.value))} className="advanced-video-volume hidden w-0 transition-all group-hover/volume:w-20 group-focus-within/volume:w-20 sm:block" aria-label="Video volume" />
          </div>
          <span className="ml-1 whitespace-nowrap text-[10px] font-bold tabular-nums text-white/75 sm:text-xs">{formatTime(currentTime)} <span className="hidden text-white/40 sm:inline">/ {formatTime(duration)}</span></span>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <label className="relative flex h-9 items-center gap-1 rounded-full px-2 text-xs font-black text-white transition hover:bg-white/15 sm:h-10" title="Playback speed">
              <Gauge className="hidden size-4 sm:block" />
              <span className="sr-only">Playback speed</span>
              <select value={playbackRate} onChange={(event) => changePlaybackRate(Number(event.target.value))} className="cursor-pointer appearance-none bg-transparent pr-1 text-xs font-black text-white outline-none" aria-label="Playback speed">
                {PLAYBACK_RATES.map((rate) => <option key={rate} value={rate} className="bg-black text-white">{rate}x</option>)}
              </select>
            </label>
            {canUsePip && (
              <button type="button" onClick={() => void togglePictureInPicture()} className={`${controlClass} hidden sm:grid`} aria-label={isPip ? "Exit picture in picture" : "Open picture in picture"} title="Picture in picture"><PictureInPicture2 className="size-4.5" /></button>
            )}
            <button type="button" onClick={() => void toggleFullscreen()} className={controlClass} aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} title="Fullscreen (F)">
              {isFullscreen ? <Minimize className="size-4.5" /> : <Maximize className="size-4.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
