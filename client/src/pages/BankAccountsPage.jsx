import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Landmark,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  ZoomIn,
  X,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { settingService } from '../services/api';
import { SeoHead } from '../components/common/SeoHead';

export const BankAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState('');
  const [qrZoomSrc, setQrZoomSrc] = useState(null);
  const qrDialogRef = useRef(null);

  useEffect(() => {
    let active = true;
    settingService
      .getSettings()
      .then((res) => {
        if (!active) return;
        const list = (res?.settings?.bankAccounts || []).filter((b) => b.isActive !== false);
        setAccounts(list);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const dlg = qrDialogRef.current;
    if (!dlg) return;
    if (qrZoomSrc && !dlg.open) dlg.showModal();
    else if (!qrZoomSrc && dlg.open) dlg.close();
  }, [qrZoomSrc]);

  const copyText = (key, text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 1800);
  };

  return (
    <div className="bg-[#FFFCF8] min-h-screen py-10 sm:py-14 font-body text-[#292321]">
      <SeoHead
        title="Official Bank Accounts & UPI QR Codes | BL Jewels"
        description="View verified BL Jewels showroom bank account numbers, IFSC codes, and official UPI QR codes for secure NEFT, IMPS, RTGS, and direct transfers."
      />

      <style>{`
        dialog.bank-qr-dialog:modal { overscroll-behavior: contain; }
        dialog.bank-qr-dialog::backdrop {
          background: rgba(20, 14, 11, 0.65);
          overflow: hidden;
          overscroll-behavior: contain;
        }
      `}</style>

      <div className="max-w-[1140px] mx-auto px-5 sm:px-8 space-y-10">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F8F2EC] border border-[#E9DED2] text-[11px] font-accent font-semibold uppercase tracking-[0.2em] text-[#940303]">
            <Landmark className="w-3.5 h-3.5 text-[#D4AF66]" aria-hidden="true" />
            <span>Verified Settlement Accounts</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-medium text-[#940303] leading-tight">
            Official Bank Details &amp; UPI QR Codes
          </h1>
          <p className="text-sm sm:text-base text-[#756B65] leading-relaxed">
            Transfer directly via NEFT, RTGS, IMPS, or scan any official BL Jewels UPI QR below. During Checkout, upload your payment receipt &amp; UTR/Transaction ID for priority dispatch verification.
          </p>
        </header>

        {/* Security & Process Banner */}
        <div className="rounded-2xl bg-[#F8F2EC] border border-[#E9DED2] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#940303] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-semibold text-[#292321]">
                How Direct Bank / QR Checkout Works
              </p>
              <p className="text-[#756B65]">
                1. Transfer your exact order amount to any active account below → 2. Select{' '}
                <strong className="text-[#292321]">Direct Bank Account / UPI QR Transfer</strong> at Checkout → 3. Enter UTR / Transaction ID &amp; upload payment screenshot.
              </p>
            </div>
          </div>
          <Link
            to="/checkout"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#940303] hover:bg-[#700202] text-white text-xs font-semibold shrink-0 transition"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-[#F8F2EC] animate-pulse border border-[#E9DED2]" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E9DED2] p-12 text-center space-y-3">
            <QrCode className="w-10 h-10 text-[#D4AF66] mx-auto" aria-hidden="true" />
            <h2 className="font-display text-2xl font-medium text-[#292321]">
              Bank Accounts Temporarily Unavailable
            </h2>
            <p className="text-sm text-[#756B65] max-w-md mx-auto">
              Our online Razorpay gateway and Cash on Delivery remain fully active at Checkout.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#940303] text-[#940303] text-xs font-semibold hover:bg-[#940303] hover:text-white transition"
            >
              <span>Contact Showroom Concierge</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accounts.map((acc, idx) => (
              <article
                key={acc._id || idx}
                className="bg-white rounded-2xl border border-[#E9DED2] p-6 shadow-xs space-y-5 flex flex-col justify-between"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#E9DED2]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF66]" aria-hidden="true" />
                      <h2 className="font-display text-xl font-semibold text-[#940303]">
                        {acc.label || `BL Jewels Account #${idx + 1}`}
                      </h2>
                    </div>
                    <p className="text-xs text-[#756B65] mt-1">
                      {acc.bankName || 'Official Merchant Account'}
                      {acc.accountType ? ` · ${acc.accountType}` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] font-accent font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified Account
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {acc.qrImage && (
                    <div className="w-full sm:w-44 shrink-0 rounded-xl bg-[#F8F2EC] border border-[#E9DED2] p-3 text-center space-y-2">
                      <img
                        src={acc.qrImage}
                        alt={`${acc.label} UPI QR Code`}
                        className="w-36 h-36 mx-auto object-contain rounded-lg bg-white p-1.5 border border-[#E9DED2]"
                      />
                      <button
                        type="button"
                        onClick={() => setQrZoomSrc(acc.qrImage)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#940303] hover:underline cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Enlarge QR Code</span>
                      </button>
                    </div>
                  )}

                  <dl className="flex-1 w-full space-y-2.5 text-xs sm:text-sm">
                    {acc.accountHolder && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-[#756B65]">Account Holder</dt>
                        <dd className="font-semibold text-[#292321] text-right">{acc.accountHolder}</dd>
                      </div>
                    )}
                    {acc.accountNumber && (
                      <div className="flex justify-between items-center gap-2">
                        <dt className="text-[#756B65]">Account Number</dt>
                        <dd>
                          <button
                            type="button"
                            onClick={() => copyText(`acc-${idx}`, acc.accountNumber)}
                            className="inline-flex items-center gap-1.5 font-mono font-bold text-[#940303] cursor-pointer hover:underline"
                          >
                            <span>{acc.accountNumber}</span>
                            {copiedKey === `acc-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </dd>
                      </div>
                    )}
                    {acc.ifsc && (
                      <div className="flex justify-between items-center gap-2">
                        <dt className="text-[#756B65]">IFSC Code</dt>
                        <dd>
                          <button
                            type="button"
                            onClick={() => copyText(`ifsc-${idx}`, acc.ifsc)}
                            className="inline-flex items-center gap-1.5 font-mono font-bold text-[#292321] cursor-pointer hover:underline"
                          >
                            <span>{acc.ifsc}</span>
                            {copiedKey === `ifsc-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </dd>
                      </div>
                    )}
                    {acc.branch && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-[#756B65]">Branch</dt>
                        <dd className="text-[#292321] text-right">{acc.branch}</dd>
                      </div>
                    )}
                    {acc.upiId && (
                      <div className="flex justify-between items-center gap-2">
                        <dt className="text-[#756B65]">UPI ID</dt>
                        <dd>
                          <button
                            type="button"
                            onClick={() => copyText(`upi-${idx}`, acc.upiId)}
                            className="inline-flex items-center gap-1.5 font-semibold text-[#940303] cursor-pointer hover:underline"
                          >
                            <span>{acc.upiId}</span>
                            {copiedKey === `upi-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {acc.instructions && (
                  <p className="text-xs bg-[#F8F2EC] border border-[#E9DED2] rounded-xl px-4 py-3 text-[#756B65]">
                    {acc.instructions}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* QR Zoom Dialog */}
      <dialog
        ref={qrDialogRef}
        closedby="any"
        aria-labelledby="public-qr-title"
        onClose={() => setQrZoomSrc(null)}
        onCancel={() => setQrZoomSrc(null)}
        className="bank-qr-dialog m-auto rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-2xl max-w-sm w-[calc(100%-2rem)] text-center space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 id="public-qr-title" className="font-display font-bold text-lg text-[#940303]">
            BL Jewels Official UPI QR
          </h3>
          <button
            type="button"
            autoFocus
            aria-label="Close QR popup"
            onClick={() => setQrZoomSrc(null)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {qrZoomSrc && (
          <img
            src={qrZoomSrc}
            alt="Full size BL Jewels UPI QR Code"
            className="w-64 h-64 mx-auto object-contain rounded-xl border border-[#E9DED2] p-2 bg-[#F8F2EC]"
          />
        )}
        <p className="text-xs text-[#756B65]">
          Scan via GPay, PhonePe, Paytm or any UPI app and save your payment screenshot for checkout verification.
        </p>
      </dialog>
    </div>
  );
};

export default BankAccountsPage;

