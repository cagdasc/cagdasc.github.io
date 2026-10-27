export type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export interface Point {
  x: number;
  y: number;
}

export interface TerrainNode {
  x: number;
  topY: number;
  bottomY: number;
}

export type PlanetType = 'rocky' | 'gas_giant_rings' | 'magma' | 'ice' | 'toxic_pulsar';

export interface Planet {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: PlanetType;
  primaryColor: string;
  secondaryColor: string;
  craterSeeds: number[];
  rings?: {
    radiusX: number;
    radiusY: number;
    angle: number;
    color: string;
  };
  glowColor: string;
  rotation: number;
  rotationSpeed: number;
  passed?: boolean;
}

export type DinoType = 't_rex_helmet' | 'pterodactyl_flight' | 'brachio_neck' | 'fossil_meteor' | 'mini_herd';

export interface DinosaurEncounter {
  id: number;
  type: DinoType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  bobPhase: number;
  rotation: number;
  isObstacle: boolean;
  collisionRadius: number;
  passed: boolean;
  name: string;
}

export interface Wormhole {
  id: number;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  bonusYears: number;
  teleportDistance: number;
  pulsePhase: number;
  passed: boolean;
}

export interface BlackHole {
  id: number;
  x: number;
  y: number;
  singularityRadius: number;
  accretionRadius: number;
  influenceRadius: number;
  spinDirection: 'clockwise' | 'counter_clockwise';
  rotation: number;
  rotationSpeed: number;
  boostMultiplier: number;
  active: boolean;
  hasInteracted?: boolean;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
}

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  startSize: number;
  color: string;
  alpha: number;
}

export interface RunStats {
  scoreYears: number;
  bestScoreYears: number;
  distancePx: number;
  eraName: string;
  dinosaursEncountered: number;
  planetsAvoided: number;
  wormholesTraversed: number;
  blackholesSlingshot: number;
  endMessage: string;
}

export type HoldGravityMode = 'progressive_float' | 'progressive_heavy' | 'dampened_arc' | 'jetpack_thruster';

export interface HoldGravityTelemetry {
  isHeld: boolean;
  holdDuration: number;
  maxDuration: number;
  effectiveGravity: number;
  baseGravity: number;
  mode: HoldGravityMode;
}

export interface DebugConfig {
  corridorBaseHeight: number;
  corridorMinHeight: number;
  fluctuationAmplitude: number;
  fluctuationFrequency: number;
  scrollSpeed: number;
  gravity: number;
  upwardImpulse: number;
  godMode: boolean;
  wormholeSpawnChance: number;
  blackholeSpawnChance: number;
  // Hold-Duration Variable Gravity Experiments:
  variableGravityOnHold: boolean;
  holdGravityMode: HoldGravityMode;
  holdMaxDuration: number;
  holdGravityMultiplier: number;
  holdThrustPower: number;
}
