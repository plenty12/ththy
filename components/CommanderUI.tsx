
import React from 'react';

interface CommanderUIProps {
  message: string;
  status: 'idle' | 'thinking' | 'talking';
}

const CommanderUI: React.FC<CommanderUIProps> = ({ message, status }) => {
  return (
    <div className="fixed bottom-10 right-10 w-96 bg-slate-900/90 border-2 border-blue-500/50 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className={`w-16 h-16 rounded-lg bg-blue-900/50 border border-blue-400 flex items-center justify-center overflow-hidden ${status === 'talking' ? 'animate-pulse' : ''}`}>
             {/* AI Avatar Placeholder */}
             <svg viewBox="0 0 24 24" className="w-10 h-10 text-blue-400 fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
             </svg>
          </div>
          {status === 'thinking' && (
            <div className="absolute -top-1 -right-1">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="text-xs font-orbitron text-blue-400 mb-1 flex justify-between">
            <span>TACTICAL COMMANDER</span>
            <span className="opacity-50">{status.toUpperCase()}</span>
          </div>
          <div className="text-sm text-slate-100 font-medium leading-relaxed italic">
            "{message}"
          </div>
        </div>
      </div>
      
      {/* Audio Visualizer Mock */}
      <div className="mt-3 flex gap-0.5 h-4 items-end justify-center opacity-30">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-blue-400" 
            style={{ 
              height: status === 'talking' ? `${Math.random() * 100}%` : '10%',
              transition: 'height 0.1s ease-in-out'
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default CommanderUI;
