export function formatTimeShort(ms: number): string {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatRemainingMinutes(endMs: number, nowMs: number): string {
  const diffMins = Math.max(0, Math.ceil((endMs - nowMs) / 60000));
  if (diffMins >= 60) {
    const hrs = Math.floor(diffMins / 60);
    const rem = diffMins % 60;
    return rem > 0 ? `${hrs}h ${rem}m left` : `${hrs}h left`;
  }
  return `${diffMins}m left`;
}

export function formatDurationMinutes(startMs: number, endMs: number): string {
  const mins = Math.max(1, Math.round((endMs - startMs) / 60000));
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
  }
  return `${mins}m`;
}

export function getProgramProgress(startMs: number, endMs: number, nowMs: number): number {
  if (endMs <= startMs) return 0;
  const pct = ((nowMs - startMs) / (endMs - startMs)) * 100;
  return Math.max(0, Math.min(100, pct));
}

export function getChannelMonogram(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  if (!cleaned) return 'TV';
  const words = cleaned.split(/\s+/);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}
