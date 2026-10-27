# 📐 Project Structure & Architecture Guide

This document provides a comprehensive overview of the **Asteroid Chrono-Runner** codebase architecture, module responsibilities, physics equations, rendering pipeline, and testing patterns to help AI agents and human developers quickly understand and extend the project.

---

## 🗂️ Directory Tree Breakdown

Located at `/games/asteroid-through-time/` within the root portfolio project:

```
games/asteroid-through-time/
├── README.md                      # Project overview and quick start commands
├── PROJECT_STRUCTURE.md           # Architecture guide and codebase map (this file)
├── index.html                     # HTML5 entry point & Google Fonts imports
└── src/
    ├── main.tsx                   # React root entry point
    ├── App.tsx                    # Top-level React container (Canvas lifecycle, HUD, Modals)
    ├── index.css                  # Global styles (Tailwind CSS v4 @import, safe-area insets)
    ├── components/                # React UI components (HUD, Modals, Debugger)
    │   ├── HudOverlay.tsx         # Live speed gauge, hold-duration bar, score & era badge
    │   ├── DebugMenu.tsx          # Live developer menu for tuning gravity modes & physics (hidden in prod)
    │   ├── TitleScreen.tsx        # Modern cosmic main menu & controls overview
    │   ├── GameOverModal.tsx      # Game Over modal with score breakdown & high scores
    │   ├── PauseModal.tsx         # Pause menu with audio controls & settings
    │   └── TipsModal.tsx          # Interactive tips for gravity modes & slingshots
    └── game/                      # Decoupled Game Engine & Physics Subsystems
        ├── types.ts               # Core TypeScript interfaces & state enums
        ├── game-config.json       # Production tuning configuration (cave dimensions, gravity, speeds)
        ├── GameConfig.ts          # Centralized game constants & gravity mode presets
        ├── GameEngine.ts          # RequestAnimationFrame game loop & state coordinator
        ├── VisualRenderer.ts      # HTML5 Canvas 2D drawing pipeline
        ├── CollisionSystem.ts     # Physics collision math (circles, line segments, vectors)
        ├── DifficultySystem.ts    # Dynamic speed scaling & corridor variance logic
        ├── TerrainGenerator.ts    # Procedural cave ceiling/floor wall generator
        ├── ObstacleSpawner.ts     # Spawning logic for planets, wormholes, black holes, dinos
        ├── ScoreSystem.ts         # Distance-to-years translation & era progression
        ├── SoundSystem.ts         # Procedural Web Audio API sound generator
        ├── ParticlePool.ts        # High-performance object-pooled particle system
        ├── BestScoreStorage.ts    # LocalStorage persistence manager
        └── game.test.ts           # Automated Node.js unit test suite (17/17 tests passing)
```

---

## 🏛️ System Architecture

The game uses a **Decoupled Game Engine Architecture**:

```
 ┌───────────────────────────────────────────────────────────────┐
 │                           App.tsx                             │
 │    (React Wrapper: Handles input events, HUD, Debug UI)       │
 └──────────────────────────────┬────────────────────────────────┘
                                │ Mounts & drives canvas ref
                                ▼
 ┌───────────────────────────────────────────────────────────────┐
 │                        GameEngine.ts                          │
 │      (Loop: requestAnimationFrame, Delta Time calculation)     │
 └──────┬────────────┬──────────────┬──────────────┬─────────────┘
        │            │              │              │
        ▼            ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Physics &   │ │ Collision &  │ │ Difficulty & │ │ Terrain &    │
│  Gravity     │ │ Black Holes  │ │ Speed Scale  │ │ Obstacles    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
        │            │              │              │
        └────────────┴──────┬───────┴──────────────┘
                            │ Updates frame state
                            ▼
 ┌───────────────────────────────────────────────────────────────┐
 │                      VisualRenderer.ts                        │
 │     (Canvas 2D Pipeline: Asteroid, Tail, Caves, FX, HUD)       │
 └───────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Virtual Camera & Mobile Scaling

To guarantee identical gameplay, hitboxes, and visual fidelity across all screen sizes (from ultra-wide monitors to portrait/landscape smartphones):

1. **Virtual Coordinate Space**:
   - The game calculates physics and procedural cave coordinates in a normalized virtual space.
   - In **Landscape/Desktop** (aspect ratio $\ge 1.1$), canonical height is $720\text{ px}$. Virtual width is scaled dynamically to fill the screen ratio (`virtualWidth = cssWidth / (cssHeight / 720)`).
   - In **Portrait** (aspect ratio $< 1.1$), virtual width is locked to a safe minimum of $640\text{ px}$ to guarantee ample forward visibility for obstacles, with virtual height extending to match.

2. **DPR & Canvas Transformation**:
   ```ts
   const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
   this.canvas.width = Math.round(cssWidth * dpr);
   this.canvas.height = Math.round(cssHeight * dpr);
   
   this.ctx.resetTransform();
   this.ctx.scale(dpr * this.viewScale, dpr * this.viewScale);
   ```
   All rendering and physics operate in logical virtual coordinates while rendering crisp Retina/High-DPI pixels.

3. **Safe-Area Inset Support**:
   - `index.html` includes `viewport-fit=cover`.
   - UI overlays use the `.safe-inset` utility class to automatically avoid device notches, dynamic islands, and home indicator bars.

---

## 🧩 Module Breakdown & Responsibilities

### 1. `src/App.tsx`
- **Purpose**: Top-level React container.
- **Responsibilities**:
  - Initializes `<canvas>` and attaches `GameEngine`.
  - Captures keyboard (`Space`, `ArrowUp`, `Escape`, `KeyP`, `KeyM`, `KeyR`), mouse, and touch events.
  - Subscribes to engine state callbacks (`onGameStateChange`, `onSpeedUpdate`, `onScoreUpdate`).
  - Renders React UI overlays (`HudOverlay`, `DebugMenu`, `TitleScreen`, `GameOverModal`, `PauseModal`, `TipsModal`).
  - Hides the Debug Menu in production (`import.meta.env.PROD`), with an optional `?debug=1` query parameter override for developers.

### 2. `src/game/GameEngine.ts`
- **Purpose**: Central ticker and game state controller.
- **Key Mechanics**:
  - Maintains `GameState` (`title`, `playing`, `paused`, `gameover`).
  - Measures delta time (`dt`) capped at $0.05\text{s}$ for consistent physics across frame rates.
  - Calculates live forward speed using `DifficultySystem.getForwardSpeed(player.x)` and passes speed telemetry ($180 \to 350\text{ px/s}$) to the HUD.
  - Processes hold-duration input to evaluate active gravity mode parameters.

### 3. `src/game/game-config.json` & `GameConfig.ts`
- **Purpose**: Central configuration constants and production tuning file.
- **Key Parameters**:
  - `ASTEROID_VISUAL_RADIUS`: $14\text{ px}$ (Matches exact circular collision hitbox).
  - `BASE_FORWARD_SPEED`: $180\text{ px/s}$, `MAX_FORWARD_SPEED`: $350\text{ px/s}$.
  - `CORRIDOR_BASE_HEIGHT`, `CORRIDOR_MIN_HEIGHT`: Cave passage dimensions.
  - `GRAVITY_MODES`: Preset parameters for `default`, `progressive_float`, `progressive_heavy`, `dampened_arc`, and `jetpack_thruster`.

### 4. `src/game/VisualRenderer.ts`
- **Purpose**: High-fidelity Canvas 2D rendering pipeline.
- **Key Visual Features**:
  - **Player Asteroid**: Draws 18 faceted vertices, 3D impact craters, and glowing molten cracks inside a self-rotating canvas matrix (`selfRollAngle = (player.x * 0.045) % 2π`). The thruster flame trail is drawn outside the rotation matrix to keep it oriented backwards behind movement vector.
  - **Black Holes**: Accretion disk glow, singularity void, and directional spin chevrons (`↻ CLOCKWISE`, `↺ COUNTER-CW`) guiding slingshots.
  - **Space Caves & Terrain**: Parallax mountain ridges, cave roof/floor nodes with glowing crystal stalactites/stalagmites.
  - **Background & Parallax**: 160 twinkling stars, 12 multi-colored nebulas, and ambient time portals.

### 5. `src/game/CollisionSystem.ts`
- **Purpose**: Mathematical collision detection & gravitational orbital math.
- **Key Functions**:
  - `circleIntersectsCircle`: Standard Euclidean distance check between circular hitboxes.
  - `pointSegmentDistanceSq`: Point-to-line-segment projection for cave wall collisions.
  - `checkBlackHoleInteraction`: Calculates orbital gravitational pull and slingshot tangential forces based on spin direction.

### 6. `src/game/DifficultySystem.ts`
- **Purpose**: Progression scaling.
- **Scaling Equations**:
  - Speed: $v(x) = \min(350, 180 + \frac{x}{3000} \times 170)$.
  - Cave Corridor: Gap decreases gradually while guaranteeing a safe minimum height.

### 7. `src/game/TerrainGenerator.ts`
- **Purpose**: Procedural terrain generation for top and bottom cave boundaries.
- **Features**: Generates smooth terrain nodes using multi-frequency harmonic sine waves with guaranteed safe clearing around wormholes and black holes.

### 8. `src/game/ObstacleSpawner.ts`
- **Purpose**: Spawns items and obstacles as the camera advances.
- **Types Spawned**: Planetary obstacles, Chrono Jump Wormholes, Gravitational Black Holes, and Space Dinosaurs (T-Rex in helmet, Pterodactyls, Brachiosaurus rifts).

### 9. `src/game/ScoreSystem.ts`
- **Purpose**: Scoring and temporal progression.
- **Conversion**: Distance ($X\text{ px}$) translates into millions of years traveled ($1\text{ px} \approx 10,000\text{ years}$).
- **Eras**: Quaternary Shift, Cretaceous Void, Jurassic Rift, Permian Anomaly.

### 10. `src/game/SoundSystem.ts`
- **Purpose**: Pure Web Audio API synthesized sound effects.
- **Sounds**: Thruster roar, gravity shift chime, wormhole warp chord, black hole gravity hum, collision crash, era milestone chime.

### 11. `src/game/ParticlePool.ts`
- **Purpose**: Object-pooled particle system avoiding garbage collection pressure.
- **Particles**: Flame trails, cosmic dust, explosion embers, warp streaks.

### 12. `src/game/game.test.ts`
- **Purpose**: Automated Node.js unit test suite (`npx tsx --test games/asteroid-through-time/src/game/game.test.ts`).
- **Coverage**:
  - Score to years translation & formatting.
  - Difficulty scaling bounds.
  - Circle-circle & cave segment collision detection.
  - Wormhole teleportation & shield timing.
  - Black hole orbital slingshot vs. counter-spin turbulent push.
  - Hold-duration gravity mode physics calculations.

---

## 🎮 Physics & Mechanics Deep Dive

### 1. Hold-Duration Dynamic Gravity Modes
When the user holds the jump input, `GameEngine` tracks `holdDuration`.
Depending on `holdGravityMode`:
- **Progressive Float**: Effective gravity drops smoothly from normal gravity down toward negative gravity based on hold duration.
- **Progressive Heavy**: Effective gravity increases for sharp downward dives.
- **Dampened Arc**: Vertical velocity is dampened toward $0$ while held inside the window, snapping back to normal gravity upon release.
- **Jetpack Thruster**: Applies constant upward thrust acceleration while held.

### 2. Self-Rolling Asteroid Visual Effect
The player asteroid's physical hitbox is an exact circle ($r = 14\text{ px}$).
To create a realistic traveling/rolling effect:
```ts
// Calculate continuous roll angle based on forward distance
const selfRollAngle = (player.x * 0.045) % (Math.PI * 2);

// Save canvas, rotate for the rocky core body, craters, facets, and cracks
ctx.save();
ctx.rotate(selfRollAngle);
// ... draw faceted vertices, craters, cracks ...
ctx.restore();
```
This leaves the flame tail aligned with velocity pitch while the rocky body tumbles continuously.

---

## 💡 Developer & AI Extension Guidelines

When modifying or extending this codebase:

1. **Adding a New Obstacle**:
   - Define type in `src/game/types.ts`.
   - Add spawning logic in `src/game/ObstacleSpawner.ts`.
   - Add collision check in `src/game/CollisionSystem.ts`.
   - Add visual drawing function in `src/game/VisualRenderer.ts`.
   - Add unit test in `src/game/game.test.ts`.

2. **Adding a New Gravity Mode**:
   - Define mode key in `src/game/types.ts` under `HoldGravityMode`.
   - Implement physics step in `src/game/GameEngine.ts`.
   - Add selector option in `src/components/DebugMenu.tsx`.
   - Add automated test case in `src/game/game.test.ts`.

3. **Running Checks Before Finishing**:
   - Always run unit tests: `npx tsx --test games/asteroid-through-time/src/game/game.test.ts`
   - Always run linter: `npm run lint`
   - Always verify build: `npm run build`
