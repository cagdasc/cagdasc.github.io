import { TerrainNode } from './types';
import { GAME_CONFIG } from './GameConfig';

export class TerrainGenerator {
  private lastX: number = 0;
  private currentCenterY: number;
  private currentGap: number;
  private viewportHeight: number;
  private seed: number;

  // Dynamic tuning parameters (can be adjusted live via Debug Menu)
  private baseGap: number = GAME_CONFIG.CORRIDOR_BASE_HEIGHT;
  private minGap: number = GAME_CONFIG.CORRIDOR_MIN_HEIGHT;
  private fluctuationAmplitude: number = GAME_CONFIG.CAVE_FLUCTUATION_AMPLITUDE;
  private fluctuationFrequency: number = GAME_CONFIG.CAVE_FLUCTUATION_FREQUENCY;

  // Safe zones for wormhole/blackhole exits
  private safeZones: { startX: number; endX: number; targetCenterY?: number }[] = [];

  constructor(viewportHeight: number = GAME_CONFIG.CANVAS_VIRTUAL_HEIGHT, seed: number = 42) {
    this.viewportHeight = viewportHeight;
    this.seed = seed;
    this.currentCenterY = viewportHeight * 0.5;
    this.currentGap = this.baseGap;
  }

  public setTuningParams(
    baseGap?: number,
    minGap?: number,
    amplitude?: number,
    frequency?: number
  ): void {
    if (baseGap !== undefined) this.baseGap = Math.max(160, baseGap);
    if (minGap !== undefined) this.minGap = Math.max(120, minGap);
    if (amplitude !== undefined) this.fluctuationAmplitude = Math.max(0, amplitude);
    if (frequency !== undefined) this.fluctuationFrequency = Math.max(0.0005, frequency);
  }

  public reset(viewportHeight: number = this.viewportHeight, seed: number = Math.random() * 10000): void {
    this.viewportHeight = viewportHeight;
    this.seed = seed;
    this.lastX = 0;
    this.currentCenterY = viewportHeight * 0.5;
    this.currentGap = this.baseGap;
    this.safeZones = [];
  }

  /**
   * Designates a guaranteed safe exit corridor (e.g. after a Black Hole slingshot or Wormhole warp)
   */
  public addSafeZone(startX: number, distance: number, targetCenterY?: number): void {
    this.safeZones.push({
      startX,
      endX: startX + distance,
      targetCenterY
    });
  }

  private isInsideSafeZone(x: number): { inZone: boolean; targetCenterY?: number } {
    for (const zone of this.safeZones) {
      if (x >= zone.startX && x <= zone.endX) {
        return { inZone: true, targetCenterY: zone.targetCenterY };
      }
    }
    return { inZone: false };
  }

  private pseudorandom(step: number): number {
    const x = Math.sin(this.seed + step * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  public generateInitialTerrain(targetX: number): TerrainNode[] {
    const nodes: TerrainNode[] = [];
    const step = GAME_CONFIG.TERRAIN_SEGMENT_WIDTH;
    let x = 0;

    nodes.push({
      x: 0,
      topY: Math.max(GAME_CONFIG.CORRIDOR_VERTICAL_MARGIN, this.currentCenterY - this.baseGap * 0.5),
      bottomY: Math.min(this.viewportHeight - GAME_CONFIG.CORRIDOR_VERTICAL_MARGIN, this.currentCenterY + this.baseGap * 0.5)
    });

    while (x < targetX) {
      x += step;
      nodes.push(this.createNextNode(x, this.baseGap));
    }

    this.lastX = x;
    return nodes;
  }

  public extendTerrain(targetX: number, desiredGap: number): TerrainNode[] {
    const newNodes: TerrainNode[] = [];
    const step = GAME_CONFIG.TERRAIN_SEGMENT_WIDTH;

    const safeGap = Math.max(this.minGap, desiredGap || this.baseGap);
    this.currentGap = this.currentGap * 0.9 + safeGap * 0.1;

    while (this.lastX < targetX) {
      this.lastX += step;
      newNodes.push(this.createNextNode(this.lastX, this.currentGap));
    }

    // Prune expired safe zones
    this.safeZones = this.safeZones.filter(z => z.endX >= this.lastX - 2000);

    return newNodes;
  }

  public createNextNode(x: number, gap: number): TerrainNode {
    const index = Math.floor(x / GAME_CONFIG.TERRAIN_SEGMENT_WIDTH);
    const isIntro = x < 700;
    const safeZoneInfo = this.isInsideSafeZone(x);

    // If inside safe zone (after blackhole / wormhole), expand corridor significantly
    let effectiveGap = gap;
    if (safeZoneInfo.inZone) {
      effectiveGap = Math.max(gap, this.baseGap * 1.35);
    } else if (isIntro) {
      effectiveGap = Math.max(gap, this.baseGap * 1.15);
    }

    if (isIntro) {
      this.currentCenterY = this.viewportHeight * 0.5;
    } else {
      // Dynamic multi-frequency harmonic wave for rich cave fluctuation
      const freq = this.fluctuationFrequency;
      const amp = this.fluctuationAmplitude;

      const wave1 = Math.sin(x * freq) * (amp * 0.7);
      const wave2 = Math.cos(x * freq * 1.85 + 1.2) * (amp * 0.3);
      const noise = (this.pseudorandom(index) - 0.5) * (amp * 0.25);

      let targetCenter = (this.viewportHeight * 0.5) + wave1 + wave2 + noise;

      if (safeZoneInfo.inZone && safeZoneInfo.targetCenterY !== undefined) {
        // Smoothly blend toward exit target
        targetCenter = safeZoneInfo.targetCenterY;
      }

      // Limit slope delta for fairness
      const deltaCenter = targetCenter - this.currentCenterY;
      const maxDelta = GAME_CONFIG.MAX_SLOPE_DELTA * 0.65;
      const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaCenter));
      this.currentCenterY += clampedDelta;

      // Keep corridor center within safe bounds
      const minCenter = GAME_CONFIG.CORRIDOR_VERTICAL_MARGIN + effectiveGap * 0.5 + 20;
      const maxCenter = this.viewportHeight - GAME_CONFIG.CORRIDOR_VERTICAL_MARGIN - effectiveGap * 0.5 - 20;
      this.currentCenterY = Math.max(minCenter, Math.min(maxCenter, this.currentCenterY));
    }

    // Organic rocky crags on ceiling & floor
    const rockAmp = safeZoneInfo.inZone ? 8 : 22;
    const roofRock = isIntro ? 0 : (this.pseudorandom(index * 2 + 1) - 0.5) * rockAmp;
    const floorRock = isIntro ? 0 : (this.pseudorandom(index * 2 + 2) - 0.5) * rockAmp;

    const halfGap = effectiveGap * 0.5;
    let topY = this.currentCenterY - halfGap + roofRock;
    let bottomY = this.currentCenterY + halfGap + floorRock;

    // Hard bounds
    topY = Math.max(GAME_CONFIG.CORRIDOR_VERTICAL_MARGIN, topY);
    bottomY = Math.min(this.viewportHeight - GAME_CONFIG.CORRIDOR_VERTICAL_MARGIN, bottomY);

    // Invariant: bottomY - topY >= minGap
    if (bottomY - topY < this.minGap) {
      const mid = (topY + bottomY) * 0.5;
      topY = mid - this.minGap * 0.5;
      bottomY = mid + this.minGap * 0.5;
    }

    return { x, topY, bottomY };
  }
}
