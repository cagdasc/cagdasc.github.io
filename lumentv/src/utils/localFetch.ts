export interface LocalFetchResult {
  buffer: ArrayBuffer;
  contentType: string;
  viaRelay: boolean;
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
 * If blocked by browser CORS / Mixed Content, or if a custom User-Agent is requested,
 * transparently falls back to the localhost Vite dev/preview relay (/__local_fetch).
 */
export async function fetchUrlWithLocalFallback(
  url: string,
  userAgent?: string
): Promise<LocalFetchResult> {
  const trimmedUa = userAgent?.trim() || '';

  if (!trimmedUa) {
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

  let relayRes: Response;
  try {
    relayRes = await fetch('/__local_fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        userAgent: trimmedUa || undefined,
      }),
    });
  } catch {
    throw new Error(
      'Direct browser fetch was blocked by CORS and the local Vite relay is unreachable. Download the file and drop it into Local File mode, or paste its contents.'
    );
  }

  if (relayRes.headers.get('X-LumenTV-Local-Relay') !== '1') {
    throw new Error(
      'Direct browser fetch was blocked (likely CORS headers on the remote server). Download the file and drop it into Local File mode, or paste its contents.'
    );
  }

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

export function buildLocalStreamUrl(streamUrl: string, userAgent?: string): string {
  const params = new URLSearchParams({ url: streamUrl });
  const trimmedUa = userAgent?.trim();
  if (trimmedUa) {
    params.set('ua', trimmedUa);
  }
  return `/__local_stream?${params.toString()}`;
}
