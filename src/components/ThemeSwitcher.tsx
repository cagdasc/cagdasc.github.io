import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Check, Palette, ChevronDown } from 'lucide-react';
import { useTheme, THEME_OPTIONS, ThemeId } from '../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, isDark, toggleTheme, currentOption } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'light' | 'dark'>('all');
  const [showSelector, setShowSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check URL param or local dev mode to show full selector
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasThemeParam = 
      searchParams.get('themes') === 'true' || 
      searchParams.get('themes') === '1' ||
      searchParams.get('palette') === 'true' ||
      searchParams.get('debug') === 'true' ||
      searchParams.get('selector') === 'true';

    const isLocal = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';

    const isExplicitlySaved = localStorage.getItem('show_theme_palette') === 'true';

    if (hasThemeParam || isLocal || isExplicitlySaved) {
      setShowSelector(true);
    }

    // Keyboard shortcut (Alt + T) to toggle full palette selector locally
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        setShowSelector(prev => {
          const next = !prev;
          localStorage.setItem('show_theme_palette', next ? 'true' : 'false');
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = THEME_OPTIONS.filter((opt) => {
    if (activeTab === 'all') return true;
    return opt.category === activeTab;
  });

  return (
    <div className="relative flex items-center gap-1.5" ref={dropdownRef}>
      {/* Primary Toggle: Seamlessly toggles between Soft Oat & Sand and Pine Forest Night */}
      <button
        id="theme-quick-toggle"
        onClick={toggleTheme}
        className="p-2 sm:p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center border text-xs font-semibold shadow-2xs cursor-pointer select-none"
        style={{
          backgroundColor: 'var(--app-surface)',
          borderColor: 'var(--app-border)',
          color: 'var(--app-text)',
        }}
        title={isDark ? "Switch to Soft Oat & Sand" : "Switch to Pine Forest Night"}
        aria-label={isDark ? "Switch to Soft Oat & Sand" : "Switch to Pine Forest Night"}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-emerald-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-600" />
        )}
      </button>

      {/* Advanced Theme Selector (Visible when ?themes=true or locally via Alt+T) */}
      {showSelector && (
        <>
          <button
            id="theme-palette-button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 sm:p-2 rounded-xl transition-all duration-150 flex items-center gap-1 border text-xs font-mono font-medium shadow-2xs cursor-pointer"
            style={{
              backgroundColor: 'var(--app-surface)',
              borderColor: 'var(--app-border)',
              color: 'var(--app-text)',
            }}
            title="Local Theme Palette Selector (Alt+T)"
          >
            <span
              className="w-2.5 h-2.5 rounded-full border"
              style={{
                backgroundColor: currentOption.previewAccent,
                borderColor: 'var(--app-border)',
              }}
            />
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Theme Dropdown Panel */}
          {isOpen && (
            <div
              className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] sm:w-96 rounded-2xl p-4 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 top-full"
              style={{
                backgroundColor: 'var(--app-surface)',
                borderColor: 'var(--app-border)',
                color: 'var(--app-text)',
              }}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--app-border)' }}>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs sm:text-sm font-bold font-heading">
                    Theme Explorer (Local / Param)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--app-accent-bg)', color: 'var(--app-accent)' }}>
                  {THEME_OPTIONS.length} Presets
                </span>
              </div>

              {/* Filter Segment Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl mb-3 border text-[11px] font-medium" style={{ backgroundColor: 'var(--app-surface-subtle)', borderColor: 'var(--app-border)' }}>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-1 px-2 rounded-lg text-center transition-all cursor-pointer ${
                    activeTab === 'all' ? 'shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'all' ? 'var(--app-surface)' : 'transparent',
                    color: 'var(--app-text)',
                  }}
                >
                  All ({THEME_OPTIONS.length})
                </button>
                <button
                  onClick={() => setActiveTab('light')}
                  className={`flex-1 py-1 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'light' ? 'shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'light' ? 'var(--app-surface)' : 'transparent',
                    color: 'var(--app-text)',
                  }}
                >
                  <Sun className="w-3 h-3 text-amber-500" /> Soft Light (5)
                </button>
                <button
                  onClick={() => setActiveTab('dark')}
                  className={`flex-1 py-1 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'dark' ? 'shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'dark' ? 'var(--app-surface)' : 'transparent',
                    color: 'var(--app-text)',
                  }}
                >
                  <Moon className="w-3 h-3 text-emerald-400" /> Deep Dark (6)
                </button>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredOptions.map((opt) => {
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      id={`theme-select-${opt.id}`}
                      onClick={() => {
                        setTheme(opt.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 group cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-offset-1'
                          : 'hover:brightness-95'
                      }`}
                      style={{
                        backgroundColor: opt.previewBg,
                        borderColor: isSelected ? opt.previewAccent : 'var(--app-border)',
                        outlineColor: opt.previewAccent,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Visual Color Palette Pill Preview */}
                        <div
                          className="w-8 h-8 rounded-lg border flex items-center justify-center relative overflow-hidden shadow-xs shrink-0"
                          style={{
                            backgroundColor: opt.previewCard,
                            borderColor: isSelected ? opt.previewAccent : 'rgba(128,128,128,0.25)',
                          }}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow-xs"
                            style={{ backgroundColor: opt.previewAccent }}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="text-xs sm:text-sm font-bold"
                              style={{ color: opt.category === 'light' ? '#1E293B' : '#F8FAFC' }}
                            >
                              {opt.name}
                            </span>
                            {opt.id === 'light-oat' && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 font-medium">
                                Active Light
                              </span>
                            )}
                            {opt.id === 'forest-pine' && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                                Active Dark
                              </span>
                            )}
                          </div>
                          <p
                            className="text-[11px] line-clamp-1 mt-0.5"
                            style={{ color: opt.category === 'light' ? '#64748B' : '#94A3B8' }}
                          >
                            {opt.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isSelected ? (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shadow-xs text-white"
                            style={{ backgroundColor: opt.previewAccent }}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div
                            className="w-4 h-4 rounded-full border border-dashed opacity-40 group-hover:opacity-100 transition-opacity"
                            style={{ borderColor: opt.category === 'light' ? '#64748B' : '#94A3B8' }}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
