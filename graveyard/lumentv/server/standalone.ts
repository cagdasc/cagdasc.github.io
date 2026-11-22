import http from 'node:http';
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { handleLocalFetchRequest, handleLocalStreamRequest } from './relay';

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

export interface EmbeddedAssetEntry {
  contentType: string;
  base64: string;
}

interface DecodedAsset {
  contentType: string;
  body: Buffer;
}

function parseArgs(argv: string[]) {
  let port = Number(process.env.PORT || 4173);
  let host = '127.0.0.1';
  let openWindow = true;
  let browserTab = false;
  let showHelp = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      showHelp = true;
    } else if (arg === '--no-open') {
      openWindow = false;
    } else if (arg === '--browser') {
      browserTab = true;
    } else if ((arg === '--port' || arg === '-p') && argv[i + 1]) {
      const parsed = Number(argv[++i]);
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 65535) {
        port = parsed;
      }
    } else if (arg.startsWith('--port=')) {
      const parsed = Number(arg.slice('--port='.length));
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 65535) {
        port = parsed;
      }
    } else if (arg === '--lan') {
      host = '0.0.0.0';
    }
  }

  return { port, host, openWindow, browserTab, showHelp };
}

function printHelp(): void {
  console.log(`LumenTV — Local Privacy-First IPTV Player

Usage:
  lumentv [options]

Options:
  -p, --port <number>   Preferred local port (default: 4173, falls back to free port)
  --no-open             Start the local server without opening a window
  --browser             Open in a standard browser tab instead of app window mode
  --lan                 Bind to 0.0.0.0 instead of 127.0.0.1
  -h, --help            Show this help message
`);
}

function findChromiumAppBinary(): string | null {
  const candidates =
    process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
          '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
        ]
      : process.platform === 'win32'
        ? [
            path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
            path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
            path.join(process.env['LocalAppData'] || '', 'Google\\Chrome\\Application\\chrome.exe'),
            path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Microsoft\\Edge\\Application\\msedge.exe'),
            path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Microsoft\\Edge\\Application\\msedge.exe'),
          ]
        : [
            '/usr/bin/google-chrome',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/usr/bin/microsoft-edge',
            '/usr/bin/brave-browser',
          ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function openLumenWindow(url: string, preferBrowserTab: boolean): void {
  if (!preferBrowserTab) {
    const appBrowser = findChromiumAppBinary();
    if (appBrowser) {
      const child = spawn(appBrowser, [`--app=${url}`], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      return;
    }
  }

  if (process.platform === 'darwin') {
    const child = spawn('open', [url], { detached: true, stdio: 'ignore' });
    child.unref();
  } else if (process.platform === 'win32') {
    const child = spawn('cmd', ['/c', 'start', '', url], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
  } else {
    const child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
    child.unref();
  }
}

function listenWithFallback(
  server: http.Server,
  preferredPort: number,
  host: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const onError = (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && preferredPort !== 0) {
        server.removeListener('error', onError);
        server.listen(0, host, () => {
          const addr = server.address();
          resolve(typeof addr === 'object' && addr ? addr.port : 0);
        });
      } else {
        reject(err);
      }
    };

    server.once('error', onError);
    server.listen(preferredPort, host, () => {
      server.removeListener('error', onError);
      const addr = server.address();
      resolve(typeof addr === 'object' && addr ? addr.port : preferredPort);
    });
  });
}

export async function startStandaloneServer(
  embeddedAssets: Record<string, EmbeddedAssetEntry>
): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.showHelp) {
    printHelp();
    return;
  }

  const decodedAssets = new Map<string, DecodedAsset>();
  for (const [routePath, asset] of Object.entries(embeddedAssets)) {
    decodedAssets.set(routePath, {
      contentType: asset.contentType,
      body: Buffer.from(asset.base64, 'base64'),
    });
  }

  const server = http.createServer((req, res) => {
    const reqPath = (req.url || '/').split('?')[0];

    if (reqPath === '/__local_fetch') {
      void handleLocalFetchRequest(req, res);
      return;
    }

    if (reqPath === '/__local_stream') {
      void handleLocalStreamRequest(req, res);
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405;
      res.end('Method not allowed');
      return;
    }

    const normalizedPath = reqPath === '/' ? '/index.html' : reqPath;
    const asset = decodedAssets.get(normalizedPath) || decodedAssets.get('/index.html');

    if (!asset) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', asset.contentType);
    res.setHeader(
      'Cache-Control',
      normalizedPath === '/index.html' ? 'no-store' : 'public, max-age=31536000, immutable'
    );
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(asset.body);
  });

  const activePort = await listenWithFallback(server, opts.port, opts.host);
  const displayHost = opts.host === '0.0.0.0' ? '127.0.0.1' : opts.host;
  const localUrl = `http://${displayHost}:${activePort}`;

  console.log(`LumenTV local app + relay running at ${localUrl}`);
  console.log('Press Ctrl+C to stop.');

  if (opts.openWindow) {
    openLumenWindow(localUrl, opts.browserTab);
  }

  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
