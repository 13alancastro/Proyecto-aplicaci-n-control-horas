import { WorkShift, RestDay, UserSettings, MonthlyStats, WeeklyStats } from '../types';

const STORAGE_KEYS = {
  SHIFTS: 'controlhoras_shifts_v1',
  REST_DAYS: 'controlhoras_rest_days_v1',
  SETTINGS: 'controlhoras_settings_v1',
};

export const USER_ALLIES = [
  'Carlos Peña Parada',
  'Leonardo Vásquez',
  'Carlos Ricardo Díaz',
  'Miguel Ángel Sepúlveda',
  'Frank Ramírez',
  'Cristian Jiménez',
  'Emir Estupiñán',
  'Wilson Martínez',
  'Camacho',
  'Alexander Jiménez',
  'Yobanni Montañez',
  'Rodolfo Montañez',
  'Orlando Correa',
  'David Rosas',
];

export const DEFAULT_ALLIES = USER_ALLIES;

export const DEFAULT_SETTINGS: UserSettings = {
  userName: '',
  standardDailyHours: 8,
  weeklyTargetHours: 40,
  monthlyTargetBaseHours: 160,
  restDayDeductionHours: 8,
  defaultRestDaysOfWeek: [0], // 0 = Domingo
  deductionMode: 'deduct_from_target',
  frequentCoworkers: USER_ALLIES,
  hourlyRate: 0,
  currency: '$',
};

// Calculate decimal hours between HH:mm and HH:mm minus break
export function calculateShiftHours(startTime: string, endTime: string, breakMinutes: number = 0): number {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startTotalMinutes = startH * 60 + startM;
  let endTotalMinutes = endH * 60 + endM;

  // If end is before or equal to start, assume shift crossed midnight (night shift)
  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  const netMinutes = Math.max(0, endTotalMinutes - startTotalMinutes - (breakMinutes || 0));
  return Number((netMinutes / 60).toFixed(2));
}

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Format friendly date in Spanish
export function formatFriendlyDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${dayNames[date.getDay()]}, ${day} de ${monthNames[date.getMonth()]}`;
  } catch {
    return dateStr;
  }
}

// Initial shifts start at zero as requested
function generateSeedData(): { shifts: WorkShift[]; restDays: RestDay[] } {
  return { shifts: [], restDays: [] };
}

export function loadSettings(): UserSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      const parsed = JSON.parse(data);
      // Remove any legacy placeholder names or obsolete separate names
      const oldMockNames = new Set([
        'Carlos Méndez',
        'Juan Pérez',
        'Ana Gómez',
        'Roberto Silva',
        'Solo / Turno individual',
        'David',
        'Rosas',
      ]);
      const userCustom = (parsed.frequentCoworkers || []).filter(
        (name: string) => !oldMockNames.has(name) && !USER_ALLIES.includes(name)
      );
      // Only keep the user's defined allies list
      const cleanedSettings: UserSettings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        frequentCoworkers: [...USER_ALLIES, ...userCustom],
      };
      saveSettings(cleanedSettings);
      return cleanedSettings;
    }
  } catch (e) {
    console.error('Error loading settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function loadShifts(): WorkShift[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    if (data) {
      const shifts: WorkShift[] = JSON.parse(data);
      // Clean out any seed shifts so everything starts strictly at zero
      const realShifts = shifts.filter(s => !s.id.startsWith('seed-'));
      if (realShifts.length !== shifts.length) {
        saveShifts(realShifts);
      }
      return realShifts;
    }
    return [];
  } catch (e) {
    console.error('Error loading shifts', e);
    return [];
  }
}

export function saveShifts(shifts: WorkShift[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  } catch (e) {
    console.error('Error saving shifts', e);
  }
}

export function loadRestDays(): RestDay[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REST_DAYS);
    if (data) {
      const rests: RestDay[] = JSON.parse(data);
      // Clean out any seed/mock rest days
      const realRests = rests.filter(
        r => r.reason !== 'Descanso semanal regular' && r.reason !== 'Día de descanso acordado'
      );
      if (realRests.length !== rests.length) {
        saveRestDays(realRests);
      }
      return realRests;
    }
    return [];
  } catch (e) {
    console.error('Error loading rest days', e);
    return [];
  }
}

export function resetAllDataToZero(): void {
  saveShifts([]);
  saveRestDays([]);
}

export function saveRestDays(restDays: RestDay[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REST_DAYS, JSON.stringify(restDays));
  } catch (e) {
    console.error('Error saving rest days', e);
  }
}

// Check if a given date is marked as rest day (either explicit restDay record or matches routine)
export function isDateRestDay(dateStr: string, restDays: RestDay[], defaultDaysOfWeek: number[] = [0]): { isRest: boolean; restRecord?: RestDay; isRoutine: boolean } {
  const explicit = restDays.find(r => r.date === dateStr);
  if (explicit) {
    return { isRest: true, restRecord: explicit, isRoutine: explicit.type === 'weekly_routine' };
  }

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay();

  if (defaultDaysOfWeek.includes(dayOfWeek)) {
    return { isRest: true, isRoutine: true };
  }

  return { isRest: false, isRoutine: false };
}

// Calculate week start and end (Monday to Sunday)
export function getWeekRange(dateStr: string): { start: string; end: string; dates: string[] } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  
  // Day of week: 0 = Sun, 1 = Mon ...
  const currentDay = date.getDay();
  // We consider Monday as first day of work week
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    dates.push(formatDate(day));
  }

  return {
    start: dates[0],
    end: dates[6],
    dates,
  };
}

// Calculate monthly stats including rest day subtraction
export function calculateMonthlyStats(
  monthKey: string, // YYYY-MM
  shifts: WorkShift[],
  restDays: RestDay[],
  settings: UserSettings
): MonthlyStats {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr); // 1-indexed

  // Total days in month
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  let daysWorked = 0;
  let totalHoursWorked = 0;
  const coworkerMap: Record<string, { days: number; hours: number }> = {};

  // Filter shifts for this month
  const monthShifts = shifts.filter(s => s.date.startsWith(monthKey));
  monthShifts.forEach(shift => {
    daysWorked += 1;
    totalHoursWorked += shift.hoursWorked;

    const partner = shift.coworker?.trim() || 'Sin registrar';
    if (!coworkerMap[partner]) {
      coworkerMap[partner] = { days: 0, hours: 0 };
    }
    coworkerMap[partner].days += 1;
    coworkerMap[partner].hours += shift.hoursWorked;
  });

  // Calculate rest days in month
  let restDaysCount = 0;
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${yearStr}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const restInfo = isDateRestDay(dateStr, restDays, settings.defaultRestDaysOfWeek);
    // Only count as rest day if no shift was worked on that day
    const hasShift = monthShifts.some(s => s.date === dateStr);
    if (restInfo.isRest && !hasShift) {
      restDaysCount += 1;
    }
  }

  const restHoursDeducted = restDaysCount * (settings.restDayDeductionHours || settings.standardDailyHours);

  // Net balance: depends on user mode
  // If deduct_from_target: Monthly target adjusted = (Total expected hours) - (rest hours)
  // If deduct_from_worked: Net hours = Worked - Rest deduction
  let netHoursBalance = 0;
  if (settings.deductionMode === 'deduct_from_target') {
    const adjustedTarget = Math.max(0, settings.monthlyTargetBaseHours - restHoursDeducted);
    netHoursBalance = Number((totalHoursWorked - adjustedTarget).toFixed(2));
  } else {
    netHoursBalance = Number((totalHoursWorked - restHoursDeducted).toFixed(2));
  }

  const coworkersSummary = Object.entries(coworkerMap).map(([name, data]) => ({
    name,
    days: data.days,
    hours: Number(data.hours.toFixed(2)),
  })).sort((a, b) => b.hours - a.hours);

  return {
    monthKey,
    totalDaysInMonth,
    daysWorked,
    totalHoursWorked: Number(totalHoursWorked.toFixed(2)),
    restDaysCount,
    restHoursDeducted,
    netHoursBalance,
    coworkersSummary,
  };
}

// Calculate stats for a specific week
export function calculateWeeklyStats(
  weekDates: string[],
  shifts: WorkShift[],
  restDays: RestDay[],
  settings: UserSettings
): WeeklyStats {
  let daysWorked = 0;
  let totalHoursWorked = 0;
  let restDaysCount = 0;

  weekDates.forEach(dateStr => {
    const shift = shifts.find(s => s.date === dateStr);
    const restInfo = isDateRestDay(dateStr, restDays, settings.defaultRestDaysOfWeek);

    if (shift) {
      daysWorked += 1;
      totalHoursWorked += shift.hoursWorked;
    } else if (restInfo.isRest) {
      restDaysCount += 1;
    }
  });

  const restHoursDeducted = restDaysCount * (settings.restDayDeductionHours || settings.standardDailyHours);
  const target = settings.weeklyTargetHours || 40;
  const difference = Number((totalHoursWorked - target).toFixed(2));

  return {
    weekNumber: 1,
    weekStart: weekDates[0],
    weekEnd: weekDates[6],
    daysWorked,
    totalHoursWorked: Number(totalHoursWorked.toFixed(2)),
    restDaysCount,
    restHoursDeducted,
    targetHours: target,
    difference,
  };
}

// Export backup to JSON file download
export function exportDataAsJSON(): void {
  const shifts = loadShifts();
  const restDays = loadRestDays();
  const settings = loadSettings();

  const backup = {
    app: 'Control Horas',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings,
    shifts,
    restDays,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `control_horas_respaldo_${formatDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export to CSV for Excel/Google Sheets
export function exportDataAsCSV(): void {
  const shifts = loadShifts();
  const restDays = loadRestDays();
  const settings = loadSettings();

  // Combine shifts and rest days in chronological order
  const allDates = new Set<string>();
  shifts.forEach(s => allDates.add(s.date));
  restDays.forEach(r => allDates.add(r.date));
  const sortedDates = Array.from(allDates).sort();

  const headers = ['Fecha', 'Tipo', 'Hora Entrada', 'Hora Salida', 'Descanso (Min)', 'Horas Trabajadas', 'Aliado de Trabajo', 'Horas Restadas/Deducidas', 'Notas'];
  const rows = sortedDates.map(date => {
    const shift = shifts.find(s => s.date === date);
    const rest = restDays.find(r => r.date === date);
    const restInfo = isDateRestDay(date, restDays, settings.defaultRestDaysOfWeek);

    if (shift) {
      return [
        date,
        'Jornada Trabajada',
        shift.startTime,
        shift.endTime,
        shift.breakMinutes,
        shift.hoursWorked,
        `"${(shift.coworker || '').replace(/"/g, '""')}"`,
        0,
        `"${(shift.notes || '').replace(/"/g, '""')}"`,
      ];
    } else if (rest || restInfo.isRest) {
      return [
        date,
        'Día de Descanso',
        '-',
        '-',
        '-',
        0,
        '-',
        rest?.deductHours || settings.restDayDeductionHours,
        `"${(rest?.reason || 'Descanso semanal').replace(/"/g, '""')}"`,
      ];
    }
    return [date, 'Sin registro', '-', '-', '-', 0, '-', 0, ''];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `control_horas_laboradas_${formatDate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import backup from JSON file
export async function importDataFromJSON(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        if (data.shifts && Array.isArray(data.shifts)) {
          saveShifts(data.shifts);
        }
        if (data.restDays && Array.isArray(data.restDays)) {
          saveRestDays(data.restDays);
        }
        if (data.settings) {
          saveSettings(data.settings);
        }
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}
