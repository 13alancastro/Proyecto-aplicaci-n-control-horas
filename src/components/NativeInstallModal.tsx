import React, { useEffect, useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import QRCode from 'qrcode';
import { Smartphone, Download, CheckCircle2, Copy, X, QrCode, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

interface NativeInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativeInstallModal: React.FC<NativeInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // App URL for mobile
  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-aladqrjizyhssxqew6xrya-652470128301.us-west2.run.app';

  useEffect(() => {
    QRCode.toDataURL(appUrl, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#0284c7', // vibrant cyan/sky
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error generating QR', err));
  }, [appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const result = await install();
      if (result) {
        onClose();
      }
    } else {
      handleCopyLink();
      alert('Para instalar de forma nativa en tu Android:\n1. Abre este enlace en Google Chrome en tu celular.\n2. Pulsa en los 3 puntos (⋮) y selecciona "Instalar aplicación".\n¡El enlace ya ha sido copiado a tu portapapeles!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <img
            src="/src/assets/images/control_horas_logo_1792108900665.jpg"
            alt="Logo Control Horas"
            className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-sky-400/40 ring-2 ring-sky-500/20 flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
              <Sparkles className="w-3 h-3" /> Instalación Nativa Android (WebAPK)
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Instalar en tu Celular
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quedará instalada como una app de tu teléfono, con su propio icono y sin internet.
            </p>
          </div>
        </div>

        {/* Action 1: If on mobile device with install prompt ready */}
        <div className="space-y-3">
          <button
            onClick={handleDirectInstall}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2.5"
          >
            <Download className="w-5 h-5" />
            <span>INSTALAR AHORA EN ESTE TELÉFONO</span>
          </button>

          {/* QR Code and Send to Mobile Option */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-center">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4 text-sky-500" />
              <span>¿Estás en tu computadora? Escanea con tu celular:</span>
            </div>

            {qrCodeDataUrl && (
              <div className="flex justify-center py-1">
                <div className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-200">
                  <img
                    src={qrCodeDataUrl}
                    alt="Código QR para instalar en celular"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Apunta la cámara de tu teléfono Android a este código para abrir e instalar la aplicación al instante.
            </p>

            {/* Copy link button */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-500 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-sky-500" />}
                <span>{copied ? '¡Enlace Copiado!' : 'Copiar enlace para WhatsApp'}</span>
              </button>
            </div>
          </div>

          {/* 3 Steps Guide for Android */}
          <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-500" />
              <span>Cómo se instala de forma nativa en Android:</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
              <p>
                <strong>1.</strong> Abre el enlace en el navegador <strong>Google Chrome</strong> de tu teléfono.
              </p>
              <p>
                <strong>2.</strong> Toca los <strong>tres puntos verticales (⋮)</strong> en la esquina superior derecha.
              </p>
              <p>
                <strong>3.</strong> Selecciona <strong>&quot;Instalar aplicación&quot;</strong> (o &quot;Agregar a la pantalla principal&quot;).
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                ✓ Android generará el paquete nativo oficial (WebAPK) con el icono de Control Horas en tu pantalla y funcionará 100% offline.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
