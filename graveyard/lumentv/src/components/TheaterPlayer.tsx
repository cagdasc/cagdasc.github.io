import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  PanelLeftClose,
  PanelLeftOpen,
  CalendarClock,
  Star,
  RotateCcw,
  AlertCircle,
  Loader2,
  ChevronDown,
  Tv,
  Shield,
} from 'lucide-react';
import type { Channel, EpgProgram, HlsQualityLevel } from '../types/iptv';
import { buildLocalStreamUrl, probeLocalRelayAvailable } from '../utils/localFetch';
import {
  formatTimeShort,
  formatRemainingMinutes,
  getProgramProgress,
  getChannelMonogram,
} from '../utils/formatters';

interface TheaterPlayerProps {
  channel: Channel | null;
  currentProgram: EpgProgram | null;
  nextProgram: EpgProgram | null;
  nowMs: number;
  isFavorite: boolean;
  onToggleFavorite: (channelId: string) => void;
  volume: number;
  muted: boolean;
  onVolumeChange: (vol: number) => void;
  onMutedChange: (muted: boolean) => void;
  epgDrawerOpen: boolean;
  onToggleEpgDrawer: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  useLocalRelay: boolean;
  onToggleLocalRelay: () => void;
  customUserAgent: string;
  corsProxyUrl: string;
  onOpenImport: () => void;
}

export function TheaterPlayer({
  channel,
  currentProgram,
  nextProgram,
  nowMs,
  isFavorite,
  onToggleFavorite,
  volume,
  muted,
  onVolumeChange,
  onMutedChange,
  epgDrawerOpen,
  onToggleEpgDrawer,
  sidebarCollapsed,
  onToggleSidebar,
  useLocalRelay,
  onToggleLocalRelay,
  customUserAgent,
  corsProxyUrl,
  onOpenImport,
}: TheaterPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [qualityLevels, setQualityLevels] = useState<HlsQualityLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(-1); // -1 = Auto
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [logoBroken, setLogoBroken] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const [localRelayAvailable, setLocalRelayAvailable] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    probeLocalRelayAvailable().then((available) => {
      if (mounted) setLocalRelayAvailable(available);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setLogoBroken(false);
  }, [channel?.id]);

  // Sync volume and mute with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  // Listen to fullscreen state changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Initialize HLS or native playback when channel or retryNonce changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setIsPlaying(false);
      setIsBuffering(false);
      setStreamError(null);
      setQualityLevels([]);
      return;
    }

    let cancelled = false;
    setStreamError(null);
    setIsBuffering(true);
    setQualityLevels([]);
    setSelectedLevel(-1);
    setCurrentTimeSec(0);
    setDurationSec(0);
    setIsLiveStream(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const rawUrl = channel.streamUrl;
    const isDirectVideoFile = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(rawUrl);
    const canRelayStream = localRelayAvailable || Boolean(corsProxyUrl.trim());
    const url =
      useLocalRelay && canRelayStream
        ? buildLocalStreamUrl(rawUrl, customUserAgent, corsProxyUrl, localRelayAvailable)
        : rawUrl;
    const shouldTryHlsJs = Hls.isSupported() && !isDirectVideoFile;

    const startNativePlayback = () => {
      if (cancelled) return;
      video.src = url;
      video.load();
      video.play().catch(() => {
        // Autoplay might be blocked by browser policy until user interacts; remain ready
        if (!cancelled) setIsBuffering(false);
      });
    };

    if (shouldTryHlsJs) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;

      let networkRecoveryTries = 0;
      let mediaRecoveryTries = 0;

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        if (cancelled) return;
        const levels: HlsQualityLevel[] = data.levels.map((lvl, idx) => ({
          index: idx,
          height: lvl.height || 0,
          width: lvl.width || 0,
          bitrate: lvl.bitrate || 0,
          label: lvl.height ? `${lvl.height}p` : `${Math.round((lvl.bitrate || 0) / 1000)} kbps`,
        }));
        setQualityLevels(levels);
        video.play().catch(() => {
          if (!cancelled) setIsBuffering(false);
        });
      });

      hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
        if (cancelled) return;
        setIsLiveStream(Boolean(data.details?.live));
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (cancelled || !data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          // If manifest failed to parse as HLS (e.g. a non-HLS direct stream without extension), try native
          if (data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR) {
            hls.destroy();
            hlsRef.current = null;
            startNativePlayback();
            return;
          }
          if (networkRecoveryTries < 2) {
            networkRecoveryTries++;
            hls.startLoad();
            return;
          }
          setIsBuffering(false);
          setStreamError(
            'Unable to load stream. The broadcast URL may be offline or blocked by CORS headers.'
          );
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRecoveryTries < 2) {
          mediaRecoveryTries++;
          hls.recoverMediaError();
        } else {
          hls.destroy();
          hlsRef.current = null;
          setIsBuffering(false);
          setStreamError('Playback error occurred while decoding this stream.');
        }
      });

      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || isDirectVideoFile) {
      startNativePlayback();
    } else {
      startNativePlayback();
    }

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute('src');
      video.load();
    };
  }, [channel, retryNonce, useLocalRelay, customUserAgent, corsProxyUrl, localRelayAvailable]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video || !channel) return;
    if (video.paused) {
      video.play().catch(() => {
        setStreamError('Playback could not start. Check the stream URL or retry.');
      });
    } else {
      video.pause();
    }
  }, [channel]);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen rejection
    }
  }, []);

  const togglePictureInPicture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // Ignore PiP errors
    }
  }, []);

  const handleQualityChange = (levelIndex: number) => {
    setSelectedLevel(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
  };

  // Keyboard shortcuts for player controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' && channel) {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onMutedChange(!muted);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [channel, muted, onMutedChange, toggleFullscreen, togglePlayPause]);

  const formatPlaybackClock = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return '00:00';
    const total = Math.floor(sec);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  };

  if (!channel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0A0D12]">
        <div className="max-w-md space-y-4">
          <div className="w-14 h-14 mx-auto rounded-xl bg-[#12161F] border border-white/[0.08] flex items-center justify-center text-amber-400">
            <Tv className="w-7 h-7" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white">
            Add your M3U playlist to begin
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Paste an M3U / M3U8 URL, drop a local playlist file, and optionally attach a local
            XMLTV guide. Everything runs strictly in your browser.
          </p>
          <button
            type="button"
            onClick={onOpenImport}
            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
          >
            Add M3U URL or File
          </button>
        </div>
      </div>
    );
  }

  const programProgress = currentProgram
    ? getProgramProgress(currentProgram.startMs, currentProgram.endMs, nowMs)
    : 0;

  return (
    <div className="flex flex-col bg-[#0A0D12]">
      {/* Theater Video Stage */}
      <div
        ref={containerRef}
        className="relative w-full bg-black aspect-video max-h-[62vh] flex items-center justify-center overflow-hidden group border-b border-white/[0.08]"
      >
        <video
          ref={videoRef}
          playsInline
          onClick={togglePlayPause}
          onPlay={() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setStreamError(null);
          }}
          onCanPlay={() => setIsBuffering(false)}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTimeSec(videoRef.current.currentTime);
              if (Number.isFinite(videoRef.current.duration)) {
                setDurationSec(videoRef.current.duration);
              }
            }
          }}
          onError={() => {
            if (!hlsRef.current) {
              setIsBuffering(false);
              setStreamError('Browser could not decode or reach this stream URL.');
            }
          }}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Buffering State */}
        {isBuffering && !streamError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 pointer-events-none">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#12161F]/90 border border-white/[0.1] text-sm text-slate-200">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Connecting to stream...</span>
            </div>
          </div>
        )}

        {/* Stream Error State */}
        {streamError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0D12]/90 p-6">
            <div className="max-w-md w-full bg-[#12161F] border border-red-500/30 rounded-xl p-5 space-y-3 text-center">
              <AlertCircle className="w-7 h-7 text-red-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-display text-base font-semibold text-white">
                  Stream Unavailable
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{streamError}</p>
              </div>
              <p className="font-mono text-[11px] text-slate-500 truncate px-2 py-1 bg-[#0A0D12] rounded border border-white/[0.06]">
                {channel.streamUrl}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRetryNonce((n) => n + 1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Stream</span>
                </button>
                {!useLocalRelay && (localRelayAvailable || Boolean(corsProxyUrl.trim())) && (
                  <button
                    type="button"
                    onClick={onToggleLocalRelay}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#181E29] hover:bg-white/[0.1] border border-white/[0.12] rounded-lg transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>{localRelayAvailable ? 'Retry via Local Relay' : 'Retry via CORS Proxy'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Control Bar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pt-8 pb-3 flex items-center justify-between gap-4 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity duration-150">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onMutedChange(!muted)}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onVolumeChange(val);
                  if (val > 0 && muted) onMutedChange(false);
                }}
                aria-label="Volume"
                className="hidden sm:block w-20 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 pl-1 font-mono text-xs text-slate-300 tabular-nums whitespace-nowrap">
              {isLiveStream ? (
                <span className="inline-flex items-center gap-1.5 text-red-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  LIVE
                </span>
              ) : (
                <span>
                  {formatPlaybackClock(currentTimeSec)}
                  {durationSec > 0 && !Number.isNaN(durationSec)
                    ? ` / ${formatPlaybackClock(durationSec)}`
                    : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {qualityLevels.length > 1 && (
              <div className="relative">
                <select
                  value={selectedLevel}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  aria-label="Stream quality"
                  className="appearance-none h-9 pl-2.5 pr-7 bg-black/60 border border-white/15 rounded-lg text-xs font-mono text-slate-200 hover:border-white/30 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value={-1}>Auto</option>
                  {qualityLevels.map((lvl) => (
                    <option key={lvl.index} value={lvl.index}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            )}

            {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
              <button
                type="button"
                onClick={togglePictureInPicture}
                aria-label="Picture in Picture"
                className="hidden sm:inline-flex w-10 h-10 items-center justify-center rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={sidebarCollapsed ? 'Show channel sidebar' : 'Theater mode (hide sidebar)'}
              title={sidebarCollapsed ? 'Show channels' : 'Theater mode'}
              className="hidden lg:inline-flex w-10 h-10 items-center justify-center rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Now Playing Metadata Strip */}
      <div className="px-4 lg:px-6 py-4 bg-[#12161F] border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          {/* Channel Emblem */}
          <div className="w-11 h-11 shrink-0 rounded-lg bg-[#0A0D12] border border-white/[0.08] flex items-center justify-center overflow-hidden">
            {channel.logoUrl && !logoBroken ? (
              <img
                src={channel.logoUrl}
                alt={`${channel.name} logo`}
                referrerPolicy="no-referrer"
                onError={() => setLogoBroken(true)}
                className="w-full h-full object-contain p-1.5"
              />
            ) : (
              <span className="font-mono text-xs font-semibold text-amber-400">
                {getChannelMonogram(channel.name)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            {/* Unboxed Metadata Line */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-400">
              <span className="font-medium text-slate-300">{channel.category}</span>
              {channel.number && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">Ch {channel.number}</span>
                </>
              )}
              {currentProgram && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-amber-400">
                    {formatTimeShort(currentProgram.startMs)} – {formatTimeShort(currentProgram.endMs)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {formatRemainingMinutes(currentProgram.endMs, nowMs)}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h1 className="font-display text-base sm:text-lg font-semibold text-white truncate">
                {channel.name}
              </h1>
              {currentProgram && (
                <span className="text-sm text-slate-300 truncate">
                  {currentProgram.title}
                </span>
              )}
            </div>

            {currentProgram ? (
              <div className="flex items-center gap-3 pt-0.5">
                <div className="w-36 sm:w-48 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${programProgress}%` }}
                  />
                </div>
                {nextProgram && (
                  <p className="text-xs text-slate-400 truncate">
                    Up next:{' '}
                    <span className="text-slate-200">{nextProgram.title}</span>{' '}
                    <span className="font-mono tabular-nums text-slate-500">
                      ({formatTimeShort(nextProgram.startMs)})
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No local EPG schedule matched for this channel.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {(localRelayAvailable || Boolean(corsProxyUrl.trim())) && (
            <button
              type="button"
              onClick={onToggleLocalRelay}
              title={
                localRelayAvailable
                  ? 'Route stream through your local localhost Vite relay to bypass browser CORS or apply custom User-Agent'
                  : 'Route stream through your configured custom CORS proxy URL'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                useLocalRelay
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-[#181E29] border-white/[0.08] text-slate-300 hover:text-white hover:border-white/[0.16]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>
                {useLocalRelay
                  ? localRelayAvailable
                    ? 'Relay On'
                    : 'Proxy On'
                  : localRelayAvailable
                    ? 'Local Relay'
                    : 'CORS Proxy'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggleFavorite(channel.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              isFavorite
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-[#181E29] border-white/[0.08] text-slate-300 hover:text-white hover:border-white/[0.16]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleEpgDrawer}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              epgDrawerOpen
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-semibold'
                : 'bg-[#181E29] border-white/[0.08] text-slate-200 hover:text-white hover:border-white/[0.16]'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>{epgDrawerOpen ? 'Hide Guide' : 'Show Guide'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
