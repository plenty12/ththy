
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const PLAYER_SIZE = 50;
export const PLAYER_SPEED = 6;
export const PLAYER_MAX_HEALTH = 100;

export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 15;
export const BULLET_SPEED = 10;
export const FIRE_RATE = 150; // ms

export const ENEMY_TYPES = {
  scout: { width: 40, height: 40, speed: 3, health: 1, color: '#22d3ee' },
  interceptor: { width: 50, height: 50, speed: 2, health: 3, color: '#818cf8' },
  bomber: { width: 70, height: 60, speed: 1, health: 10, color: '#f472b6' }
};

export const COLORS = {
  player: '#10b981',
  bullet: '#fbbf24',
  background: '#020617'
};
