import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Wifi, WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/90 border border-slate-700/80 shadow-sm text-slate-300">
      {isOnline ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">100% Local</span>
          <Wifi className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-amber-300">Modo Offline Activo</span>
          <WifiOff className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
        </>
      )}
    </div>
  );
};
