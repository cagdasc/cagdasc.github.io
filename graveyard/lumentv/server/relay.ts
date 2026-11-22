import http from 'node:http';
import https from 'node:https';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Readable } from 'node:stream';
import zlib from 'node:zlib';

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const MAX_REDIRECTS = 10;
const CONNECT_TIMEOUT_MS = 15000;

interface UpstreamResponse {
  ok: boolean;
  status: number;
  url: string;
  contentEncodingHandled: boolean;
  getHeader(name: string): string | null;
  readBuffer(): Promise<Buffer>;
  readText(): Promise<string>;
  pipeTo(res: ServerResponse, signal?: AbortSignal): Promise<void>;
}

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > 1024 * 64) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

export function isAllowedHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function rewriteHlsPlaylist(
  playlistText: string,
  baseUrl: string,
  userAgent?: string
): string {
  const toRelayUrl = (rawUri: string): string => {
    try {
      const absolute = new URL(rawUri, baseUrl).toString();
      if (!isAllowedHttpUrl(absolute)) return rawUri;
      const params = new URLSearchParams({ url: absolute });
      if (userAgent) params.set('ua', userAgent);
      return `/__local_stream?${params.toString()}`;
    } catch {
      return rawUri;
    }
  };

  return playlistText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/g, (_m, uri: string) => `URI="${toRelayUrl(uri)}"`);
      }
      return toRelayUrl(trimmed);
    })
    .join('\n');
}

function resolveEffectiveUserAgent(explicitUa: string, req: IncomingMessage): string {
  if (explicitUa) return explicitUa;
  const incomingUa = req.headers['user-agent'];
  if (typeof incomingUa === 'string' && incomingUa.trim()) {
    return incomingUa.trim();
  }
  return DEFAULT_USER_AGENT;
}

function wrapFetchResponse(upstream: Response, fallbackUrl: string): UpstreamResponse {
  return {
    ok: upstream.ok,
    status: upstream.status,
    url: upstream.url || fallbackUrl,
    contentEncodingHandled: true,
    getHeader(name: string) {
      return upstream.headers.get(name);
    },
    async readBuffer() {
      return Buffer.from(await upstream.arrayBuffer());
    },
    async readText() {
      return upstream.text();
    },
    async pipeTo(res: ServerResponse, signal?: AbortSignal) {
      if (!upstream.body) {
        if (!res.writableEnded) res.end();
        return;
      }
      const reader = upstream.body.getReader();
      const onAbort = () => {
        reader.cancel().catch(() => {});
      };
      signal?.addEventListener('abort', onAbort, { once: true });
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!res.writableEnded) {
            res.write(value);
          }
        }
        if (!res.writableEnded) {
          res.end();
        }
      } finally {
        signal?.removeEventListener('abort', onAbort);
      }
    },
  };
}

function decodeNodeBodyStream(res: IncomingMessage): { stream: Readable; decompressed: boolean } {
  const encoding = String(res.headers['content-encoding'] || '')
    .trim()
    .toLowerCase();
  if (encoding === 'gzip' || encoding === 'x-gzip') {
    const gunzip = zlib.createGunzip();
    res.pipe(gunzip);
    return { stream: gunzip, decompressed: true };
  }
  if (encoding === 'deflate') {
    const inflate = zlib.createInflate();
    res.pipe(inflate);
    return { stream: inflate, decompressed: true };
  }
  if (encoding === 'br' && typeof zlib.createBrotliDecompress === 'function') {
    const brotli = zlib.createBrotliDecompress();
    res.pipe(brotli);
    return { stream: brotli, decompressed: true };
  }
  return { stream: res, decompressed: false };
}

function nodeHttpAttempt(
  targetUrl: string,
  options: {
    method: string;
    headers: Record<string, string>;
    family?: 4 | 6;
    signal?: AbortSignal;
    redirectsRemaining?: number;
  }
): Promise<UpstreamResponse> {
  const redirectsRemaining = options.redirectsRemaining ?? MAX_REDIRECTS;
  const parsed = new URL(targetUrl);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return Promise.reject(new Error(`Unsupported protocol: ${parsed.protocol}`));
  }

  return new Promise((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(new Error('Request aborted'));
      return;
    }

    const transport = parsed.protocol === 'https:' ? https : http;
    let settled = false;

    const req = transport.request(
      parsed,
      {
        method: options.method,
        headers: options.headers,
        family: options.family,
      },
      (res) => {
        req.setTimeout(0);
        const status = res.statusCode ?? 0;
        const location = res.headers.location;

        if (
          location &&
          [301, 302, 303, 307, 308].includes(status) &&
          redirectsRemaining > 0
        ) {
          res.resume();
          const nextUrl = new URL(location, parsed).toString();
          const nextMethod =
            status === 303 || ((status === 301 || status === 302) && options.method !== 'HEAD')
              ? 'GET'
              : options.method;
          settled = true;
          options.signal?.removeEventListener('abort', onAbort);
          nodeHttpAttempt(nextUrl, {
            ...options,
            method: nextMethod,
            redirectsRemaining: redirectsRemaining - 1,
          }).then(resolve, reject);
          return;
        }

        settled = true;
        options.signal?.removeEventListener('abort', onAbort);

        const { stream, decompressed } =
          options.method === 'HEAD'
            ? { stream: res, decompressed: false }
            : decodeNodeBodyStream(res);

        const readBuffer = (): Promise<Buffer> =>
          new Promise((resBuf, rejBuf) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk: Buffer | string) => {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            });
            stream.on('end', () => resBuf(Buffer.concat(chunks)));
            stream.on('error', rejBuf);
            res.on('error', rejBuf);
          });

        resolve({
          ok: status >= 200 && status < 300,
          status,
          url: parsed.toString(),
          contentEncodingHandled: decompressed,
          getHeader(name: string) {
            const val = res.headers[name.toLowerCase()];
            if (Array.isArray(val)) return val.join(', ');
            return typeof val === 'string' ? val : null;
          },
          readBuffer,
          async readText() {
            return (await readBuffer()).toString('utf8');
          },
          pipeTo(clientRes: ServerResponse, pipeSignal?: AbortSignal) {
            return new Promise((resPipe, rejPipe) => {
              if (options.method === 'HEAD') {
                res.resume();
                if (!clientRes.writableEnded) clientRes.end();
                resPipe();
                return;
              }
              const cleanup = () => {
                pipeSignal?.removeEventListener('abort', onPipeAbort);
                res.destroy();
                if (stream !== res) stream.destroy();
              };
              const onPipeAbort = () => {
                cleanup();
                resPipe();
              };
              pipeSignal?.addEventListener('abort', onPipeAbort, { once: true });
              stream.on('error', (err) => {
                cleanup();
                rejPipe(err);
              });
              res.on('error', (err) => {
                cleanup();
                rejPipe(err);
              });
              clientRes.on('close', cleanup);
              stream.on('end', () => {
                pipeSignal?.removeEventListener('abort', onPipeAbort);
                if (!clientRes.writableEnded) clientRes.end();
                resPipe();
              });
              stream.pipe(clientRes, { end: false });
            });
          },
        });
      }
    );

    const onAbort = () => {
      if (!settled) {
        settled = true;
        req.destroy(new Error('Request aborted'));
      }
    };
    options.signal?.addEventListener('abort', onAbort, { once: true });

    req.setTimeout(CONNECT_TIMEOUT_MS, () => {
      if (!settled) {
        settled = true;
        req.destroy(new Error(`Connection timed out after ${CONNECT_TIMEOUT_MS / 1000}s`));
      }
    });

    req.on('error', (err) => {
      options.signal?.removeEventListener('abort', onAbort);
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    req.end();
  });
}

function formatUpstreamError(err: unknown, targetUrl: string): string {
  const errObj = err as (Error & { code?: string; cause?: { code?: string; message?: string } }) | null;
  const code = errObj?.code || errObj?.cause?.code;
  const rawMessage = errObj?.message || 'Local relay connection failed';
  const causeMsg = errObj?.cause?.message;
  const detail = causeMsg && !rawMessage.includes(causeMsg) ? `${rawMessage} (${causeMsg})` : rawMessage;
  let hostLabel = targetUrl;
  try {
    hostLabel = new URL(targetUrl).host;
  } catch {
    // keep raw targetUrl
  }
  return code ? `${detail} [${code} reaching ${hostLabel}]` : `${detail} [reaching ${hostLabel}]`;
}

async function openUpstream(
  targetUrl: string,
  options: {
    method: string;
    headers: Record<string, string>;
    signal?: AbortSignal;
  }
): Promise<UpstreamResponse> {
  // 1. Try IPv4-first node:http/https directly or fetch() first:
  //    Using fetch() first preserves HTTP_PROXY/HTTPS_PROXY + HTTP/2 when available,
  //    then falling back to node:http/https (family: 4, then default family) resolves
  //    Bun IPv6/ALPN/socket connection issues ("Unable to connect...").
  let firstError: unknown;
  try {
    const res = await fetch(targetUrl, {
      method: options.method,
      headers: options.headers,
      redirect: 'follow',
      signal: options.signal,
    });
    return wrapFetchResponse(res, targetUrl);
  } catch (err) {
    firstError = err;
    if (options.signal?.aborted) {
      throw err;
    }
  }

  try {
    return await nodeHttpAttempt(targetUrl, {
      ...options,
      headers: {
        ...options.headers,
        'Accept-Encoding': options.headers['Accept-Encoding'] || 'gzip, deflate',
      },
      family: 4,
    });
  } catch (ipv4Err) {
    if (options.signal?.aborted) {
      throw ipv4Err;
    }
    try {
      return await nodeHttpAttempt(targetUrl, {
        ...options,
        headers: {
          ...options.headers,
          'Accept-Encoding': options.headers['Accept-Encoding'] || 'gzip, deflate',
        },
      });
    } catch (finalErr) {
      const chosen = finalErr || ipv4Err || firstError;
      throw new Error(formatUpstreamError(chosen, targetUrl));
    }
  }
}

export async function handleLocalFetchRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.setHeader('X-LumenTV-Local-Relay', '1');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let targetUrl = '';
  try {
    const body = await readJsonBody(req);
    targetUrl = typeof body.url === 'string' ? body.url.trim() : '';
    const explicitUa = typeof body.userAgent === 'string' ? body.userAgent.trim() : '';

    if (!isAllowedHttpUrl(targetUrl)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid http(s) URL' }));
      return;
    }

    const headers: Record<string, string> = {
      Accept: '*/*',
      'User-Agent': resolveEffectiveUserAgent(explicitUa, req),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);
    req.on('close', () => controller.abort());

    try {
      const upstream = await openUpstream(targetUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      const buf = await upstream.readBuffer();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          ok: upstream.ok,
          status: upstream.status,
          contentType: upstream.getHeader('content-type') || '',
          bodyBase64: buf.toString('base64'),
        })
      );
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Local fetch failed',
      })
    );
  }
}

export async function handleLocalStreamRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.setHeader('X-LumenTV-Local-Relay', '1');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  try {
    const reqUrl = new URL(req.url || '/', 'http://localhost');
    const targetUrl = reqUrl.searchParams.get('url')?.trim() || '';
    const explicitUa = reqUrl.searchParams.get('ua')?.trim() || '';

    if (!isAllowedHttpUrl(targetUrl)) {
      res.statusCode = 400;
      res.end('Invalid stream URL');
      return;
    }

    const headers: Record<string, string> = {
      Accept: '*/*',
      'User-Agent': resolveEffectiveUserAgent(explicitUa, req),
    };
    if (typeof req.headers.range === 'string') {
      headers['Range'] = req.headers.range;
    }

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    const upstream = await openUpstream(targetUrl, {
      method: req.method,
      headers,
      signal: controller.signal,
    });

    const contentType = upstream.getHeader('content-type') || '';
    const finalUrl = upstream.url || targetUrl;
    const isHlsPlaylist =
      /mpegurl/i.test(contentType) || /\.m3u8?(\?|$)/i.test(finalUrl);

    if (isHlsPlaylist && upstream.ok && req.method === 'GET') {
      const text = await upstream.readText();
      const rewritten = rewriteHlsPlaylist(text, finalUrl, explicitUa || undefined);
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(rewritten);
      return;
    }

    res.statusCode = upstream.status;
    if (contentType) res.setHeader('Content-Type', contentType);
    if (!upstream.contentEncodingHandled) {
      const contentLength = upstream.getHeader('content-length');
      if (contentLength) res.setHeader('Content-Length', contentLength);
      const contentEncoding = upstream.getHeader('content-encoding');
      if (contentEncoding) res.setHeader('Content-Encoding', contentEncoding);
    }
    const contentRange = upstream.getHeader('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    const acceptRanges = upstream.getHeader('accept-ranges');
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

    await upstream.pipeTo(res, controller.signal);
  } catch (err) {
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end(err instanceof Error ? err.message : 'Local stream relay failed');
    } else if (!res.writableEnded) {
      res.end();
    }
  }
}
