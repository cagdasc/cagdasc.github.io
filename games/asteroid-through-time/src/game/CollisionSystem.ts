import { Point, TerrainNode, Planet, DinosaurEncounter, Wormhole, BlackHole } from './types';

export interface CircleCollider {
  x: number;
  y: number;
  radius: number;
}

export function circleIntersectsCircle(c1: CircleCollider, c2: CircleCollider): boolean {
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  const combinedRadius = c1.radius + c2.radius;
  return (dx * dx + dy * dy) <= (combinedRadius * combinedRadius);
}

export function pointSegmentDistanceSq(
  cx: number, cy: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) {
    const px = cx - x1;
    const py = cy - y1;
    return px * px + py * py;
  }
  const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / l2));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  const diffX = cx - projX;
  const diffY = cy - projY;
  return diffX * diffX + diffY * diffY;
}

export function circleIntersectsSegment(
  circle: CircleCollider,
  x1: number, y1: number,
  x2: number, y2: number
): boolean {
  const distSq = pointSegmentDistanceSq(circle.x, circle.y, x1, y1, x2, y2);
  return distSq <= (circle.radius * circle.radius);
}

export function checkCaveCollision(
  asteroid: CircleCollider,
  terrainNodes: TerrainNode[]
): boolean {
  if (terrainNodes.length < 2) return false;

  const r = asteroid.radius;
  const rSq = r * r;

  for (let i = 0; i < terrainNodes.length - 1; i++) {
    const n1 = terrainNodes[i];
    const n2 = terrainNodes[i + 1];

    const minX = Math.min(n1.x, n2.x) - r;
    const maxX = Math.max(n1.x, n2.x) + r;
    if (asteroid.x < minX || asteroid.x > maxX) {
      continue;
    }

    if (pointSegmentDistanceSq(asteroid.x, asteroid.y, n1.x, n1.topY, n2.x, n2.topY) <= rSq) {
      return true;
    }

    if (asteroid.x >= n1.x && asteroid.x <= n2.x) {
      const t = (asteroid.x - n1.x) / (n2.x - n1.x || 1);
      const interpolatedTopY = n1.topY + t * (n2.topY - n1.topY);
      if (asteroid.y - r <= interpolatedTopY) {
        return true;
      }

      const interpolatedBottomY = n1.bottomY + t * (n2.bottomY - n1.bottomY);
      if (asteroid.y + r >= interpolatedBottomY) {
        return true;
      }
    }

    if (pointSegmentDistanceSq(asteroid.x, asteroid.y, n1.x, n1.bottomY, n2.x, n2.bottomY) <= rSq) {
      return true;
    }
  }

  return false;
}

export function checkPlanetCollisions(asteroid: CircleCollider, planets: Planet[]): Planet | null {
  for (const planet of planets) {
    if (circleIntersectsCircle(asteroid, { x: planet.x, y: planet.y, radius: planet.radius * 0.92 })) {
      return planet;
    }
  }
  return null;
}

export function checkDinoCollisions(asteroid: CircleCollider, dinos: DinosaurEncounter[]): DinosaurEncounter | null {
  for (const dino of dinos) {
    if (!dino.isObstacle) continue;
    if (circleIntersectsCircle(asteroid, { x: dino.x, y: dino.y, radius: dino.collisionRadius })) {
      return dino;
    }
  }
  return null;
}

/**
 * Check if the asteroid enters a Wormhole
 */
export function checkWormholeCollision(asteroid: CircleCollider, wormholes: Wormhole[]): Wormhole | null {
  for (const wormhole of wormholes) {
    if (wormhole.passed) continue;
    if (circleIntersectsCircle(asteroid, { x: wormhole.x, y: wormhole.y, radius: wormhole.radius * 0.8 })) {
      return wormhole;
    }
  }
  return null;
}

export interface BlackHoleInteractionResult {
  blackHole: BlackHole;
  type: 'slingshot' | 'push' | 'singularity_hit';
  throwVx: number;
  throwVy: number;
  message: string;
}

/**
 * Check interaction with Black Hole gravity assist / slingshot
 * Throws you in the direction it spins if entered correctly, or pushes you into turbulence if not!
 */
export function checkBlackHoleInteraction(
  asteroid: CircleCollider,
  asteroidVy: number,
  forwardSpeed: number,
  blackHoles: BlackHole[]
): BlackHoleInteractionResult | null {
  for (const bh of blackHoles) {
    if (!bh.active) continue;

    const dx = asteroid.x - bh.x;
    const dy = asteroid.y - bh.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // If outside outer gravitational field
    if (dist > bh.influenceRadius + asteroid.radius) {
      continue;
    }

    // Direct hit to inner singularity
    if (dist <= bh.singularityRadius * 0.75 + asteroid.radius) {
      return {
        blackHole: bh,
        type: 'singularity_hit',
        throwVx: 0,
        throwVy: 0,
        message: 'CONSUMED BY SINGULARITY'
      };
    }

    // Tangent vector of spinning accretion disk
    // In Canvas 2D: clockwise rotation has tangent (-dy, dx) / dist
    // counter-clockwise has tangent (dy, -dx) / dist
    const tangentX = bh.spinDirection === 'clockwise' ? -dy / (dist || 1) : dy / (dist || 1);
    const tangentY = bh.spinDirection === 'clockwise' ? dx / (dist || 1) : -dx / (dist || 1);

    const speed = Math.hypot(forwardSpeed, asteroidVy) || 1;
    const normVx = forwardSpeed / speed;
    const normVy = asteroidVy / speed;

    // Alignment with spin
    const alignment = normVx * tangentX + normVy * tangentY;

    // Trigger interaction within accretion radius
    if (dist <= bh.accretionRadius + asteroid.radius) {
      if (alignment > 0.25) {
        // Throws player along the spin direction
        const throwVx = Math.max(120, tangentX * 360 + 240);
        const throwVy = tangentY * 380;

        return {
          blackHole: bh,
          type: 'slingshot',
          throwVx,
          throwVy,
          message: 'ORBITAL SLINGSHOT ASSIST!'
        };
      } else {
        // Counter-flow push: repels player and throws them into cave turbulence
        const pushUnitX = dx / (dist || 1);
        const pushUnitY = dy / (dist || 1);

        const pushVx = pushUnitX * 160 - 50;
        const pushVy = pushUnitY * 340 + (bh.spinDirection === 'clockwise' ? 140 : -140);

        return {
          blackHole: bh,
          type: 'push',
          throwVx: pushVx,
          throwVy: pushVy,
          message: 'GRAVITATIONAL TURBULENCE: PUSHED!'
        };
      }
    }
  }
  return null;
}
