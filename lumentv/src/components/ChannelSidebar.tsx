import { useMemo, useState, useEffect } from 'react';
import { Search, Star, X, Tv } from 'lucide-react';
import type { Channel, EpgDataset, SidebarScope } from '../types/iptv';
import { getProgramsForChannel, getNowAndNextPrograms } from '../utils/xmltvParser';
import { getChannelMonogram } from '../utils/formatters';

interface ChannelSidebarProps {
  channels: Channel[];
  categories: string[];
  activeChannelId: string | null;
  favoriteIds: string[];
  recentIds: string[];
  epgDataset: EpgDataset | null;
  nowMs: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  scope: SidebarScope;
  onScopeChange: (scope: SidebarScope) => void;
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
}

const INITIAL_RENDER_LIMIT = 120;

export function ChannelSidebar({
  channels,
  categories,
  activeChannelId,
  favoriteIds,
  recentIds,
  epgDataset,
  nowMs,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  scope,
  onScopeChange,
  onSelectChannel,
  onToggleFavorite,
  searchInputRef,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
}: ChannelSidebarProps) {
  const [renderLimit, setRenderLimit] = useState(INITIAL_RENDER_LIMIT);
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setRenderLimit(INITIAL_RENDER_LIMIT);
  }, [searchQuery, selectedCategory, scope, channels]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const recentOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    recentIds.forEach((id, idx) => map.set(id, idx));
    return map;
  }, [recentIds]);

  const currentProgramByChannelId = useMemo(() => {
    const map = new Map<string, string>();
    if (!epgDataset) return map;
    for (const ch of channels) {
      const progs = getProgramsForChannel(epgDataset, ch);
      if (progs.length > 0) {
        const { current } = getNowAndNextPrograms(progs, nowMs);
        if (current) {
          map.set(ch.id, current.title);
        }
      }
    }
    return map;
  }, [channels, epgDataset, nowMs]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ch of channels) {
      counts.set(ch.category, (counts.get(ch.category) || 0) + 1);
    }
    return counts;
  }, [channels]);

  const filteredChannels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let list = channels.filter((ch) => {
      if (scope === 'favorites' && !favoriteSet.has(ch.id)) return false;
      if (scope === 'recent' && !recentOrderMap.has(ch.id)) return false;
      if (selectedCategory !== 'ALL' && ch.category !== selectedCategory) return false;
      if (q) {
        const progTitle = currentProgramByChannelId.get(ch.id)?.toLowerCase() || '';
        const matchName = ch.name.toLowerCase().includes(q);
        const matchCat = ch.category.toLowerCase().includes(q);
        const matchProg = progTitle.includes(q);
        if (!matchName && !matchCat && !matchProg) return false;
      }
      return true;
    });

    if (scope === 'recent') {
      list = [...list].sort(
        (a, b) => (recentOrderMap.get(a.id) ?? 9999) - (recentOrderMap.get(b.id) ?? 9999)
      );
    }

    return list;
  }, [channels, scope, favoriteSet, recentOrderMap, selectedCategory, searchQuery, currentProgramByChannelId]);

  const visibleChannels = filteredChannels.slice(0, renderLimit);
  const hasMore = filteredChannels.length > renderLimit;

  const sidebarContent = (
    <aside
      aria-label="Channel browser"
      className="flex flex-col h-full w-full bg-[#12161F] border-r border-white/[0.08] select-none"
    >
      {/* Search & Filter Controls */}
      <div className="p-4 space-y-3 border-b border-white/[0.08]">
        <div className="flex items-center justify-between gap-2 lg:hidden">
          <span className="font-display text-sm font-semibold text-white">Channels</span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close channel list"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search
            aria-hidden="true"
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search channels or shows (/)"
            aria-label="Search channels or programs"
            className="w-full h-10 pl-9 pr-8 bg-[#0A0D12] border border-white/[0.1] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center justify-center rounded text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Segmented Scope Filter (All / Favorites / Recent) */}
        <div
          role="tablist"
          aria-label="Channel list filter"
          className="grid grid-cols-3 gap-1 p-1 bg-[#0A0D12] rounded-lg border border-white/[0.06]"
        >
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'favorites', label: 'Favorites' },
              { id: 'recent', label: 'Recent' },
            ] as const
          ).map((tab) => {
            const active = scope === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => onScopeChange(tab.id)}
                className={`h-8 px-2 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  active
                    ? 'bg-[#181E29] text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Selector */}
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="category-select" className="text-xs font-medium text-slate-400 shrink-0">
            Category
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="flex-1 min-w-0 h-9 px-2.5 bg-[#0A0D12] border border-white/[0.1] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500/70"
          >
            <option value="ALL">All Categories ({channels.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({categoryCounts.get(cat) || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count Header (Clean unboxed metadata) */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-white/[0.05]">
        <span className="tabular-nums">
          {filteredChannels.length} {filteredChannels.length === 1 ? 'channel' : 'channels'}
        </span>
        {selectedCategory !== 'ALL' && (
          <button
            type="button"
            onClick={() => onCategoryChange('ALL')}
            className="text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {filteredChannels.length === 0 ? (
          <div className="px-5 py-12 text-center space-y-2">
            <Tv className="w-7 h-7 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">
              {channels.length === 0
                ? 'No playlist loaded'
                : scope === 'favorites'
                  ? 'No favorite channels yet'
                  : scope === 'recent'
                    ? 'No recently watched channels'
                    : 'No matching channels'}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {channels.length === 0
                ? 'Click Import Sources above to load an M3U URL or local file.'
                : scope === 'favorites'
                  ? 'Select the star icon on any channel row to pin it here.'
                  : 'Adjust your search query or switch category filters.'}
            </p>
            {(searchQuery || selectedCategory !== 'ALL' || scope !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  onCategoryChange('ALL');
                  onScopeChange('all');
                }}
                className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-white/[0.04] rounded-md transition-colors"
              >
                Show all channels
              </button>
            )}
          </div>
        ) : (
          <>
            {visibleChannels.map((channel) => {
              const isActive = channel.id === activeChannelId;
              const isFav = favoriteSet.has(channel.id);
              const currentProgram = currentProgramByChannelId.get(channel.id);
              const showLogo = channel.logoUrl && !brokenLogos[channel.id];

              return (
                <div
                  key={channel.id}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#181E29] ring-1 ring-inset ring-amber-500/35'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectChannel(channel);
                      onCloseMobile();
                    }}
                    className="flex-1 min-w-0 flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                  >
                    {/* Channel Logo or Clean Monogram */}
                    <div
                      className={`w-10 h-10 shrink-0 rounded-md flex items-center justify-center overflow-hidden border ${
                        isActive
                          ? 'bg-[#0A0D12] border-amber-500/40 text-amber-400'
                          : 'bg-[#0A0D12] border-white/[0.08] text-slate-300'
                      }`}
                    >
                      {showLogo ? (
                        <img
                          src={channel.logoUrl}
                          alt={`${channel.name} logo`}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setBrokenLogos((prev) => ({ ...prev, [channel.id]: true }))
                          }
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="font-mono text-xs font-semibold tracking-tight">
                          {getChannelMonogram(channel.name)}
                        </span>
                      )}
                    </div>

                    {/* Title & Unboxed Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {channel.number && (
                          <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                            {channel.number}
                          </span>
                        )}
                        <span
                          className={`text-sm font-medium truncate ${
                            isActive ? 'text-amber-400' : 'text-slate-100'
                          }`}
                        >
                          {channel.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {currentProgram ? currentProgram : channel.category}
                      </p>
                    </div>
                  </button>

                  {/* Favorite Toggle Button (40px target) */}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(channel.id)}
                    aria-label={
                      isFav
                        ? `Remove ${channel.name} from favorites`
                        : `Add ${channel.name} to favorites`
                    }
                    aria-pressed={isFav}
                    className={`w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      isFav
                        ? 'text-amber-400 hover:bg-amber-500/10'
                        : 'text-slate-600 opacity-70 group-hover:opacity-100 hover:text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              );
            })}

            {hasMore && (
              <div className="p-3 text-center">
                <button
                  type="button"
                  onClick={() => setRenderLimit((prev) => prev + 150)}
                  className="w-full py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors tabular-nums"
                >
                  Load more ({filteredChannels.length - renderLimit} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop persistent collapsible sidebar */}
      {!isCollapsedDesktop && (
        <div className="hidden lg:block w-[300px] shrink-0 h-full overflow-hidden">
          {sidebarContent}
        </div>
      )}

      {/* Mobile slide-over drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[300px] max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
