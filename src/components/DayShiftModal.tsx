import React, { useState, useEffect } from 'react';
import { WorkShift, RestDay, UserSettings } from '../types';
import { calculateShiftHours, formatFriendlyDate, formatDate, USER_ALLIES, DEFAULT_ALLIES } from '../services/storage';
import { X, Clock, Coffee, Users, Calendar, Trash2, CheckCircle2, Moon, Sun, Palmtree, Briefcase, Check } from 'lucide-react';

interface DayShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  existingShift?: WorkShift;
  existingRest?: RestDay;
  settings: UserSettings;
  onSaveShift: (shift: WorkShift) => void;
  onSaveRestDay: (restDay: RestDay) => void;
  onDeleteShift?: (shiftId: string) => void;
  onDeleteRestDay?: (date: string) => void;
}

export const DayShiftModal: React.FC<DayShiftModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  existingShift,
  existingRest,
  settings,
  onSaveShift,
  onSaveRestDay,
  onDeleteShift,
  onDeleteRestDay,
}) => {
  const [mode, setMode] = useState<'work' | 'rest'>('work');
  const [selectedDate, setSelectedDate] = useState<string>(dateStr);

  // Work form states
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('16:30');
  const [breakMinutes, setBreakMinutes] = useState<number>(60);
  const [coworker, setCoworker] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Rest form states
  const [restReason, setRestReason] = useState<string>('Descanso acordado');
  const [deductHours, setDeductHours] = useState<number>(settings.restDayDeductionHours || 8);

  useEffect(() => {
    setSelectedDate(dateStr);
    if (existingRest) {
      setMode('rest');
      setRestReason(existingRest.reason || 'Descanso programado');
      setDeductHours(existingRest.deductHours || settings.restDayDeductionHours || 8);
    } else if (existingShift) {
      setMode('work');
      setStartTime(existingShift.startTime);
      setEndTime(existingShift.endTime);
      setBreakMinutes(existingShift.breakMinutes);
      setCoworker(existingShift.coworker || '');
      setNotes(existingShift.notes || '');
    } else {
      // Default initial
      setMode('work');
      setStartTime('08:00');
      setEndTime('16:30');
      setBreakMinutes(60);
      setCoworker(settings.frequentCoworkers[0] || '');
      setNotes('');
      setRestReason('Descanso semanal');
      setDeductHours(settings.restDayDeductionHours || 8);
    }
  }, [dateStr, existingShift, existingRest, settings]);

  if (!isOpen) return null;

  const currentHours = calculateShiftHours(startTime, endTime, breakMinutes);

  const applyPreset = (start: string, end: string, bMin: number) => {
    setStartTime(start);
    setEndTime(end);
    setBreakMinutes(bMin);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'work') {
      const shift: WorkShift = {
        id: existingShift?.id || `shift-${selectedDate}-${Date.now()}`,
        date: selectedDate,
        startTime,
        endTime,
        breakMinutes,
        hoursWorked: currentHours,
        coworker: coworker.trim() || 'Solo / Sin compañero',
        notes: notes.trim(),
      };
      // If there was an existing rest day on this date, remove it
      if (existingRest && onDeleteRestDay) {
        onDeleteRestDay(selectedDate);
      }
      onSaveShift(shift);
    } else {
      const rest: RestDay = {
        date: selectedDate,
        type: 'custom',
        reason: restReason.trim() || 'Día de descanso',
        deductHours: Number(deductHours) || 8,
      };
      // If there was an existing shift on this date, remove it
      if (existingShift && onDeleteShift) {
        onDeleteShift(existingShift.id);
      }
      onSaveRestDay(rest);
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingShift && onDeleteShift) {
      onDeleteShift(existingShift.id);
    }
    if (existingRest && onDeleteRestDay) {
      onDeleteRestDay(selectedDate);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 my-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Registro del Día
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white capitalize">
              {formatFriendlyDate(selectedDate)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector if user wants to change date */}
        <div className="mt-3 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-500" /> Fecha del registro:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Mode Selector (Trabajo vs Descanso) */}
        <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMode('work')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              mode === 'work'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Jornada Trabajada</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('rest')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              mode === 'rest'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palmtree className="w-4 h-4" />
            <span>Día de Descanso</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {mode === 'work' ? (
            <>
              {/* Presets */}
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                  Plantillas rápidas de turno:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset('08:00', '16:30', 60)}
                    className="p-1.5 text-[11px] text-center font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700/60 transition"
                  >
                    Estándar 8h (08-16:30)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('07:00', '19:00', 60)}
                    className="p-1.5 text-[11px] text-center font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700/60 transition"
                  >
                    12 Horas (07-19)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('06:00', '14:00', 30)}
                    className="p-1.5 text-[11px] text-center font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700/60 transition"
                  >
                    Mañana (06-14)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('22:00', '06:00', 30)}
                    className="p-1.5 text-[11px] text-center font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700/60 transition"
                  >
                    Noche (22-06)
                  </button>
                </div>
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-sky-500" /> Hora Entrada
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> Hora Salida
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Break Minutes */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-500" /> Tiempo de Almuerzo / Comida:
                  </label>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{breakMinutes} minutos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0, 15, 30, 45, 60, 90].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => setBreakMinutes(mins)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                        breakMinutes === mins
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {mins === 0 ? 'Sin receso' : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Hours Computed Banner */}
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-sky-800 dark:text-sky-300 font-medium">Total Horas Laboradas:</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Calculadas restando {breakMinutes} min de descanso
                  </div>
                </div>
                <div className="text-2xl font-black text-sky-600 dark:text-sky-400 tracking-tight">
                  {currentHours} <span className="text-sm font-semibold">hrs</span>
                </div>
              </div>

              {/* Aliado Selection with buttons for each name */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>¿Con qué aliado trabajas hoy?</span>
                  </label>
                  {coworker && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      Seleccionado: {coworker}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Toca el botón con el nombre del aliado para asignarlo directamente a este día:
                </p>

                {/* Grid of buttons with each default ally */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  {/* Option for Solo */}
                  <button
                    type="button"
                    onClick={() => setCoworker('Solo / Sin aliado')}
                    className={`p-2 text-left text-xs font-medium rounded-lg border transition-all flex items-center justify-between ${
                      coworker === 'Solo / Sin aliado'
                        ? 'bg-sky-500 text-white border-sky-500 shadow-sm font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>Solo / Sin aliado</span>
                    {coworker === 'Solo / Sin aliado' && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>

                  {/* User's exact 14 allies */}
                  {Array.from(new Set([
                    ...USER_ALLIES,
                    ...(settings.frequentCoworkers || []).filter(n => !['Carlos Méndez', 'Juan Pérez', 'Ana Gómez', 'Roberto Silva', 'Solo / Turno individual', 'David', 'Rosas'].includes(n))
                  ])).map((name) => {
                    const isSelected = coworker === name;
                    return (
                      <button
                        type="button"
                        key={name}
                        onClick={() => setCoworker(name)}
                        className={`p-2 text-left text-xs font-medium rounded-lg border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold ring-2 ring-emerald-500/30'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                {/* Or custom input */}
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                    O escribe otro nombre si no está en la lista:
                  </label>
                  <input
                    type="text"
                    placeholder="Escribe el nombre del aliado..."
                    value={coworker}
                    onChange={(e) => setCoworker(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Notas u observaciones del día (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: guardia especial, apoyo en sede norte..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </>
          ) : (
            <>
              {/* REST DAY FORM */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <Palmtree className="w-5 h-5 text-emerald-500" />
                  <span>Día de Descanso Programado</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/90 leading-relaxed">
                  Tú decides cuándo descansas. La aplicación marcará este día en tu calendario y restará las horas correspondientes del cálculo mensual.
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Motivo o tipo de descanso:
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {[
                    'Descanso regular semanal',
                    'Día compensatorio',
                    'Día libre acordado',
                    'Permiso / Vacaciones',
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setRestReason(preset)}
                      className={`p-2 text-xs text-left rounded-xl border transition ${
                        restReason === preset
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={restReason}
                  onChange={(e) => setRestReason(e.target.value)}
                  placeholder="Otro motivo..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Deduct hours */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Horas a restar por este descanso:
                  </label>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    -{deductHours} hrs
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Estas horas se descuentan de la carga laboral mensual requerida para calcular tu saldo real.
                </p>
                <div className="flex gap-2">
                  {[4, 6, 8, 10, 12].map((h) => (
                    <button
                      type="button"
                      key={h}
                      onClick={() => setDeductHours(h)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                        deductHours === h
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-2">
            {(existingShift || existingRest) ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Borrar</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 ${
                  mode === 'work'
                    ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar {mode === 'work' ? 'Horas' : 'Descanso'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
