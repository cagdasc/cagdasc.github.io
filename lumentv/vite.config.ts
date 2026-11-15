import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Connect, type Plugin } from 'vite';

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

function isAllowedHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function rewriteHlsPlaylist(playlistText: string, baseUrl: string, userAgent?: string): string {
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
        // Rewrite URI="..." attributes inside #EXT-X-KEY, #EXT-X-MAP, #EXT-X-MEDIA, etc.
        return line.replace(/URI="([^"]+)"/g, (_m, uri: string) => `URI="${toRelayUrl(uri)}"`);
      }
      return toRelayUrl(trimmed);
    })
    .join('\n');
}

function attachLocalRelayMiddleware(middlewares: Connect.Server): void {
  middlewares.use('/__local_fetch', async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('X-LumenTV-Local-Relay', '1');

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    try {
      const body = await readJsonBody(req);
      const targetUrl = typeof body.url === 'string' ? body.url.trim() : '';
      const userAgent = typeof body.userAgent === 'string' ? body.userAgent.trim() : '';

      if (!isAllowedHttpUrl(targetUrl)) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid http(s) URL' }));
        return;
      }

      const headers: Record<string, string> = { Accept: '*/*' };
      if (userAgent) {
        headers['User-Agent'] = userAgent;
      }

      const upstream = await fetch(targetUrl, {
        headers,
        redirect: 'follow',
      });

      const buf = Buffer.from(await upstream.arrayBuffer());
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          ok: upstream.ok,
          status: upstream.status,
          contentType: upstream.headers.get('content-type') || '',
          bodyBase64: buf.toString('base64'),
        })
      );
    } catch (err) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: err instanceof Error ? err.message : 'Local fetch failed',
        })
      );
    }
  });

  middlewares.use('/__local_stream', async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('X-LumenTV-Local-Relay', '1');

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405;
      res.end('Method not allowed');
      return;
    }

    try {
      const reqUrl = new URL(req.url || '/', 'http://localhost');
      const targetUrl = reqUrl.searchParams.get('url')?.trim() || '';
      const userAgent = reqUrl.searchParams.get('ua')?.trim() || '';

      if (!isAllowedHttpUrl(targetUrl)) {
        res.statusCode = 400;
        res.end('Invalid stream URL');
        return;
      }

      const headers: Record<string, string> = { Accept: '*/*' };
      if (userAgent) headers['User-Agent'] = userAgent;
      if (typeof req.headers.range === 'string') {
        headers['Range'] = req.headers.range;
      }

      const controller = new AbortController();
      req.on('close', () => controller.abort());

      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers,
        redirect: 'follow',
        signal: controller.signal,
      });

      const contentType = upstream.headers.get('content-type') || '';
      const finalUrl = upstream.url || targetUrl;
      const isHlsPlaylist =
        /mpegurl/i.test(contentType) || /\.m3u8?(\?|$)/i.test(finalUrl);

      if (isHlsPlaylist && upstream.ok && req.method === 'GET') {
        const text = await upstream.text();
        const rewritten = rewriteHlsPlaylist(text, finalUrl, userAgent || undefined);
        res.statusCode = upstream.status;
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(rewritten);
        return;
      }

      res.statusCode = upstream.status;
      if (contentType) res.setHeader('Content-Type', contentType);
      const contentLength = upstream.headers.get('content-length');
      if (contentLength) res.setHeader('Content-Length', contentLength);
      const contentRange = upstream.headers.get('content-range');
      if (contentRange) res.setHeader('Content-Range', contentRange);
      const acceptRanges = upstream.headers.get('accept-ranges');
      if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

      if (!upstream.body || req.method === 'HEAD') {
        res.end();
        return;
      }

      const reader = upstream.body.getReader();
      req.on('close', () => {
        reader.cancel().catch(() => {});
      });

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
    } catch (err) {
      if (!res.headersSent) {
        res.statusCode = 502;
        res.end(err instanceof Error ? err.message : 'Local stream relay failed');
      } else if (!res.writableEnded) {
        res.end();
      }
    }
  });
}

function lumenLocalRelayPlugin(): Plugin {
  return {
    name: 'lumentv-local-relay',
    configureServer(server) {
      attachLocalRelayMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachLocalRelayMiddleware(server.middlewares);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), lumenLocalRelayPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
