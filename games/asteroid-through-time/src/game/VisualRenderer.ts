import { Planet, DinosaurEncounter, TerrainNode, Wormhole, BlackHole, FloatingText } from './types';
import { GAME_CONFIG } from './GameConfig';
import { ParticlePool } from './ParticlePool';
import { EraInfo } from './ScoreSystem';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedFactor: number;
  phase: number;
}

interface NebulaCloud {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedFactor: number;
}

export class VisualRenderer {
  private stars: Star[] = [];
  private nebulas: NebulaCloud[] = [];
  private asteroidVertices: { angle: number; radiusFactor: number }[] = [];
  private asteroidCracks: { x1: number; y1: number; x2: number; y2: number }[] = [];

  constructor() {
    this.initBackground();
    this.initAsteroidGeometry();
  }

  private initBackground(): void {
    for (let i = 0; i < 160; i++) {
      this.stars.push({
        x: Math.random() * 3200,
        y: Math.random() * 800,
        size: Math.random() < 0.2 ? 2.5 : Math.random() * 1.5 + 0.5,
        alpha: 0.3 + Math.random() * 0.7,
        speedFactor: 0.05 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2
      });
    }

    const colors = [
      'rgba(88, 28, 135, 0.25)', // Deep Purple
      'rgba(14, 116, 144, 0.22)', // Cyan / Teal
      'rgba(190, 24, 93, 0.18)',  // Magenta
      'rgba(180, 83, 9, 0.20)',   // Amber / Bronze
      'rgba(30, 58, 138, 0.28)'   // Deep Blue
    ];
    for (let i = 0; i < 12; i++) {
      this.nebulas.push({
        x: i * 350 + Math.random() * 200,
        y: 100 + Math.random() * 500,
        radius: 160 + Math.random() * 180,
        color: colors[i % colors.length],
        speedFactor: 0.12 + Math.random() * 0.08
      });
    }
  }

  private asteroidCraters: { x: number; y: number; r: number }[] = [];

  private initAsteroidGeometry(): void {
    // 18 faceted vertices with pronounced organic rocky edges (0.84 to 1.16 radius factor)
    // creating clear edges and facets so continuous spin gives a realistic rolling motion
    const count = 18;
    const baseFactors = [
      1.08, 0.86, 1.14, 0.90, 1.12, 0.84, 1.05, 1.16, 0.88,
      1.10, 0.85, 1.15, 0.92, 1.07, 0.86, 1.12, 0.90, 1.06
    ];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      this.asteroidVertices.push({
        angle,
        radiusFactor: baseFactors[i]
      });
    }

    // Impact craters that tumble around the rock center during roll
    this.asteroidCraters = [
      { x: -5, y: -4, r: 4.2 },
      { x: 4, y: 3, r: 3.4 },
      { x: -2, y: 6, r: 2.8 },
      { x: 5, y: -5, r: 2.5 },
      { x: -6, y: 2, r: 2.2 }
    ];

    this.asteroidCracks = [
      { x1: -7, y1: -2, x2: 1, y2: 3 },
      { x1: 1, y1: 3, x2: 7, y2: -1 },
      { x1: -2, y1: 5, x2: 2, y2: 9 },
      { x1: -5, y1: -6, x2: -1, y2: -2 },
      { x1: 3, y1: -7, x2: 8, y2: -3 }
    ];
  }

  public renderWorld(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    player: {
      x: number;
      y: number;
      vy: number;
      rotation: number;
      squashX: number;
      squashY: number;
      isDead: boolean;
      shieldTimer?: number;
    },
    terrainNodes: TerrainNode[],
    planets: Planet[],
    dinosaurs: DinosaurEncounter[],
    wormholes: Wormhole[],
    blackHoles: BlackHole[],
    floatingTexts: FloatingText[],
    particles: ParticlePool,
    eraInfo: EraInfo,
    trauma: number,
    globalTime: number,
    warpStreakTimer: number = 0,
    holdGravityInfo?: {
      isHeld: boolean;
      holdDuration: number;
      maxDuration: number;
      effectiveGravity: number;
      baseGravity: number;
      mode: string;
      enabled: boolean;
    },
    virtualWidth?: number,
    virtualHeight?: number
  ): void {
    const dpr = window.devicePixelRatio || 1;
    const width = virtualWidth ?? (ctx.canvas.width / dpr);
    const height = virtualHeight ?? (ctx.canvas.height / dpr);

    ctx.save();

    // Screen Shake from trauma
    if (trauma > 0) {
      const shakeMagnitude = trauma * trauma * 16;
      const shakeX = (Math.random() * 2 - 1) * shakeMagnitude;
      const shakeY = (Math.random() * 2 - 1) * shakeMagnitude;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Deep space background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, eraInfo.bgColor);
    bgGrad.addColorStop(0.5, '#040711');
    bgGrad.addColorStop(1, '#020308');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Parallax Nebulae
    this.renderNebulae(ctx, cameraX, width, height);

    // 3. Parallax Distant Stars
    this.renderStars(ctx, cameraX, width, height, globalTime);

    // 4. Distant Parallax Mountain Ridges
    this.renderDistantMountains(ctx, cameraX, width, height, eraInfo.accentColor);

    // 5. Ambient Time Portals in backdrop
    this.renderTimePortals(ctx, cameraX, width, height, globalTime, eraInfo);

    // 6. Foreground Space Cave Walls
    this.renderCaveWalls(ctx, cameraX, width, height, terrainNodes, eraInfo.accentColor);

    // 7. Wormholes (Chrono Jump Portals)
    this.renderWormholes(ctx, cameraX, wormholes, globalTime);

    // 8. Black Holes (Gravitational Slingshots with Directional Guide)
    this.renderBlackHoles(ctx, cameraX, blackHoles, globalTime);

    // 9. Planetary Obstacles (never disappearing when passed)
    this.renderPlanets(ctx, cameraX, planets, globalTime);

    // 10. Dinosaur Encounters
    this.renderDinosaurs(ctx, cameraX, dinosaurs, globalTime);

    // 11. Particle Pool
    particles.render(ctx, cameraX);

    // 12. Player Asteroid
    if (!player.isDead) {
      this.renderPlayerAsteroid(ctx, cameraX, player, globalTime, holdGravityInfo);
    }

    // 13. Hyperdrive Warp Speed FX
    if (warpStreakTimer > 0) {
      this.renderHyperdriveStreaks(ctx, warpStreakTimer, width, height);
    }

    // 14. Floating Text Popups
    this.renderFloatingTexts(ctx, cameraX, floatingTexts);

    // 15. Subtle Vignette
    this.renderVignette(ctx, width, height);

    ctx.restore();
  }

  private renderNebulae(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    width: number,
    height: number
  ): void {
    ctx.save();
    for (const neb of this.nebulas) {
      const screenX = (neb.x - cameraX * neb.speedFactor) % (width + neb.radius * 2) - neb.radius;
      if (screenX < -neb.radius * 2 || screenX > width + neb.radius) continue;

      const grad = ctx.createRadialGradient(
        screenX, neb.y, 10,
        screenX, neb.y, neb.radius
      );
      grad.addColorStop(0, neb.color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(screenX, neb.y, neb.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderStars(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    width: number,
    height: number,
    time: number
  ): void {
    ctx.save();
    for (const star of this.stars) {
      const wrapWidth = width + 200;
      let sx = (star.x - cameraX * star.speedFactor) % wrapWidth;
      if (sx < 0) sx += wrapWidth;

      const twinkle = Math.sin(time * 3 + star.phase) * 0.35 + 0.65;
      ctx.globalAlpha = star.alpha * twinkle;
      ctx.fillStyle = star.size > 2 ? '#e0f2fe' : '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      if (star.size > 2) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(sx - 4, star.y);
        ctx.lineTo(sx + 4, star.y);
        ctx.moveTo(sx, star.y - 4);
        ctx.lineTo(sx, star.y + 4);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private renderDistantMountains(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    width: number,
    height: number,
    accentColor: string
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#0a1024';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;

    // Distant top ridge
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= width; x += 60) {
      const worldX = cameraX * 0.18 + x;
      const y = 80 + Math.sin(worldX * 0.003) * 40 + Math.cos(worldX * 0.007) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, 0);
    ctx.closePath();
    ctx.fill();

    // Distant bottom ridge
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 60) {
      const worldX = cameraX * 0.18 + x;
      const y = height - 80 - Math.sin(worldX * 0.0035 + 1.2) * 45 - Math.cos(worldX * 0.006) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderTimePortals(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    width: number,
    height: number,
    time: number,
    eraInfo: EraInfo
  ): void {
    const portalSpacing = 3200;
    const portalWorldX = Math.floor(cameraX / portalSpacing) * portalSpacing + 1600;
    const screenX = portalWorldX - cameraX;

    if (screenX > -150 && screenX < width + 150) {
      ctx.save();
      const centerY = height * 0.5;
      const pulse = Math.sin(time * 2.5) * 8;
      const radius = 90 + pulse;

      const portalGrad = ctx.createRadialGradient(screenX, centerY, 10, screenX, centerY, radius);
      portalGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      portalGrad.addColorStop(0.35, eraInfo.accentColor);
      portalGrad.addColorStop(0.7, 'rgba(147, 51, 234, 0.3)');
      portalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = portalGrad;
      ctx.beginPath();
      ctx.arc(screenX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = eraInfo.accentColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.2) {
        const r = (a / (Math.PI * 4)) * (radius * 0.85);
        const px = screenX + Math.cos(a + time * 1.8) * r;
        const py = centerY + Math.sin(a + time * 1.8) * r * 0.6;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.restore();
    }
  }

  private renderCaveWalls(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    width: number,
    height: number,
    nodes: TerrainNode[],
    accentColor: string
  ): void {
    if (nodes.length < 2) return;

    ctx.save();

    // Upper Cave (Roof)
    ctx.beginPath();
    ctx.moveTo(-50, -50);
    ctx.lineTo(width + 50, -50);

    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const sx = node.x - cameraX;
      if (sx >= -100 && sx <= width + 100) {
        ctx.lineTo(sx, node.topY);
      }
    }
    ctx.closePath();

    const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
    topGrad.addColorStop(0, '#090e1f');
    topGrad.addColorStop(0.7, '#0e1633');
    topGrad.addColorStop(1, '#152147');
    ctx.fillStyle = topGrad;
    ctx.fill();

    // Glowing edge line along roof
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const sx = node.x - cameraX;
      if (sx >= -100 && sx <= width + 100) {
        if (!started) {
          ctx.moveTo(sx, node.topY);
          started = true;
        } else {
          ctx.lineTo(sx, node.topY);
        }
      }
    }
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Lower Cave (Floor)
    ctx.beginPath();
    ctx.moveTo(-50, height + 50);
    ctx.lineTo(width + 50, height + 50);

    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const sx = node.x - cameraX;
      if (sx >= -100 && sx <= width + 100) {
        ctx.lineTo(sx, node.bottomY);
      }
    }
    ctx.closePath();

    const bottomGrad = ctx.createLinearGradient(0, height * 0.55, 0, height);
    bottomGrad.addColorStop(0, '#152147');
    bottomGrad.addColorStop(0.3, '#0e1633');
    bottomGrad.addColorStop(1, '#090e1f');
    ctx.fillStyle = bottomGrad;
    ctx.fill();

    // Glowing edge line along floor
    ctx.beginPath();
    started = false;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const sx = node.x - cameraX;
      if (sx >= -100 && sx <= width + 100) {
        if (!started) {
          ctx.moveTo(sx, node.bottomY);
          started = true;
        } else {
          ctx.lineTo(sx, node.bottomY);
        }
      }
    }
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.stroke();

    this.renderCrystals(ctx, cameraX, width, nodes, accentColor);

    ctx.restore();
  }

  private renderCrystals(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    width: number,
    nodes: TerrainNode[],
    accentColor: string
  ): void {
    ctx.save();
    for (let i = 0; i < nodes.length; i += 3) {
      const node = nodes[i];
      const sx = node.x - cameraX;
      if (sx < -40 || sx > width + 40) continue;

      const seed = Math.sin(node.x * 0.05);
      if (seed > 0.4) {
        const crystalLen = 14 + (seed - 0.4) * 35;
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = 0.85;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(sx - 4, node.topY);
        ctx.lineTo(sx, node.topY + crystalLen);
        ctx.lineTo(sx + 4, node.topY);
        ctx.closePath();
        ctx.fill();
      } else if (seed < -0.4) {
        const crystalLen = 14 + (-seed - 0.4) * 35;
        ctx.fillStyle = '#38bdf8';
        ctx.globalAlpha = 0.85;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(sx - 4, node.bottomY);
        ctx.lineTo(sx, node.bottomY - crystalLen);
        ctx.lineTo(sx + 4, node.bottomY);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * Render Wormholes (Chrono Jump Portals)
   */
  private renderWormholes(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    wormholes: Wormhole[],
    time: number
  ): void {
    for (const w of wormholes) {
      const sx = w.x - cameraX;
      if (sx < -120 || sx > ctx.canvas.width + 120) continue;

      ctx.save();
      ctx.translate(sx, w.y);

      const pulse = Math.sin(time * 4 + w.pulsePhase) * 4;
      const currentRadius = w.radius + pulse;

      // Outer swirling nebula aura
      const aura = ctx.createRadialGradient(0, 0, currentRadius * 0.2, 0, 0, currentRadius * 1.5);
      aura.addColorStop(0, 'rgba(56, 189, 248, 0.8)'); // Bright Cyan
      aura.addColorStop(0.4, 'rgba(168, 85, 247, 0.6)'); // Radiant Violet
      aura.addColorStop(0.8, 'rgba(236, 72, 153, 0.3)'); // Hot Pink
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, currentRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Rotating spiral vortex arms
      ctx.rotate(time * w.rotationSpeed);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;

      for (let arm = 0; arm < 4; arm++) {
        ctx.save();
        ctx.rotate((arm * Math.PI) / 2);
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 1.5; a += 0.15) {
          const r = (a / (Math.PI * 1.5)) * currentRadius;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Bright Singularity Core
      ctx.beginPath();
      ctx.arc(0, 0, currentRadius * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.fill();

      // Floating text label
      ctx.rotate(-time * w.rotationSpeed); // restore rotation for text
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#a5f3fc';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 6;
      ctx.fillText('WARP PORTAL', 0, -currentRadius - 12);
      ctx.fillText('+2.5M YEARS', 0, currentRadius + 16);

      ctx.restore();
    }
  }

  /**
   * Render Black Holes (Gravitational Slingshots with Directional Guide)
   */
  private renderBlackHoles(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    blackHoles: BlackHole[],
    time: number
  ): void {
    for (const bh of blackHoles) {
      const sx = bh.x - cameraX;
      if (sx < -180 || sx > ctx.canvas.width + 180) continue;

      ctx.save();
      ctx.translate(sx, bh.y);

      // 1. Gravitational Lensing Distorted Background Ring
      const lensGrad = ctx.createRadialGradient(
        0, 0, bh.singularityRadius,
        0, 0, bh.accretionRadius * 1.4
      );
      lensGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      lensGrad.addColorStop(0.35, 'rgba(251, 146, 60, 0.45)');
      lensGrad.addColorStop(0.7, 'rgba(234, 88, 12, 0.25)');
      lensGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bh.accretionRadius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // 2. Spinning Fiery Accretion Disk (Molten Golden-Orange)
      ctx.save();
      const spinAngle = time * bh.rotationSpeed;
      ctx.rotate(spinAngle);

      const diskGrad = ctx.createLinearGradient(-bh.accretionRadius, 0, bh.accretionRadius, 0);
      diskGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      diskGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.95)');
      diskGrad.addColorStop(1, 'rgba(220, 38, 38, 0.7)');

      ctx.strokeStyle = diskGrad;
      ctx.lineWidth = 14;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.ellipse(0, 0, bh.accretionRadius, bh.accretionRadius * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Pitch Black Event Horizon Singularity (Pure Void)
      ctx.beginPath();
      ctx.arc(0, 0, bh.singularityRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. CLEAR DIRECTIONAL GUIDE (Shows where it turns so player can slingshot or get pushed!)
      const isClockwise = bh.spinDirection === 'clockwise';

      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;

      // Circular trajectory ring with dashes
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.arc(0, 0, bh.accretionRadius * 0.92, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Animated glowing spin chevrons along the perimeter indicating rotation flow
      const numArrows = 6;
      for (let i = 0; i < numArrows; i++) {
        const baseAngle = (i / numArrows) * Math.PI * 2;
        const currentAngle = baseAngle + (isClockwise ? (time * 3) : -(time * 3));
        const ax = Math.cos(currentAngle) * (bh.accretionRadius * 0.92);
        const ay = Math.sin(currentAngle) * (bh.accretionRadius * 0.92);
        const tangent = currentAngle + (isClockwise ? Math.PI / 2 : -Math.PI / 2);

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(tangent);
        ctx.beginPath();
        ctx.moveTo(-6, -5);
        ctx.lineTo(5, 0);
        ctx.lineTo(-6, 5);
        ctx.stroke();
        ctx.restore();
      }

      // Guidance Labels
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 8;

      const guideText = isClockwise
        ? '↻ SPIN: CLOCKWISE (ENTER BELOW TO FLING UP) ↻'
        : '↺ SPIN: COUNTER-CW (ENTER ABOVE TO FLING DOWN) ↺';
      ctx.fillText(guideText, 0, -bh.accretionRadius - 16);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#f87171';
      ctx.fillText('⚡ COUNTER-FLOW CAUSES TURBULENT PUSH ⚡', 0, bh.accretionRadius + 22);

      ctx.restore();
      ctx.restore();
    }
  }

  /**
   * Render Planetary Obstacles
   * Extended margins guarantee that planets NEVER disappear when the player passes them!
   */
  private renderPlanets(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    planets: Planet[],
    time: number
  ): void {
    for (const p of planets) {
      const sx = p.x - cameraX;
      // Generous margin ensures planets remain rendered until completely off the left of the screen
      const margin = Math.max(220, p.radius * 3.5);
      if (sx < -margin || sx > ctx.canvas.width + margin) continue;

      ctx.save();
      ctx.translate(sx, p.y);

      // Back of planetary rings
      if (p.rings) {
        ctx.save();
        ctx.rotate(p.rings.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rings.radiusX, p.rings.radiusY, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = p.rings.color;
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.restore();
      }

      // Atmospheric Corona Glow
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = p.glowColor;
      ctx.shadowColor = p.glowColor;
      ctx.shadowBlur = 18;
      ctx.fill();

      // Planet Sphere Body with 3D spherical shading
      const sphereGrad = ctx.createRadialGradient(
        -p.radius * 0.35, -p.radius * 0.35, p.radius * 0.1,
        0, 0, p.radius
      );
      sphereGrad.addColorStop(0, '#ffffff');
      sphereGrad.addColorStop(0.2, p.primaryColor);
      sphereGrad.addColorStop(0.85, p.secondaryColor);
      sphereGrad.addColorStop(1, '#05070d');

      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Craters / Surface Bands
      ctx.save();
      ctx.clip();
      ctx.rotate(p.rotation + time * p.rotationSpeed);

      if (p.type === 'gas_giant_rings') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.fillRect(-p.radius, -p.radius * 0.45, p.radius * 2, p.radius * 0.25);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(-p.radius, p.radius * 0.1, p.radius * 2, p.radius * 0.2);
      } else {
        p.craterSeeds.forEach((seed, idx) => {
          const cx = (seed * 1.5 - 0.75) * p.radius;
          const cy = (Math.sin(idx * 2) * 0.7) * p.radius;
          const cr = (0.12 + (seed * 0.12)) * p.radius;

          ctx.beginPath();
          ctx.arc(cx, cy, cr, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cx - 1, cy - 1, cr * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fill();
        });
      }
      ctx.restore();

      // Front of planetary rings
      if (p.rings) {
        ctx.save();
        ctx.rotate(p.rings.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rings.radiusX, p.rings.radiusY, 0, 0, Math.PI);
        ctx.strokeStyle = p.rings.color;
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  private renderDinosaurs(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    dinosaurs: DinosaurEncounter[],
    time: number
  ): void {
    for (const dino of dinosaurs) {
      const sx = dino.x - cameraX;
      if (sx < -120 || sx > ctx.canvas.width + 120) continue;

      ctx.save();
      const bobY = Math.sin(time * 2.5 + dino.bobPhase) * 9;
      ctx.translate(sx, dino.y + bobY);
      ctx.rotate(dino.rotation + Math.sin(time * 1.5 + dino.bobPhase) * 0.08);

      if (dino.isObstacle) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, dino.collisionRadius * 1.35, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      switch (dino.type) {
        case 't_rex_helmet':
          this.drawAstronautTRex(ctx, time);
          break;
        case 'pterodactyl_flight':
          this.drawPterodactyl(ctx, time);
          break;
        case 'brachio_neck':
          this.drawBrachiosaurusRift(ctx, time);
          break;
        case 'fossil_meteor':
          this.drawFossilMeteor(ctx);
          break;
        case 'mini_herd':
        default:
          this.drawMiniTriceratops(ctx, time);
          break;
      }

      ctx.restore();
    }
  }

  private drawAstronautTRex(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();

    ctx.fillStyle = '#64748b';
    ctx.fillRect(-18, -4, 7, 14);
    const flameFlicker = Math.sin(time * 15) * 3;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-18, 10);
    ctx.lineTo(-24 - flameFlicker, 14);
    ctx.lineTo(-18, 18);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(-2, 4, 13, 11, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-12, 6);
    ctx.quadraticCurveTo(-26, 2 + Math.sin(time * 3) * 4, -28, 8);
    ctx.lineTo(-12, 12);
    ctx.fill();

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(-6, 12, 5, 8);
    ctx.fillRect(2, 12, 5, 8);

    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const armWave = Math.sin(time * 8) * 3;
    ctx.beginPath();
    ctx.moveTo(4, 3);
    ctx.lineTo(10, 4 + armWave);
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(8, -8, 10, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(10, -9, 8, 8);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(8, -10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(9, -10, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(9, -7, 16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(4, -13, 5, -Math.PI * 0.7, -Math.PI * 0.2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  private drawPterodactyl(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();
    const wingAngle = Math.sin(time * 7) * 0.45;

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.lineTo(24, 0);
    ctx.lineTo(8, 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.lineTo(-4, -10);
    ctx.lineTo(0, -1);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(10, -1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(-2, -2);
    ctx.rotate(-wingAngle);
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, -26);
    ctx.lineTo(8, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(-2, 2);
    ctx.rotate(wingAngle);
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, 26);
    ctx.lineTo(8, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  private drawBrachiosaurusRift(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();

    const riftGrad = ctx.createRadialGradient(0, 10, 5, 0, 10, 35);
    riftGrad.addColorStop(0, '#c084fc');
    riftGrad.addColorStop(0.5, '#7c3aed');
    riftGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = riftGrad;
    ctx.beginPath();
    ctx.arc(0, 10, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 22);
    ctx.quadraticCurveTo(-15 + Math.sin(time * 2) * 5, -5, 6, -20);
    ctx.stroke();

    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.ellipse(8, -22, 9, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(16, -22, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(8, -24, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(9, -24, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawFossilMeteor(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 5; a += 0.25) {
      const r = (a / (Math.PI * 5)) * 12;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.restore();
  }

  private drawMiniTriceratops(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(8, -4, 9, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(11, -8);
    ctx.lineTo(19, -12);
    ctx.lineTo(13, -5);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(21, 0);
    ctx.lineTo(15, 3);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(9, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(10, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderPlayerAsteroid(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    player: {
      x: number;
      y: number;
      vy: number;
      rotation: number;
      squashX: number;
      squashY: number;
      shieldTimer?: number;
    },
    time: number,
    holdGravityInfo?: {
      isHeld: boolean;
      holdDuration: number;
      maxDuration: number;
      effectiveGravity: number;
      baseGravity: number;
      mode: string;
      enabled: boolean;
    }
  ): void {
    const sx = player.x - cameraX;

    ctx.save();
    ctx.translate(sx, player.y);
    ctx.rotate(player.rotation);
    ctx.scale(player.squashX, player.squashY);

    // Hold-Duration Ion Thruster Flare & Charge Aura
    if (holdGravityInfo?.enabled && holdGravityInfo?.isHeld) {
      const chargeRatio = Math.min(1, holdGravityInfo.holdDuration / Math.max(0.05, holdGravityInfo.maxDuration));
      const isHeavy = holdGravityInfo.mode === 'progressive_heavy';
      const flareColor = isHeavy ? 'rgba(239, 68, 68, 0.9)' : 'rgba(56, 189, 248, 0.9)';

      // Boost plume at the rear
      ctx.save();
      const boostPlumeLen = 28 + chargeRatio * 32;
      const boostPlumeWidth = 14 + chargeRatio * 10;
      const plumeGrad = ctx.createLinearGradient(0, 0, -boostPlumeLen, 0);
      plumeGrad.addColorStop(0, '#ffffff');
      plumeGrad.addColorStop(0.3, isHeavy ? '#f43f5e' : '#38bdf8');
      plumeGrad.addColorStop(0.8, isHeavy ? '#991b1b' : '#0284c7');
      plumeGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = plumeGrad;
      ctx.beginPath();
      ctx.moveTo(-10, -boostPlumeWidth * 0.5);
      ctx.lineTo(-boostPlumeLen, 0);
      ctx.lineTo(-10, boostPlumeWidth * 0.5);
      ctx.closePath();
      ctx.shadowColor = isHeavy ? '#ef4444' : '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();

      // Curved charge meter arc around asteroid
      ctx.save();
      ctx.rotate(-player.rotation); // keep meter upright regardless of asteroid tilt
      ctx.beginPath();
      const startAngle = -Math.PI * 0.75;
      const sweepAngle = Math.PI * 1.5 * chargeRatio;
      ctx.arc(0, 0, GAME_CONFIG.ASTEROID_VISUAL_RADIUS * 1.6, startAngle, startAngle + sweepAngle);
      ctx.strokeStyle = isHeavy ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isHeavy ? '#ef4444' : '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Miniature live G readout
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = isHeavy ? '#fca5a5' : '#7dd3fc';
      ctx.textAlign = 'center';
      ctx.shadowColor = isHeavy ? '#991b1b' : '#0369a1';
      ctx.shadowBlur = 5;
      ctx.fillText(
        `${holdGravityInfo.effectiveGravity.toFixed(0)}G (${holdGravityInfo.holdDuration.toFixed(2)}s)`,
        0,
        -GAME_CONFIG.ASTEROID_VISUAL_RADIUS * 1.95
      );
      ctx.restore();
    }

    // Dynamic Flame Comet Tail
    const tailLength = 45 + Math.min(50, Math.abs(player.vy) * 0.12);
    const tailFlutter = Math.sin(time * 20) * 4;

    const outerFlame = ctx.createLinearGradient(0, 0, -tailLength * 1.2, 0);
    outerFlame.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
    outerFlame.addColorStop(0.6, 'rgba(249, 115, 22, 0.45)');
    outerFlame.addColorStop(1, 'rgba(124, 58, 237, 0)');

    ctx.fillStyle = outerFlame;
    ctx.beginPath();
    ctx.moveTo(-8, -12);
    ctx.lineTo(-tailLength * 1.2, tailFlutter);
    ctx.lineTo(-8, 12);
    ctx.closePath();
    ctx.fill();

    const innerFlame = ctx.createLinearGradient(0, 0, -tailLength * 0.7, 0);
    innerFlame.addColorStop(0, '#ffffff');
    innerFlame.addColorStop(0.4, '#fde047');
    innerFlame.addColorStop(1, 'rgba(249, 115, 22, 0)');

    ctx.fillStyle = innerFlame;
    ctx.beginPath();
    ctx.moveTo(-6, -7);
    ctx.lineTo(-tailLength * 0.7, tailFlutter * 0.5);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();

    // Asteroid Body (Faceted rocky meteor body with continuous self-rolling rotation)
    const r = GAME_CONFIG.ASTEROID_VISUAL_RADIUS;

    // Self-rolling rotation around its center, proportional to forward travel distance (player.x)
    const selfRollAngle = (player.x * 0.045) % (Math.PI * 2);

    ctx.save();
    ctx.rotate(selfRollAngle);

    ctx.beginPath();
    this.asteroidVertices.forEach((v, idx) => {
      const vertRadius = r * v.radiusFactor;
      const px = Math.cos(v.angle) * vertRadius;
      const py = Math.sin(v.angle) * vertRadius;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();

    // 3D Spherical Radial Lighting
    const rockGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, r);
    rockGrad.addColorStop(0, '#fdba74');
    rockGrad.addColorStop(0.25, '#f97316');
    rockGrad.addColorStop(0.55, '#c2410c');
    rockGrad.addColorStop(0.85, '#7c2d12');
    rockGrad.addColorStop(1, '#431407');

    ctx.fillStyle = rockGrad;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 12;
    ctx.fill();

    // Round Impact Craters with 3D Depth (tumbles with selfRollAngle)
    for (const crater of this.asteroidCraters) {
      // Crater dark depression
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2);
      ctx.fillStyle = '#290e04';
      ctx.shadowBlur = 0;
      ctx.fill();

      // Crater glowing bottom center
      ctx.beginPath();
      ctx.arc(crater.x - 0.5, crater.y - 0.5, crater.r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 88, 12, 0.65)';
      ctx.fill();

      // Crater highlighted rim arc facing light
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.r, Math.PI * 0.7, Math.PI * 1.8);
      ctx.strokeStyle = 'rgba(254, 215, 170, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Outer rocky rim highlight & facet lines
    ctx.strokeStyle = '#ffedd5';
    ctx.lineWidth = 1.3;
    ctx.shadowColor = '#fb923c';
    ctx.shadowBlur = 6;
    ctx.stroke();

    // Glowing Molten Cracks (tumbles with selfRollAngle)
    const crackPulse = Math.sin(time * 6) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(254, 240, 138, ${crackPulse})`;
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    this.asteroidCracks.forEach((c) => {
      ctx.moveTo(c.x1, c.y1);
      ctx.lineTo(c.x2, c.y2);
    });
    ctx.stroke();

    ctx.restore(); // End of selfRollAngle transform

    // Kinetic Shield Bubble (if recently exited wormhole or black hole)
    if (player.shieldTimer && player.shieldTimer > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Render Hyperdrive speed streaks
   */
  private renderHyperdriveStreaks(
    ctx: CanvasRenderingContext2D,
    timer: number,
    width: number,
    height: number
  ): void {
    ctx.save();
    ctx.globalAlpha = Math.min(1, timer * 2.5);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#a5f3fc';
    ctx.shadowBlur = 10;

    for (let i = 0; i < 28; i++) {
      const y = (i * 37) % height;
      const len = 120 + ((i * 73) % 240);
      const x = ((i * 123) % width);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Render floating text popups (+2.5M YEARS WARP, etc.)
   */
  private renderFloatingTexts(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    texts: FloatingText[]
  ): void {
    ctx.save();
    for (const t of texts) {
      const sx = t.x - cameraX;
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.font = `bold ${Math.round(18 * t.scale)}px 'Chakra Petch', sans-serif`;
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10;
      ctx.fillText(t.text, sx, t.y);
    }
    ctx.restore();
  }

  private renderVignette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const vig = ctx.createRadialGradient(
      width * 0.5, height * 0.5, Math.min(width, height) * 0.45,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.75
    );
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
  }
}
