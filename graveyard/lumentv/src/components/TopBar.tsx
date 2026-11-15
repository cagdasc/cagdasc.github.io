import { Plus, Menu } from 'lucide-react';
import type { WorkspaceView } from '../types/iptv';

interface TopBarProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onOpenImport: () => void;
  onToggleMobileSidebar: () => void;
}

export function TopBar({
  activeView,
  onSelectView,
  onOpenImport,
  onToggleMobileSidebar,
}: TopBarProps) {
  const navItems: Array<{ id: WorkspaceView; label: string }> = [
    { id: 'player', label: 'Player' },
    { id: 'guide', label: 'TV Guide' },
    { id: 'playlists', label: 'Playlists' },
  ];

  return (
    <header className="h-14 shrink-0 border-b border-white/[0.08] bg-[#0A0D12] px-4 lg:px-6 flex items-center justify-between gap-8">
      {/* Zone 1: Brand Wordmark (single text element) + mobile drawer trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle channel list"
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 -ml-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onSelectView('player')}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
        >
          LumenTV
        </button>
      </div>

      {/* Zone 2: Clean single-line navigation links */}
      <nav aria-label="Primary" className="flex items-center gap-5 sm:gap-7">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {item.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-[15px] h-[2px] bg-amber-500"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Single Primary Action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenImport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D12]"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Import Sources</span>
        </button>
      </div>
    </header>
  );
}
