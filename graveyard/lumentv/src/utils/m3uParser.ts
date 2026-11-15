import type { Channel } from '../types/iptv';

export interface ParsedM3uResult {
  channels: Channel[];
  categories: string[];
  epgUrlHint?: string;
}

const ATTR_REGEX = /([a-zA-Z0-9_-]+)="([^"]*)"/g;

/**
 * Extracts trailing channel title after the last unquoted comma in an #EXTINF line.
 */
function extractExtinfTitle(line: string): string {
  let inQuotes = false;
  let lastCommaIdx = -1;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      lastCommaIdx = i;
    }
  }
  if (lastCommaIdx === -1) return '';
  return line.slice(lastCommaIdx + 1).trim();
}

function hashChannelId(playlistId: string, name: string, url: string, idx: number): string {
  // Deterministic compact ID so favorites persist cleanly across re-imports of the same playlist
  const raw = `${name.toLowerCase()}::${url}`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `${playlistId}_${(h >>> 0).toString(36)}_${idx}`;
}

export function parseM3uContent(content: string, playlistId: string): ParsedM3uResult {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const channels: Channel[] = [];
  const categorySet = new Set<string>();

  let epgUrlHint: string | undefined;
  let pendingMeta: {
    name?: string;
    tvgId?: string;
    tvgName?: string;
    logoUrl?: string;
    category?: string;
    number?: string;
  } | null = null;
  let pendingGroup: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTM3U')) {
      ATTR_REGEX.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = ATTR_REGEX.exec(line)) !== null) {
        const key = match[1].toLowerCase();
        const val = match[2].trim();
        if ((key === 'url-tvg' || key === 'x-tvg-url') && val) {
          epgUrlHint = val.split(',')[0].trim();
        }
      }
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      const attrs: Record<string, string> = {};
      ATTR_REGEX.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = ATTR_REGEX.exec(line)) !== null) {
        attrs[match[1].toLowerCase()] = match[2].trim();
      }
      const title = extractExtinfTitle(line) || attrs['tvg-name'] || `Channel ${channels.length + 1}`;
      pendingMeta = {
        name: title,
        tvgId: attrs['tvg-id'] || undefined,
        tvgName: attrs['tvg-name'] || undefined,
        logoUrl: attrs['tvg-logo'] || undefined,
        category: attrs['group-title'] || pendingGroup || 'Uncategorized',
        number: attrs['tvg-chno'] || undefined,
      };
      continue;
    }

    if (line.startsWith('#EXTGRP:')) {
      const grp = line.slice('#EXTGRP:'.length).trim();
      if (grp) {
        pendingGroup = grp;
        if (pendingMeta && (!pendingMeta.category || pendingMeta.category === 'Uncategorized')) {
          pendingMeta.category = grp;
        }
      }
      continue;
    }

    // Ignore other #EXT directives or comments
    if (line.startsWith('#')) {
      continue;
    }

    // Stream URL line
    if (/^(https?:\/\/|rtmp:\/\/|rtsp:\/\/|\/|blob:)/i.test(line)) {
      const category = (pendingMeta?.category || pendingGroup || 'Uncategorized').trim() || 'Uncategorized';
      const name = (pendingMeta?.name || `Channel ${channels.length + 1}`).trim();
      categorySet.add(category);

      channels.push({
        id: hashChannelId(playlistId, name, line, channels.length),
        playlistId,
        name,
        streamUrl: line,
        logoUrl: pendingMeta?.logoUrl,
        category,
        tvgId: pendingMeta?.tvgId,
        tvgName: pendingMeta?.tvgName,
        number: pendingMeta?.number,
      });

      pendingMeta = null;
      pendingGroup = undefined;
    }
  }

  return {
    channels,
    categories: Array.from(categorySet),
    epgUrlHint,
  };
}
