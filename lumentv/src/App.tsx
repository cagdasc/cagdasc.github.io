import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type {
  Channel,
  EpgDataset,
  SidebarScope,
  StoredPlaylist,
  UserPreferences,
  WorkspaceView,
} from './types/iptv';
import {
  clearActiveEpg,
  clearAllLocalData,
  DEFAULT_PREFERENCES,
  deletePlaylist,
  loadActiveEpg,
  loadAllPlaylists,
  loadPreferences,
  saveActiveEpg,
  savePlaylist,
  savePreferences,
} from './utils/storage';
import { getNowAndNextPrograms, getProgramsForChannel } from './utils/xmltvParser';
import { TopBar } from './components/TopBar';
import { ChannelSidebar } from './components/ChannelSidebar';
import { TheaterPlayer } from './components/TheaterPlayer';
import { EpgDrawer } from './components/EpgDrawer';
import { ImportModal } from './components/ImportModal';
import { PlaylistsView } from './components/PlaylistsView';

export default function App() {
  const [isHydrating, setIsHydrating] = useState(true);
  const [playlists, setPlaylists] = useState<StoredPlaylist[]>([]);
  const [epgDataset, setEpgDataset] = useState<EpgDataset | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadPreferences());

  const [activeView, setActiveView] = useState<WorkspaceView>('player');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sidebarScope, setSidebarScope] = useState<SidebarScope>('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [importModalState, setImportModalState] = useState<{
    open: boolean;
    tab: 'playlist' | 'epg';
  }>({ open: false, tab: 'playlist' });

  const [nowMs, setNowMs] = useState(() => Date.now());
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate playlists & EPG from browser IndexedDB on boot
  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      try {
        const [storedPlaylists, storedEpg] = await Promise.all([
          loadAllPlaylists(),
          loadActiveEpg(),
        ]);

        if (!mounted) return;

        // Purge any previously stored demo playlist/EPG
        const demoPlaylists = storedPlaylists.filter((p) => p.meta.sourceType === 'demo');
        if (demoPlaylists.length > 0) {
          await Promise.all(demoPlaylists.map((p) => deletePlaylist(p.meta.id)));
        }
        const userPlaylists = storedPlaylists.filter((p) => p.meta.sourceType !== 'demo');

        let activeEpg = storedEpg;
        if (activeEpg?.info.sourceType === 'demo') {
          await clearActiveEpg();
          activeEpg = null;
        }

        if (!mounted) return;

        setPlaylists(userPlaylists);
        setEpgDataset(activeEpg);

        if (userPlaylists.length === 0) {
          setPrefs((prev) => {
            const next: UserPreferences = {
              ...prev,
              activePlaylistId: '',
              activeChannelId: null,
            };
            savePreferences(next);
            return next;
          });
        } else {
          setPrefs((prev) => {
            const validPlaylist =
              userPlaylists.find((p) => p.meta.id === prev.activePlaylistId) ||
              userPlaylists[0];
            const validChannel =
              validPlaylist.channels.find((c) => c.id === prev.activeChannelId) ||
              validPlaylist.channels[0] ||
              null;
            const next: UserPreferences = {
              ...prev,
              activePlaylistId: validPlaylist.meta.id,
              activeChannelId: validChannel ? validChannel.id : null,
            };
            savePreferences(next);
            return next;
          });
        }
      } catch {
        if (!mounted) return;
        setPlaylists([]);
        setEpgDataset(null);
      } finally {
        if (mounted) {
          setIsHydrating(false);
        }
      }
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  // Periodic local clock tick for real-time EPG progress & "Now" indicator
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const updatePrefs = useCallback(
    (updater: (prev: UserPreferences) => UserPreferences) => {
      setPrefs((prev) => {
        const next = updater(prev);
        savePreferences(next);
        return next;
      });
    },
    []
  );

  // Global keyboard shortcuts: `/` focuses search, `G` toggles EPG drawer, `Escape` closes modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (importModalState.open) {
          setImportModalState((s) => ({ ...s, open: false }));
          return;
        }
        if (mobileSidebarOpen) {
          setMobileSidebarOpen(false);
          return;
        }
      }

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

      if (e.key === '/') {
        e.preventDefault();
        if (activeView === 'playlists') setActiveView('player');
        updatePrefs((prev) => ({ ...prev, sidebarCollapsed: false }));
        setMobileSidebarOpen(true);
        requestAnimationFrame(() => searchInputRef.current?.focus());
      } else if ((e.key === 'g' || e.key === 'G') && activeView === 'player') {
        e.preventDefault();
        updatePrefs((prev) => ({ ...prev, epgDrawerOpen: !prev.epgDrawerOpen }));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView, importModalState.open, mobileSidebarOpen, updatePrefs]);

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.meta.id === prefs.activePlaylistId) || playlists[0] || null,
    [playlists, prefs.activePlaylistId]
  );

  const channels = useMemo(() => activePlaylist?.channels || [], [activePlaylist]);
  const categories = useMemo(() => activePlaylist?.meta.categories || [], [activePlaylist]);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === prefs.activeChannelId) || null,
    [channels, prefs.activeChannelId]
  );

  const { current: currentProgram, next: nextProgram } = useMemo(() => {
    if (!activeChannel || !epgDataset) return { current: null, next: null };
    const programs = getProgramsForChannel(epgDataset, activeChannel);
    return getNowAndNextPrograms(programs, nowMs);
  }, [activeChannel, epgDataset, nowMs]);

  const handleSelectChannel = useCallback(
    (channel: Channel) => {
      updatePrefs((prev) => {
        const filteredRecent = prev.recentIds.filter((id) => id !== channel.id);
        return {
          ...prev,
          activeChannelId: channel.id,
          recentIds: [channel.id, ...filteredRecent].slice(0, 40),
        };
      });
    },
    [updatePrefs]
  );

  const handleToggleFavorite = useCallback(
    (channelId: string) => {
      updatePrefs((prev) => {
        const exists = prev.favoriteIds.includes(channelId);
        return {
          ...prev,
          favoriteIds: exists
            ? prev.favoriteIds.filter((id) => id !== channelId)
            : [...prev.favoriteIds, channelId],
        };
      });
    },
    [updatePrefs]
  );

  const handleImportPlaylist = useCallback(
    async (playlist: StoredPlaylist) => {
      await savePlaylist(playlist);
      setPlaylists((prev) => [playlist, ...prev.filter((p) => p.meta.id !== playlist.meta.id)]);
      setSelectedCategory('ALL');
      setSearchQuery('');
      setSidebarScope('all');
      updatePrefs((prev) => ({
        ...prev,
        activePlaylistId: playlist.meta.id,
        activeChannelId: playlist.channels[0]?.id ?? null,
      }));
      setActiveView('player');
    },
    [updatePrefs]
  );

  const handleImportEpg = useCallback(async (dataset: EpgDataset) => {
    await saveActiveEpg(dataset);
    setEpgDataset(dataset);
  }, []);

  const handleSelectPlaylist = useCallback(
    (playlistId: string) => {
      const target = playlists.find((p) => p.meta.id === playlistId);
      if (!target) return;
      setSelectedCategory('ALL');
      setSearchQuery('');
      updatePrefs((prev) => ({
        ...prev,
        activePlaylistId: target.meta.id,
        activeChannelId: target.channels[0]?.id ?? null,
      }));
      setActiveView('player');
    },
    [playlists, updatePrefs]
  );

  const handleDeletePlaylist = useCallback(
    async (playlistId: string) => {
      await deletePlaylist(playlistId);
      setPlaylists((prev) => {
        const remaining = prev.filter((p) => p.meta.id !== playlistId);
        if (prefs.activePlaylistId === playlistId) {
          const fallback = remaining[0] || null;
          updatePrefs((p) => ({
            ...p,
            activePlaylistId: fallback ? fallback.meta.id : '',
            activeChannelId: fallback?.channels[0]?.id ?? null,
          }));
        }
        return remaining;
      });
    },
    [prefs.activePlaylistId, updatePrefs]
  );

  const handleClearEpg = useCallback(async () => {
    await clearActiveEpg();
    setEpgDataset(null);
  }, []);

  const handleClearAllData = useCallback(async () => {
    await clearAllLocalData();
    setPlaylists([]);
    setEpgDataset(null);
    setSelectedCategory('ALL');
    setSearchQuery('');
    setPrefs({ ...DEFAULT_PREFERENCES });
  }, []);

  if (isHydrating) {
    return (
      <div className="h-screen w-screen bg-[#0A0D12] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          <span>Loading local LumenTV workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A0D12] text-[#F1F5F9] overflow-hidden">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenImport={() => setImportModalState({ open: true, tab: 'playlist' })}
        onToggleMobileSidebar={() => setMobileSidebarOpen((v) => !v)}
      />

      <main className="flex-1 min-h-0 flex overflow-hidden">
        {activeView !== 'playlists' && (
          <ChannelSidebar
            channels={channels}
            categories={categories}
            activeChannelId={prefs.activeChannelId}
            favoriteIds={prefs.favoriteIds}
            recentIds={prefs.recentIds}
            epgDataset={epgDataset}
            nowMs={nowMs}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            scope={sidebarScope}
            onScopeChange={setSidebarScope}
            onSelectChannel={handleSelectChannel}
            onToggleFavorite={handleToggleFavorite}
            searchInputRef={searchInputRef}
            isOpenMobile={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            isCollapsedDesktop={activeView === 'player' && prefs.sidebarCollapsed}
          />
        )}

        {activeView === 'player' && (
          <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
            <TheaterPlayer
              channel={activeChannel}
              currentProgram={currentProgram}
              nextProgram={nextProgram}
              nowMs={nowMs}
              isFavorite={activeChannel ? prefs.favoriteIds.includes(activeChannel.id) : false}
              onToggleFavorite={handleToggleFavorite}
              volume={prefs.volume}
              muted={prefs.muted}
              onVolumeChange={(volume) => updatePrefs((p) => ({ ...p, volume }))}
              onMutedChange={(muted) => updatePrefs((p) => ({ ...p, muted }))}
              epgDrawerOpen={prefs.epgDrawerOpen}
              onToggleEpgDrawer={() =>
                updatePrefs((p) => ({ ...p, epgDrawerOpen: !p.epgDrawerOpen }))
              }
              sidebarCollapsed={prefs.sidebarCollapsed}
              onToggleSidebar={() =>
                updatePrefs((p) => ({ ...p, sidebarCollapsed: !p.sidebarCollapsed }))
              }
              useLocalRelay={prefs.useLocalRelay}
              onToggleLocalRelay={() =>
                updatePrefs((p) => ({ ...p, useLocalRelay: !p.useLocalRelay }))
              }
              customUserAgent={prefs.customUserAgent}
              onOpenImport={() => setImportModalState({ open: true, tab: 'playlist' })}
            />

            {prefs.epgDrawerOpen && (
              <EpgDrawer
                channels={channels}
                activeChannelId={prefs.activeChannelId}
                epgDataset={epgDataset}
                nowMs={nowMs}
                selectedCategory={selectedCategory}
                onSelectChannel={handleSelectChannel}
                onOpenImportEpg={() => setImportModalState({ open: true, tab: 'epg' })}
                onCloseDrawer={() => updatePrefs((p) => ({ ...p, epgDrawerOpen: false }))}
              />
            )}
          </div>
        )}

        {activeView === 'guide' && (
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <EpgDrawer
              channels={channels}
              activeChannelId={prefs.activeChannelId}
              epgDataset={epgDataset}
              nowMs={nowMs}
              selectedCategory={selectedCategory}
              onSelectChannel={(ch) => {
                handleSelectChannel(ch);
                setActiveView('player');
              }}
              onOpenImportEpg={() => setImportModalState({ open: true, tab: 'epg' })}
              isExpandedFullView
            />
          </div>
        )}

        {activeView === 'playlists' && (
          <PlaylistsView
            playlists={playlists}
            activePlaylistId={prefs.activePlaylistId}
            epgDataset={epgDataset}
            favoriteCount={prefs.favoriteIds.length}
            onSelectPlaylist={handleSelectPlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onClearEpg={handleClearEpg}
            onClearAllData={handleClearAllData}
            onOpenImport={(tab) => setImportModalState({ open: true, tab })}
          />
        )}
      </main>

      <ImportModal
        key={`${importModalState.open}-${importModalState.tab}`}
        isOpen={importModalState.open}
        initialTab={importModalState.tab}
        customUserAgent={prefs.customUserAgent}
        onCustomUserAgentChange={(customUserAgent) =>
          updatePrefs((p) => ({ ...p, customUserAgent }))
        }
        onClose={() => setImportModalState((s) => ({ ...s, open: false }))}
        onImportPlaylist={handleImportPlaylist}
        onImportEpg={handleImportEpg}
      />
    </div>
  );
}
