
export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  score: number;
  bullets: Bullet[];
  lastShot: number;
}

export interface Bullet extends Entity {
  damage: number;
}

export interface Enemy extends Entity {
  type: 'scout' | 'interceptor' | 'bomber';
  health: number;
  color: string;
}

export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  level: number;
  commanderMessage: string;
  commanderStatus: 'idle' | 'thinking' | 'talking';
}

export type MoveDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;
