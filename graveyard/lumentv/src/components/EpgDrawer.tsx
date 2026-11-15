import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Play,
  Upload,
  X,
} from 'lucide-react';
import type { Channel, EpgDataset, EpgProgram } from '../types/iptv';
import { getProgramsForChannel } from '../utils/xmltvParser';
import { formatTimeShort, formatDurationMinutes } from '../utils/formatters';

interface EpgDrawerProps {
  channels: Channel[];
  activeChannelId: string | null;
  epgDataset: EpgDataset | null;
  nowMs: number;
  selectedCategory: string;
  onSelectChannel: (channel: Channel) => void;
  onOpenImportEpg: () => void;
  isExpandedFullView?: boolean;
  onCloseDrawer?: () => void;
}

const WINDOW_HOURS = 3;
const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;
const SLOT_MS = 30 * 60 * 1000; // 30-minute guide ticks
const MAX_GUIDE_CHANNELS = 80;

export function EpgDrawer({
  channels,
  activeChannelId,
  epgDataset,
  nowMs,
  selectedCategory,
  onSelectChannel,
  onOpenImportEpg,
  isExpandedFullView = false,
  onCloseDrawer,
}: EpgDrawerProps) {
  // Window offset in 30-min increments relative to current time
  const [offsetSlots, setOffsetSlots] = useState(0);
  const [inspectedProgram, setInspectedProgram] = useState<{
    program: EpgProgram;
    channel: Channel;
  } | null>(null);

  // Align window start to nearest 30-min boundary before nowMs - 30m
  const windowStartMs = useMemo(() => {
    const base = Math.floor(nowMs / SLOT_MS) * SLOT_MS - SLOT_MS;
    return base + offsetSlots * SLOT_MS;
  }, [nowMs, offsetSlots]);

  const windowEndMs = windowStartMs + WINDOW_MS;

  const timeTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let t = windowStartMs; t < windowEndMs; t += SLOT_MS) {
      ticks.push(t);
    }
    return ticks;
  }, [windowStartMs, windowEndMs]);

  const scopedChannels = useMemo(() => {
    const filtered =
      selectedCategory === 'ALL'
        ? channels
        : channels.filter((c) => c.category === selectedCategory);
    return filtered.slice(0, MAX_GUIDE_CHANNELS);
  }, [channels, selectedCategory]);

  const nowIndicatorPct = useMemo(() => {
    if (nowMs < windowStartMs || nowMs > windowEndMs) return null;
    return ((nowMs - windowStartMs) / WINDOW_MS) * 100;
  }, [nowMs, windowStartMs, windowEndMs]);

  const matchedProgramsTotal = useMemo(() => {
    if (!epgDataset) return 0;
    let total = 0;
    for (const ch of scopedChannels) {
      total += getProgramsForChannel(epgDataset, ch).length;
    }
    return total;
  }, [epgDataset, scopedChannels]);

  return (
    <section
      aria-label="Electronic Program Guide"
      className={`flex flex-col bg-[#0A0D12] ${
        isExpandedFullView ? 'flex-1 min-h-0' : 'flex-1 min-h-[280px]'
      }`}
    >
      {/* Guide Toolbar */}
      <div className="px-4 lg:px-6 py-2.5 bg-[#12161F] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 text-sm font-display font-semibold text-white">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Program Guide</span>
          </div>
          {epgDataset && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[200px]">{epgDataset.info.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {epgDataset.info.programCount.toLocaleString()} programs
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOffsetSlots((s) => s - 2)}
            aria-label="Earlier programs"
            className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-[#181E29] border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:border-white/[0.16] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1h</span>
          </button>

          <button
            type="button"
            onClick={() => setOffsetSlots(0)}
            className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
              offsetSlots === 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-[#181E29] border-white/[0.08] text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Now</span>
          </button>

          <button
            type="button"
            onClick={() => setOffsetSlots((s) => s + 2)}
            aria-label="Later programs"
            className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-[#181E29] border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:border-white/[0.16] transition-colors"
          >
            <span className="hidden sm:inline">1h</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenImportEpg}
            className="ml-1 h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#181E29] border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:border-white/[0.16] transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Load XMLTV</span>
          </button>

          {!isExpandedFullView && onCloseDrawer && (
            <button
              type="button"
              onClick={onCloseDrawer}
              aria-label="Close EPG drawer"
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Program Detail Inspector */}
      {inspectedProgram && (
        <div className="px-4 lg:px-6 py-3 bg-[#181E29] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-400">
              <span className="font-medium text-amber-400">{inspectedProgram.channel.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-200">
                {formatTimeShort(inspectedProgram.program.startMs)} –{' '}
                {formatTimeShort(inspectedProgram.program.endMs)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {formatDurationMinutes(
                  inspectedProgram.program.startMs,
                  inspectedProgram.program.endMs
                )}
              </span>
              {inspectedProgram.program.category && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{inspectedProgram.program.category}</span>
                </>
              )}
            </div>
            <p className="font-display text-sm font-semibold text-white">
              {inspectedProgram.program.title}
            </p>
            {inspectedProgram.program.description && (
              <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl">
                {inspectedProgram.program.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectChannel(inspectedProgram.channel)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch Channel</span>
            </button>
            <button
              type="button"
              onClick={() => setInspectedProgram(null)}
              aria-label="Dismiss program details"
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* EPG Grid or Empty State */}
      {!epgDataset || matchedProgramsTotal === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-3">
            <p className="font-display text-sm font-semibold text-slate-200">
              {epgDataset
                ? 'No EPG entries matched these channels'
                : 'No local XMLTV EPG data loaded'}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {epgDataset
                ? 'Ensure your M3U tvg-id or channel names match the channel identifiers in your XMLTV file.'
                : 'Drop a local .xml or .xml.gz XMLTV guide file to inspect schedules right in your browser with zero external requests.'}
            </p>
            <button
              type="button"
              onClick={onOpenImportEpg}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Local XMLTV</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto relative">
          <div className="min-w-[760px]">
            {/* Sticky Time Header */}
            <div className="sticky top-0 z-20 flex bg-[#12161F] border-b border-white/[0.08]">
              <div className="w-48 shrink-0 px-4 py-2 text-xs font-medium text-slate-400 border-r border-white/[0.08]">
                Channel
              </div>
              <div className="flex-1 relative grid grid-cols-6">
                {timeTicks.map((tick) => (
                  <div
                    key={tick}
                    className="px-2.5 py-2 font-mono text-xs text-slate-400 tabular-nums border-r border-white/[0.06] last:border-r-0"
                  >
                    {formatTimeShort(tick)}
                  </div>
                ))}
                {nowIndicatorPct !== null && (
                  <div
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 w-[2px] bg-amber-500 z-30 pointer-events-none"
                    style={{ left: `${nowIndicatorPct}%` }}
                  />
                )}
              </div>
            </div>

            {/* Channel Schedule Rows */}
            <div className="divide-y divide-white/[0.06]">
              {scopedChannels.map((channel) => {
                const isActiveChannel = channel.id === activeChannelId;
                const channelPrograms = getProgramsForChannel(epgDataset, channel).filter(
                  (p) => p.endMs > windowStartMs && p.startMs < windowEndMs
                );

                return (
                  <div
                    key={channel.id}
                    className={`flex items-stretch h-14 ${
                      isActiveChannel ? 'bg-[#181E29]/60' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Channel Column */}
                    <button
                      type="button"
                      onClick={() => onSelectChannel(channel)}
                      className="w-48 shrink-0 px-4 py-2 flex flex-col justify-center text-left border-r border-white/[0.08] hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500"
                    >
                      <span
                        className={`text-xs font-semibold truncate ${
                          isActiveChannel ? 'text-amber-400' : 'text-slate-200'
                        }`}
                      >
                        {channel.name}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">{channel.category}</span>
                    </button>

                    {/* Timeline Track */}
                    <div className="flex-1 relative overflow-hidden">
                      {/* Subtle 30-min grid lines */}
                      <div className="absolute inset-0 grid grid-cols-6 pointer-events-none">
                        {timeTicks.map((tick) => (
                          <div
                            key={tick}
                            className="border-r border-white/[0.04] last:border-r-0 h-full"
                          />
                        ))}
                      </div>

                      {/* Real-time Now vertical marker */}
                      {nowIndicatorPct !== null && (
                        <div
                          aria-hidden="true"
                          className="absolute top-0 bottom-0 w-[2px] bg-amber-500/75 z-10 pointer-events-none"
                          style={{ left: `${nowIndicatorPct}%` }}
                        />
                      )}

                      {channelPrograms.length === 0 ? (
                        <div className="h-full flex items-center px-3 text-xs text-slate-600">
                          No schedule data in this window
                        </div>
                      ) : (
                        channelPrograms.map((prog) => {
                          const clampedStart = Math.max(prog.startMs, windowStartMs);
                          const clampedEnd = Math.min(prog.endMs, windowEndMs);
                          const leftPct = ((clampedStart - windowStartMs) / WINDOW_MS) * 100;
                          const widthPct = ((clampedEnd - clampedStart) / WINDOW_MS) * 100;
                          const isAiringNow = prog.startMs <= nowMs && nowMs < prog.endMs;
                          const isSelected = inspectedProgram?.program.id === prog.id;

                          return (
                            <button
                              key={prog.id}
                              type="button"
                              onClick={() => setInspectedProgram({ program: prog, channel })}
                              style={{
                                left: `${leftPct}%`,
                                width: `calc(${widthPct}% - 2px)`,
                              }}
                              className={`absolute top-1.5 bottom-1.5 px-2.5 py-1 rounded-md text-left overflow-hidden border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-500 text-white z-20'
                                  : isAiringNow
                                    ? 'bg-[#181E29] border-amber-500/40 text-slate-100 hover:border-amber-400'
                                    : 'bg-[#12161F] border-white/[0.08] text-slate-300 hover:bg-[#181E29] hover:border-white/[0.16]'
                              }`}
                            >
                              <div className="text-xs font-medium truncate">{prog.title}</div>
                              <div className="font-mono text-[10px] text-slate-400 tabular-nums truncate">
                                {formatTimeShort(prog.startMs)} – {formatTimeShort(prog.endMs)}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
