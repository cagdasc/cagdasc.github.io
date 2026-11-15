# SignalDeck — Privacy-First Local Web IPTV Player

SignalDeck is a lightweight, zero-telemetry web IPTV player that parses M3U playlists and XMLTV program guides entirely inside the user's browser with no external proxy servers. It pairs a Cinema Dark theater video player with instant category filtering, favorites, search, and a collapsible EPG timeline drawer backed by browser-local storage.

## User Review & Critical Decisions

> [!IMPORTANT]
> All core product preferences from Phase 1 are locked in below. Review the architecture and visual direction before approving execution.

- **Confirmed Decision 1 (Theme)**: Cinema Dark mode tailored for comfortable viewing, using deep obsidian/slate surfaces and restrained high-contrast accents.
- **Confirmed Decision 2 (Layout)**: Theater player primary viewport with a collapsible EPG guide drawer, paired with a compact channel & category browser sidebar.
- **Confirmed Decision 3 (First-Launch Onboarding)**: Preloaded with open, privacy-safe HLS test streams and an embedded local demo EPG dataset so playback, search, favorites, and EPG schedules work immediately while allowing instant replacement with the user's own M3U/XMLTV sources.
- **Confirmed Decision 4 (Local Persistence)**: Playlists, favorites, and parsed EPG schedules are saved strictly in local browser storage (IndexedDB for large playlists/EPG datasets + `localStorage` for lightweight UI preferences).

---

## 1. Overview & Core Concept

- **What It Does**: Loads M3U/M3U8 playlists (via direct browser URL fetch, local `.m3u`/`.m3u8` file upload, or pasted playlist text) and XMLTV EPG data (via local `.xml` / `.xml.gz` file upload, pasted XML, or direct browser URL fetch), parses them in-memory on the client, plays live HLS/media streams, and renders real-time "Now & Next" program guides.
- **Target Audience / Persona**: Privacy-conscious viewers who want a fast, clean desktop and tablet web IPTV workspace without uploading private playlist URLs, credentials, or viewing history to third-party servers.
- **Key Value**: Zero server round-trips for parsing or storage, sub-second channel filtering across large playlists, and a distraction-free theater viewing experience.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **First-Launch & Instant Playback**:
   - The app opens directly into the Cinema Dark theater workspace with a curated demo playlist of open HLS test streams and matching local EPG program blocks.
   - Selecting any channel immediately initializes playback in the main 16:9 theater viewport and displays current and upcoming EPG programs.
2. **Importing User Playlists & Local EPG**:
   - Clicking **Import Sources** in the top bar opens a focused local-import modal where users can add an M3U playlist (URL fetch, `.m3u`/`.m3u8` file drop, or raw text) and attach a local XMLTV EPG source (`.xml` / `.xml.gz` file drop or URL fetch).
   - Users can switch between multiple saved local playlists, merge or replace sources, or clear all local browser data in one click.
   - If a third-party URL blocks direct browser fetching due to CORS headers, the UI explains the browser CORS restriction cleanly and prompts for local file drop or paste—never routing user URLs through an external proxy.
3. **Browsing, Categories, Favorites & Search**:
   - **Sidebar Channel Browser** (`280px`–`320px` collapsible on desktop, drawer on narrow screens): Houses an instant client-side search input (`/` shortcut), segmented scope tabs (**All Channels**, **Favorites**, **Recent**), a clean category selector list with tabular channel counts, and a virtualized/windowed scrollable channel list showing channel logo (with resilient monogram fallback), channel name, and current program title.
   - Hovering or focusing a channel row reveals a direct favorite toggle button (star/bookmark action) without cluttering the resting row.
4. **Theater Player & Collapsible EPG Guide Drawer**:
   - **Theater Viewport**: Anchors the screen with custom Cinema Dark controls (Play/Pause, Volume & Mute slider, HLS Quality Level selector when exposed by the stream manifest, Picture-in-Picture, Fullscreen, and Theater Expand toggle that collapses the sidebar).
   - **Now Playing Strip**: Directly beneath the video frame, displays unboxed typographic metadata: Channel Name · Category · Current Program Title · Remaining Time (`tabular-nums`), plus a quick **Guide Drawer** toggle button.
   - **Collapsible EPG Drawer**: Slides open from the bottom of the workspace (or toggles into an expanded schedule view) displaying an interactive horizontal time-grid for the active category or all channels, complete with a real-time "Now" marker line, 30-minute time slots in `tabular-nums`, and click-to-inspect program descriptions or tune directly to a channel.

### Visual Identity & Theme

- **Aesthetic Direction**: Utilitarian Cinema Studio — dark, quiet, high-legibility broadcast console inspired by professional nonlinear editing suites and studio monitors, free of decorative clutter or neon glow.
- **Color Palette & Mood (Cinema Dark — 60-30-10 Discipline)**:
  - *60% Dominant Neutral Canvas*: Deep Obsidian (`#0A0D12`) for the main theater background and viewport frame.
  - *30% Structural Surfaces*: Elevated Charcoal Slate (`#12161F` / `#181E29`) with crisp `1px` hairline dividers (`rgba(255, 255, 255, 0.08)`), single-elevation depth, and zero nested card sandwiches.
  - *10% Accent Budget*: Broadcast Amber/Gold (`#F59E0B` / `#D97706`) strictly for the active channel indicator, favorite star state, EPG "Now" timeline marker, and primary action buttons; Semantic Crimson (`#EF4444`) paired with explicit text for stream errors or live playback labels.
- **Typography & Hierarchy**:
  - *Display / Headings*: `Plus Jakarta Sans` (SemiBold 600, `text-wrap: balance`) for channel titles, modal headings, and program titles.
  - *Body / UI Controls*: `DM Sans` (Regular 400 / Medium 500, subtle dark-mode optical tracking) for sidebar lists, EPG descriptions, and navigation.
  - *Timestamps & Telemetry*: `JetBrains Mono` with `font-variant-numeric: tabular-nums` strictly for EPG time slots, broadcast durations, channel counts, and playback timers.
- **Component & Metadata Discipline**:
  - Clean 3-zone Top Bar Contract: Brand wordmark (**SignalDeck**) on the left, concise workspace filter/view links in the center (`Player`, `TV Guide`, `Playlists`), and a single primary CTA button (**Import Sources**) on the right.
  - Zero static pill badges on channel cards or EPG metadata—category names, time ranges, and resolutions use quiet unboxed text with `·` separators.
  - All interactive controls remain single-line (`whitespace-nowrap shrink-0`) with `40px+` hit targets and clear `focus-visible` outlines.

### Interactive Feedback & Motion

- Sub-200ms (`150ms cubic-bezier(0.16, 1, 0.3, 1)`) compositor-only transitions (`transform`, `opacity`) for opening the EPG drawer, toggling the sidebar, and modal reveals, respecting `prefers-reduced-motion`.
- Complete view states: Smooth loading indicator while parsing large M3U/XMLTV files, actionable empty states for zero search matches or empty Favorites, and resilient media error recovery banner inside the player frame (with retry & stream URL copy/inspect).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: 100% Client-Side Parsing & Direct Playback**
  - *Chosen Approach*: Parse M3U/M3U8 text and XMLTV XML (including browser-native `DecompressionStream` for `.xml.gz` files) exclusively in browser memory, playing streams via `hls.js` + native `<video>`.
  - *Why*: Guarantees absolute user privacy—neither M3U URLs, channel lists, nor viewing habits ever leave the user's device, and the app stays lightweight with zero backend runtime overhead.
  - *Alternatives Considered*: Server-side CORS proxy for M3U/EPG fetching. Passed over because routing user playlist URLs through a server directly violates the no-external-server privacy requirement; instead, clear CORS guidance and instant local file/paste import handle restricted hosts cleanly.

- **Decision 2: IndexedDB + `localStorage` Hybrid Persistence**
  - *Chosen Approach*: Store parsed playlists, channels, and XMLTV EPG program maps in browser IndexedDB, while storing lightweight user state (favorites IDs, recent channel IDs, active playlist ID, volume, EPG drawer state) in `localStorage`/IndexedDB.
  - *Why*: Real-world IPTV playlists and 7-day XMLTV files easily exceed `localStorage`'s ~5MB limit. IndexedDB handles tens of thousands of EPG program entries locally without blocking the UI or failing quota checks.
  - *Alternatives Considered*: `localStorage`-only JSON serialization. Passed over due to quota limits and main-thread JSON serialization lag on large EPG files.

- **Decision 3: Performance Optimization for Large Playlists**
  - *Chosen Approach*: Windowed/chunked channel rendering (or paginated/virtualized list rendering) and indexed `Map` lookups (`tvg-id` and normalized channel-name matching) for EPG programs.
  - *Why*: Ensures instant search and category switching even when a user imports an M3U playlist containing thousands of channels and tens of thousands of EPG entries.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Browser-Local Persistence                        │
│   IndexedDB (Playlists, Channels, XMLTV Programs) + localStorage (Prefs) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Load / Save / Clear (100% Local)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Local Parsing & Media Engine                      │
│  ┌───────────────────┐  ┌─────────────────────┐  ┌───────────────────┐  │
│  │    M3U Parser     │  │  XMLTV EPG Parser   │  │   HLS / Video     │  │
│  │  (#EXTM3U/EXTINF) │  │ (DOMParser + gzip)  │  │ (hls.js + native) │  │
│  └─────────┬─────────┘  └──────────┬──────────┘  └─────────┬─────────┘  │
└────────────┼───────────────────────┼───────────────────────┼────────────┘
             │                       │                       │
             ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SignalDeck Application                          │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Top Bar: [SignalDeck]  —  [Player · TV Guide · Playlists] — [Import]│ │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────────────────────┐  │
│  │   Channel Sidebar    │  │            Theater Workspace            │  │
│  │                      │  │                                         │  │
│  │ • Search Input (/)   │  │  ┌───────────────────────────────────┐  │  │
│  │ • All / Fav / Recent │  │  │     Video Viewport (16:9 HLS)     │  │  │
│  │ • Category Filter    │  │  │  Custom Controls · Quality · PiP  │  │  │
│  │ • Virtualized List   │  │  └───────────────────────────────────┘  │  │
│  │   (Logo, Name, Now,  │  │                                         │  │
│  │    Favorite Toggle)  │  │  Now Playing Bar + [Toggle EPG Drawer]  │  │
│  └──────────────────────┘  │                                         │  │
│                            │  ┌───────────────────────────────────┐  │  │
│                            │  │   Collapsible EPG Guide Drawer    │  │  │
│                            │  │  (Time Grid · Now Line · Details) │  │  │
│                            │  └───────────────────────────────────┘  │  │
│                            └─────────────────────────────────────────┘  │
│                                                                         │
│  Modals: [Import M3U & Local EPG Modal] · [Playlist Manager & Privacy]  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **`PlaylistSource`**: `{ id, name, sourceType ('demo' | 'url' | 'file' | 'text'), sourceRef?, createdAt, channelCount, categories[] }`
- **`Channel`**: `{ id, playlistId, name, streamUrl, logoUrl?, category, tvgId?, tvgName?, number? }`
- **`EpgProgram`**: `{ channelKey (tvgId or normalized name), title, description?, category?, startMs, endMs }`
- **`UserPreferences`**: `{ activePlaylistId, activeChannelId, favoriteIds[], recentIds[], volume, muted, epgDrawerOpen, sidebarCollapsed }`

### Interactive Component & State Mapping

- **Top Bar & Navigation (`Player` / `TV Guide` / `Playlists` / `Import Sources`)**:
  - `Player` focuses the theater viewport and sidebar; `TV Guide` expands the EPG drawer into a full-workspace guide view; `Playlists` opens the local playlist & privacy storage manager; `Import Sources` opens the M3U/EPG import modal.
- **Channel Sidebar (`Search`, `All / Favorites / Recent`, `Categories`, `Channel Rows`)**:
  - Typing in search filters channels in real time across channel names, categories, and currently airing EPG titles.
  - Selecting a category updates the visible channel list and optionally scopes the EPG timeline.
  - Clicking a favorite star toggles membership in `favoriteIds` and persists immediately to local browser storage.
  - Clicking a channel row updates `activeChannelId`, appends to `recentIds`, and triggers `hls.js` / `<video>` source loading.
- **Theater Player (`VideoViewport`, `ControlBar`)**:
  - Binds `hls.js` instance lifecycle (`MANIFEST_PARSED`, `LEVEL_SWITCHED`, `ERROR` recovery for network/media hiccups) with clean teardown on channel switch.
  - Supports keyboard shortcuts (`Space`/play-pause, `M`/mute, `F`/fullscreen, `/`/focus search, `G`/toggle EPG drawer).
- **Collapsible EPG Drawer (`EpgDrawer`, `ProgramDetailPopover`)**:
  - Queries parsed `EpgProgram` entries for the visible channel window around the current local clock (`Date.now()`).
  - Clicking a live program row tunes directly to that channel; clicking an upcoming/past program displays its synopsis and airtime in an inline detail strip.
- **Import & Storage Manager (`ImportModal`, `PlaylistManagerModal`)**:
  - Validates M3U headers/entries and XMLTV structure before committing to IndexedDB, reporting exact parsed counts (e.g., `142 channels · 1,840 programs`) and offering a **Clear All Local Data** action.
