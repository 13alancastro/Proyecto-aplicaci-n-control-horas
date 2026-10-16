import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import QRCode from 'qrcode';
import { Download, Smartphone, CheckCircle2, X, Share2, MoreVertical, PlusSquare, QrCode, Copy, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 220,
        margin: 1,
        color: {
          dark: '#0284c7',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error(err));
    }
  }, [currentUrl]);

  // If already running inside installed standalone PWA, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-bold px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-950/40 active:scale-95 transition-all"
        title="Instalar como app nativa en tu teléfono Android"
      >
        <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-100" />
        <span>Instalar en Celular</span>
        <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-90" />
      </button>

      {/* Android Native Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-slate-100 relative my-auto">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <img
                src="/src/assets/images/control_horas_logo_1792108900665.jpg"
                alt="Logo Control Horas"
                className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-sky-400/40 ring-2 ring-sky-500/20 flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-0.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> App Nativa Android (WebAPK)
                </div>
                <h3 className="text-lg font-bold text-white">Instalar Control Horas</h3>
                <p className="text-xs text-sky-400 font-medium">100% Privada • Sin internet • Rápida</p>
              </div>
            </div>

            {/* Direct Native Install Button */}
            <div className="mb-4">
              <button
                onClick={async () => {
                  if (isInstallable) {
                    await install();
                    setShowGuideModal(false);
                  } else {
                    handleCopy();
                    alert('Para instalar de forma nativa en tu celular:\n1. Abre este enlace en Google Chrome en tu teléfono.\n2. Toca en los tres puntos (⋮) y selecciona "Instalar aplicación".\n\n¡El enlace ya ha sido copiado a tu portapapeles!');
                  }
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                INSTALAR AHORA EN ESTE CELULAR
              </button>
            </div>

            {/* QR Code section */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center mb-4 space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4 text-sky-400" />
                <span>¿Quieres pasarla a tu celular ahora mismo?</span>
              </div>

              {qrCodeUrl && (
                <div className="flex justify-center py-1">
                  <div className="bg-white p-2 rounded-xl shadow-md inline-block">
                    <img
                      src={qrCodeUrl}
                      alt="Código QR de instalación"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400">
                Apunta la <strong>cámara de tu celular</strong> a este código para abrir la app y presionar &quot;Instalar&quot;.
              </p>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-1.5"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
                <span>{copied ? '¡Enlace copiado al portapapeles!' : 'Copiar enlace para enviártelo por WhatsApp'}</span>
              </button>
            </div>

            {/* Steps in Android */}
            <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Instalación nativa paso a paso en Android:</span>
              </div>
              <div className="text-[11px] space-y-1 text-slate-400">
                <p>1. Abre el enlace en <strong>Google Chrome</strong> en tu móvil.</p>
                <p>2. Pulsa el menú de <strong>tres puntos (⋮)</strong> en Chrome.</p>
                <p>3. Selecciona <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Agregar a la pantalla principal&quot;</strong>.</p>
                <p className="text-emerald-400 font-medium pt-1">
                  ✓ Se instalará automáticamente con su propio icono de app, pantalla completa y 100% offline.
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
