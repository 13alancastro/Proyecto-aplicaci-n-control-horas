import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ showLabel?: boolean; className?: string }> = ({ showLabel = false, className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all flex items-center gap-2 ${
        theme === 'dark'
          ? 'bg-slate-800/80 text-amber-300 hover:bg-slate-700/80 hover:text-amber-200 border border-slate-700/60'
          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'
      } ${className}`}
      title={theme === 'dark' ? 'Cambiar a tema Blanco / Claro' : 'Cambiar a tema Negro / Oscuro'}
      aria-label="Alternar tema claro y oscuro"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-300 transition-transform active:rotate-45" />
          {showLabel && <span className="text-xs font-medium text-slate-200">Tema Claro</span>}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600 transition-transform active:-rotate-45" />
          {showLabel && <span className="text-xs font-medium text-slate-700">Tema Oscuro</span>}
        </>
      )}
    </button>
  );
};
