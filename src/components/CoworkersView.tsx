import React, { useState } from 'react';
import { WorkShift, UserSettings } from '../types';
import { formatFriendlyDate, USER_ALLIES, DEFAULT_ALLIES } from '../services/storage';
import { Users, Search, Plus, Calendar, Clock, Star, Trash2, CheckCircle2 } from 'lucide-react';

interface CoworkersViewProps {
  shifts: WorkShift[];
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onOpenModal: (date: string) => void;
}

export const CoworkersView: React.FC<CoworkersViewProps> = ({
  shifts,
  settings,
  onUpdateSettings,
  onOpenModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoworker, setSelectedCoworker] = useState<string | null>(null);
  const [newCoworkerName, setNewCoworkerName] = useState('');

  // Clean out any legacy mock names or separate obsolete entries
  const oldMockNames = new Set([
    'Carlos Méndez',
    'Juan Pérez',
    'Ana Gómez',
    'Roberto Silva',
    'Solo / Turno individual',
    'David',
    'Rosas',
  ]);

  // Only the user's 15 allies (and any custom ones added by user)
  const allAllies = Array.from(new Set([
    ...USER_ALLIES,
    ...(settings.frequentCoworkers || []).filter(n => !oldMockNames.has(n)),
  ]));

  // Aggregate stats per ally from all shifts
  const coworkerStatsMap: Record<string, { days: number; hours: number; lastDate: string; shifts: WorkShift[] }> = {};

  // Initialize with all known allies
  allAllies.forEach(name => {
    coworkerStatsMap[name] = { days: 0, hours: 0, lastDate: '', shifts: [] };
  });

  shifts.forEach((shift) => {
    const partner = shift.coworker?.trim() || 'Solo / Sin aliado';
    if (oldMockNames.has(partner)) return; // skip legacy mock names
    if (!coworkerStatsMap[partner]) {
      coworkerStatsMap[partner] = { days: 0, hours: 0, lastDate: shift.date, shifts: [] };
    }
    coworkerStatsMap[partner].days += 1;
    coworkerStatsMap[partner].hours += shift.hoursWorked;
    coworkerStatsMap[partner].shifts.push(shift);
    if (!coworkerStatsMap[partner].lastDate || shift.date > coworkerStatsMap[partner].lastDate) {
      coworkerStatsMap[partner].lastDate = shift.date;
    }
  });

  const coworkerList = Object.entries(coworkerStatsMap)
    .filter(([name]) => !oldMockNames.has(name))
    .map(([name, data]) => ({
      name,
      days: data.days,
      hours: Number(data.hours.toFixed(2)),
      lastDate: data.lastDate,
      shifts: data.shifts.sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.days - a.days || a.name.localeCompare(b.name));

  const handleAddFrequent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCoworkerName.trim();
    if (!name) return;
    if (!settings.frequentCoworkers.includes(name)) {
      const updated = {
        ...settings,
        frequentCoworkers: [...settings.frequentCoworkers, name],
      };
      onUpdateSettings(updated);
    }
    setNewCoworkerName('');
  };

  const handleRemoveFrequent = (name: string) => {
    const updated = {
      ...settings,
      frequentCoworkers: settings.frequentCoworkers.filter(n => n !== name),
    };
    onUpdateSettings(updated);
  };

  return (
    <div className="space-y-4">
      {/* Search and header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <span>Control de Aliados de Trabajo</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Revisa con qué aliado has trabajado cada día y tus estadísticas conjuntas.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar aliado por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Default Allies Quick Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Tus Aliados Disponibles ({allAllies.length}):</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {allAllies.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedCoworker(selectedCoworker === name ? null : name)}
              className={`text-left p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                selectedCoworker === name
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
              }`}
            >
              <span className="truncate">{name}</span>
              <span className="text-[10px] opacity-75 ml-1">
                {coworkerStatsMap[name]?.days || 0}d
              </span>
            </button>
          ))}
        </div>

        {/* Add another ally form */}
        <form onSubmit={handleAddFrequent} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            placeholder="Agregar otro aliado nuevo..."
            value={newCoworkerName}
            onChange={(e) => setNewCoworkerName(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </form>
      </div>

      {/* Aliados Summary Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Historial por Aliado ({coworkerList.length}):
        </h4>

        {coworkerList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
            No se encontraron aliados con ese nombre.
          </div>
        ) : (
          coworkerList.map((coworker) => {
            const isExpanded = selectedCoworker === coworker.name;

            return (
              <div
                key={coworker.name}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                      {coworker.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {coworker.name}
                      </h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Última vez juntos: {formatFriendlyDate(coworker.lastDate)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-sky-600 dark:text-sky-400">
                      {coworker.hours} hrs
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {coworker.days} día{coworker.days !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Toggle details */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => setSelectedCoworker(isExpanded ? null : coworker.name)}
                    className="text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Ocultar turnos' : `Ver ${coworker.shifts.length} turno(s) trabajados`}</span>
                  </button>
                </div>

                {/* Expanded list of shifts */}
                {isExpanded && (
                  <div className="space-y-1.5 pt-1">
                    {coworker.shifts.map((shift) => (
                      <div
                        key={shift.id}
                        onClick={() => onOpenModal(shift.date)}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                            {formatFriendlyDate(shift.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 dark:text-slate-400">
                            {shift.startTime} - {shift.endTime}
                          </span>
                          <span className="font-bold text-sky-600 dark:text-sky-400">
                            {shift.hoursWorked}h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
