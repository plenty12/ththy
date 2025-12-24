
import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import CommanderUI from './components/CommanderUI';
import { GameState } from './types';
import { getTacticalAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isGameOver: false,
    level: 1,
    commanderMessage: "대기 중입니다. 전투 준비가 되면 시작 버튼을 누르십시오.",
    commanderStatus: 'idle'
  });

  const handleGameEvent = useCallback(async (event: string, score: number, health: number) => {
    setGameState(prev => ({ ...prev, commanderStatus: 'thinking' }));
    const advice = await getTacticalAdvice(event, score, health);
    setGameState(prev => ({ 
      ...prev, 
      commanderMessage: advice,
      commanderStatus: 'talking'
    }));
    
    // Reset status after a delay
    setTimeout(() => {
      setGameState(prev => ({ ...prev, commanderStatus: 'idle' }));
    }, 4000);
  }, []);

  const startGame = () => {
    setGameState({
      isPlaying: true,
      isGameOver: false,
      level: 1,
      commanderMessage: "출격 준비 완료. 행운을 빈다, 조종사.",
      commanderStatus: 'talking'
    });
  };

  const restartGame = () => {
    window.location.reload(); // Simplest way to reset all refs
  };

  return (
    <div className="w-screen h-screen relative bg-slate-950 text-white select-none">
      {/* Menu / Game Over Screen */}
      {(!gameState.isPlaying || gameState.isGameOver) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <h1 className="text-6xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4 tracking-widest">
            SKY GUARDIAN
          </h1>
          <p className="text-slate-400 mb-12 font-medium tracking-wide">THE AI COMMANDER PROTOCOL</p>
          
          {gameState.isGameOver ? (
            <div className="text-center">
              <h2 className="text-4xl font-orbitron text-red-500 mb-8">MISSION FAILED</h2>
              <button 
                onClick={restartGame}
                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                REDEPLOY
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="grid grid-cols-2 gap-8 text-center mb-8">
                <div className="p-4 border border-slate-700 rounded-xl bg-slate-900/50">
                  <div className="text-blue-400 font-orbitron mb-1">WASD / ARROWS</div>
                  <div className="text-xs text-slate-500">NAVIGATION</div>
                </div>
                <div className="p-4 border border-slate-700 rounded-xl bg-slate-900/50">
                  <div className="text-emerald-400 font-orbitron mb-1">SPACE BAR</div>
                  <div className="text-xs text-slate-500">WEAPONS SYSTEM</div>
                </div>
              </div>
              <button 
                onClick={startGame}
                className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-orbitron text-lg rounded-full transition-all hover:scale-110 active:scale-95 shadow-xl shadow-blue-500/30"
              >
                ENGAGE MISSION
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Game Surface */}
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        onEvent={handleGameEvent}
      />

      {/* AI Commander Interface */}
      <CommanderUI 
        message={gameState.commanderMessage} 
        status={gameState.commanderStatus} 
      />

      {/* Visual Decorations */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 opacity-20" />
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 opacity-20" />
    </div>
  );
};

export default App;
