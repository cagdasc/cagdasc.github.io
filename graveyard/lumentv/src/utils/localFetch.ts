export interface LocalFetchResult {
  buffer: ArrayBuffer;
  contentType: string;
  viaRelay: boolean;
  viaCustomRelay?: boolean;
}

export interface LocalFetchOptions {
  userAgent?: string;
  corsProxyUrl?: string;
}

export class LocalFetchError extends Error {
  readonly isBlockedOnStaticHost: boolean;
  readonly isMixedContent: boolean;

  constructor(
    message: string,
    opts?: { isBlockedOnStaticHost?: boolean; isMixedContent?: boolean }
  ) {
    super(message);
    this.name = 'LocalFetchError';
    this.isBlockedOnStaticHost = Boolean(opts?.isBlockedOnStaticHost);
    this.isMixedContent = Boolean(opts?.isMixedContent);
  }
}

let cachedRelayAvailability: boolean | null = null;

export async function probeLocalRelayAvailable(): Promise<boolean> {
  if (cachedRelayAvailability !== null) {
    return cachedRelayAvailability;
  }
  try {
    const res = await fetch('/__local_fetch', { method: 'HEAD' });
    cachedRelayAvailability = res.headers.get('X-LumenTV-Local-Relay') === '1';
  } catch {
    cachedRelayAvailability = false;
  }
  return cachedRelayAvailability;
}

export function formatCorsProxyUrl(proxyTemplate: string, targetUrl: string): string {
  const trimmed = proxyTemplate.trim();
  if (!trimmed) return targetUrl;
  if (trimmed.includes('{url}')) {
    return trimmed.replace(/\{url\}/g, encodeURIComponent(targetUrl));
  }
  if (trimmed.includes('?')) {
    return trimmed.endsWith('=') || trimmed.endsWith('?')
      ? `${trimmed}${encodeURIComponent(targetUrl)}`
      : `${trimmed}&url=${encodeURIComponent(targetUrl)}`;
  }
  return trimmed.endsWith('/')
    ? `${trimmed}${encodeURIComponent(targetUrl)}`
    : `${trimmed}/?url=${encodeURIComponent(targetUrl)}`;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Fetches an M3U or XMLTV URL directly in the browser first (when no custom User-Agent is set).
 * Never sends URLs to any third-party/public proxy service.
 * Falls back only to:
 * 1) The localhost Vite dev/preview relay (/__local_fetch), if running locally.
 * 2) A user-supplied self-hosted relay URL, if explicitly configured.
 */
export async function fetchUrlWithLocalFallback(
  url: string,
  optionsOrUa?: string | LocalFetchOptions
): Promise<LocalFetchResult> {
  const options: LocalFetchOptions =
    typeof optionsOrUa === 'string' ? { userAgent: optionsOrUa } : optionsOrUa || {};

  const trimmedUa = options.userAgent?.trim() || '';
  const customRelay = options.corsProxyUrl?.trim() || '';
  const isMixedContent =
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    /^http:\/\//i.test(url.trim());

  // 1. Direct browser fetch
  if (!trimmedUa && !isMixedContent) {
    try {
      const directRes = await fetch(url);
      if (!directRes.ok) {
        throw new Error(`Remote host returned HTTP ${directRes.status}.`);
      }
      const buffer = await directRes.arrayBuffer();
      return {
        buffer,
        contentType: directRes.headers.get('content-type') || '',
        viaRelay: false,
      };
    } catch (err) {
      // Only fall back on network/CORS TypeError; rethrow explicit HTTP errors
      if (!(err instanceof TypeError)) {
        throw err;
      }
    }
  }

  // 2. Try localhost Vite relay (/__local_fetch)
  try {
    const relayRes = await fetch('/__local_fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        userAgent: trimmedUa || undefined,
      }),
    });

    if (relayRes.headers.get('X-LumenTV-Local-Relay') === '1') {
      cachedRelayAvailability = true;
      const payload = (await relayRes.json()) as {
        ok?: boolean;
        status?: number;
        contentType?: string;
        bodyBase64?: string;
        error?: string;
      };

      if (!relayRes.ok || payload.error) {
        throw new Error(payload.error || 'Local relay failed to fetch the remote URL.');
      }

      if (!payload.ok) {
        throw new Error(`Remote host returned HTTP ${payload.status ?? 'error'}.`);
      }

      return {
        buffer: base64ToArrayBuffer(payload.bodyBase64 || ''),
        contentType: payload.contentType || '',
        viaRelay: true,
      };
    }
    cachedRelayAvailability = false;
  } catch (err) {
    if (!(err instanceof TypeError) && !(err instanceof SyntaxError)) {
      throw err;
    }
    cachedRelayAvailability = false;
  }

  // 3. Optional user-configured self-hosted relay URL (never a built-in public service)
  if (customRelay) {
    const proxiedUrl = formatCorsProxyUrl(customRelay, url);
    const res = await fetch(proxiedUrl);
    if (!res.ok) {
      throw new Error(`Self-hosted relay returned HTTP ${res.status}.`);
    }
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength === 0) {
      throw new Error('Self-hosted relay returned an empty response.');
    }
    return {
      buffer,
      contentType: res.headers.get('content-type') || '',
      viaRelay: false,
      viaCustomRelay: true,
    };
  }

  // 4. Strictly privacy-preserving failure guidance for static hosting
  const reason = isMixedContent
    ? 'This page is served over HTTPS, so your browser blocked the insecure http:// URL (Mixed Content).'
    : 'Direct browser fetch was blocked by CORS headers on the remote server, and static hosting has no local relay.';

  throw new LocalFetchError(
    `${reason} To keep your playlist URL private without third-party servers, download the file in a new tab and drop it into Local File mode, or run LumenTV locally (npm run dev).`,
    { isBlockedOnStaticHost: true, isMixedContent }
  );
}

export function buildLocalStreamUrl(
  streamUrl: string,
  userAgent?: string,
  corsProxyUrl?: string,
  useLocalViteRelay = true
): string {
  if (!useLocalViteRelay && corsProxyUrl?.trim()) {
    return formatCorsProxyUrl(corsProxyUrl, streamUrl);
  }
  const params = new URLSearchParams({ url: streamUrl });
  const trimmedUa = userAgent?.trim();
  if (trimmedUa) {
    params.set('ua', trimmedUa);
  }
  return `/__local_stream?${params.toString()}`;
}
