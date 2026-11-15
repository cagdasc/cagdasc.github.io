import { useState } from 'react';
import {
  ShieldCheck,
  Trash2,
  Plus,
  Check,
  Database,
  Calendar,
  Tv,
} from 'lucide-react';
import type { EpgDataset, StoredPlaylist } from '../types/iptv';

interface PlaylistsViewProps {
  playlists: StoredPlaylist[];
  activePlaylistId: string;
  epgDataset: EpgDataset | null;
  favoriteCount: number;
  onSelectPlaylist: (playlistId: string) => void;
  onDeletePlaylist: (playlistId: string) => Promise<void>;
  onClearEpg: () => Promise<void>;
  onClearAllData: () => Promise<void>;
  onOpenImport: (tab: 'playlist' | 'epg') => void;
}

export function PlaylistsView({
  playlists,
  activePlaylistId,
  epgDataset,
  favoriteCount,
  onSelectPlaylist,
  onDeletePlaylist,
  onClearEpg,
  onClearAllData,
  onOpenImport,
}: PlaylistsViewProps) {
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0D12] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-semibold text-white">
              Local Playlists & Privacy Storage
            </h1>
            <p className="text-sm text-slate-400">
              All M3U playlists, XMLTV program guides, and favorites live exclusively in your
              browser&apos;s IndexedDB and local storage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenImport('playlist')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Playlist</span>
          </button>
        </div>

        {/* Summary Metrics Row (Clean unboxed dividers, tabular numerals) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#12161F] border border-white/[0.08] rounded-xl p-5">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Saved Playlists</span>
            <p className="font-mono text-xl font-semibold text-white tabular-nums">
              {playlists.length}
            </p>
          </div>
          <div className="space-y-1 sm:border-l sm:border-white/[0.08] sm:pl-5">
            <span className="text-xs text-slate-400">Pinned Favorites</span>
            <p className="font-mono text-xl font-semibold text-amber-400 tabular-nums">
              {favoriteCount}
            </p>
          </div>
          <div className="space-y-1 sm:border-l sm:border-white/[0.08] sm:pl-5">
            <span className="text-xs text-slate-400">Local EPG Programs</span>
            <p className="font-mono text-xl font-semibold text-white tabular-nums">
              {epgDataset ? epgDataset.info.programCount.toLocaleString() : '0'}
            </p>
          </div>
        </div>

        {/* Saved Playlists Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Stored M3U Playlists</span>
            </h2>
          </div>

          {playlists.length === 0 ? (
            <div className="bg-[#12161F] border border-white/[0.08] rounded-xl p-8 text-center space-y-3">
              <p className="text-sm font-medium text-slate-300">No playlists saved locally</p>
              <p className="text-xs text-slate-500">
                Add an M3U/M3U8 URL, drop a local playlist file, or paste M3U text to start
                watching.
              </p>
            </div>
          ) : (
            <div className="bg-[#12161F] border border-white/[0.08] rounded-xl divide-y divide-white/[0.06]">
              {playlists.map((pl) => {
                const isActive = pl.meta.id === activePlaylistId;
                return (
                  <div
                    key={pl.meta.id}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display text-sm font-semibold text-white truncate">
                          {pl.meta.name}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
                            <Check className="w-3.5 h-3.5" />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-400">
                        <span className="font-mono tabular-nums">
                          {pl.meta.channelCount} channels
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {pl.meta.categories.length} categories
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{pl.meta.sourceType} source</span>
                        <span aria-hidden="true">·</span>
                        <span>Added {new Date(pl.meta.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => onSelectPlaylist(pl.meta.id)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#181E29] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeletePlaylist(pl.meta.id)}
                        aria-label={`Delete ${pl.meta.name}`}
                        className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Active Local EPG Dataset */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Local XMLTV Program Guide</span>
            </h2>
            <button
              type="button"
              onClick={() => onOpenImport('epg')}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              Replace XMLTV
            </button>
          </div>

          <div className="bg-[#12161F] border border-white/[0.08] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {epgDataset ? (
              <>
                <div className="space-y-1">
                  <p className="font-display text-sm font-semibold text-white">
                    {epgDataset.info.name}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-2 text-xs text-slate-400">
                    <span className="font-mono tabular-nums">
                      {epgDataset.info.programCount.toLocaleString()} programs
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {epgDataset.info.channelCount} guide channels
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{epgDataset.info.sourceType} source</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClearEpg}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-red-300 bg-[#181E29] border border-white/[0.08] rounded-lg transition-colors self-start sm:self-auto"
                >
                  Clear EPG
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between w-full gap-4">
                <p className="text-xs text-slate-400">No XMLTV dataset currently stored.</p>
                <button
                  type="button"
                  onClick={() => onOpenImport('epg')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
                >
                  Import XMLTV
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Privacy Architecture & Data Reset */}
        <section className="bg-[#12161F] border border-white/[0.08] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-display text-sm font-semibold text-white">
                Zero-Server Privacy Guarantee
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                LumenTV parses M3U playlists and XMLTV files locally in memory and persists them
                to browser IndexedDB. Video streams connect directly from your browser to the media
                URLs in your playlist.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {!confirmClearAll ? (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 rounded-lg transition-colors whitespace-nowrap"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Clear All Local Data</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await onClearAllData();
                    setConfirmClearAll(false);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors whitespace-nowrap"
                >
                  Confirm Wipe
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-300 bg-[#181E29] rounded-lg hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
