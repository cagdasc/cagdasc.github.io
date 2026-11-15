import React, { useState } from 'react';
import { Archive, ArrowUpRight, Gamepad2, Tv } from 'lucide-react';
import asteroidTileImage from '../assets/images/tile_asteroid_runner_1794774403102.jpg';
import lumentvTileImage from '../assets/images/tile_lumentv_player_1794774403041.jpg';
import { trackProjectClick } from '../utils/analytics';

interface GraveyardAppItem {
  id: string;
  title: string;
  href: string;
  category: string;
  stack: string;
  description: string;
  image: string;
  imageAlt: string;
  fallbackIcon: 'gamepad' | 'tv';
  accentGradient: string;
}

const GRAVEYARD_APPS: GraveyardAppItem[] = [
  {
    id: 'asteroid-through-time',
    title: 'Asteroid Through Time',
    href: '/graveyard/asteroid-through-time/',
    category: 'Arcade Runner',
    stack: 'HTML5 Canvas · Procedural Web Audio · Physics',
    description:
      'Navigate a rolling, molten asteroid through cosmic cavern rifts, wormhole time warps, gravity-lensing black holes, and prehistoric space eras.',
    image: asteroidTileImage,
    imageAlt: 'Asteroid Through Time cosmic cavern runner artwork',
    fallbackIcon: 'gamepad',
    accentGradient: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 55%, #451A03 100%)',
  },
  {
    id: 'lumentv',
    title: 'LumenTV',
    href: '/graveyard/lumentv/',
    category: 'Media Utility',
    stack: 'HLS.js · XMLTV EPG · IndexedDB',
    description:
      'Local, privacy-first web IPTV player with M3U playlist import, browser-side XMLTV guide parsing, category filtering, favorites, and theater playback.',
    image: lumentvTileImage,
    imageAlt: 'LumenTV dark theater broadcast player artwork',
    fallbackIcon: 'tv',
    accentGradient: 'linear-gradient(135deg, #0A0D12 0%, #181E29 60%, #451A03 100%)',
  },
];

export const GraveyardSection: React.FC = () => {
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  return (
    <section
      id="graveyard-section"
      className="pt-24 pb-20 md:pt-32 md:pb-28 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--app-bg)',
        color: 'var(--app-text)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Editorial Header */}
        <header className="max-w-2xl mb-10 sm:mb-12 space-y-3">
          <div
            className="flex items-center gap-2 text-xs font-medium"
            style={{ color: 'var(--app-accent)' }}
          >
            <Archive className="w-3.5 h-3.5 shrink-0" />
            <span>Experiments Archive</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight"
            style={{ color: 'var(--app-text)', textWrap: 'balance' }}
          >
            App Graveyard
          </h1>

          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: 'var(--app-text-secondary)' }}
          >
            Side projects, prototypes, and weekend builds preserved in working condition. Select any tile to run it directly in your browser.
          </p>
        </header>

        {/* Two-Tile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GRAVEYARD_APPS.map((app) => {
            const isBroken = Boolean(brokenImages[app.id]);
            const FallbackIcon = app.fallbackIcon === 'gamepad' ? Gamepad2 : Tv;

            return (
              <a
                key={app.id}
                id={`graveyard-tile-${app.id}`}
                href={app.href}
                onClick={() => trackProjectClick(app.title, app.href)}
                className="group rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-xs focus-visible:outline-none focus-visible:ring-2"
                style={{
                  backgroundColor: 'var(--app-surface-card)',
                  borderColor: 'var(--app-border)',
                  ['--tw-ring-color' as string]: 'var(--app-accent)',
                }}
              >
                {/* 16:9 Artwork Header */}
                <div
                  className="relative aspect-video w-full overflow-hidden border-b"
                  style={{
                    backgroundColor: 'var(--app-surface-subtle)',
                    borderColor: 'var(--app-border)',
                  }}
                >
                  {!isBroken ? (
                    <img
                      src={app.image}
                      alt={app.imageAlt}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [app.id]: true }))
                      }
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-slate-200"
                      style={{ background: app.accentGradient }}
                    >
                      <FallbackIcon className="w-10 h-10 text-amber-400" />
                      <span className="font-heading text-base font-semibold tracking-tight">
                        {app.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tile Body */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-2.5">
                    {/* Unboxed Metadata Line */}
                    <div
                      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono"
                      style={{ color: 'var(--app-text-muted)' }}
                    >
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--app-accent)' }}
                      >
                        {app.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{app.stack}</span>
                    </div>

                    <h2
                      className="text-xl font-bold font-heading tracking-tight transition-colors"
                      style={{ color: 'var(--app-text)' }}
                    >
                      {app.title}
                    </h2>

                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--app-text-secondary)' }}
                    >
                      {app.description}
                    </p>
                  </div>

                  {/* Action Row */}
                  <div
                    className="pt-4 border-t flex items-center justify-between gap-4"
                    style={{ borderColor: 'var(--app-border)' }}
                  >
                    <span
                      className="text-xs font-mono truncate"
                      style={{ color: 'var(--app-text-muted)' }}
                    >
                      {app.href}
                    </span>

                    <span
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                      style={{ color: 'var(--app-accent)' }}
                    >
                      <span>Launch App</span>
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
