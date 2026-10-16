import React from 'react';
import { WorkShift, RestDay, UserSettings, MonthlyStats, WeeklyStats } from '../types';
import { formatFriendlyDate, formatDate } from '../services/storage';
import { Clock, Palmtree, Users, PlusCircle, CheckCircle, Calendar, Sparkles, AlertCircle, ArrowRight, Briefcase, Download, Smartphone } from 'lucide-react';

interface TodayViewProps {
  todayStr: string;
  todayShift?: WorkShift;
  todayRest?: RestDay;
  isTodayRoutineRest: boolean;
  weeklyStats: WeeklyStats;
  monthlyStats: MonthlyStats;
  settings: UserSettings;
  recentShifts: WorkShift[];
  onOpenModal: (date: string) => void;
  onQuickToggleRest: () => void;
  onNavigateToTab: (tab: 'weekly' | 'calendar' | 'coworkers' | 'settings') => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  todayStr,
  todayShift,
  todayRest,
  isTodayRoutineRest,
  weeklyStats,
  monthlyStats,
  settings,
  recentShifts,
  onOpenModal,
  onQuickToggleRest,
  onNavigateToTab,
}) => {
  const isResting = !!todayRest || (!todayShift && isTodayRoutineRest);

  return (
    <div className="space-y-4">
      {/* TODAY HERO CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 dark:from-slate-900 dark:via-slate-950 dark:to-black text-white p-5 sm:p-6 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Estado de Hoy
              </span>
            </div>
            <div className="text-xs font-medium text-slate-400 capitalize">
              {formatFriendlyDate(todayStr)}
            </div>
          </div>

          {/* Conditional based on shift or rest day */}
          {todayShift ? (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {todayShift.hoursWorked} <span className="text-base font-semibold text-sky-400">horas laboradas</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Horario: <strong className="text-white">{todayShift.startTime}</strong> a <strong className="text-white">{todayShift.endTime}</strong>
                    {todayShift.breakMinutes > 0 && ` (${todayShift.breakMinutes}m de almuerzo)`}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <CheckCircle className="w-3.5 h-3.5" /> Turno Registrado
                </span>
              </div>

              {/* Aliado Highlight */}
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3.5 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
                    <Users className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400">Trabajando hoy con el aliado:</div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{todayShift.coworker || 'Solo / Sin aliado'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenModal(todayStr)}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition"
                >
                  Cambiar Aliado
                </button>
              </div>

              {todayShift.notes && (
                <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  &ldquo;{todayShift.notes}&rdquo;
                </p>
              )}
            </div>
          ) : isResting ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                    <Palmtree className="w-4 h-4" /> Día de Descanso
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    ¡Hoy es tu día libre!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm">
                    {todayRest?.reason || 'Descanso programado por ti. Horas restadas de la meta mensual.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">
                    -{todayRest?.deductHours || settings.restDayDeductionHours || 8}h
                  </span>
                  <div className="text-[10px] text-slate-400">Restadas de la semana/mes</div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => onOpenModal(todayStr)}
                  className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition border border-slate-700"
                >
                  Cambiar a Día Laborado
                </button>
                <button
                  onClick={onQuickToggleRest}
                  className="text-xs text-slate-400 hover:text-white py-2.5 px-3 rounded-xl hover:bg-slate-800 transition"
                >
                  Quitar descanso
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Aún no has registrado el turno de hoy
                </h3>
                <p className="text-xs text-slate-300">
                  Registra tus horas trabajadas o indícale a la app si hoy es tu día de descanso con un solo toque.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => onOpenModal(todayStr)}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-950/50 active:scale-98 transition"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Registrar Horas de Hoy</span>
                </button>
                <button
                  onClick={onQuickToggleRest}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm border border-emerald-500/40 shadow-lg shadow-emerald-950/40 active:scale-98 transition"
                >
                  <Palmtree className="w-4 h-4" />
                  <span>Hoy es mi Día de Descanso</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK METRICS (Semana & Mes) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weekly Mini Card */}
        <div 
          onClick={() => onNavigateToTab('weekly')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-sky-500/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Esta Semana</span>
            <ArrowRight className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {weeklyStats.totalHoursWorked}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ {weeklyStats.targetHours}h</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-slate-400">
              {weeklyStats.daysWorked} días trab.
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              🏖️ {weeklyStats.restDaysCount} descanso{weeklyStats.restDaysCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Monthly Mini Card */}
        <div 
          onClick={() => onNavigateToTab('weekly')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-emerald-500/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Este Mes</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {monthlyStats.totalHoursWorked}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">hrs trab.</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-slate-400">
              {monthlyStats.daysWorked} días
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-medium" title="Horas restadas por descansos">
              -{monthlyStats.restHoursDeducted}h desc.
            </span>
          </div>
        </div>
      </div>

      {/* REST DEDUCTION FORMULA BANNER */}
      <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1">
          <Palmtree className="w-4 h-4 text-emerald-500" />
          <span>Control de Resta de Horas por Descansos:</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Has tomado <strong>{monthlyStats.restDaysCount} días de descanso</strong> este mes. La aplicación resta automáticamente <strong>{monthlyStats.restHoursDeducted} horas</strong> ({settings.restDayDeductionHours}h por descanso) de la jornada exigida, dándote un saldo neto de <strong>{monthlyStats.netHoursBalance >= 0 ? `+${monthlyStats.netHoursBalance}` : monthlyStats.netHoursBalance} hrs</strong>.
        </p>
      </div>

      {/* RECENT ACTIVITY & ALIAS LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" />
            <span>Últimos Turnos y Aliados</span>
          </h3>
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Ver calendario completo
          </button>
        </div>

        {recentShifts.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No hay turnos registrados recientemente. ¡Presiona &ldquo;Registrar&rdquo; para comenzar!
          </div>
        ) : (
          <div className="space-y-2">
            {recentShifts.slice(0, 5).map((shift) => (
              <div
                key={shift.id}
                onClick={() => onOpenModal(shift.date)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex flex-col items-center justify-center font-bold text-xs">
                    <span>{shift.date.split('-')[2]}</span>
                    <span className="text-[9px] uppercase font-normal">{shift.date.split('-')[1]}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {shift.startTime} - {shift.endTime} ({shift.hoursWorked}h)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3 h-3 text-emerald-500" />
                      <span>{shift.coworker || 'Solo'}</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                  {shift.hoursWorked} hrs
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INSTALACIÓN NATIVA CARD */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-blue-500/10 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/control_horas_logo_1792108900665.jpg"
            alt="Logo Control Horas"
            className="w-12 h-12 rounded-2xl object-cover shadow-md border border-emerald-400/40 flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>Instalar de forma nativa en tu Celular</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Crea el ícono de la app en tu pantalla, abre a pantalla completa y funciona 100% offline.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const btn = document.querySelector('button[title*="Instalar"]') as HTMLButtonElement;
            if (btn) btn.click();
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar Ahora</span>
        </button>
      </div>
    </div>
  );
};
