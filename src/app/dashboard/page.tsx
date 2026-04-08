"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SystemState = {
  id: number;
  emoticon: string;
  message: string;
  current_task: string;
  line3?: string;
  line4?: string;
};

export default function Dashboard() {
  const [state, setState] = useState<SystemState | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const { data, error } = await supabase
          .from("system_state")
          .select("*")
          .order("id", { ascending: false })
          .limit(1)
          .single();
        
        if (data) setState(data);
      } catch (err) {
        console.error("Failed to fetch state:", err);
      }
    };

    fetchState();

    // Polling every 5 seconds
    const interval = setInterval(fetchState, 5000);

    return () => clearInterval(interval);
  }, []);

  // Default values if no data
  const emoticon = state?.emoticon || "(O_O)";
  const line1 = state?.message || "SYSTEM ONLINE";
  const line2 = state?.current_task || "IDLE";
  const line3 = state?.line3 || "AWAITING INPUT";
  const line4 = state?.line4 || "ALL SYSTEMS GO";

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B162C] text-[#f5f1e3] font-mono overflow-hidden">
      <div className="flex-1 flex flex-col p-6 w-full max-w-[480px] h-full max-h-[800px] mx-auto justify-between">
        
        <div className="flex-1 flex items-center justify-center">
          <pre className="text-8xl leading-none font-bold text-center tracking-tighter">
            {emoticon}
          </pre>
        </div>
        
        <div className="flex-none mb-4 text-[22px] leading-relaxed space-y-4 font-bold">
          <p className="truncate border-b-2 border-[#f5f1e3]/30 pb-2">&gt; {line1}</p>
          <p className="truncate border-b-2 border-[#f5f1e3]/30 pb-2">&gt; {line2}</p>
          <p className="truncate border-b-2 border-[#f5f1e3]/30 pb-2">&gt; {line3}</p>
          <p className="truncate border-b-2 border-[#f5f1e3]/30 pb-2">&gt; {line4}</p>
        </div>

      </div>
    </div>
  );
}