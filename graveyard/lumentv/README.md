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
