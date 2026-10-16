export interface WorkShift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number; // minutes of lunch/break
  hoursWorked: number; // computed decimal hours (e.g. 8.5)
  coworker: string; // coworker name, e.g. "Carlos Méndez"
  isRestDay?: boolean; // if false or undefined, it's a worked shift
  notes?: string;
  hourlyRate?: number;
}

export interface RestDay {
  date: string; // YYYY-MM-DD
  type: 'custom' | 'weekly_routine' | 'holiday';
  reason?: string;
  deductHours: number; // e.g. 8 hours to deduct from month/week
}

export interface UserSettings {
  userName: string;
  standardDailyHours: number; // default 8
  weeklyTargetHours: number; // default 40 or 48
  monthlyTargetBaseHours: number; // default 160 or 192 (calculated or custom)
  restDayDeductionHours: number; // standard hours deducted per rest day (e.g. 8h)
  defaultRestDaysOfWeek: number[]; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  deductionMode: 'deduct_from_target' | 'deduct_from_worked'; 
  // 'deduct_from_target': (Horas trabajadas vs [Meta mensual - Horas de descanso])
  // 'deduct_from_worked': (Horas brutas - Deducción descanso)
  frequentCoworkers: string[];
  hourlyRate?: number;
  currency: string;
}

export interface MonthlyStats {
  monthKey: string; // YYYY-MM
  totalDaysInMonth: number;
  daysWorked: number;
  totalHoursWorked: number;
  restDaysCount: number;
  restHoursDeducted: number;
  netHoursBalance: number;
  coworkersSummary: { name: string; days: number; hours: number }[];
}

export interface WeeklyStats {
  weekNumber: number;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  daysWorked: number;
  totalHoursWorked: number;
  restDaysCount: number;
  restHoursDeducted: number;
  targetHours: number;
  difference: number;
}
