# LumenTV — Local Privacy-First IPTV Player

A browser-local web IPTV player built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **HLS.js**. Playlists, XMLTV EPG schedules, favorites, and preferences are stored strictly inside your browser (`IndexedDB` and `localStorage`) with zero external backend uploads.

Integrated as a Multi-Page Application (MPA) within the portfolio site at `/graveyard/lumentv/`.

---

## Features

- **M3U / M3U8 Playlist Import**: Load playlists from a URL, local `.m3u` / `.m3u8` file drag-and-drop, or pasted text.
- **Local XMLTV EPG Parsing**: Supports `.xml` and gzipped `.xml.gz` XMLTV files (decompressed natively in the browser), with real-time Now/Next indicators and a full TV Guide view.
- **Theater Player**: Powered by `hls.js` with adaptive quality switching, picture-in-picture, fullscreen, volume/mute persistence, and keyboard shortcuts (`Space` play/pause, `M` mute, `F` fullscreen, `/` search, `G` toggle guide).
- **Local CORS & User-Agent Relay**: When running via Vite (`npm run dev` or `npm run prod` / `npm run preview`), `vite.config.ts` exposes `/__local_fetch` and `/__local_stream` middleware to fetch CORS-restricted playlists or apply a custom `User-Agent`. On purely static hosting (such as GitHub Pages), direct browser fetch and Local File / Paste modes remain available.

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
