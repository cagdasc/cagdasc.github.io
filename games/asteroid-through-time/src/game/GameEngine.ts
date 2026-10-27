import { GameState, Planet, DinosaurEncounter, TerrainNode, Wormhole, BlackHole, FloatingText, RunStats, DebugConfig, HoldGravityTelemetry, HoldGravityMode } from './types';
import { GAME_CONFIG } from './GameConfig';
import gameConfigJson from './game-config.json';
import { calculateScoreYears, getEraInfo, getEndGameMessage } from './ScoreSystem';
import { calculateDifficulty, DifficultyState } from './DifficultySystem';
import { checkCaveCollision, checkPlanetCollisions, checkDinoCollisions, checkWormholeCollision, checkBlackHoleInteraction } from './CollisionSystem';
import { TerrainGenerator } from './TerrainGenerator';
import { ObstacleSpawner } from './ObstacleSpawner';
import { VisualRenderer } from './VisualRenderer';
import { ParticlePool } from './ParticlePool';
import { BestScoreStorage } from './BestScoreStorage';
import { sound } from './SoundSystem';

export interface GameCallbacks {
  onStateChange: (state: GameState) => void;
  onScoreUpdate: (scoreYears: number, bestScoreYears: number, eraName: string, currentSpeed?: number) => void;
  onGameOver: (stats: RunStats) => void;
  onDinoAlert: (name: string) => void;
  onWarpAlert?: (msg: string) => void;
  onHoldGravityTelemetry?: (telemetry: HoldGravityTelemetry) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameCallbacks;

  private state: GameState = 'title';
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private globalTime: number = 0;

  // Camera & World
  private cameraX: number = 0;
  private distancePx: number = 0;
  private scoreYears: number = 0;
  private bestScoreYears: number = 0;
  private currentDifficulty: DifficultyState;

  // Responsive Virtual Coordinate System
  private virtualWidth: number = 1280;
  private virtualHeight: number = 720;
  private viewScale: number = 1;
  private dpr: number = 1;

  // Player Asteroid
  private player = {
    x: 180,
    y: 360,
    vy: 0,
    rotation: 0,
    squashX: 1,
    squashY: 1,
    isDead: false,
    shieldTimer: 0
  };

  // Systems
  private terrainGen: TerrainGenerator;
  private spawner: ObstacleSpawner;
  private renderer: VisualRenderer;
  private particles: ParticlePool;

  // Entities
  private terrainNodes: TerrainNode[] = [];
  private planets: Planet[] = [];
  private dinosaurs: DinosaurEncounter[] = [];
  private wormholes: Wormhole[] = [];
  private blackHoles: BlackHole[] = [];
  private floatingTexts: FloatingText[] = [];
  private nextTextId: number = 1;

  // Stats
  private dinosEncounteredCount: number = 0;
  private planetsAvoidedCount: number = 0;
  private wormholesTraversedCount: number = 0;
  private blackholesSlingshotCount: number = 0;

  // Juice & Feedback
  private trauma: number = 0;
  private hitstopTimer: number = 0;
  private trailTimer: number = 0;
  private warpStreakTimer: number = 0;

  // Input states
  private isImpulseHeld: boolean = false;
  private currentHoldDuration: number = 0;
  private effectiveGravity: number = GAME_CONFIG.GRAVITY;

  // Live Tuning & Configuration (Loaded from game-config.json)
  private debugConfig: DebugConfig = {
    corridorBaseHeight: gameConfigJson.corridorBaseHeight ?? GAME_CONFIG.CORRIDOR_BASE_HEIGHT,
    corridorMinHeight: gameConfigJson.corridorMinHeight ?? GAME_CONFIG.CORRIDOR_MIN_HEIGHT,
    fluctuationAmplitude: gameConfigJson.fluctuationAmplitude ?? GAME_CONFIG.CAVE_FLUCTUATION_AMPLITUDE,
    fluctuationFrequency: gameConfigJson.fluctuationFrequency ?? GAME_CONFIG.CAVE_FLUCTUATION_FREQUENCY,
    scrollSpeed: gameConfigJson.scrollSpeed ?? GAME_CONFIG.BASE_SCROLL_SPEED,
    gravity: gameConfigJson.gravity ?? GAME_CONFIG.GRAVITY,
    upwardImpulse: gameConfigJson.upwardImpulse ?? GAME_CONFIG.UPWARD_IMPULSE,
    godMode: false,
    wormholeSpawnChance: gameConfigJson.wormholeSpawnChance ?? GAME_CONFIG.WORMHOLE_SPAWN_CHANCE,
    blackholeSpawnChance: gameConfigJson.blackholeSpawnChance ?? GAME_CONFIG.BLACKHOLE_SPAWN_CHANCE,
    variableGravityOnHold: gameConfigJson.variableGravityOnHold ?? GAME_CONFIG.VARIABLE_GRAVITY_ON_HOLD,
    holdGravityMode: (gameConfigJson.holdGravityMode as HoldGravityMode) ?? GAME_CONFIG.HOLD_GRAVITY_MODE,
    holdMaxDuration: gameConfigJson.holdMaxDuration ?? GAME_CONFIG.HOLD_MAX_DURATION,
    holdGravityMultiplier: gameConfigJson.holdGravityMultiplier ?? GAME_CONFIG.HOLD_GRAVITY_MULTIPLIER,
    holdThrustPower: gameConfigJson.holdThrustPower ?? GAME_CONFIG.HOLD_THRUST_POWER
  };

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.callbacks = callbacks;

    this.terrainGen = new TerrainGenerator(GAME_CONFIG.CANVAS_VIRTUAL_HEIGHT);
    this.spawner = new ObstacleSpawner();
    this.renderer = new VisualRenderer();
    this.particles = new ParticlePool(450);

    this.bestScoreYears = BestScoreStorage.getBestScore();
    this.currentDifficulty = calculateDifficulty(0);

    this.handleResize();
    this.initWorld();

    this.setupInputs();
    this.startLoop();
  }

  public getState(): GameState {
    return this.state;
  }

  public getBestScore(): number {
    return this.bestScoreYears;
  }

  public getDebugConfig(): DebugConfig {
    return { ...this.debugConfig };
  }

  public setDebugConfig(partial: Partial<DebugConfig>): void {
    this.debugConfig = { ...this.debugConfig, ...partial };
    this.terrainGen.setTuningParams(
      this.debugConfig.corridorBaseHeight,
      this.debugConfig.corridorMinHeight,
      this.debugConfig.fluctuationAmplitude,
      this.debugConfig.fluctuationFrequency
    );
  }

  public getHoldGravityTelemetry(): HoldGravityTelemetry {
    return {
      isHeld: this.isImpulseHeld,
      holdDuration: this.currentHoldDuration,
      maxDuration: this.debugConfig.holdMaxDuration,
      effectiveGravity: this.effectiveGravity,
      baseGravity: this.debugConfig.gravity,
      mode: this.debugConfig.holdGravityMode
    };
  }

  public resetDebugConfig(): void {
    this.debugConfig = {
      corridorBaseHeight: gameConfigJson.corridorBaseHeight ?? GAME_CONFIG.CORRIDOR_BASE_HEIGHT,
      corridorMinHeight: gameConfigJson.corridorMinHeight ?? GAME_CONFIG.CORRIDOR_MIN_HEIGHT,
      fluctuationAmplitude: gameConfigJson.fluctuationAmplitude ?? GAME_CONFIG.CAVE_FLUCTUATION_AMPLITUDE,
      fluctuationFrequency: gameConfigJson.fluctuationFrequency ?? GAME_CONFIG.CAVE_FLUCTUATION_FREQUENCY,
      scrollSpeed: gameConfigJson.scrollSpeed ?? GAME_CONFIG.BASE_SCROLL_SPEED,
      gravity: gameConfigJson.gravity ?? GAME_CONFIG.GRAVITY,
      upwardImpulse: gameConfigJson.upwardImpulse ?? GAME_CONFIG.UPWARD_IMPULSE,
      godMode: false,
      wormholeSpawnChance: gameConfigJson.wormholeSpawnChance ?? GAME_CONFIG.WORMHOLE_SPAWN_CHANCE,
      blackholeSpawnChance: gameConfigJson.blackholeSpawnChance ?? GAME_CONFIG.BLACKHOLE_SPAWN_CHANCE,
      variableGravityOnHold: gameConfigJson.variableGravityOnHold ?? GAME_CONFIG.VARIABLE_GRAVITY_ON_HOLD,
      holdGravityMode: (gameConfigJson.holdGravityMode as HoldGravityMode) ?? GAME_CONFIG.HOLD_GRAVITY_MODE,
      holdMaxDuration: gameConfigJson.holdMaxDuration ?? GAME_CONFIG.HOLD_MAX_DURATION,
      holdGravityMultiplier: gameConfigJson.holdGravityMultiplier ?? GAME_CONFIG.HOLD_GRAVITY_MULTIPLIER,
      holdThrustPower: gameConfigJson.holdThrustPower ?? GAME_CONFIG.HOLD_THRUST_POWER
    };
    this.terrainGen.setTuningParams(
      this.debugConfig.corridorBaseHeight,
      this.debugConfig.corridorMinHeight,
      this.debugConfig.fluctuationAmplitude,
      this.debugConfig.fluctuationFrequency
    );
  }

  public spawnWormholeNow(): void {
    const aheadX = this.player.x + 400;
    const node = this.terrainGen.createNextNode(aheadX, this.debugConfig.corridorBaseHeight);
    const centerY = (node.topY + node.bottomY) * 0.5;
    this.wormholes.push(this.spawner.spawnInstantWormhole(aheadX, centerY));
    this.terrainGen.addSafeZone(aheadX + GAME_CONFIG.WORMHOLE_TELEPORT_DISTANCE - 100, 600, centerY);
    this.addFloatingText('WORMHOLE INCOMING!', this.player.x, this.player.y - 30, '#38bdf8');
  }

  public spawnBlackHoleNow(spin: 'clockwise' | 'counter_clockwise' = 'clockwise'): void {
    const aheadX = this.player.x + 450;
    const node = this.terrainGen.createNextNode(aheadX, this.debugConfig.corridorBaseHeight);
    const centerY = (node.topY + node.bottomY) * 0.5;
    this.blackHoles.push(this.spawner.spawnInstantBlackHole(aheadX, centerY, spin));
    this.terrainGen.addSafeZone(aheadX - 50, GAME_CONFIG.BLACKHOLE_SAFE_CLEAR_DISTANCE, centerY);
    this.addFloatingText(`BLACK HOLE (${spin === 'clockwise' ? 'CLOCKWISE' : 'COUNTER-CW'})!`, this.player.x, this.player.y - 30, '#f59e0b');
  }

  private initWorld(): void {
    const vHeight = this.virtualHeight;
    this.terrainGen.reset(vHeight);
    this.terrainGen.setTuningParams(
      this.debugConfig.corridorBaseHeight,
      this.debugConfig.corridorMinHeight,
      this.debugConfig.fluctuationAmplitude,
      this.debugConfig.fluctuationFrequency
    );
    this.spawner.reset();
    this.particles.reset();

    this.cameraX = 0;
    this.distancePx = 0;
    this.scoreYears = 0;
    this.dinosEncounteredCount = 0;
    this.planetsAvoidedCount = 0;
    this.wormholesTraversedCount = 0;
    this.blackholesSlingshotCount = 0;
    this.trauma = 0;
    this.hitstopTimer = 0;
    this.warpStreakTimer = 0;

    const startX = this.virtualWidth * GAME_CONFIG.ASTEROID_SCREEN_X_PERCENT;
    this.player = {
      x: startX,
      y: vHeight * 0.5,
      vy: 0,
      rotation: 0,
      squashX: 1,
      squashY: 1,
      isDead: false,
      shieldTimer: 0
    };

    this.terrainNodes = this.terrainGen.generateInitialTerrain(this.virtualWidth + 1200);
    this.planets = [];
    this.dinosaurs = [];
    this.wormholes = [];
    this.blackHoles = [];
    this.floatingTexts = [];
  }

  public startGame(): void {
    if (this.state === 'playing') return;

    this.initWorld();
    this.state = 'playing';
    document.body.dataset.state = 'playing';

    sound.startAmbience();
    sound.playStart();
    this.applyImpulse();

    this.callbacks.onStateChange('playing');
    this.callbacks.onScoreUpdate(0, this.bestScoreYears, getEraInfo(0).era, GAME_CONFIG.BASE_SCROLL_SPEED);
  }

  public pauseGame(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    document.body.dataset.state = 'paused';
    sound.stopAmbience();
    this.callbacks.onStateChange('paused');
  }

  public resumeGame(): void {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    document.body.dataset.state = 'playing';
    sound.startAmbience();
    this.lastTime = performance.now();
    this.callbacks.onStateChange('playing');
  }

  public returnToTitle(): void {
    this.state = 'title';
    document.body.dataset.state = 'title';
    sound.stopAmbience();
    this.initWorld();
    this.callbacks.onStateChange('title');
  }

  public applyImpulse(): void {
    if (this.state === 'title') {
      this.startGame();
      return;
    }
    if (this.state === 'gameover') {
      this.startGame();
      return;
    }
    if (this.state !== 'playing' || this.player.isDead) return;

    this.player.vy = this.debugConfig.upwardImpulse;
    this.player.squashX = GAME_CONFIG.SQUASH_TAKEOFF.x;
    this.player.squashY = GAME_CONFIG.SQUASH_TAKEOFF.y;

    for (let i = 0; i < 6; i++) {
      this.particles.emit(
        this.player.x - 12,
        this.player.y + (Math.random() * 8 - 4),
        -180 - Math.random() * 120,
        Math.random() * 120 - 60,
        0.35 + Math.random() * 0.25,
        3.5 + Math.random() * 2.5,
        '#fef08a'
      );
    }

    sound.playImpulse();
  }

  private addFloatingText(text: string, x: number, y: number, color: string = '#fef08a'): void {
    this.floatingTexts.push({
      id: this.nextTextId++,
      text,
      x,
      y,
      vy: -45,
      color,
      alpha: 1,
      life: 1.4,
      maxLife: 1.4,
      scale: 1
    });
  }

  private handleGameOver(): void {
    if (this.debugConfig.godMode || this.player.isDead) return;
    this.player.isDead = true;
    this.trauma = 1.0;
    this.hitstopTimer = GAME_CONFIG.HITSTOP_DURATION;

    sound.playCollision();

    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 260;
      const colors = ['#f97316', '#ef4444', '#fde047', '#ffffff', '#7c2d12'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.emit(
        this.player.x,
        this.player.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0.5 + Math.random() * 0.7,
        3 + Math.random() * 4,
        color
      );
    }

    const isNewBest = BestScoreStorage.saveBestScore(this.scoreYears);
    if (isNewBest) {
      this.bestScoreYears = this.scoreYears;
    }

    const era = getEraInfo(this.scoreYears);
    const endMessage = getEndGameMessage(this.scoreYears, Math.floor(this.scoreYears / 1000));

    const stats: RunStats = {
      scoreYears: this.scoreYears,
      bestScoreYears: this.bestScoreYears,
      distancePx: Math.floor(this.distancePx),
      eraName: era.era,
      dinosaursEncountered: this.dinosEncounteredCount,
      planetsAvoided: this.planetsAvoidedCount,
      wormholesTraversed: this.wormholesTraversedCount,
      blackholesSlingshot: this.blackholesSlingshotCount,
      endMessage
    };

    setTimeout(() => {
      this.state = 'gameover';
      document.body.dataset.state = 'gameover';
      sound.stopAmbience();
      this.callbacks.onGameOver(stats);
      this.callbacks.onStateChange('gameover');
    }, 450);
  }

  private setupInputs(): void {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!this.isImpulseHeld) {
          this.isImpulseHeld = true;
          this.applyImpulse();
        }
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (this.state === 'playing') {
          this.pauseGame();
        } else if (this.state === 'paused') {
          this.resumeGame();
        }
      } else if (e.code === 'KeyM') {
        sound.toggleMute();
      } else if (e.code === 'KeyR' && (this.state === 'playing' || this.state === 'paused')) {
        this.startGame();
      } else if (e.code === 'Enter' && (this.state === 'title' || this.state === 'gameover')) {
        this.startGame();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.isImpulseHeld = false;
        this.currentHoldDuration = 0;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, a, input, select, [role="button"], .debug-panel')) {
        return;
      }
      this.isImpulseHeld = true;
      this.currentHoldDuration = 0;
      this.applyImpulse();
    };

    const onPointerUp = () => {
      this.isImpulseHeld = false;
      this.currentHoldDuration = 0;
    };

    const onPointerCancel = () => {
      this.isImpulseHeld = false;
      this.currentHoldDuration = 0;
    };

    const onBlur = () => {
      this.isImpulseHeld = false;
      this.currentHoldDuration = 0;
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('blur', onBlur);
    window.addEventListener('resize', () => this.handleResize());
  }

  public handleResize(): void {
    const parent = this.canvas.parentElement;
    const cssWidth = parent ? parent.clientWidth : window.innerWidth;
    const cssHeight = parent ? parent.clientHeight : window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.dpr = dpr;

    // Responsive Virtual Camera System:
    // In landscape/desktop (aspect ratio >= 1.1), canonical height is 720 and width scales to screen ratio.
    // In portrait (aspect ratio < 1.1), fix virtual width to 640 so obstacles and horizon remain readable.
    const aspectRatio = cssWidth / Math.max(cssHeight, 1);
    if (aspectRatio < 1.1) {
      this.virtualWidth = 640;
      this.viewScale = cssWidth / this.virtualWidth;
      this.virtualHeight = cssHeight / this.viewScale;
    } else {
      this.virtualHeight = 720;
      this.viewScale = cssHeight / this.virtualHeight;
      this.virtualWidth = cssWidth / this.viewScale;
    }

    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr * this.viewScale, dpr * this.viewScale);
  }

  private startLoop(): void {
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      const rawDt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      const dt = Math.min(rawDt, 0.05);
      this.globalTime += dt;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private update(dt: number): void {
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - GAME_CONFIG.SHAKE_DECAY * dt);
    }

    if (this.player.shieldTimer > 0) {
      this.player.shieldTimer = Math.max(0, this.player.shieldTimer - dt);
    }

    if (this.warpStreakTimer > 0) {
      this.warpStreakTimer = Math.max(0, this.warpStreakTimer - dt);
    }

    this.particles.update(dt);

    // Update floating text popups
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      t.y += t.vy * dt;
      t.alpha = t.life / t.maxLife;
      t.scale = 1 + (1 - t.alpha) * 0.2;
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    if (this.state === 'title') {
      this.cameraX += 45 * dt;
      this.terrainNodes = this.terrainGen.extendTerrain(this.cameraX + this.virtualWidth + 800, this.debugConfig.corridorBaseHeight);
      return;
    }

    if (this.state !== 'playing' || this.player.isDead) {
      return;
    }

    this.currentDifficulty = calculateDifficulty(this.distancePx);
    // Use live debug scroll speed if adjusted
    const scrollSpeed = Math.max(this.debugConfig.scrollSpeed, this.currentDifficulty.scrollSpeed);

    const forwardMovement = scrollSpeed * dt;
    this.distancePx += forwardMovement;
    this.player.x += forwardMovement;
    this.cameraX = this.player.x - this.virtualWidth * GAME_CONFIG.ASTEROID_SCREEN_X_PERCENT;

    // Calculate live hold-duration variable gravity
    let effectiveGravity = this.debugConfig.gravity;

    if (this.debugConfig.variableGravityOnHold && this.isImpulseHeld && !this.player.isDead) {
      this.currentHoldDuration += dt;
      const maxDur = Math.max(0.05, this.debugConfig.holdMaxDuration);
      const holdRatio = Math.min(1, this.currentHoldDuration / maxDur);

      switch (this.debugConfig.holdGravityMode) {
        case 'progressive_float': {
          // Gravity progressively softens the longer held down to holdGravityMultiplier (e.g. 20%)
          const factor = 1 - holdRatio * (1 - this.debugConfig.holdGravityMultiplier);
          effectiveGravity = this.debugConfig.gravity * Math.max(0, factor);
          break;
        }
        case 'progressive_heavy': {
          // Gravity progressively strengthens the longer held (heavy slam/dive)
          const targetMultiplier = Math.max(1.2, this.debugConfig.holdGravityMultiplier > 1 ? this.debugConfig.holdGravityMultiplier : 2.2);
          const factor = 1 + holdRatio * (targetMultiplier - 1);
          effectiveGravity = this.debugConfig.gravity * factor;
          break;
        }
        case 'dampened_arc': {
          // Mario/classic variable jump: while holding within maxDur, gravity is sustained at reduced level
          if (this.currentHoldDuration <= maxDur) {
            effectiveGravity = this.debugConfig.gravity * this.debugConfig.holdGravityMultiplier;
          } else {
            effectiveGravity = this.debugConfig.gravity;
          }
          break;
        }
        case 'jetpack_thruster': {
          // Counter-thrust acceleration while holding
          effectiveGravity = this.debugConfig.gravity - this.debugConfig.holdThrustPower * (1 - holdRatio * 0.2);
          break;
        }
      }

      // Visual feedback: emit extra thruster particles from asteroid while holding
      if (Math.random() < 0.75) {
        const isFloat = this.debugConfig.holdGravityMode !== 'progressive_heavy';
        const particleColor = isFloat ? '#38bdf8' : '#f43f5e';
        this.particles.emit(
          this.player.x - 12,
          this.player.y + (Math.random() * 8 - 4),
          -220 - Math.random() * 120,
          (Math.random() * 50 - 25),
          0.35 + Math.random() * 0.2,
          3.2,
          particleColor
        );
      }
    } else {
      this.currentHoldDuration = 0;
    }

    this.effectiveGravity = effectiveGravity;

    if (this.callbacks.onHoldGravityTelemetry) {
      this.callbacks.onHoldGravityTelemetry({
        isHeld: this.isImpulseHeld,
        holdDuration: this.currentHoldDuration,
        maxDuration: this.debugConfig.holdMaxDuration,
        effectiveGravity: this.effectiveGravity,
        baseGravity: this.debugConfig.gravity,
        mode: this.debugConfig.holdGravityMode
      });
    }

    // Apply live gravity
    this.player.vy += effectiveGravity * dt;
    this.player.vy = Math.max(GAME_CONFIG.MAX_RISE_SPEED, Math.min(GAME_CONFIG.MAX_FALL_SPEED, this.player.vy));
    this.player.y += this.player.vy * dt;

    this.player.rotation = this.player.vy * GAME_CONFIG.ROTATION_FACTOR;
    this.player.squashX += (1 - this.player.squashX) * (GAME_CONFIG.SQUASH_RECOVERY_RATE * dt);
    this.player.squashY += (1 - this.player.squashY) * (GAME_CONFIG.SQUASH_RECOVERY_RATE * dt);

    // Trail particles
    this.trailTimer += dt;
    if (this.trailTimer >= 1 / GAME_CONFIG.TRAIL_PARTICLES_PER_SECOND) {
      this.trailTimer = 0;
      const angle = this.player.rotation + Math.PI;
      const trailSpeed = 120 + Math.random() * 80;
      const trailColors = ['#f97316', '#fbbf24', '#ef4444', '#eab308'];
      this.particles.emit(
        this.player.x - 10,
        this.player.y + (Math.random() * 6 - 3),
        Math.cos(angle) * trailSpeed,
        Math.sin(angle) * trailSpeed + (Math.random() * 30 - 15),
        0.4 + Math.random() * 0.3,
        2.5 + Math.random() * 2,
        trailColors[Math.floor(Math.random() * trailColors.length)]
      );
    }

    // Extend terrain
    const targetTerrainX = this.cameraX + this.virtualWidth + 800;
    const newNodes = this.terrainGen.extendTerrain(targetTerrainX, this.debugConfig.corridorBaseHeight);
    if (newNodes.length > 0) {
      this.terrainNodes.push(...newNodes);
    }

    // Prune distant terrain
    const pruneX = this.cameraX - 600;
    let removeCount = 0;
    while (removeCount < this.terrainNodes.length - 10 && this.terrainNodes[removeCount].x < pruneX) {
      removeCount++;
    }
    if (removeCount > 0) {
      this.terrainNodes.splice(0, removeCount);
    }

    // Spawner update (with custom wormhole and blackhole chances)
    this.spawner.updateSpawns(
      this.cameraX,
      this.virtualWidth,
      this.currentDifficulty,
      this.terrainNodes,
      this.terrainGen,
      this.planets,
      this.dinosaurs,
      this.wormholes,
      this.blackHoles,
      this.debugConfig.wormholeSpawnChance,
      this.debugConfig.blackholeSpawnChance
    );

    // Moving dinosaurs
    for (const dino of this.dinosaurs) {
      dino.x += dino.vx * dt;
      dino.y += dino.vy * dt;

      if (!dino.passed && this.player.x > dino.x) {
        dino.passed = true;
        this.dinosEncounteredCount++;
        sound.playDinoChirp();
        this.callbacks.onDinoAlert(dino.name);
      }
    }

    // Passed planets: marked as passed for stats, but stay in world until far off-screen!
    for (const planet of this.planets) {
      if (!planet.passed && this.player.x > planet.x + planet.radius) {
        planet.passed = true;
        this.planetsAvoidedCount++;
      }
    }

    // Update score
    const prevScore = this.scoreYears;
    this.scoreYears = calculateScoreYears(this.distancePx);

    if (Math.floor(this.scoreYears / 10_000_000) > Math.floor(prevScore / 10_000_000)) {
      sound.playMilestone();
    }

    const era = getEraInfo(this.scoreYears);
    this.callbacks.onScoreUpdate(this.scoreYears, this.bestScoreYears, era.era, Math.round(scrollSpeed));

    // ---------------- Collisions & Interactions ----------------
    const asteroidCollider = {
      x: this.player.x,
      y: this.player.y,
      radius: GAME_CONFIG.ASTEROID_RADIUS
    };

    // 1. Wormhole Teleportation Interaction
    const enteredWormhole = checkWormholeCollision(asteroidCollider, this.wormholes);
    if (enteredWormhole) {
      enteredWormhole.passed = true;
      this.wormholesTraversedCount++;

      // Teleport forward in distance and add huge bonus years!
      this.distancePx += enteredWormhole.teleportDistance;
      this.player.x += enteredWormhole.teleportDistance;
      this.cameraX += enteredWormhole.teleportDistance;

      // Extend terrain immediately up to destination
      const exitHorizon = this.player.x + 1200;
      const destinationTerrain = this.terrainGen.extendTerrain(exitHorizon, this.debugConfig.corridorBaseHeight);
      if (destinationTerrain.length > 0) {
        this.terrainNodes.push(...destinationTerrain);
      }

      // CHALLENGE: Spawn a challenging obstacle slalom at the exit so it's exciting!
      this.spawner.spawnWormholeSlalomAtExit(this.player.x, this.terrainNodes, this.planets, this.dinosaurs);

      // Brief reaction shield (0.45s) so player must actively react and maneuver!
      this.player.shieldTimer = 0.45;
      this.warpStreakTimer = 0.55;

      sound.playWormholeWarp();
      this.addFloatingText('+2,500,000 YEARS WARP!', this.player.x, this.player.y - 35, '#38bdf8');
      if (this.callbacks.onWarpAlert) {
        this.callbacks.onWarpAlert('TEMPORAL SLALOM! WEAVE THROUGH OBSTACLES!');
      }

      // Starburst effect
      for (let i = 0; i < 30; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 100 + Math.random() * 250;
        this.particles.emit(
          this.player.x,
          this.player.y,
          Math.cos(ang) * spd,
          Math.sin(ang) * spd,
          0.6,
          3.5,
          '#a5f3fc'
        );
      }
      return;
    }

    // 2. Black Hole Slingshot / Push Interaction
    const blackHoleInteraction = checkBlackHoleInteraction(asteroidCollider, this.player.vy, scrollSpeed, this.blackHoles);
    if (blackHoleInteraction) {
      const bh = blackHoleInteraction.blackHole;

      if (blackHoleInteraction.type === 'singularity_hit') {
        if (!this.debugConfig.godMode && (!this.player.shieldTimer || this.player.shieldTimer <= 0)) {
          this.handleGameOver();
          return;
        }
      } else if (blackHoleInteraction.type === 'slingshot') {
        bh.active = false;
        this.blackholesSlingshotCount++;

        // Slingshot throw: accelerated along spin tangent!
        this.player.vy = blackHoleInteraction.throwVy;
        this.player.squashX = 1.35;
        this.player.squashY = 0.75;

        this.distancePx += blackHoleInteraction.throwVx;
        this.player.x += blackHoleInteraction.throwVx;
        this.cameraX += blackHoleInteraction.throwVx;
        this.scoreYears += 1_000_000;

        this.player.shieldTimer = 0.8;
        this.warpStreakTimer = 0.45;

        sound.playSlingshotBoost();
        this.addFloatingText('ORBITAL SLINGSHOT ASSIST! +1M YRS', this.player.x, this.player.y - 35, '#facc15');
        if (this.callbacks.onWarpAlert) {
          this.callbacks.onWarpAlert('SLINGSHOT BOOST! LAUNCHED ALONG SPIN');
        }

        for (let i = 0; i < 25; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 80 + Math.random() * 200;
          this.particles.emit(
            this.player.x,
            this.player.y,
            Math.cos(ang) * spd,
            Math.sin(ang) * spd,
            0.5,
            3,
            '#f59e0b'
          );
        }
        return;
      } else if (blackHoleInteraction.type === 'push') {
        // Player entered against the spin!
        // "otherwise it should push you and make game bit challengy."
        bh.active = false;

        this.player.vy = blackHoleInteraction.throwVy;
        this.trauma = 0.7; // Heavy screen shake!
        sound.playCollision();

        this.addFloatingText('COUNTER-SPIN REPULSION! PUSHED!', this.player.x, this.player.y - 35, '#ef4444');
        if (this.callbacks.onWarpAlert) {
          this.callbacks.onWarpAlert('TURBULENT GRAVITY REPULSION! RECOVER!');
        }

        // Violent repulsion sparks
        for (let i = 0; i < 20; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 120 + Math.random() * 180;
          this.particles.emit(
            this.player.x,
            this.player.y,
            Math.cos(ang) * spd,
            Math.sin(ang) * spd,
            0.4,
            3,
            '#ef4444'
          );
        }
        return;
      }
    }

    // Skip fatal collisions if in god mode or shield is active
    if (this.debugConfig.godMode || this.player.shieldTimer > 0) {
      return;
    }

    // 3. Cave terrain collision
    if (checkCaveCollision(asteroidCollider, this.terrainNodes)) {
      this.handleGameOver();
      return;
    }

    // 4. Planet obstacle collision
    if (checkPlanetCollisions(asteroidCollider, this.planets)) {
      this.handleGameOver();
      return;
    }

    // 5. Solid dinosaur collision
    if (checkDinoCollisions(asteroidCollider, this.dinosaurs)) {
      this.handleGameOver();
      return;
    }

    // 6. Hard canvas bounds in virtual space
    if (this.player.y - asteroidCollider.radius <= 0 || this.player.y + asteroidCollider.radius >= this.virtualHeight) {
      this.handleGameOver();
      return;
    }
  }

  private render(): void {
    const era = getEraInfo(this.scoreYears);
    this.renderer.renderWorld(
      this.ctx,
      this.cameraX,
      this.player,
      this.terrainNodes,
      this.planets,
      this.dinosaurs,
      this.wormholes,
      this.blackHoles,
      this.floatingTexts,
      this.particles,
      era,
      this.trauma,
      this.globalTime,
      this.warpStreakTimer,
      {
        isHeld: this.isImpulseHeld,
        holdDuration: this.currentHoldDuration,
        maxDuration: this.debugConfig.holdMaxDuration,
        effectiveGravity: this.effectiveGravity,
        baseGravity: this.debugConfig.gravity,
        mode: this.debugConfig.holdGravityMode,
        enabled: this.debugConfig.variableGravityOnHold
      },
      this.virtualWidth,
      this.virtualHeight
    );
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    sound.stopAmbience();
  }
}
