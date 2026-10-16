import React, { useState, useRef } from 'react';
import { UserSettings } from '../types';
import { useTheme } from '../context/ThemeContext';
import { exportDataAsJSON, exportDataAsCSV, importDataFromJSON, resetAllDataToZero } from '../services/storage';
import { Sun, Moon, Settings, ShieldCheck, Download, Upload, FileSpreadsheet, Smartphone, Check, Palmtree, Clock, User, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onDataImported: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onDataImported,
}) => {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleDayOfWeekToggle = (dayIndex: number) => {
    const current = localSettings.defaultRestDaysOfWeek || [];
    let updated: number[];
    if (current.includes(dayIndex)) {
      updated = current.filter(d => d !== dayIndex);
    } else {
      updated = [...current, dayIndex];
    }
    setLocalSettings(prev => ({ ...prev, defaultRestDaysOfWeek: updated }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importDataFromJSON(file);
      setImportStatus('¡Datos restaurados con éxito!');
      onDataImported();
      setTimeout(() => setImportStatus(null), 3000);
    } catch {
      setImportStatus('Error al importar el archivo.');
    }
  };

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="space-y-4">
      {/* APP IDENTITY CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
        <img
          src="/src/assets/images/control_horas_logo_1792108900665.jpg"
          alt="Logo Control Horas"
          className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-sky-400/40 ring-2 ring-sky-500/20 flex-shrink-0"
          referrerPolicy="no-referrer"
        />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Control Horas
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tu aplicación privada para llevar el control diario, semanal y mensual de horas laboradas y descansos.
          </p>
        </div>
      </div>

      {/* USER REGISTRATION / PERFIL DE USUARIO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-sky-500" />
              <span>Registro de Usuario</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ingresa tu nombre para personalizar tu aplicación y tus reportes de horas.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Escribe tu nombre (ej: Alan Castro)..."
            value={localSettings.userName}
            onChange={(e) => setLocalSettings({ ...localSettings, userName: e.target.value })}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* TEMA OSCURO / CLARO SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Tema de la Aplicación (Color)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Elige si prefieres fondo negro/oscuro o fondo blanco/claro.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
              theme === 'dark'
                ? 'bg-slate-950 border-sky-500 text-white shadow-md ring-2 ring-sky-500/30'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <Moon className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xs font-bold">Tema Negro / Oscuro</div>
            <div className="text-[10px] text-slate-400">Cómodo para la vista</div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
              theme === 'light'
                ? 'bg-white border-sky-500 text-slate-900 shadow-md ring-2 ring-sky-500/30'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xs font-bold text-slate-900">Tema Blanco / Claro</div>
            <div className="text-[10px] text-slate-500">Alto contraste y nitidez</div>
          </button>
        </div>
      </div>

      {/* JORNADA Y DESCANSO FORM */}
      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" />
            <span>Configuración de Horas y Descansos</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ajusta tu jornada de trabajo y cómo la aplicación resta tus descansos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Horas estándar por día */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Horas diarias estándar:
            </label>
            <input
              type="number"
              min="1"
              max="24"
              step="0.5"
              value={localSettings.standardDailyHours}
              onChange={(e) => setLocalSettings({ ...localSettings, standardDailyHours: Number(e.target.value) })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Ej: 8 horas habituales</span>
          </div>

          {/* Meta Semanal */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Meta semanal de horas:
            </label>
            <input
              type="number"
              min="10"
              max="80"
              value={localSettings.weeklyTargetHours}
              onChange={(e) => setLocalSettings({ ...localSettings, weeklyTargetHours: Number(e.target.value) })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Ej: 40 o 48 horas semanales</span>
          </div>

          {/* Horas deducidas por descanso */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
              Horas a restar por descanso:
            </label>
            <input
              type="number"
              min="0"
              max="24"
              value={localSettings.restDayDeductionHours}
              onChange={(e) => setLocalSettings({ ...localSettings, restDayDeductionHours: Number(e.target.value) })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Horas descontadas al descansar</span>
          </div>
        </div>

        {/* Días habituales de descanso semanal */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Palmtree className="w-4 h-4 text-emerald-500" />
            <span>Tus días fijos de descanso semanal (opcional):</span>
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            La app marcará estos días como descanso automáticamente, pero siempre podrás cambiarlos día a día en el calendario.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            {dayNames.map((name, index) => {
              const isSelected = localSettings.defaultRestDaysOfWeek.includes(index);
              return (
                <button
                  type="button"
                  key={name}
                  onClick={() => handleDayOfWeekToggle(index)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {saveSuccess ? (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Guardado correctamente
            </span>
          ) : <div />}

          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl shadow-md transition"
          >
            Guardar Configuración
          </button>
        </div>
      </form>

      {/* RESPALDO Y EXPORTACIÓN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Respaldo y Seguridad (100% en tu Celular)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tus datos se guardan en la memoria local de tu dispositivo. No necesitas conexión a internet y nadie más tiene acceso a tus horas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={exportDataAsCSV}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 flex items-center gap-3 text-left transition"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Exportar a Excel / CSV</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Descarga tu planilla con horas y aliados</div>
            </div>
          </button>

          <button
            type="button"
            onClick={exportDataAsJSON}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500 flex items-center gap-3 text-left transition"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Descargar Copia de Seguridad</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Archivo de respaldo para restaurar cuando quieras</div>
            </div>
          </button>
        </div>

        {/* Import file */}
        <div className="pt-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-950 transition"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Restaurar Copia de Seguridad previa (.json)</span>
          </button>

          {importStatus && (
            <p className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              {importStatus}
            </p>
          )}
        </div>

        {/* Botón para reiniciar todos los turnos a cero */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Deseas dejar todos los turnos, horas y descansos en cero para comenzar de nuevo?')) {
                resetAllDataToZero();
                onDataImported();
                alert('¡Todos los turnos y horas han quedado en cero!');
              }
            }}
            className="text-xs text-rose-500 hover:text-rose-400 font-semibold py-1.5 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reiniciar todos los turnos a cero</span>
          </button>
        </div>
      </div>

      {/* GUIA DE INSTALACIÓN APK / ANDROID */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-500" />
            <span>Instalar APK en tu Teléfono Android</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Android cuenta con la tecnología oficial <strong>WebAPK</strong>: compila e instala la aplicación directamente como una app nativa en tu teléfono sin pasar por la Play Store ni requerir permisos peligrosos.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-700 dark:text-slate-300">
          <div className="font-bold text-slate-900 dark:text-white">
            Pasos para instalar la APK nativa en 10 segundos:
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>Abre este enlace en <strong>Google Chrome</strong> en tu celular.</li>
            <li>Toca el botón <strong>&quot;Instalar en Celular&quot;</strong> en la barra superior o ve a los <strong>tres puntos (⋮)</strong> del navegador.</li>
            <li>Presiona <strong>&quot;Instalar aplicación&quot;</strong>.</li>
            <li>Tu celular generará el paquete APK oficial y lo instalará con el ícono de Control Horas en tu pantalla.</li>
          </ol>
        </div>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('¡Enlace de Control Horas copiado! Pégalo en Google Chrome en tu celular para instalarla directamente.');
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold text-xs transition flex items-center justify-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          <span>Copiar Enlace para Abrir e Instalar en mi Teléfono</span>
        </button>
      </div>
    </div>
  );
};
