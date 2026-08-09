'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface CryptoQrModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  address: string;
  icon: string;
  onCopy: () => void;
  copied: boolean;
}

/**
 * Full-screen "Receive"-style modal: renders a scannable QR code for the
 * given address client-side (no third-party QR API call — the address
 * never leaves the browser), plus the full address and a copy button.
 */
export function CryptoQrModal({ open, onClose, name, address, icon, onCopy, copied }: CryptoQrModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    setReady(false);
    QRCode.toCanvas(canvasRef.current, address, {
      width: 260,
      margin: 1,
      color: { dark: '#0a0a0c', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, [open, address]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Receive ${name}`}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="absolute inset-0 bg-night/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-sm sm:rounded-sm shadow-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-sm bg-cream border border-black/8 flex items-center justify-center text-base font-bold">{icon}</span>
            <div>
              <p className="font-black text-night text-sm">{name}</p>
              <p className="text-[11px] text-night/45">Scan to send</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-sm text-night/50 hover:text-night hover:bg-night/5 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-sm p-2.5 mb-5 leading-snug">
          ⚠️ Only send {name} on this exact network. Sending any other asset will result in permanent loss.
        </p>

        <div className="flex justify-center">
          <div className="relative bg-white rounded-sm p-3 ring-1 ring-black/8">
            <canvas ref={canvasRef} width={260} height={260} className={ready ? '' : 'opacity-0'} />
            {!ready && (
              <div className="absolute inset-3 flex items-center justify-center">
                <svg className="animate-spin text-night/30" width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <p className="mt-5 text-center font-mono text-[13px] text-night/70 break-all leading-relaxed">{address}</p>

        <button
          type="button"
          onClick={onCopy}
          className="btn-primary w-full justify-center mt-5"
        >
          {copied ? (
            <>
              Copied
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </>
          ) : (
            <>
              Copy address
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
