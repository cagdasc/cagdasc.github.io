# 🚀 Asteroid Chrono-Runner: Deep Space Time-Travel Game

An action-packed 2D Canvas space-cave runner game built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **HTML5 Canvas**. Navigate a faceted, rolling celestial asteroid through space caves, cosmic wormholes, spinning black holes, planetary obstacles, and space-bound prehistoric dinosaurs while traveling through millions of years of historical cosmic eras.

Integrated as a dedicated Multi-Page Application (MPA) within the portfolio site, accessible at `/games/asteroid-through-time/`.

---

## 🌟 Key Features

1. **Faceted Rolling Asteroid & Trajectory Tail**:
   - 18 organic rocky vertices, 3D impact craters, and glowing molten fissures.
   - Independent self-rolling matrix: the rock body tumbles continuously proportional to forward travel distance, while the comet thruster tail stays oriented along the velocity angle.

2. **Hold-Duration Dynamic Gravity Mechanics**:
   - Press and hold Spacebar / Mouse / Touch to modify gravity on the fly.
   - **Supported Gravity Modes**:
     - `Default`: Standard tap-to-rebound thrust.
     - `Progressive Float`: Extended holding smoothly reduces gravity for floaty soaring.
     - `Progressive Heavy`: Extended holding scales gravity upward for diving maneuvers.
     - `Dampened Arc`: Dampens vertical velocity inside hold window then snaps back.
     - `Jetpack Thruster`: Applies continuous upward counter-acceleration.

3. **Responsive Mobile & High-DPI Display Support**:
   - Dynamic virtual camera scaling: automatically adapts coordinate space to any screen aspect ratio (desktop widescreen, tablet, mobile landscape, and mobile portrait).
   - High-DPI / Retina crispness with pixel ratio clamping.
   - iOS notch & dynamic island safe-area inset padding (`viewport-fit=cover`).
   - Touch & hold impulse physics optimized for mobile gaming.

4. **Chrono Jump Wormholes & Black Hole Slingshots**:
   - **Warp Portals**: Jump millions of years into the future with hyperdrive visual streaks.
   - **Black Holes**: Realistic orbital gravity lensing with animated spin chevrons. Entering with the spin direction slingshots the asteroid; entering counter-spin exerts turbulent push.

5. **Dynamic Speed Telemetry & Live Gauge**:
   - Forward speed smoothly scales from $180\text{ px/s}$ up to $350\text{ px/s}$ as distance increases.
   - Live speed gauge in the top HUD displays `currentSpeed px/s`.

6. **Cosmic Prehistoric Eras**:
   - Progress through distinct historical eras based on light-years traveled (e.g., Quaternary Shift, Cretaceous Void, Jurassic Rift, Permian Anomaly).

7. **Production Configuration JSON**:
   - Game physics, cave corridor heights, wave fluctuation, and spawn rates can be tuned directly via `src/game/game-config.json` without modifying code.

8. **Procedural Web Audio API Sound System**:
   - Pure Web Audio API synthesized audio for thrusters, gravity shifts, warp entry, black hole hums, collisions, and era achievements.

---

## 🛠️ Project Commands (Run from Repository Root)

```bash
# Start local development server (serves main site & game at http://localhost:3000/games/asteroid-through-time/)
npm run dev

# Run automated game physics and logic unit tests (17 passing tests)
npx tsx --test games/asteroid-through-time/src/game/game.test.ts

# Check TypeScript types across the entire project
npm run lint

# Build production bundle (compiles site and game into dist/)
npm run build

# Preview production build locally
npm run preview
```

---

## 📂 Documentation

For detailed architecture, module breakdowns, physics equations, and guidelines for future AI agents or developers, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).
