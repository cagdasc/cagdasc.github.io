import type { Channel, EpgDataset, EpgProgram, EpgSourceInfo } from '../types/iptv';

export function normalizeEpgKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Parses XMLTV datetime format:
 * Examples:
 *   20261115083000 +0000
 *   20261115083000 -0800
 *   20261115083000
 */
export function parseXmltvTimestamp(raw: string | null): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-]\d{4}|Z)?/.exec(trimmed);
  if (!match) {
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] ? Number(match[6]) : 0;
  const tz = match[7];

  if (!tz) {
    // Treat unspecified offset as local time for consistent display
    return new Date(year, month, day, hour, minute, second).getTime();
  }

  const utcBase = Date.UTC(year, month, day, hour, minute, second);
  if (tz === 'Z') return utcBase;

  const sign = tz[0] === '-' ? -1 : 1;
  const tzHours = Number(tz.slice(1, 3));
  const tzMins = Number(tz.slice(3, 5));
  const offsetMs = sign * (tzHours * 60 + tzMins) * 60 * 1000;
  return utcBase - offsetMs;
}

export async function readPossiblyGzippedFile(file: File): Promise<string> {
  const isGzip =
    file.name.toLowerCase().endsWith('.gz') ||
    file.type === 'application/gzip' ||
    file.type === 'application/x-gzip';

  if (!isGzip) {
    return file.text();
  }

  if (typeof DecompressionStream === 'undefined') {
    throw new Error('This browser does not support native gzip decompression. Please extract the .xml file first.');
  }

  const decompressedStream = file.stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(decompressedStream).text();
}

export async function decodePossiblyGzippedBuffer(buffer: ArrayBuffer, urlOrName: string): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const looksGzip =
    urlOrName.toLowerCase().endsWith('.gz') ||
    (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b);

  if (!looksGzip) {
    return new TextDecoder().decode(buffer);
  }

  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Browser does not support gzip decompression. Please use an uncompressed XMLTV file.');
  }

  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

export function parseXmltvContent(
  xmlText: string,
  meta: Omit<EpgSourceInfo, 'channelCount' | 'programCount' | 'loadedAt'>
): EpgDataset {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid XMLTV document. Ensure the file is valid XML.');
  }

  const programsByKey: Record<string, EpgProgram[]> = {};
  const aliasToKeys: Record<string, string[]> = {};
  const channelIds = new Set<string>();

  const channelNodes = doc.getElementsByTagName('channel');
  for (let i = 0; i < channelNodes.length; i++) {
    const node = channelNodes[i];
    const idAttr = node.getAttribute('id');
    if (!idAttr) continue;
    const normId = normalizeEpgKey(idAttr);
    channelIds.add(normId);

    const displayNames = node.getElementsByTagName('display-name');
    for (let j = 0; j < displayNames.length; j++) {
      const nameText = displayNames[j].textContent;
      if (!nameText) continue;
      const normName = normalizeEpgKey(nameText);
      if (!aliasToKeys[normName]) aliasToKeys[normName] = [];
      if (!aliasToKeys[normName].includes(normId)) {
        aliasToKeys[normName].push(normId);
      }
    }
  }

  const programmeNodes = doc.getElementsByTagName('programme');
  let programCount = 0;

  for (let i = 0; i < programmeNodes.length; i++) {
    const node = programmeNodes[i];
    const chAttr = node.getAttribute('channel');
    if (!chAttr) continue;
    const channelKey = normalizeEpgKey(chAttr);

    const startMs = parseXmltvTimestamp(node.getAttribute('start'));
    const endMs = parseXmltvTimestamp(node.getAttribute('stop'));
    if (startMs === null || endMs === null || endMs <= startMs) continue;

    const titleEl = node.getElementsByTagName('title')[0];
    const title = titleEl?.textContent?.trim() || 'Untitled Program';
    const subTitleEl = node.getElementsByTagName('sub-title')[0];
    const descEl = node.getElementsByTagName('desc')[0];
    const catEl = node.getElementsByTagName('category')[0];

    const program: EpgProgram = {
      id: `${channelKey}_${startMs}_${i}`,
      channelKey,
      title,
      subtitle: subTitleEl?.textContent?.trim() || undefined,
      description: descEl?.textContent?.trim() || undefined,
      category: catEl?.textContent?.trim() || undefined,
      startMs,
      endMs,
    };

    if (!programsByKey[channelKey]) {
      programsByKey[channelKey] = [];
    }
    programsByKey[channelKey].push(program);
    channelIds.add(channelKey);
    programCount++;
  }

  // Sort each channel's schedule chronologically
  for (const key of Object.keys(programsByKey)) {
    programsByKey[key].sort((a, b) => a.startMs - b.startMs);
  }

  return {
    info: {
      ...meta,
      loadedAt: Date.now(),
      channelCount: channelIds.size,
      programCount,
    },
    programsByKey,
    aliasToKeys,
  };
}

export function getProgramsForChannel(dataset: EpgDataset | null, channel: Channel): EpgProgram[] {
  if (!dataset) return [];

  if (channel.tvgId) {
    const normId = normalizeEpgKey(channel.tvgId);
    if (dataset.programsByKey[normId]?.length) {
      return dataset.programsByKey[normId];
    }
  }

  const candidateNames = [channel.tvgName, channel.name].filter(Boolean) as string[];
  for (const name of candidateNames) {
    const norm = normalizeEpgKey(name);
    if (dataset.programsByKey[norm]?.length) {
      return dataset.programsByKey[norm];
    }
    const aliasedKeys = dataset.aliasToKeys[norm];
    if (aliasedKeys) {
      for (const k of aliasedKeys) {
        if (dataset.programsByKey[k]?.length) {
          return dataset.programsByKey[k];
        }
      }
    }
  }

  return [];
}

export function getNowAndNextPrograms(
  programs: EpgProgram[],
  nowMs: number
): { current: EpgProgram | null; next: EpgProgram | null } {
  if (!programs.length) return { current: null, next: null };

  let currentIdx = -1;
  let nextIdx = -1;

  for (let i = 0; i < programs.length; i++) {
    const p = programs[i];
    if (p.startMs <= nowMs && nowMs < p.endMs) {
      currentIdx = i;
      nextIdx = i + 1 < programs.length ? i + 1 : -1;
      break;
    }
    if (p.startMs > nowMs) {
      nextIdx = i;
      break;
    }
  }

  return {
    current: currentIdx >= 0 ? programs[currentIdx] : null,
    next: nextIdx >= 0 ? programs[nextIdx] : null,
  };
}
