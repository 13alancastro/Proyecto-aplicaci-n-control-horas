import React, { useState } from 'react';
import { WorkShift, RestDay, UserSettings } from '../types';
import { isDateRestDay, formatFriendlyDate, formatDate } from '../services/storage';
import { ChevronLeft, ChevronRight, Palmtree, Briefcase, Plus, Users, Info } from 'lucide-react';

interface CalendarRestViewProps {
  shifts: WorkShift[];
  restDays: RestDay[];
  settings: UserSettings;
  onOpenModal: (date: string) => void;
  onSaveRestDay: (rest: RestDay) => void;
  onDeleteRestDay: (date: string) => void;
}

export const CalendarRestView: React.FC<CalendarRestViewProps> = ({
  shifts,
  restDays,
  settings,
  onOpenModal,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const resetToCurrent = () => {
    setCurrentDate(new Date());
  };

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  // Convert so Monday = 0, ..., Sunday = 6
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Count rest days and worked days in this month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const workedThisMonth = shifts.filter(s => s.date.startsWith(monthPrefix)).length;

  let restThisMonth = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
    const restInfo = isDateRestDay(dStr, restDays, settings.defaultRestDaysOfWeek);
    const hasWork = shifts.some(s => s.date === dStr);
    if (restInfo.isRest && !hasWork) {
      restThisMonth++;
    }
  }

  const todayStr = formatDate(new Date());

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-sm">
        <button
          onClick={prevMonth}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          title="Mes anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={resetToCurrent}
            className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
          >
            Ir a fecha actual
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          title="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-semibold">
            <span className="w-3 h-3 rounded-md bg-sky-500 inline-block" />
            <span>Trabajado ({workedThisMonth})</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
            <span>Descanso ({restThisMonth})</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Toca cualquier día para registrar o cambiar
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {dayHeaders.map((day) => (
            <div
              key={day}
              className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty cells before start of month */}
          {Array.from({ length: startDayOffset }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 opacity-40" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
            const shift = shifts.find(s => s.date === dateStr);
            const restInfo = isDateRestDay(dateStr, restDays, settings.defaultRestDaysOfWeek);
            const isToday = dateStr === todayStr;

            return (
              <button
                key={dateStr}
                onClick={() => onOpenModal(dateStr)}
                className={`h-16 sm:h-20 p-1 sm:p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden group ${
                  isToday ? 'ring-2 ring-sky-500' : ''
                } ${
                  shift
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800/80 hover:border-sky-500'
                    : restInfo.isRest
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {/* Day Number and status badge */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-black rounded-md px-1.5 py-0.5 ${
                      isToday
                        ? 'bg-sky-500 text-white'
                        : shift
                        ? 'text-sky-800 dark:text-sky-300 font-bold'
                        : restInfo.isRest
                        ? 'text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {shift ? (
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                      {shift.hoursWorked}h
                    </span>
                  ) : restInfo.isRest ? (
                    <Palmtree className="w-3 h-3 text-emerald-500" />
                  ) : null}
                </div>

                {/* Content snippet */}
                <div className="w-full truncate text-[10px] leading-tight">
                  {shift ? (
                    <div>
                      <div className="font-semibold text-sky-900 dark:text-sky-200 truncate">
                        {shift.coworker ? shift.coworker.split(' ')[0] : 'Solo'}
                      </div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400">
                        {shift.startTime}
                      </div>
                    </div>
                  ) : restInfo.isRest ? (
                    <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                      🏖️ Libre
                    </div>
                  ) : (
                    <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      +
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanatory note */}
      <div className="bg-slate-100 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 dark:text-slate-200">Tú tienes el control total de tus descansos:</strong> Puedes pulsar en cualquier día del calendario y marcarlo como &ldquo;Día de Descanso&rdquo;. Cada descanso se mostrará en verde y restará automáticamente sus horas del cómputo mensual.
        </div>
      </div>
    </div>
  );
};
