# cagdas.caglak.cc

Personal portfolio, one-page CV, technical engineering blog, links page, and Multi-Page Application (MPA) graveyard for **Cagdas Caglak** (`https://cagdas.caglak.cc`).

---

## Project Structure

```text
.
├── index.html                          # Main portfolio SPA entry
├── vite.config.ts                      # Multi-page Vite config + LumenTV local relay plugin
├── package.json                        # Root scripts & shared dependencies
├── .vscode/
│   ├── launch.json                     # VS Code Dev & Prod debug/run configurations
│   ├── tasks.json                      # VS Code tasks (Dev, Prod, Build, Typecheck)
│   └── settings.json                   # Workspace TypeScript & Tailwind CSS v4 settings
├── src/                                # Main site (Resume, Blog, Links, App Graveyard)
│   ├── App.tsx                         # Route & tab synchronizer + document meta
│   ├── components/
│   │   ├── Navbar.tsx                  # Top navigation bar (Graveyard tab commented out)
│   │   ├── OnePageCV.tsx               # Interactive & printable CV view
│   │   ├── BlogSection.tsx             # Searchable technical articles grid
│   │   ├── ArticleReader.tsx           # Markdown article reader
│   │   ├── LinktreePage.tsx            # Standalone /links bio page
│   │   └── GraveyardSection.tsx        # Tile launcher for graveyard/ sub-apps
│   ├── data/                           # CV data, links, and blog posts
│   └── utils/                          # GA4 zero-cookie analytics, meta, QR utilities
├── graveyard/                          # Standalone MPA sub-apps built into dist/graveyard/
│   ├── asteroid-through-time/          # 2D Canvas cosmic arcade runner
│   └── lumentv/                        # Local privacy-first HLS/XMLTV IPTV player
├── scripts/
│   ├── prerender-pages.js              # Generates static /blog, /links, /graveyard HTML
│   └── generate-og-images.js           # Generates OpenGraph PNG assets
└── public/
    ├── 404.html                        # GitHub Pages SPA/MPA fallback & redirects
    ├── sitemap.xml                     # Sitemap including blog & graveyard entries
    └── robots.txt
```

---

## Routes & Applications

| Path | Description |
| :--- | :--- |
| `/` or `/#cv` | One-page CV / Resume |
| `/blog` or `/#blog` | Technical articles list (`/blog/:slug` for individual posts) |
| `/links` or `/#links` | Standalone quick-links bio page |
| `/graveyard` or `/#graveyard` | Tile screen launching archived experiments |
| `/graveyard/asteroid-through-time/` | **Asteroid Through Time** — physics-based space-cave runner |
| `/graveyard/lumentv/` | **LumenTV** — browser-local IPTV player (M3U + XMLTV EPG) |

> **Navbar Visibility Note:** The **Graveyard** tab in `src/components/Navbar.tsx` is currently commented out so it stays hidden from the main navbar while remaining accessible directly at `/graveyard` or `/#graveyard`. Uncomment the `Archive` import and `graveyard` entry in `navItems` inside `src/components/Navbar.tsx` to display it in the header.

---

## Getting Started

### Prerequisites
- **Node.js** 20+
- **npm** (do not remove `package-lock.json` or `bun.lock`)

### Install Dependencies
```bash
npm install
```

### Run in Development Mode
Starts Vite on `http://localhost:3000` serving the main site and all `graveyard/` apps (including LumenTV's `/__local_fetch` and `/__local_stream` relay middleware):
```bash
npm run dev
```

### Build & Run in Production Mode Locally
Builds all MPA entry points into `dist/`, pre-renders static route HTML pages (`/blog`, `/links`, `/graveyard`), and serves `dist/` on `http://localhost:3000`:
```bash
npm run prod
```

### Individual Scripts
```bash
# Type-check entire workspace (main site + graveyard apps)
npm run lint

# Build production bundle + pre-render static HTML pages into dist/
npm run build

# Preview already-built dist/ on port 3000
npm run preview

# Run Asteroid Through Time unit tests (17 tests)
npx tsx --test graveyard/asteroid-through-time/src/game/game.test.ts

# Clean dist/
npm run clean
```

---

## VS Code Run & Debug Instructions

Root `.vscode/launch.json` and `.vscode/tasks.json` provide one-click configurations in the VS Code **Run and Debug** panel (`Ctrl+Shift+D` / `Cmd+Shift+D`):

- **Dev (Chrome)** / **Dev (Edge)**: Runs `npm install` + `npm run dev` on port `3000` and launches the browser attached to `http://localhost:3000`.
- **Prod (Chrome)** / **Prod (Edge)**: Runs `npm install` + `npm run prod` (builds `dist/` and starts `vite preview` on port `3000`) and launches the browser.
- **Run npm run dev** / **Run npm run prod**: Runs the corresponding npm script directly in the integrated terminal without launching a browser.
- **Tasks (`Terminal -> Run Task`)**: `Dev`, `Prod`, `Build` (default build task), `Typecheck`, and `Install Dependencies`.

---

## Adding a New App to `graveyard/`

1. Place the app under `graveyard/<app-name>/` with its own `index.html` and `src/main.tsx`.
2. In `graveyard/<app-name>/index.html`, reference the entry script with a relative path:
   ```html
   <script type="module" src="./src/main.tsx"></script>
   ```
3. Register `'graveyard/<app-name>/index'` inside `build.rollupOptions.input` in `vite.config.ts`.
4. Add any new runtime packages to the root `package.json`.
5. Add a tile entry in `src/components/GraveyardSection.tsx` pointing to `/graveyard/<app-name>/`, and add the URL to `public/sitemap.xml`.

---

## Deployment

Pushes to `main` or `master` trigger `.github/workflows/deploy.yml`, which runs `npm ci`, executes `npm run build`, and deploys `./dist` to GitHub Pages.
