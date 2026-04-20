/* Game-wide constants */
const G = {
  W: 480,
  H: 854,

  WALL_X: 240,       // center x of dividing wall
  WALL_W: 36,        // wall thickness in pixels

  GRAVITY: 900,
  JUMP_VY: -560,     // vertical velocity on jump
  MOVE_VX: 170,      // horizontal speed on jump

  TETHER_Y_MAX: 240, // max Y-distance before tether tugs trailing player
  TETHER_PULL: 280,  // upward force applied to trailing player when taut

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
