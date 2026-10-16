import React, { useState } from 'react';
import { WorkShift, RestDay, UserSettings, MonthlyStats, WeeklyStats } from '../types';
import { getWeekRange, isDateRestDay, formatFriendlyDate, calculateWeeklyStats, calculateMonthlyStats } from '../services/storage';
import { ChevronLeft, ChevronRight, Calendar, Users, Palmtree, Briefcase, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface WeeklyMonthlyViewProps {
  shifts: WorkShift[];
  restDays: RestDay[];
  settings: UserSettings;
  onOpenModal: (date: string) => void;
}

export const WeeklyMonthlyView: React.FC<WeeklyMonthlyViewProps> = ({
  shifts,
  restDays,
  settings,
  onOpenModal,
}) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');

  // Week navigation state
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(new Date());
  // Month navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  // Week range
  const yyyy = currentWeekDate.getFullYear();
  const mm = String(currentWeekDate.getMonth() + 1).padStart(2, '0');
  const dd = String(currentWeekDate.getDate()).padStart(2, '0');
  const weekRange = getWeekRange(`${yyyy}-${mm}-${dd}`);
  const weekStats = calculateWeeklyStats(weekRange.dates, shifts, restDays, settings);

  // Month stats
  const monthKey = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const monthStats = calculateMonthlyStats(monthKey, shifts, restDays, settings);

  const prevWeek = () => {
    const d = new Date(currentWeekDate);
    d.setDate(d.getDate() - 7);
    setCurrentWeekDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekDate);
    d.setDate(d.getDate() + 7);
    setCurrentWeekDate(d);
  };

  const resetToCurrentWeek = () => {
    setCurrentWeekDate(new Date());
  };

  const prevMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonthDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonthDate(d);
  };

  const resetToCurrentMonth = () => {
    setCurrentMonthDate(new Date());
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthLabel = `${monthNames[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`;

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'weekly'
              ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Vista Semanal</span>
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'monthly'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Vista Mensual</span>
        </button>
      </div>

      {/* WEEKLY CONTENT */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          {/* Week Navigation Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <button
              onClick={prevWeek}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Semana anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                Semana del {weekRange.start.split('-')[2]} al {weekRange.end.split('-')[2]} de {monthNames[Number(weekRange.start.split('-')[1]) - 1]}
              </div>
              <button
                onClick={resetToCurrentWeek}
                className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline mt-0.5"
              >
                Ir a semana actual
              </button>
            </div>
            <button
              onClick={nextWeek}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Semana siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Horas Trabajadas</div>
              <div className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">
                {weekStats.totalHoursWorked} <span className="text-xs font-normal text-slate-400">hrs</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Meta: {weekStats.targetHours}h
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Días Laborados</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {weekStats.daysWorked} <span className="text-xs font-normal text-slate-400">días</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Turnos completados
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Días de Descanso</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {weekStats.restDaysCount} <span className="text-xs font-normal text-slate-400">días</span>
              </div>
              <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                -{weekStats.restHoursDeducted}h deducibles
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Diferencia vs Meta</div>
              <div className={`text-xl font-black mt-1 ${
                weekStats.difference >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
              }`}>
                {weekStats.difference >= 0 ? `+${weekStats.difference}` : weekStats.difference} <span className="text-xs font-normal text-slate-400">h</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {weekStats.difference >= 0 ? 'Cumplido o extra' : 'Horas restantes'}
              </div>
            </div>
          </div>

          {/* Day-by-Day Cards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Detalle día por día (Lunes a Domingo):
            </h4>
            {weekRange.dates.map((dateStr) => {
              const shift = shifts.find(s => s.date === dateStr);
              const restInfo = isDateRestDay(dateStr, restDays, settings.defaultRestDaysOfWeek);
              const [y, m, d] = dateStr.split('-');
              const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
              const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dateObj.getDay()];
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={dateStr}
                  onClick={() => onOpenModal(dateStr)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isToday
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs ${
                      shift
                        ? 'bg-sky-500 text-white shadow-sm'
                        : restInfo.isRest
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <span className="text-[10px] uppercase font-semibold leading-tight">{dayName.slice(0, 3)}</span>
                      <span className="text-sm font-black">{d}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                          {dayName} {d}
                        </span>
                        {isToday && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500 text-white font-bold">
                            Hoy
                          </span>
                        )}
                      </div>

                      {shift ? (
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {shift.startTime} - {shift.endTime} ({shift.hoursWorked}h)
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            <Users className="w-3 h-3" />
                            <span>{shift.coworker || 'Solo'}</span>
                          </span>
                        </div>
                      ) : restInfo.isRest ? (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <Palmtree className="w-3.5 h-3.5" />
                          <span>Día de Descanso (-{restInfo.restRecord?.deductHours || settings.restDayDeductionHours || 8}h deducidas)</span>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-slate-400 italic">
                          Sin registrar • Toca para agregar turno o descanso
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {shift ? (
                      <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                        {shift.hoursWorked} hrs
                      </span>
                    ) : restInfo.isRest ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Descanso
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        + Añadir
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MONTHLY CONTENT */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                {monthLabel}
              </div>
              <button
                onClick={resetToCurrentMonth}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline mt-0.5"
              >
                Ir al mes actual
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

          {/* Monthly Grand Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                  Resumen de Horas del Mes
                </span>
                <h3 className="text-3xl font-black text-white mt-1">
                  {monthStats.totalHoursWorked} <span className="text-lg font-bold text-sky-400">horas trabajadas</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Repartidas en <strong>{monthStats.daysWorked} días de trabajo</strong>
                </p>
              </div>

              <div className="text-right bg-emerald-950/60 border border-emerald-700/60 rounded-2xl p-3">
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                  <Palmtree className="w-4 h-4" /> Días de Descanso
                </div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {monthStats.restDaysCount} <span className="text-xs font-normal text-slate-300">días</span>
                </div>
                <div className="text-[10px] text-emerald-300 mt-0.5">
                  -{monthStats.restHoursDeducted}h deducidas
                </div>
              </div>
            </div>

            {/* Rest Day Deduction Math explanation */}
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs text-slate-300 space-y-1.5">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Cálculo con Días de Descanso Restados:</span>
                <span className="text-sky-400 font-black">
                  Saldo: {monthStats.netHoursBalance >= 0 ? `+${monthStats.netHoursBalance}` : monthStats.netHoursBalance} hrs
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Base mensual estimada: {settings.monthlyTargetBaseHours}h | Descuento por {monthStats.restDaysCount} descansos: -{monthStats.restHoursDeducted}h | Meta ajustada: {Math.max(0, settings.monthlyTargetBaseHours - monthStats.restHoursDeducted)}h.
              </p>
            </div>
          </div>

          {/* Aliados con los que trabajaste este mes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Aliados con los que trabajaste este mes ({monthStats.coworkersSummary.length}):</span>
            </h4>

            {monthStats.coworkersSummary.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 text-center">
                Aún no has registrado aliados este mes.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {monthStats.coworkersSummary.map((cw) => (
                  <div
                    key={cw.name}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                        {cw.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {cw.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {cw.days} turno{cw.days !== 1 ? 's' : ''} juntos
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
                      {cw.hours} hrs
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
