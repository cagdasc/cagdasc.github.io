import { GAME_CONFIG } from './GameConfig';

export interface DifficultyState {
  scrollSpeed: number;
  corridorHeight: number;
  obstacleSpacing: number;
  planetSpawnChance: number;
  dinoSpawnChance: number;
  hazardDinoRatio: number;
  difficultyProgress: number; // 0.0 to 1.0
}

export function calculateDifficulty(distancePx: number): DifficultyState {
  const safeDistance = Math.max(0, distancePx || 0);
  // Ease-out progress 0 to 1 over SPEED_RAMP_DISTANCE
  const rawProgress = Math.min(1, safeDistance / GAME_CONFIG.SPEED_RAMP_DISTANCE);
  // Smoothstep easing for gentle early game and controlled late game ramp
  const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);

  const scrollSpeed = GAME_CONFIG.BASE_SCROLL_SPEED + 
    (GAME_CONFIG.MAX_SCROLL_SPEED - GAME_CONFIG.BASE_SCROLL_SPEED) * progress;

  const corridorHeight = GAME_CONFIG.CORRIDOR_BASE_HEIGHT - 
    (GAME_CONFIG.CORRIDOR_BASE_HEIGHT - GAME_CONFIG.CORRIDOR_MIN_HEIGHT) * progress;

  // Obstacle spacing tightens slightly as difficulty increases, but never below safe reaction time
  const obstacleSpacing = Math.max(
    GAME_CONFIG.MIN_OBSTACLE_DISTANCE,
    580 - progress * 160
  );

  // Chance of spawning planets vs dinosaurs
  const planetSpawnChance = 0.65;
  const dinoSpawnChance = 0.55;

  // Portion of dinosaurs that act as physical obstacles vs purely decorative cosmic comedy
  // Starts at 0% for first 1500px, slowly climbs to at most 30%
  const hazardDinoRatio = safeDistance > 2000 ? Math.min(0.28, (safeDistance - 2000) / 30000 * 0.28) : 0;

  return {
    scrollSpeed,
    corridorHeight,
    obstacleSpacing,
    planetSpawnChance,
    dinoSpawnChance,
    hazardDinoRatio,
    difficultyProgress: progress
  };
}
