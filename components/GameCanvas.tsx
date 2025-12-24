
import React, { useRef, useEffect, useCallback } from 'react';
import { 
  PLAYER_SIZE, PLAYER_SPEED, BULLET_WIDTH, BULLET_HEIGHT, BULLET_SPEED, 
  FIRE_RATE, ENEMY_TYPES, COLORS 
} from '../constants';
import { Player, Enemy, Bullet, GameState } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onEvent: (event: string, score: number, health: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState, onEvent }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player>({
    x: 0, y: 0, width: PLAYER_SIZE, height: PLAYER_SIZE,
    speed: PLAYER_SPEED, health: 100, maxHealth: 100, score: 0,
    bullets: [], lastShot: 0
  });
  const enemiesRef = useRef<Enemy[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const animationFrameRef = useRef<number>();
  const lastLevelRef = useRef<number>(1);

  // Initialize player position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      playerRef.current.x = canvas.width / 2 - PLAYER_SIZE / 2;
      playerRef.current.y = canvas.height - PLAYER_SIZE - 20;
    }
  }, []);

  const spawnEnemy = useCallback(() => {
    if (!canvasRef.current || !gameState.isPlaying) return;
    
    const rand = Math.random();
    let type: 'scout' | 'interceptor' | 'bomber' = 'scout';
    if (rand > 0.9) type = 'bomber';
    else if (rand > 0.7) type = 'interceptor';

    const config = ENEMY_TYPES[type];
    // Fix: Added the 'type' property to correctly match the Enemy interface
    const newEnemy: Enemy = {
      type: type,
      x: Math.random() * (canvasRef.current.width - config.width),
      y: -config.height,
      ...config
    };
    enemiesRef.current.push(newEnemy);
  }, [gameState.isPlaying]);

  const update = useCallback(() => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    const player = playerRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Move player
    if ((keysRef.current['ArrowLeft'] || keysRef.current['a']) && player.x > 0) player.x -= player.speed;
    if ((keysRef.current['ArrowRight'] || keysRef.current['d']) && player.x < canvas.width - player.width) player.x += player.speed;
    if ((keysRef.current['ArrowUp'] || keysRef.current['w']) && player.y > 0) player.y -= player.speed;
    if ((keysRef.current['ArrowDown'] || keysRef.current['s']) && player.y < canvas.height - player.height) player.y += player.speed;

    // Shooting
    const now = Date.now();
    if (keysRef.current[' '] && now - player.lastShot > FIRE_RATE) {
      player.bullets.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED,
        damage: 1
      });
      player.lastShot = now;
    }

    // Update bullets
    player.bullets = player.bullets.filter(b => {
      b.y -= b.speed;
      return b.y > -b.height;
    });

    // Update enemies
    enemiesRef.current = enemiesRef.current.filter(e => {
      e.y += e.speed;
      
      // Collision with bullets
      player.bullets = player.bullets.filter(b => {
        const hit = b.x < e.x + e.width && b.x + b.width > e.x &&
                    b.y < e.y + e.height && b.y + b.height > e.y;
        if (hit) {
          e.health -= b.damage;
          return false;
        }
        return true;
      });

      if (e.health <= 0) {
        player.score += (e.type === 'bomber' ? 100 : e.type === 'interceptor' ? 50 : 20);
        return false;
      }

      // Collision with player
      const crash = player.x < e.x + e.width && player.x + player.width > e.x &&
                    player.y < e.y + e.height && player.y + player.height > e.y;
      if (crash) {
        player.health -= 20;
        onEvent("적기와 충돌했습니다!", player.score, player.health);
        return false;
      }

      return e.y < canvas.height;
    });

    // Level progression
    const currentLevel = Math.floor(player.score / 1000) + 1;
    if (currentLevel > lastLevelRef.current) {
      lastLevelRef.current = currentLevel;
      setGameState(prev => ({ ...prev, level: currentLevel }));
      onEvent(`레벨 ${currentLevel} 도달! 전투 강도가 높아집니다.`, player.score, player.health);
    }

    // Check game over
    if (player.health <= 0) {
      setGameState(prev => ({ ...prev, isGameOver: true, isPlaying: false }));
      onEvent("기체가 파괴되었습니다. 임무 실패.", player.score, 0);
    }

    // Enemy Spawning logic
    if (Math.random() < 0.02 + (gameState.level * 0.005)) {
      spawnEnemy();
    }
  }, [gameState.isPlaying, gameState.isGameOver, gameState.level, spawnEnemy, setGameState, onEvent]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Starfield Background effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * ctx.canvas.width, (Date.now() / 20 + i * 50) % ctx.canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const player = playerRef.current;
    
    // Draw Bullets
    ctx.fillStyle = COLORS.bullet;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.bullet;
    player.bullets.forEach(b => {
      ctx.fillRect(b.x, b.y, b.width, b.height);
    });
    ctx.shadowBlur = 0;

    // Draw Player
    ctx.fillStyle = COLORS.player;
    // Simple fighter shape
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height * 0.8);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    // Engine glow
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height, 5 + Math.random() * 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw Enemies
    enemiesRef.current.forEach(e => {
      ctx.fillStyle = e.color;
      ctx.shadowBlur = 5;
      ctx.shadowColor = e.color;
      
      if (e.type === 'bomber') {
        ctx.fillRect(e.x, e.y, e.width, e.height);
      } else {
        ctx.beginPath();
        ctx.moveTo(e.x + e.width / 2, e.y + e.height);
        ctx.lineTo(e.x + e.width, e.y);
        ctx.lineTo(e.x, e.y);
        ctx.closePath();
        ctx.fill();
      }
    });
    ctx.shadowBlur = 0;
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      update();
      draw(ctx);
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameLoop]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="border-4 border-slate-800 rounded-lg shadow-2xl shadow-blue-500/20"
      />
      
      {/* HUD Overlays within the canvas area */}
      <div className="absolute top-10 left-10 pointer-events-none flex flex-col gap-2">
        <div className="text-emerald-400 font-orbitron text-xl">SCORE: {playerRef.current.score}</div>
        <div className="w-48 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300" 
            style={{ width: `${Math.max(0, playerRef.current.health)}%` }}
          />
        </div>
      </div>
      
      <div className="absolute top-10 right-10 pointer-events-none">
        <div className="text-blue-400 font-orbitron text-xl">LEVEL {gameState.level}</div>
      </div>
    </div>
  );
};

export default GameCanvas;
