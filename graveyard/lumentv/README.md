# LumenTV — Local Privacy-First IPTV Player

A browser-local web IPTV player built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **HLS.js**. Playlists, XMLTV EPG schedules, favorites, and preferences are stored strictly inside your browser (`IndexedDB` and `localStorage`) with zero external backend uploads.

Integrated as a Multi-Page Application (MPA) within the portfolio site at `/graveyard/lumentv/`.

---

## Features

- **M3U / M3U8 Playlist Import**: Load playlists from a URL, local `.m3u` / `.m3u8` file drag-and-drop, or pasted text.
- **Local XMLTV EPG Parsing**: Supports `.xml` and gzipped `.xml.gz` XMLTV files (decompressed natively in the browser), with real-time Now/Next indicators and a full TV Guide view.
- **Theater Player**: Powered by `hls.js` with adaptive quality switching, picture-in-picture, fullscreen, volume/mute persistence, and keyboard shortcuts (`Space` play/pause, `M` mute, `F` fullscreen, `/` search, `G` toggle guide).
- **Strict Privacy & Local Relay**: Zero third-party servers or public proxies. When running via Vite (`npm run dev` or `npm run prod`), `vite.config.ts` exposes `/__local_fetch` and `/__local_stream` on your own machine to fetch CORS-restricted playlists or apply a custom `User-Agent`. On static hosting (such as GitHub Pages), LumenTV uses direct browser fetch, local file import, pasted text, or an optional self-hosted relay URL you control.

---

## Running Locally (From Repository Root)

```bash
# Install workspace dependencies
npm install

# Start local development server (open http://localhost:3000/graveyard/lumentv/)
npm run dev

# Build and preview production bundle (open http://localhost:3000/graveyard/lumentv/)
npm run prod

# Type-check workspace
npm run lint
```

---

## Standalone Local Executable

LumenTV can also be compiled into a self-contained single executable (`dist-lumentv/lumentv` or `dist-lumentv/lumentv.exe`) that embeds the built web UI and runs the local `/__local_fetch` and `/__local_stream` relay on `127.0.0.1` without needing Node/Vite installed at runtime. It automatically opens in a chromeless Chromium `--app=` window (Chrome/Edge/Brave) or falls back to your default browser so native media codecs work seamlessly.

### Build Locally (Requires Bun + Node.js)

```bash
# Compile standalone binary for your current OS into dist-lumentv/
npm run lumentv:build

# Run it
./dist-lumentv/lumentv

# Or build a tiny ~1.5 MB Bun JS bundle instead of a full binary
node scripts/build-lumentv.mjs --bundle-only
bun run dist-lumentv/lumentv.mjs
```

### CLI Options

| Flag | Description |
| :--- | :--- |
| `-p, --port <number>` | Preferred local port (default: `4173`, auto-falls back to a free port) |
| `--no-open` | Start the local server without opening a browser window |
| `--browser` | Open in a standard browser tab instead of app window mode |
| `--lan` | Bind to `0.0.0.0` instead of `127.0.0.1` |
| `-h, --help` | Print CLI help |

---

## Automated Version Releases (`lumentv-v*`)

Pushing any tag matching `lumentv-v*` (or running the **Release LumenTV Standalone** workflow manually in GitHub Actions) builds binaries for macOS (`arm64`, `x64`), Linux (`x64`, `arm64`), and Windows (`x64`), generates `SHA256SUMS.txt`, and publishes a GitHub Release independently of the main portfolio deploy:

```bash
git tag lumentv-v1.0.0
git push origin lumentv-v1.0.0
```

