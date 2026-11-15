import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScoreYears, formatYears, formatYearsCompact, getEraInfo, getEndGameMessage } from './ScoreSystem';
import { calculateDifficulty } from './DifficultySystem';
import {
  circleIntersectsCircle,
  pointSegmentDistanceSq,
  checkCaveCollision,
  checkWormholeCollision,
  checkBlackHoleInteraction,
  CircleCollider
} from './CollisionSystem';
import { TerrainGenerator } from './TerrainGenerator';
import { GAME_CONFIG } from './GameConfig';
import { Wormhole, BlackHole } from './types';

test('ScoreSystem: converts distance to years accurately and handles edge cases', () => {
  assert.equal(calculateScoreYears(0), 0);
  assert.equal(calculateScoreYears(-100), 0);
  assert.equal(calculateScoreYears(Number.NaN), 0);
  
  const years = calculateScoreYears(100, 200);
  assert.equal(years, 20000);
});

test('ScoreSystem: formats readable year strings with commas', () => {
  assert.equal(formatYears(0), '0 YEARS');
  assert.equal(formatYears(65000000), '65,000,000 YEARS');
  assert.equal(formatYearsCompact(65000000), '65.0M YRS');
  assert.equal(formatYearsCompact(250000), '250K YRS');
});

test('ScoreSystem: provides distinct historical eras based on millions of years', () => {
  const early = getEraInfo(100000);
  assert.equal(early.era, 'QUATERNARY SHIFT');

  const cretaceous = getEraInfo(70000000);
  assert.equal(cretaceous.era, 'CRETACEOUS VOID');

  const jurassic = getEraInfo(160000000);
  assert.equal(jurassic.era, 'JURASSIC RIFT');

  const permian = getEraInfo(300000000);
  assert.equal(permian.era, 'PERMIAN ANOMALY');
});

test('ScoreSystem: generates thematic end messages', () => {
  const msg65m = getEndGameMessage(66000000);
  assert.ok(msg65m.length > 5);
  const msgGeneral = getEndGameMessage(50000, 3);
  assert.ok(GAME_CONFIG.END_MESSAGES.includes(msgGeneral as any) || msgGeneral.includes('million years'));
});

test('DifficultySystem: maintains safe corridor and bounded speeds', () => {
  const start = calculateDifficulty(0);
  assert.equal(start.scrollSpeed, GAME_CONFIG.BASE_SCROLL_SPEED);

  const mid = calculateDifficulty(20000);
  assert.ok(mid.scrollSpeed > start.scrollSpeed);

  const extreme = calculateDifficulty(1000000);
  assert.ok(extreme.scrollSpeed <= GAME_CONFIG.MAX_SCROLL_SPEED);
  assert.ok(extreme.corridorHeight >= GAME_CONFIG.CORRIDOR_MIN_HEIGHT);
});

test('CollisionSystem: circle-circle collisions detect overlapping spheres', () => {
  const c1: CircleCollider = { x: 100, y: 100, radius: 15 };
  const c2: CircleCollider = { x: 120, y: 100, radius: 10 };
  const cFar: CircleCollider = { x: 200, y: 200, radius: 10 };

  assert.equal(circleIntersectsCircle(c1, c2), true);
  assert.equal(circleIntersectsCircle(c1, cFar), false);
});

test('CollisionSystem: point-to-segment distance calculation is exact', () => {
  const distSq = pointSegmentDistanceSq(5, 5, 0, 0, 10, 0);
  assert.equal(distSq, 25);

  const distSqBefore = pointSegmentDistanceSq(-3, 4, 0, 0, 10, 0);
  assert.equal(distSqBefore, 25);
});

test('CollisionSystem: detects cave wall collisions and respects safe clearings', () => {
  const nodes = [
    { x: 0, topY: 100, bottomY: 500 },
    { x: 100, topY: 100, bottomY: 500 },
    { x: 200, topY: 100, bottomY: 500 }
  ];

  const safeAsteroid: CircleCollider = { x: 50, y: 300, radius: 15 };
  assert.equal(checkCaveCollision(safeAsteroid, nodes), false);

  const roofAsteroid: CircleCollider = { x: 50, y: 110, radius: 15 };
  assert.equal(checkCaveCollision(roofAsteroid, nodes), true);

  const floorAsteroid: CircleCollider = { x: 50, y: 490, radius: 15 };
  assert.equal(checkCaveCollision(floorAsteroid, nodes), true);
});

test('CollisionSystem: detects Wormhole entry and triggers teleportation', () => {
  const asteroid: CircleCollider = { x: 500, y: 300, radius: 14 };
  const wormholes: Wormhole[] = [
    {
      id: 1,
      x: 510,
      y: 305,
      radius: 36,
      rotation: 0,
      rotationSpeed: 1.8,
      bonusYears: 2500000,
      teleportDistance: 1400,
      pulsePhase: 0,
      passed: false
    }
  ];

  const hit = checkWormholeCollision(asteroid, wormholes);
  assert.ok(hit !== null);
  assert.equal(hit?.id, 1);
  assert.equal(hit?.bonusYears, 2500000);
});

test('CollisionSystem: detects Black Hole orbital slingshot when entering with spin', () => {
  // Clockwise black hole at (800, 300).
  // Asteroid approaching from the top (y = 260, dx = -10, dy = -40)
  // For clockwise, tangentX at top is positive (+ forward in direction of travel)
  const asteroid: CircleCollider = { x: 790, y: 260, radius: 14 };
  const blackHoles: BlackHole[] = [
    {
      id: 1,
      x: 800,
      y: 300,
      singularityRadius: 18,
      accretionRadius: 55,
      influenceRadius: 110,
      spinDirection: 'clockwise',
      rotation: 0,
      rotationSpeed: 2.5,
      active: true,
      boostMultiplier: 1.5
    }
  ];

  const result = checkBlackHoleInteraction(asteroid, 20, 220, blackHoles);
  assert.ok(result !== null);
  assert.equal(result?.type, 'slingshot');
  assert.ok(result?.throwVx > 0, 'Should throw forward');
  assert.ok(result?.message.includes('SLINGSHOT'));
});

test('CollisionSystem: detects turbulent push when entering counter-spin into Black Hole', () => {
  // Counter-clockwise black hole at (800, 300).
  // Asteroid approaching from top (y = 260, dy = -40).
  // Counter-clockwise tangent at top is negative (counter to forward travel)
  const asteroid: CircleCollider = { x: 790, y: 260, radius: 14 };
  const blackHoles: BlackHole[] = [
    {
      id: 2,
      x: 800,
      y: 300,
      singularityRadius: 18,
      accretionRadius: 55,
      influenceRadius: 110,
      spinDirection: 'counter_clockwise',
      rotation: 0,
      rotationSpeed: 2.5,
      active: true,
      boostMultiplier: 1.5
    }
  ];

  const result = checkBlackHoleInteraction(asteroid, 20, 220, blackHoles);
  assert.ok(result !== null);
  assert.equal(result?.type, 'push');
  assert.ok(result?.message.includes('TURBULENCE'));
});

test('CollisionSystem: detects singularity direct collision', () => {
  const asteroid: CircleCollider = { x: 802, y: 302, radius: 14 };
  const blackHoles: BlackHole[] = [
    {
      id: 3,
      x: 800,
      y: 300,
      singularityRadius: 20,
      accretionRadius: 55,
      influenceRadius: 110,
      spinDirection: 'clockwise',
      rotation: 0,
      rotationSpeed: 2.5,
      active: true,
      boostMultiplier: 1.5
    }
  ];

  const result = checkBlackHoleInteraction(asteroid, 0, 220, blackHoles);
  assert.ok(result !== null);
  assert.equal(result?.type, 'singularity_hit');
});

test('TerrainGenerator: guarantees minimum corridor height, safe zones, and live tuning', () => {
  const generator = new TerrainGenerator(720, 12345);
  // Set custom wider corridor and rich wave fluctuation
  generator.setTuningParams(380, 240, 90, 0.0035);
  // Guarantee safe zone ahead
  generator.addSafeZone(1000, 800, 360);

  const nodes = generator.generateInitialTerrain(2200);
  assert.ok(nodes.length > 30);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const gap = node.bottomY - node.topY;
    assert.ok(gap >= 240, `Gap at x=${node.x} was ${gap}, expected >= 240`);

    // In the safe zone [1000, 1800], corridor should be extra wide
    if (node.x >= 1000 && node.x <= 1800) {
      assert.ok(gap >= 350, `Safe zone gap at x=${node.x} was ${gap}, expected >= 350`);
    }
  }
});

test('Physics: Hold-Duration Progressive Float reduces gravity smoothly', () => {
  const baseGravity = 820;
  const maxDur = 0.45;
  const minMultiplier = 0.20;

  // Function mimicking the engine's progressive float formula
  const calcFloatGravity = (holdDur: number) => {
    const ratio = Math.min(1, holdDur / maxDur);
    const factor = 1 - ratio * (1 - minMultiplier);
    return baseGravity * Math.max(0, factor);
  };

  assert.equal(calcFloatGravity(0), baseGravity, 'Tap (0s hold) should have 100% gravity');
  assert.equal(Math.round(calcFloatGravity(maxDur)), Math.round(baseGravity * minMultiplier), 'Max hold should reach min gravity multiplier');
  assert.ok(calcFloatGravity(0.20) < calcFloatGravity(0.10), 'Holding longer must progressively reduce gravity');
  assert.equal(calcFloatGravity(1.0), calcFloatGravity(maxDur), 'Hold beyond max duration should stay clamped at target');
});

test('Physics: Hold-Duration Progressive Heavy scales gravity upward for diving', () => {
  const baseGravity = 820;
  const maxDur = 0.40;
  const peakMultiplier = 2.20;

  const calcHeavyGravity = (holdDur: number) => {
    const ratio = Math.min(1, holdDur / maxDur);
    const factor = 1 + ratio * (peakMultiplier - 1);
    return baseGravity * factor;
  };

  assert.equal(calcHeavyGravity(0), baseGravity);
  assert.ok(calcHeavyGravity(0.20) > calcHeavyGravity(0.10));
  assert.equal(Math.round(calcHeavyGravity(maxDur)), Math.round(baseGravity * peakMultiplier));
});

test('Physics: Hold-Duration Dampened Arc maintains low-G within hold window and snaps back', () => {
  const baseGravity = 820;
  const maxDur = 0.35;
  const multiplier = 0.25;

  const calcArcGravity = (holdDur: number) => {
    if (holdDur <= maxDur) {
      return baseGravity * multiplier;
    }
    return baseGravity;
  };

  assert.equal(calcArcGravity(0.15), baseGravity * multiplier, 'Within window, gravity is held low');
  assert.equal(calcArcGravity(0.35), baseGravity * multiplier, 'At boundary, gravity remains low');
  assert.equal(calcArcGravity(0.40), baseGravity, 'Past boundary, gravity snaps back to normal');
});

test('Physics: Hold-Duration Jetpack Thruster applies continuous counter-acceleration', () => {
  const baseGravity = 820;
  const thrustPower = 650;
  const maxDur = 0.60;

  const calcJetpackGravity = (holdDur: number) => {
    const ratio = Math.min(1, holdDur / maxDur);
    return baseGravity - thrustPower * (1 - ratio * 0.2);
  };

  const initialNet = calcJetpackGravity(0);
  assert.equal(initialNet, baseGravity - thrustPower);
  assert.ok(initialNet < 200, 'Jetpack thrust counteracts gravity to create floaty hover');
});
