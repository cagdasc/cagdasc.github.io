export const GAME_CONFIG = {
  // World & Viewport defaults
  CANVAS_VIRTUAL_HEIGHT: 720,
  ASPECT_RATIO_MIN: 4 / 3,

  // Physics
  GRAVITY: 820, // px / s^2 downward acceleration
  UPWARD_IMPULSE: -340, // px / s instantaneous impulse on tap / space
  MAX_FALL_SPEED: 520, // px / s terminal fall velocity
  MAX_RISE_SPEED: -460, // px / s maximum ascent velocity
  ROTATION_FACTOR: 0.0016, // Radians per vertical velocity
  SQUASH_TAKEOFF: { x: 0.91, y: 1.09 },
  SQUASH_RECOVERY_RATE: 6.5, // Rapid spring recovery so it maintains a circular spherical shape

  // Hold-Duration Variable Gravity Experiments
  VARIABLE_GRAVITY_ON_HOLD: true, // Enabled so user can immediately test!
  HOLD_GRAVITY_MODE: 'progressive_float' as const, // 'progressive_float' | 'progressive_heavy' | 'dampened_arc' | 'jetpack_thruster'
  HOLD_MAX_DURATION: 0.45, // Seconds of hold influence window
  HOLD_GRAVITY_MULTIPLIER: 0.22, // 22% of normal gravity at peak hold
  HOLD_THRUST_POWER: 650, // px / s^2 counter-thrust acceleration for jetpack mode

  // Asteroid Dimensions
  ASTEROID_RADIUS: 14, // Collision radius
  ASTEROID_VISUAL_RADIUS: 18, // Visual outline radius
  ASTEROID_SCREEN_X_PERCENT: 0.22, // Player stays around 22% from left

  // Difficulty & Progression
  BASE_SCROLL_SPEED: 180, // px / s
  MAX_SCROLL_SPEED: 350, // px / s
  SPEED_RAMP_DISTANCE: 40000,
  YEARS_PER_WORLD_UNIT: 220,

  // Cave Corridors - Increased base and min heights so it is comfortably playable
  TERRAIN_SEGMENT_WIDTH: 45,
  CORRIDOR_BASE_HEIGHT: 330, // Default wider cave passage
  CORRIDOR_MIN_HEIGHT: 230, // Guaranteed minimum passage height
  CORRIDOR_VERTICAL_MARGIN: 35,
  MAX_SLOPE_DELTA: 45,
  CAVE_FLUCTUATION_AMPLITUDE: 75, // Rich vertical cave wave undulation
  CAVE_FLUCTUATION_FREQUENCY: 0.0032, // Wavelength for harmonic fluctuation

  // Wormholes & Black Holes
  WORMHOLE_RADIUS: 36,
  WORMHOLE_BONUS_YEARS: 2_500_000, // Teleport bonus years
  WORMHOLE_TELEPORT_DISTANCE: 1400, // Distance px skipped forward
  WORMHOLE_SPAWN_CHANCE: 0.40,

  BLACKHOLE_SINGULARITY_RADIUS: 20,
  BLACKHOLE_ACCRETION_RADIUS: 58,
  BLACKHOLE_SLINGSHOT_SPEED_BOOST: 1.75,
  BLACKHOLE_SAFE_CLEAR_DISTANCE: 850, // Pixels cleared after slingshot exit to guarantee player safety
  BLACKHOLE_SPAWN_CHANCE: 0.35,

  // Obstacle Spawning
  MIN_OBSTACLE_DISTANCE: 420,
  PLANET_MIN_RADIUS: 24,
  PLANET_MAX_RADIUS: 46,

  // Juice & Feedback
  HITSTOP_DURATION: 0.07,
  SHAKE_DECAY: 6.0,
  TRAIL_PARTICLES_PER_SECOND: 65,

  // Result messages
  END_MESSAGES: [
    "A brief geological event.",
    "Extinction avoided. This time.",
    "You survived 65 million years.",
    "Space-time remains unconvinced.",
    "A minor crater in cosmic history.",
    "Dinosaurs watched you pass by.",
    "The Cretaceous barrier proved fatal.",
    "Chronological trajectory terminated.",
    "Relic of a prehistoric epoch."
  ] as const
};
