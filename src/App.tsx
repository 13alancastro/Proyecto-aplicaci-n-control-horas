/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WorkShift, RestDay, UserSettings } from './types';
import {
  loadShifts,
  saveShifts,
  loadRestDays,
  saveRestDays,
  loadSettings,
  saveSettings,
  formatDate,
  isDateRestDay,
  getWeekRange,
  calculateWeeklyStats,
  calculateMonthlyStats,
} from './services/storage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { OfflineBadge } from './components/OfflineBadge';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { DayShiftModal } from './components/DayShiftModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NativeInstallModal } from './components/NativeInstallModal';
import { TodayView } from './components/TodayView';
import { WeeklyMonthlyView } from './components/WeeklyMonthlyView';
import { CalendarRestView } from './components/CalendarRestView';
import { CoworkersView } from './components/CoworkersView';
import { SettingsView } from './components/SettingsView';
import {
  Clock,
  Calendar,
  BarChart3,
  Users,
  Settings,
  Plus,
  Palmtree,
  Sparkles,
  User,
} from 'lucide-react';

function MainApp() {
  const { theme } = useTheme();

  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [restDays, setRestDays] = useState<RestDay[]>([]);
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'calendar' | 'coworkers' | 'settings'>('today');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>(formatDate(new Date()));

  // Load initial data
  useEffect(() => {
    // Ensure all previous mock shifts are wiped so everything starts cleanly at zero
    const hasReset = localStorage.getItem('controlhoras_zero_reset_v3');
    if (!hasReset) {
      saveShifts([]);
      saveRestDays([]);
      localStorage.setItem('controlhoras_zero_reset_v3', 'true');
    }
    setShifts(loadShifts());
    setRestDays(loadRestDays());
    setSettings(loadSettings());
  }, []);

  const todayStr = formatDate(new Date());
  const todayShift = shifts.find(s => s.date === todayStr);
  const todayRest = restDays.find(r => r.date === todayStr);
  const todayRoutineInfo = isDateRestDay(todayStr, restDays, settings.defaultRestDaysOfWeek);

  // Stats calculations
  const currentWeekRange = getWeekRange(todayStr);
  const weeklyStats = calculateWeeklyStats(currentWeekRange.dates, shifts, restDays, settings);

  const currentMonthKey = todayStr.substring(0, 7);
  const monthlyStats = calculateMonthlyStats(currentMonthKey, shifts, restDays, settings);

  // Handlers for Shifts & Rest Days
  const handleSaveShift = (newShift: WorkShift) => {
    const existingIndex = shifts.findIndex(s => s.id === newShift.id || s.date === newShift.date);
    let updated: WorkShift[];
    if (existingIndex >= 0) {
      updated = [...shifts];
      updated[existingIndex] = newShift;
    } else {
      updated = [newShift, ...shifts];
    }
    setShifts(updated);
    saveShifts(updated);

    // Also remove any rest day on this date
    const updatedRest = restDays.filter(r => r.date !== newShift.date);
    if (updatedRest.length !== restDays.length) {
      setRestDays(updatedRest);
      saveRestDays(updatedRest);
    }
  };

  const handleSaveRestDay = (newRest: RestDay) => {
    const existingIndex = restDays.findIndex(r => r.date === newRest.date);
    let updated: RestDay[];
    if (existingIndex >= 0) {
      updated = [...restDays];
      updated[existingIndex] = newRest;
    } else {
      updated = [newRest, ...restDays];
    }
    setRestDays(updated);
    saveRestDays(updated);

    // Also remove any shift on this date
    const updatedShifts = shifts.filter(s => s.date !== newRest.date);
    if (updatedShifts.length !== shifts.length) {
      setShifts(updatedShifts);
      saveShifts(updatedShifts);
    }
  };

  const handleDeleteShift = (shiftId: string) => {
    const updated = shifts.filter(s => s.id !== shiftId);
    setShifts(updated);
    saveShifts(updated);
  };

  const handleDeleteRestDay = (date: string) => {
    const updated = restDays.filter(r => r.date !== date);
    setRestDays(updated);
    saveRestDays(updated);
  };

  const handleQuickToggleRestToday = () => {
    if (todayRest) {
      handleDeleteRestDay(todayStr);
    } else {
      handleSaveRestDay({
        date: todayStr,
        type: 'custom',
        reason: 'Descanso marcado hoy',
        deductHours: settings.restDayDeductionHours || 8,
      });
    }
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleDataReload = () => {
    setShifts(loadShifts());
    setRestDays(loadRestDays());
    setSettings(loadSettings());
  };

  const openModalForDate = (date: string) => {
    setModalDate(date);
    setIsModalOpen(true);
  };

  // Find records for the modal
  const existingShiftForModal = shifts.find(s => s.date === modalDate);
  const existingRestForModal = restDays.find(r => r.date === modalDate);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-24 md:pb-12">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img
              src="/src/assets/images/control_horas_logo_1792108900665.jpg"
              alt="Logo Control Horas"
              className="w-10 h-10 rounded-xl object-cover shadow-md shadow-sky-500/30 border border-sky-400/40 ring-1 ring-white/10"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Control Horas
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                Mi Registro Personal
              </p>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title="Mi Registro de Usuario (Nombre)"
            >
              <User className="w-3.5 h-3.5 text-sky-500" />
              <span className="max-w-[70px] sm:max-w-[130px] truncate">
                {settings.userName ? settings.userName : 'Registrarme'}
              </span>
            </button>
            <OfflineBadge />
            <PWAInstallBanner />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {activeTab === 'today' && (
          <TodayView
            todayStr={todayStr}
            todayShift={todayShift}
            todayRest={todayRest}
            isTodayRoutineRest={todayRoutineInfo.isRest}
            weeklyStats={weeklyStats}
            monthlyStats={monthlyStats}
            settings={settings}
            recentShifts={shifts}
            onOpenModal={openModalForDate}
            onQuickToggleRest={handleQuickToggleRestToday}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyMonthlyView
            shifts={shifts}
            restDays={restDays}
            settings={settings}
            onOpenModal={openModalForDate}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarRestView
            shifts={shifts}
            restDays={restDays}
            settings={settings}
            onOpenModal={openModalForDate}
            onSaveRestDay={handleSaveRestDay}
            onDeleteRestDay={handleDeleteRestDay}
          />
        )}

        {activeTab === 'coworkers' && (
          <CoworkersView
            shifts={shifts}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenModal={openModalForDate}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onDataImported={handleDataReload}
          />
        )}
      </main>

      {/* FLOATING ACTION BUTTON (QUICK ADD SHIFT) */}
      <button
        onClick={() => openModalForDate(todayStr)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white p-3.5 sm:p-4 rounded-full shadow-xl shadow-sky-950/40 hover:shadow-sky-500/30 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs sm:text-sm"
        title="Registrar turno de hoy o descanso"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="hidden sm:inline">Registrar Turno / Descanso</span>
      </button>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg max-w-4xl mx-auto md:relative md:border-0 md:bg-transparent md:backdrop-blur-none md:mt-8 md:p-0">
        <div className="flex items-center justify-around md:justify-center md:gap-3">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col md:flex-row items-center gap-1 py-1.5 px-3 rounded-2xl text-[10px] md:text-xs font-bold transition-all ${
              activeTab === 'today'
                ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Hoy</span>
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex flex-col md:flex-row items-center gap-1 py-1.5 px-3 rounded-2xl text-[10px] md:text-xs font-bold transition-all ${
              activeTab === 'weekly'
                ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Semana/Mes</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col md:flex-row items-center gap-1 py-1.5 px-3 rounded-2xl text-[10px] md:text-xs font-bold transition-all ${
              activeTab === 'calendar'
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Descansos</span>
          </button>

          <button
            onClick={() => setActiveTab('coworkers')}
            className={`flex flex-col md:flex-row items-center gap-1 py-1.5 px-3 rounded-2xl text-[10px] md:text-xs font-bold transition-all ${
              activeTab === 'coworkers'
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Aliados</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col md:flex-row items-center gap-1 py-1.5 px-3 rounded-2xl text-[10px] md:text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Ajustes</span>
          </button>
        </div>
      </nav>

      {/* USER REGISTRATION MODAL */}
      <UserProfileModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentName={settings.userName}
        onSaveName={(name) => handleUpdateSettings({ ...settings, userName: name })}
      />

      {/* LOG / EDIT MODAL */}
      <DayShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dateStr={modalDate}
        existingShift={existingShiftForModal}
        existingRest={existingRestForModal}
        settings={settings}
        onSaveShift={handleSaveShift}
        onSaveRestDay={handleSaveRestDay}
        onDeleteShift={handleDeleteShift}
        onDeleteRestDay={handleDeleteRestDay}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
