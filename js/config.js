/* Game-wide constants */
const G = {
  W: 480,
  H: 854,

  WALL_X: 240,       // center x of dividing wall
  WALL_W: 36,        // wall thickness in pixels

  CLIMB_SPEED: 130,  // starting auto-scroll speed (px/s)
  SCROLL_ACCEL: 2.5, // acceleration (px/s²)
  SCROLL_MAX: 290,   // max scroll speed
  STUN_GRAVITY: 750, // downward accel while stunned
  MOVE_VX: 200,      // lateral speed on tap

  TETHER_Y_MAX: 200, // max Y-distance before tether snaps trailing player up

  TILE: 32,
  WORLD_H: 12000,
  SUMMIT_Y: 300,     // world-Y of summit finish line

  // Platform generation
  GAP_Y_MIN: 88,
  GAP_Y_MAX: 130,
  PLATFORM_W_MIN: 2, // tiles
  PLATFORM_W_MAX: 5,

  // Difficulty thresholds (metres climbed)
  DIFF: [0, 150, 350, 600, 900],
};
