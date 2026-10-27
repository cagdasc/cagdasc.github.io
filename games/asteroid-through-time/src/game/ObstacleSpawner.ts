import { Planet, PlanetType, DinosaurEncounter, DinoType, Wormhole, BlackHole, TerrainNode } from './types';
import { GAME_CONFIG } from './GameConfig';
import { DifficultyState } from './DifficultySystem';
import { TerrainGenerator } from './TerrainGenerator';

export class ObstacleSpawner {
  private nextObstacleX: number = 900;
  private nextPlanetId: number = 1;
  private nextDinoId: number = 1;
  private nextWormholeId: number = 1;
  private nextBlackHoleId: number = 1;

  public reset(): void {
    this.nextObstacleX = 900;
    this.nextPlanetId = 1;
    this.nextDinoId = 1;
    this.nextWormholeId = 1;
    this.nextBlackHoleId = 1;
  }

  /**
   * Spawns planets, dinosaurs, wormholes, and black holes as camera advances
   */
  public updateSpawns(
    cameraX: number,
    canvasWidth: number,
    difficulty: DifficultyState,
    terrainNodes: TerrainNode[],
    terrainGen: TerrainGenerator,
    planets: Planet[],
    dinosaurs: DinosaurEncounter[],
    wormholes: Wormhole[],
    blackHoles: BlackHole[],
    customWormholeChance?: number,
    customBlackHoleChance?: number
  ): void {
    const horizonX = cameraX + canvasWidth + 900;

    while (this.nextObstacleX < horizonX) {
      const spawnX = this.nextObstacleX;
      const terrainAtX = this.getTerrainBoundsAt(spawnX, terrainNodes);
      const corridorHeight = terrainAtX.bottomY - terrainAtX.topY;
      const corridorCenterY = (terrainAtX.topY + terrainAtX.bottomY) * 0.5;

      const roll = Math.random();
      const wormholeChance = customWormholeChance ?? GAME_CONFIG.WORMHOLE_SPAWN_CHANCE;
      const blackHoleChance = customBlackHoleChance ?? GAME_CONFIG.BLACKHOLE_SPAWN_CHANCE;

      // 1. Check for Black Hole spawn (Gravitational Assist Slingshot or Repulsive Push)
      if (spawnX > 1600 && roll < blackHoleChance && blackHoles.length < 2) {
        // Spin clockwise or counter-clockwise
        const spinDirection: 'clockwise' | 'counter_clockwise' = Math.random() < 0.5 ? 'clockwise' : 'counter_clockwise';
        const rotationSpeed = spinDirection === 'clockwise' ? 3.8 : -3.8;
        const bhY = corridorCenterY + (Math.random() * 40 - 20);

        const blackHole: BlackHole = {
          id: this.nextBlackHoleId++,
          x: spawnX,
          y: bhY,
          singularityRadius: GAME_CONFIG.BLACKHOLE_SINGULARITY_RADIUS,
          accretionRadius: GAME_CONFIG.BLACKHOLE_ACCRETION_RADIUS,
          influenceRadius: 130,
          spinDirection,
          rotation: 0,
          rotationSpeed,
          boostMultiplier: GAME_CONFIG.BLACKHOLE_SLINGSHOT_SPEED_BOOST,
          active: true
        };

        blackHoles.push(blackHole);

        // GUARANTEE: Clear all obstacles ahead of black hole slingshot exit so player doesn't fail unfairly
        const clearStart = spawnX - 50;
        const clearEnd = spawnX + GAME_CONFIG.BLACKHOLE_SAFE_CLEAR_DISTANCE;
        terrainGen.addSafeZone(clearStart, GAME_CONFIG.BLACKHOLE_SAFE_CLEAR_DISTANCE, bhY);

        this.nextObstacleX = clearEnd + 250;
        continue;
      }

      // 2. Check for Wormhole spawn (Teleportation & Bonus Years)
      if (spawnX > 1200 && Math.random() < wormholeChance && wormholes.length < 2) {
        const wormholeY = corridorCenterY + (Math.random() * 0.4 - 0.2) * corridorHeight;

        wormholes.push({
          id: this.nextWormholeId++,
          x: spawnX,
          y: wormholeY,
          radius: GAME_CONFIG.WORMHOLE_RADIUS,
          rotation: 0,
          rotationSpeed: 1.8,
          bonusYears: GAME_CONFIG.WORMHOLE_BONUS_YEARS,
          teleportDistance: GAME_CONFIG.WORMHOLE_TELEPORT_DISTANCE,
          pulsePhase: Math.random() * Math.PI * 2,
          passed: false
        });

        this.nextObstacleX += 520;
        continue;
      }

      // 3. Regular Planet Obstacle
      if (roll < difficulty.planetSpawnChance) {
        const maxSafeRadius = Math.min(GAME_CONFIG.PLANET_MAX_RADIUS, corridorHeight * 0.22);
        const radius = GAME_CONFIG.PLANET_MIN_RADIUS + Math.random() * (maxSafeRadius - GAME_CONFIG.PLANET_MIN_RADIUS);

        const offsetDirection = Math.random() < 0.5 ? -1 : 1;
        const maxOffset = (corridorHeight * 0.5) - radius - 35;
        const yOffset = offsetDirection * (20 + Math.random() * Math.max(0, maxOffset));
        const planetY = corridorCenterY + yOffset;

        const planetTypes: PlanetType[] = ['rocky', 'gas_giant_rings', 'magma', 'ice', 'toxic_pulsar'];
        const chosenType = planetTypes[Math.floor(Math.random() * planetTypes.length)];

        planets.push(this.createPlanet(this.nextPlanetId++, spawnX, planetY, radius, chosenType));
      }

      // 4. Dinosaur Encounter
      if (Math.random() < difficulty.dinoSpawnChance) {
        const dinoX = spawnX + (Math.random() * 200 - 100);
        const dinoY = corridorCenterY + (Math.random() * 0.6 - 0.3) * corridorHeight;

        const dinoTypes: DinoType[] = [
          't_rex_helmet',
          'pterodactyl_flight',
          'brachio_neck',
          'fossil_meteor',
          'mini_herd'
        ];
        const chosenDino = dinoTypes[Math.floor(Math.random() * dinoTypes.length)];
        const isHazard = Math.random() < difficulty.hazardDinoRatio;

        dinosaurs.push(this.createDinosaur(this.nextDinoId++, dinoX, dinoY, chosenDino, isHazard));
      }

      this.nextObstacleX += difficulty.obstacleSpacing + Math.random() * 120;
    }

    // Clean up entities ONLY when comfortably far off-screen behind camera (never delete when passed!)
    const offscreenThreshold = cameraX - 1200;

    for (let i = planets.length - 1; i >= 0; i--) {
      if (planets[i].x < offscreenThreshold) {
        planets.splice(i, 1);
      }
    }
    for (let i = dinosaurs.length - 1; i >= 0; i--) {
      if (dinosaurs[i].x < offscreenThreshold) {
        dinosaurs.splice(i, 1);
      }
    }
    for (let i = wormholes.length - 1; i >= 0; i--) {
      if (wormholes[i].x < offscreenThreshold) {
        wormholes.splice(i, 1);
      }
    }
    for (let i = blackHoles.length - 1; i >= 0; i--) {
      if (blackHoles[i].x < offscreenThreshold) {
        blackHoles.splice(i, 1);
      }
    }
  }

  public spawnInstantWormhole(aheadX: number, centerY: number): Wormhole {
    return {
      id: this.nextWormholeId++,
      x: aheadX,
      y: centerY,
      radius: GAME_CONFIG.WORMHOLE_RADIUS,
      rotation: 0,
      rotationSpeed: 1.8,
      bonusYears: GAME_CONFIG.WORMHOLE_BONUS_YEARS,
      teleportDistance: GAME_CONFIG.WORMHOLE_TELEPORT_DISTANCE,
      pulsePhase: 0,
      passed: false
    };
  }

  public spawnInstantBlackHole(aheadX: number, centerY: number, spin: 'clockwise' | 'counter_clockwise' = 'clockwise'): BlackHole {
    return {
      id: this.nextBlackHoleId++,
      x: aheadX,
      y: centerY,
      singularityRadius: GAME_CONFIG.BLACKHOLE_SINGULARITY_RADIUS,
      accretionRadius: GAME_CONFIG.BLACKHOLE_ACCRETION_RADIUS,
      influenceRadius: 130,
      spinDirection: spin,
      rotation: 0,
      rotationSpeed: spin === 'clockwise' ? 3.8 : -3.8,
      boostMultiplier: GAME_CONFIG.BLACKHOLE_SLINGSHOT_SPEED_BOOST,
      active: true
    };
  }

  /**
   * Spawns a challenging temporal obstacle slalom at the wormhole exit!
   * Leaves a traversable corridor but requires active reflex maneuvers.
   */
  public spawnWormholeSlalomAtExit(
    exitX: number,
    terrainNodes: TerrainNode[],
    planets: Planet[],
    dinosaurs: DinosaurEncounter[]
  ): void {
    // 1. First obstacle at exitX + 260: an upper floating asteroid
    const t1 = this.getTerrainBoundsAt(exitX + 260, terrainNodes);
    const h1 = t1.bottomY - t1.topY;
    const y1 = t1.topY + h1 * 0.28; // Upper obstacle
    planets.push(this.createPlanet(this.nextPlanetId++, exitX + 260, y1, 28, 'ice'));

    // 2. Second obstacle at exitX + 540: a lower obstacle, creating a zigzag slalom!
    const t2 = this.getTerrainBoundsAt(exitX + 540, terrainNodes);
    const h2 = t2.bottomY - t2.topY;
    const y2 = t2.bottomY - h2 * 0.28; // Lower obstacle
    planets.push(this.createPlanet(this.nextPlanetId++, exitX + 540, y2, 30, 'magma'));

    // 3. A gliding pterosaur crossing through the middle at exitX + 780
    const t3 = this.getTerrainBoundsAt(exitX + 780, terrainNodes);
    const midY = (t3.topY + t3.bottomY) * 0.5;
    dinosaurs.push(this.createDinosaur(this.nextDinoId++, exitX + 780, midY, 'pterodactyl_flight', false));
  }

  private getTerrainBoundsAt(x: number, nodes: TerrainNode[]): { topY: number; bottomY: number } {
    if (nodes.length === 0) return { topY: 100, bottomY: 600 };
    for (let i = 0; i < nodes.length - 1; i++) {
      if (x >= nodes[i].x && x <= nodes[i + 1].x) {
        const t = (x - nodes[i].x) / (nodes[i + 1].x - nodes[i].x || 1);
        return {
          topY: nodes[i].topY + t * (nodes[i + 1].topY - nodes[i].topY),
          bottomY: nodes[i].bottomY + t * (nodes[i + 1].bottomY - nodes[i].bottomY)
        };
      }
    }
    const last = nodes[nodes.length - 1];
    return { topY: last.topY, bottomY: last.bottomY };
  }

  private createPlanet(id: number, x: number, y: number, radius: number, type: PlanetType): Planet {
    let primaryColor = '#94a3b8';
    let secondaryColor = '#475569';
    let glowColor = 'rgba(148, 163, 184, 0.4)';
    let rings: Planet['rings'] = undefined;

    switch (type) {
      case 'gas_giant_rings':
        primaryColor = '#d97706';
        secondaryColor = '#b45309';
        glowColor = 'rgba(245, 158, 11, 0.45)';
        rings = {
          radiusX: radius * 2.1,
          radiusY: radius * 0.5,
          angle: -0.32,
          color: 'rgba(251, 191, 36, 0.75)'
        };
        break;
      case 'magma':
        primaryColor = '#dc2626';
        secondaryColor = '#7f1d1d';
        glowColor = 'rgba(239, 68, 68, 0.55)';
        break;
      case 'ice':
        primaryColor = '#38bdf8';
        secondaryColor = '#0284c7';
        glowColor = 'rgba(56, 189, 248, 0.5)';
        break;
      case 'toxic_pulsar':
        primaryColor = '#10b981';
        secondaryColor = '#065f46';
        glowColor = 'rgba(16, 185, 129, 0.6)';
        break;
      case 'rocky':
      default:
        primaryColor = '#a8a29e';
        secondaryColor = '#57534e';
        glowColor = 'rgba(168, 162, 158, 0.35)';
        break;
    }

    const craterSeeds = [Math.random(), Math.random(), Math.random(), Math.random()];

    return {
      id,
      x,
      y,
      radius,
      type,
      primaryColor,
      secondaryColor,
      craterSeeds,
      rings,
      glowColor,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      passed: false
    };
  }

  private createDinosaur(
    id: number,
    x: number,
    y: number,
    type: DinoType,
    isObstacle: boolean
  ): DinosaurEncounter {
    let name = 'Cosmic T-Rex';
    let size = 38;
    let collisionRadius = 20;
    let vx = (Math.random() - 0.5) * 15;
    let vy = (Math.random() - 0.5) * 10;

    switch (type) {
      case 't_rex_helmet':
        name = 'Spacewalking T-Rex';
        size = 38;
        collisionRadius = 20;
        break;
      case 'pterodactyl_flight':
        name = 'Gliding Pterosaur';
        size = 42;
        collisionRadius = 18;
        vx = -40;
        break;
      case 'brachio_neck':
        name = 'Sauropod Nebula Rift';
        size = 48;
        collisionRadius = 24;
        break;
      case 'fossil_meteor':
        name = 'Ammonite Space Fossil';
        size = 30;
        collisionRadius = 16;
        break;
      case 'mini_herd':
        name = 'Zero-G Triceratops Pod';
        size = 28;
        collisionRadius = 15;
        break;
    }

    return {
      id,
      type,
      x,
      y,
      vx,
      vy,
      size,
      bobPhase: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 0.25,
      isObstacle,
      collisionRadius,
      passed: false,
      name
    };
  }
}
