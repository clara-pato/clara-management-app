"use client";

import { useEffect, useState, useRef } from "react";

type SystemState = {
  mood: string;
  message: string;
  current_task_id: string;
  activities: string[];
  lockedUntil: number;
  logs: string[];
};

const ANIMATIONS: Record<string, { frames: string[], speed: number }> = {
  idle: { frames: ["( -_-)", "( -_-)", "( -_-)", "( o_o)", "( -_-)"], speed: 1000 },
  working: { frames: ["(⌐■_■) _", "(⌐■_■) ░", "(⌐■_■) ▒", "(⌐■_■) ▓"], speed: 250 },
  thinking: { frames: ["( •_• )", "(  •_•)", "(   •_•)", "(  •_•)", "( •_• )", "(•_•  )", "(•_•   )", "(•_•  )"], speed: 400 },
  excited: { frames: ["(*^▽^*)", "(*^o^*)"], speed: 400 },
  blocked: { frames: ["(>_<)", "(x_x)"], speed: 200 },
  spawning_agent: { frames: ["(•_•)  ", "(•_•)>⌐", "(⌐■_■) "], speed: 600 },
  waiting_for_input: { frames: ["(O_O)", "(o_o)", "(-_-)", "(o_o)"], speed: 500 },
  default: { frames: ["(•_•)"], speed: 1000 }
};

function AnimatedEmoticon({ mood = "idle" }: { mood?: string }) {
  const [frameIdx, setFrameIdx] = useState(0);
  const normalizedMood = mood ? mood.toLowerCase() : "idle";
  const anim = ANIMATIONS[normalizedMood] || ANIMATIONS.default;

  useEffect(() => {
    setFrameIdx(0);
    const interval = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % anim.frames.length);
    }, anim.speed);
    return () => clearInterval(interval);
  }, [normalizedMood, anim]);

  let colorClass = "text-[#f5f1e3]";
  if (normalizedMood === "blocked") colorClass = "text-red-500 animate-pulse";
  else if (normalizedMood === "excited") colorClass = "text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]";
  else if (normalizedMood === "working") colorClass = "text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]";
  else if (normalizedMood === "thinking") colorClass = "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]";
  else colorClass = "text-[#f5f1e3] drop-shadow-[0_0_10px_rgba(245,241,227,0.4)]";

  return (
    <pre className={`text-[120px] sm:text-[200px] md:text-[280px] leading-none font-bold text-center tracking-tighter transition-colors duration-300 ${colorClass}`}>
      {anim.frames[frameIdx]}
    </pre>
  );
}

export default function Dashboard() {
  const [state, setState] = useState<SystemState>({
    mood: "idle",
    message: "AWAITING ACTIVITY",
    current_task_id: "none",
    activities: ["AWAITING ACTIVITY"],
    lockedUntil: 0,
    logs: []
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.logs]);

  useEffect(() => {
    const sse = new EventSource('/api/stream');
    
    sse.onopen = () => {
      setIsConnected(true);
    };

    sse.onerror = () => {
      setIsConnected(false);
      setState(prev => ({
        ...prev,
        mood: "blocked",
        message: "RECONNECTING...",
      }));
    };
    
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'res' && data.id === 'stat_req' && data.result) {
          const tasks = data.result.tasks || [];
          const sessions = data.result.activeSessions || [];
          const now = Date.now();

          if (tasks.length > 0) {
            const activeTask = tasks[0];
            let newMood = "working";
            const newMessage = activeTask.description || activeTask.name || "Processing Task...";
            const newTaskId = activeTask.id || "active";
            
            if (activeTask.state === "thinking" || newMessage.toLowerCase().includes("[thinking]")) {
               newMood = "thinking";
            }

            setState(prev => {
              const isLocked = now < prev.lockedUntil;
              return {
                ...prev,
                mood: isLocked ? prev.mood : newMood,
                message: isLocked ? prev.message : newMessage,
                current_task_id: newTaskId
              };
            });
          } else {
            setState(prev => {
              const isLocked = now < prev.lockedUntil;
              const hasSessions = sessions.length > 0;
              return {
                ...prev,
                mood: isLocked ? prev.mood : (hasSessions ? "waiting_for_input" : "idle"),
                message: isLocked ? prev.message : (hasSessions ? "SESSION ACTIVE" : "SYSTEM ONLINE"),
                current_task_id: "none"
              };
            });
          }
        } else if (data.type === 'res' && data.id === 'log_req' && data.result) {
          const lines = data.result.lines || [];
          setState(prev => ({
            ...prev,
            logs: lines
          }));
        }
      } catch (err) {}
    };

    return () => {
      sse.close();
    };
  }, []);

  const mood = !isConnected ? "blocked" : (state?.mood || "idle");
  const line1 = !isConnected ? "RECONNECTING..." : (state?.message === "AWAITING ACTIVITY" && state.logs.length > 0 ? "SYSTEM ONLINE" : state?.message || "SYSTEM ONLINE");
  const line2 = state?.current_task_id && state.current_task_id !== "none" 
    ? `[TASK]: ${state.current_task_id}` 
    : "[TASK]: AWAITING ASSIGNMENT";
  
  let sysStatus = "[SYS]: ALL SYSTEMS GO";
  if (!isConnected) sysStatus = "[SYS]: CONNECTION LOST";
  else if (mood === "blocked") sysStatus = "[SYS]: ERROR DETECTED";
  else if (mood === "working") sysStatus = "[SYS]: PROCESSING...";

  return (
    <div className="relative flex flex-col h-full w-full bg-[#0B162C] text-[#f5f1e3] font-mono overflow-hidden selection:bg-[#f5f1e3] selection:text-[#0B162C]">
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-30"></div>
      
      {/* Main Content Area - Emoticon centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pb-[30vh]">
        <AnimatedEmoticon mood={mood} />
      </div>
      
      {/* Logs Terminal Overlay - Professional Auto-scrolling */}
      <div className="absolute bottom-16 md:bottom-20 left-0 w-full px-4 md:px-6 z-20 h-[35vh] md:h-[40vh]">
        <div className="max-w-screen-2xl mx-auto h-full flex flex-col justify-end">
          <div className="w-full h-full bg-[#050A15]/90 border border-[#f5f1e3]/20 rounded-md overflow-hidden flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-sm relative">
            {/* Terminal Header */}
            <div className="bg-[#0f1b33] border-b border-[#f5f1e3]/20 px-4 py-2 flex items-center justify-between text-xs text-[#f5f1e3]/60 select-none">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={isConnected ? "text-green-400" : "text-red-500 animate-pulse"}>●</span>
                clara-os // tail -f /var/log/system.log
              </div>
            </div>
            
            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#f5f1e3]/20 text-[11px] sm:text-[12px] md:text-[14px] leading-tight md:leading-normal font-mono">
              {!isConnected && (
                <div className="text-red-400 opacity-80 mb-2 font-bold">&gt; FATAL: Connection to RPC server lost. Attempting to reconnect...</div>
              )}
              {isConnected && state.logs.length === 0 && (
                <div className="text-[#f5f1e3]/50 mb-2">&gt; Connection established. Awaiting telemetry...</div>
              )}
              {state.logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap break-words mb-1 text-[#f5f1e3]/90 hover:bg-white/5 px-1 -mx-1 rounded transition-colors">
                  <span className="text-green-400 mr-2 select-none">$</span>{log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-[#080d1a] border-t-2 border-[#f5f1e3]/20 h-16 md:h-20 flex flex-col justify-center px-4 md:px-6 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex flex-row justify-between items-center max-w-screen-2xl mx-auto text-[14px] sm:text-[18px] md:text-[24px] font-bold drop-shadow-[0_0_5px_rgba(245,241,227,0.3)] gap-2 md:gap-6 w-full">
          <div className="flex-1 truncate w-full flex items-center">
            <span className="text-[#f5f1e3]/60 mr-3 animate-pulse">&gt;</span>
            <span className={`truncate ${mood === "working" ? "text-blue-300" : ""}`}>{line1}</span>
          </div>
          
          <div className="flex-none flex items-center md:justify-end gap-6 border-t md:border-t-0 border-[#f5f1e3]/10 pt-2 md:pt-0 mt-2 md:mt-0">
            <span className="text-yellow-200/80 uppercase">{line2}</span>
            <span className={mood === "blocked" ? "text-red-500 animate-pulse" : "text-[#f5f1e3]/70"}>
              {sysStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Subtle vignette/glow */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-40"></div>
    </div>
  );
}
