import { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Link2,
  FileText,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import type { EpgDataset, StoredPlaylist } from '../types/iptv';
import { parseM3uContent } from '../utils/m3uParser';
import {
  fetchUrlWithLocalFallback,
  LocalFetchError,
  probeLocalRelayAvailable,
} from '../utils/localFetch';
import {
  decodePossiblyGzippedBuffer,
  parseXmltvContent,
  readPossiblyGzippedFile,
} from '../utils/xmltvParser';

interface ImportModalProps {
  isOpen: boolean;
  initialTab: 'playlist' | 'epg';
  customUserAgent: string;
  onCustomUserAgentChange: (ua: string) => void;
  corsProxyUrl: string;
  onCorsProxyUrlChange: (proxyUrl: string) => void;
  onClose: () => void;
  onImportPlaylist: (playlist: StoredPlaylist) => Promise<void>;
  onImportEpg: (dataset: EpgDataset) => Promise<void>;
}

type InputMode = 'url' | 'file' | 'text';

export function ImportModal({
  isOpen,
  initialTab,
  customUserAgent,
  onCustomUserAgentChange,
  corsProxyUrl,
  onCorsProxyUrlChange,
  onClose,
  onImportPlaylist,
  onImportEpg,
}: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<'playlist' | 'epg'>(initialTab);

  // Playlist state
  const [m3uMode, setM3uMode] = useState<InputMode>('url');
  const [playlistName, setPlaylistName] = useState('');
  const [m3uUrl, setM3uUrl] = useState('');
  const [m3uText, setM3uText] = useState('');
  const [epgUrlHint, setEpgUrlHint] = useState<string | null>(null);

  // EPG state
  const [epgMode, setEpgMode] = useState<InputMode>('file');
  const [epgName, setEpgName] = useState('');
  const [epgUrl, setEpgUrl] = useState('');
  const [epgText, setEpgText] = useState('');

  // Relay state
  const [localRelayAvailable, setLocalRelayAvailable] = useState<boolean | null>(null);
  const [showSelfHostedRelay, setShowSelfHostedRelay] = useState(false);

  // Status
  const [isBusy, setIsBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [blockedContext, setBlockedContext] = useState<{
    kind: 'playlist' | 'epg';
    url: string;
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const m3uFileInputRef = useRef<HTMLInputElement>(null);
  const epgFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    probeLocalRelayAvailable().then((available) => {
      if (mounted) setLocalRelayAvailable(available);
    });
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg(null);
    setBlockedContext(null);
    setSuccessMsg(null);
  };

  const commitM3uString = async (
    rawText: string,
    sourceType: 'url' | 'file' | 'text',
    fallbackName: string,
    sourceRef?: string
  ) => {
    const playlistId = `pl_${Date.now().toString(36)}`;
    const parsed = parseM3uContent(rawText, playlistId);

    if (parsed.channels.length === 0) {
      throw new Error(
        'No valid stream entries found. Verify the file starts with #EXTM3U / #EXTINF lines and contains stream URLs.'
      );
    }

    const stored: StoredPlaylist = {
      meta: {
        id: playlistId,
        name: playlistName.trim() || fallbackName,
        sourceType,
        sourceRef,
        epgUrlHint: parsed.epgUrlHint,
        createdAt: Date.now(),
        channelCount: parsed.channels.length,
        categories: parsed.categories,
      },
      channels: parsed.channels,
    };

    await onImportPlaylist(stored);
    if (parsed.epgUrlHint) {
      setEpgUrlHint(parsed.epgUrlHint);
      setEpgUrl(parsed.epgUrlHint);
    }
    setSuccessMsg(
      `Imported "${stored.meta.name}" — ${parsed.channels.length} channels across ${parsed.categories.length} categories saved locally.`
    );
  };

  const handleImportM3uSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsBusy(true);

    try {
      if (m3uMode === 'url') {
        const trimmedUrl = m3uUrl.trim();
        if (!trimmedUrl) throw new Error('Enter an M3U or M3U8 playlist URL.');

        const result = await fetchUrlWithLocalFallback(trimmedUrl, {
          userAgent: customUserAgent,
          corsProxyUrl,
        });

        const text = new TextDecoder().decode(result.buffer);
        const urlName = trimmedUrl.split('/').pop()?.split('?')[0] || 'Remote M3U Playlist';
        await commitM3uString(text, 'url', urlName, trimmedUrl);
        if (result.viaRelay) {
          setSuccessMsg((prev) =>
            prev ? `${prev} (Fetched via local machine relay)` : 'Fetched via local machine relay.'
          );
        } else if (result.viaCustomRelay) {
          setSuccessMsg((prev) =>
            prev ? `${prev} (Fetched via your self-hosted relay)` : 'Fetched via your self-hosted relay.'
          );
        }
      } else if (m3uMode === 'text') {
        if (!m3uText.trim()) throw new Error('Paste your M3U playlist text first.');
        await commitM3uString(m3uText, 'text', 'Pasted Playlist');
      }
    } catch (err) {
      if (err instanceof LocalFetchError && err.isBlockedOnStaticHost) {
        setBlockedContext({ kind: 'playlist', url: m3uUrl.trim() });
      }
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse M3U playlist.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleM3uFileSelected = async (file: File | undefined) => {
    if (!file) return;
    resetMessages();
    setIsBusy(true);
    try {
      const content = await file.text();
      await commitM3uString(content, 'file', file.name.replace(/\.(m3u8?|txt)$/i, ''));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to read M3U file.');
    } finally {
      setIsBusy(false);
    }
  };

  const commitXmltvString = async (
    xmlText: string,
    sourceType: 'file' | 'url' | 'text',
    fallbackName: string
  ) => {
    const dataset = parseXmltvContent(xmlText, {
      name: epgName.trim() || fallbackName,
      sourceType,
    });

    if (dataset.info.programCount === 0) {
      throw new Error('XMLTV parsed cleanly, but zero <programme> entries were found.');
    }

    await onImportEpg(dataset);
    setSuccessMsg(
      `Loaded local EPG "${dataset.info.name}" — ${dataset.info.programCount.toLocaleString()} programs across ${dataset.info.channelCount} channels.`
    );
  };

  const handleEpgFileSelected = async (file: File | undefined) => {
    if (!file) return;
    resetMessages();
    setIsBusy(true);
    try {
      const xmlText = await readPossiblyGzippedFile(file);
      await commitXmltvString(xmlText, 'file', file.name.replace(/\.(xml|gz)$/gi, ''));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse XMLTV file.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImportEpgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsBusy(true);

    try {
      if (epgMode === 'url') {
        const trimmedUrl = epgUrl.trim();
        if (!trimmedUrl) throw new Error('Enter an XMLTV or .xml.gz URL.');
        const result = await fetchUrlWithLocalFallback(trimmedUrl, {
          userAgent: customUserAgent,
          corsProxyUrl,
        });
        const xmlText = await decodePossiblyGzippedBuffer(result.buffer, trimmedUrl);
        const urlName = trimmedUrl.split('/').pop()?.split('?')[0] || 'Browser-Fetched XMLTV';
        await commitXmltvString(xmlText, 'url', urlName);
      } else if (epgMode === 'text') {
        if (!epgText.trim()) throw new Error('Paste your XMLTV document first.');
        await commitXmltvString(epgText, 'text', 'Pasted XMLTV Guide');
      }
    } catch (err) {
      if (err instanceof LocalFetchError && err.isBlockedOnStaticHost) {
        setBlockedContext({ kind: 'epg', url: epgUrl.trim() });
      }
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse XMLTV guide.');
    } finally {
      setIsBusy(false);
    }
  };

  const renderSelfHostedRelayOption = (idPrefix: string) => (
    <div className="rounded-lg border border-white/[0.08] bg-[#0A0D12] overflow-hidden">
      <button
        type="button"
        onClick={() => setShowSelfHostedRelay((v) => !v)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
      >
        <span className="font-medium">
          Self-Hosted Relay URL (optional)
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            showSelfHostedRelay ? 'rotate-180' : ''
          }`}
        />
      </button>

      {showSelfHostedRelay && (
        <div className="px-3 pb-3 pt-1 border-t border-white/[0.06] space-y-1.5">
          <label
            htmlFor={`${idPrefix}-custom-relay`}
            className="block text-[11px] font-medium text-slate-300"
          >
            Your Own Private Relay Endpoint (never uses third-party services)
          </label>
          <input
            id={`${idPrefix}-custom-relay`}
            type="url"
            value={corsProxyUrl}
            onChange={(e) => onCorsProxyUrlChange(e.target.value)}
            placeholder="e.g. http://localhost:8787/?url={url} or your private worker"
            className="w-full h-9 px-3 bg-[#12161F] border border-white/[0.1] rounded-lg font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      )}
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[#12161F] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2 id="import-modal-title" className="font-display text-base font-semibold text-white">
              Import Local Sources
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Parsed and stored exclusively inside your browser. Zero external uploads.</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import modal"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Type Tabs */}
        <div className="px-6 pt-4 shrink-0">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#0A0D12] rounded-lg border border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('playlist');
                resetMessages();
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'playlist'
                  ? 'bg-[#181E29] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Playlist (M3U / M3U8)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('epg');
                resetMessages();
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'epg'
                  ? 'bg-[#181E29] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TV Guide (XMLTV / .gz)
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {activeTab === 'playlist' ? (
            <form onSubmit={handleImportM3uSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="playlist-name" className="block text-xs font-medium text-slate-300">
                  Playlist Label (optional)
                </label>
                <input
                  id="playlist-name"
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="e.g., Home IPTV Channels"
                  className="w-full h-10 px-3 bg-[#0A0D12] border border-white/[0.1] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Input Method Selector */}
              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'url', label: 'M3U URL', icon: Link2 },
                    { id: 'file', label: 'Local File', icon: Upload },
                    { id: 'text', label: 'Paste Text', icon: FileText },
                  ] as const
                ).map((mode) => {
                  const Icon = mode.icon;
                  const active = m3uMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setM3uMode(mode.id);
                        resetMessages();
                      }}
                      className={`flex-1 h-9 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : 'bg-[#0A0D12] border-white/[0.08] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {m3uMode === 'url' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="m3u-url" className="block text-xs font-medium text-slate-300">
                      Direct M3U / M3U8 URL
                    </label>
                    <input
                      id="m3u-url"
                      type="url"
                      value={m3uUrl}
                      onChange={(e) => setM3uUrl(e.target.value)}
                      placeholder="https://example.com/playlist.m3u8"
                      className="w-full h-10 px-3 bg-[#0A0D12] border border-white/[0.1] rounded-lg font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {localRelayAvailable !== false && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="m3u-user-agent"
                        className="block text-xs font-medium text-slate-300"
                      >
                        Custom User-Agent (optional, local Vite relay)
                      </label>
                      <input
                        id="m3u-user-agent"
                        type="text"
                        value={customUserAgent}
                        onChange={(e) => onCustomUserAgentChange(e.target.value)}
                        placeholder="Browser default (or e.g. VLC/3.0.20 LibVLC/3.0.20)"
                        className="w-full h-9 px-3 bg-[#0A0D12] border border-white/[0.1] rounded-lg font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  {renderSelfHostedRelayOption('m3u')}

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Fetches directly from your browser with zero third-party services.{' '}
                    {localRelayAvailable
                      ? 'Automatically falls back to your local machine Vite relay if CORS blocks the request.'
                      : 'If the remote host blocks CORS on static hosting, download the playlist in a new tab and drop it into Local File mode, or run LumenTV locally.'}
                  </p>
                </div>
              )}

              {m3uMode === 'file' && (
                <div>
                  <input
                    ref={m3uFileInputRef}
                    type="file"
                    accept=".m3u,.m3u8,.txt"
                    onChange={(e) => handleM3uFileSelected(e.target.files?.[0])}
                    className="hidden"
                  />
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleM3uFileSelected(e.dataTransfer.files?.[0]);
                    }}
                    onClick={() => m3uFileInputRef.current?.click()}
                    className="border border-dashed border-white/[0.18] hover:border-amber-500/60 bg-[#0A0D12] rounded-xl p-7 text-center cursor-pointer transition-colors space-y-2"
                  >
                    <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                    <p className="text-sm font-medium text-slate-200">
                      Drop .m3u or .m3u8 file here, or click to browse
                    </p>
                    <p className="text-xs text-slate-500">
                      Read directly from disk via File API — nothing leaves your computer.
                    </p>
                  </div>
                </div>
              )}

              {m3uMode === 'text' && (
                <div className="space-y-1.5">
                  <label htmlFor="m3u-raw" className="block text-xs font-medium text-slate-300">
                    Raw M3U Content
                  </label>
                  <textarea
                    id="m3u-raw"
                    rows={5}
                    value={m3uText}
                    onChange={(e) => setM3uText(e.target.value)}
                    placeholder={`#EXTM3U\n#EXTINF:-1 group-title="News",Sample Channel\nhttps://example.com/stream.m3u8`}
                    className="w-full p-3 bg-[#0A0D12] border border-white/[0.1] rounded-lg font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {epgUrlHint && (
                <div className="p-3 bg-[#181E29] border border-amber-500/30 rounded-lg flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-200 truncate">
                    Playlist references EPG URL: <span className="font-mono text-amber-300">{epgUrlHint}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('epg');
                      setEpgMode('url');
                      resetMessages();
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-950 bg-amber-500 rounded-md shrink-0"
                  >
                    Load EPG
                  </button>
                </div>
              )}

              {m3uMode !== 'file' && (
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Parse & Save Locally</span>
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleImportEpgSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="epg-name" className="block text-xs font-medium text-slate-300">
                  Guide Label (optional)
                </label>
                <input
                  id="epg-name"
                  type="text"
                  value={epgName}
                  onChange={(e) => setEpgName(e.target.value)}
                  placeholder="e.g., Local Weekly Guide"
                  className="w-full h-10 px-3 bg-[#0A0D12] border border-white/[0.1] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'file', label: 'Local File (.xml / .gz)', icon: Upload },
                    { id: 'url', label: 'XMLTV URL', icon: Link2 },
                    { id: 'text', label: 'Paste XML', icon: FileText },
                  ] as const
                ).map((mode) => {
                  const Icon = mode.icon;
                  const active = epgMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setEpgMode(mode.id);
                        resetMessages();
                      }}
                      className={`flex-1 h-9 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : 'bg-[#0A0D12] border-white/[0.08] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {epgMode === 'file' && (
                <div>
                  <input
                    ref={epgFileInputRef}
                    type="file"
                    accept=".xml,.gz,.xmltv"
                    onChange={(e) => handleEpgFileSelected(e.target.files?.[0])}
                    className="hidden"
                  />
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleEpgFileSelected(e.dataTransfer.files?.[0]);
                    }}
                    onClick={() => epgFileInputRef.current?.click()}
                    className="border border-dashed border-white/[0.18] hover:border-amber-500/60 bg-[#0A0D12] rounded-xl p-7 text-center cursor-pointer transition-colors space-y-2"
                  >
                    <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                    <p className="text-sm font-medium text-slate-200">
                      Drop .xml or .xml.gz XMLTV file here, or click to browse
                    </p>
                    <p className="text-xs text-slate-500">
                      Gzipped XMLTV files are decompressed natively inside your browser.
                    </p>
                  </div>
                </div>
              )}

              {epgMode === 'url' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="epg-url" className="block text-xs font-medium text-slate-300">
                      XMLTV or .xml.gz URL
                    </label>
                    <input
                      id="epg-url"
                      type="url"
                      value={epgUrl}
                      onChange={(e) => setEpgUrl(e.target.value)}
                      placeholder="https://example.com/guide.xml.gz"
                      className="w-full h-10 px-3 bg-[#0A0D12] border border-white/[0.1] rounded-lg font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {localRelayAvailable !== false && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="epg-user-agent"
                        className="block text-xs font-medium text-slate-300"
                      >
                        Custom User-Agent (optional, local Vite relay)
                      </label>
                      <input
                        id="epg-user-agent"
                        type="text"
                        value={customUserAgent}
                        onChange={(e) => onCustomUserAgentChange(e.target.value)}
                        placeholder="Browser default (or e.g. VLC/3.0.20 LibVLC/3.0.20)"
                        className="w-full h-9 px-3 bg-[#0A0D12] border border-white/[0.1] rounded-lg font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                  {renderSelfHostedRelayOption('epg')}
                </div>
              )}

              {epgMode === 'text' && (
                <div className="space-y-1.5">
                  <label htmlFor="epg-raw" className="block text-xs font-medium text-slate-300">
                    Raw XMLTV Content
                  </label>
                  <textarea
                    id="epg-raw"
                    rows={5}
                    value={epgText}
                    onChange={(e) => setEpgText(e.target.value)}
                    placeholder={`<tv><channel id="ch1"><display-name>Channel 1</display-name></channel>...</tv>`}
                    className="w-full p-3 bg-[#0A0D12] border border-white/[0.1] rounded-lg font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {epgMode !== 'file' && (
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Parse & Save Guide Locally</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Feedback Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 space-y-3 text-xs text-red-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>

              {blockedContext && (
                <div className="flex flex-wrap items-center gap-2 pl-6">
                  {blockedContext.url && (
                    <a
                      href={blockedContext.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Download URL in New Tab</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (blockedContext.kind === 'playlist') {
                        setM3uMode('file');
                      } else {
                        setEpgMode('file');
                      }
                      resetMessages();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#181E29] hover:bg-white/[0.1] border border-white/[0.12] text-slate-200 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Use Local File</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start justify-between gap-3 text-xs text-emerald-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="font-semibold text-emerald-300 hover:text-white shrink-0"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
