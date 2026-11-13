import React, { useEffect, useRef, useState } from 'react';
import {
  Landmark,
  QrCode,
  Plus,
  Edit,
  Trash2,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  X,
} from 'lucide-react';
import { settingService, uploadService } from '../services/api';
import { toast } from 'sonner';

const EMPTY_ACCOUNT = {
  label: '',
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  ifsc: '',
  branch: '',
  accountType: 'Current',
  upiId: '',
  qrImage: '',
  instructions: '',
  isActive: true,
};

export const AdminPaymentAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null); // null = closed, -1 = new, >=0 = index
  const [form, setForm] = useState(EMPTY_ACCOUNT);
  const [deleteTargetIdx, setDeleteTargetIdx] = useState(null);

  const formDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await settingService.getSettings();
      setAccounts(res?.settings?.bankAccounts || []);
    } catch {
      toast.error('Failed to load bank accounts & QR settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    const dlg = formDialogRef.current;
    if (!dlg) return;
    if (editingIndex !== null && !dlg.open) dlg.showModal();
    else if (editingIndex === null && dlg.open) dlg.close();
  }, [editingIndex]);

  useEffect(() => {
    const dlg = deleteDialogRef.current;
    if (!dlg) return;
    if (deleteTargetIdx !== null && !dlg.open) dlg.showModal();
    else if (deleteTargetIdx === null && dlg.open) dlg.close();
  }, [deleteTargetIdx]);

  const persistAccounts = async (nextList, successMsg) => {
    setSaving(true);
    try {
      const res = await settingService.updateSettings({ bankAccounts: nextList });
      setAccounts(res?.settings?.bankAccounts || nextList);
      toast.success(successMsg);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bank account settings');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openNewModal = () => {
    setForm({
      ...EMPTY_ACCOUNT,
      label: `BL Jewels Showroom Account #${accounts.length + 1}`,
    });
    setEditingIndex(-1);
  };

  const openEditModal = (idx) => {
    setForm({ ...EMPTY_ACCOUNT, ...accounts[idx] });
    setEditingIndex(idx);
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/payment-qr');
      if (res?.url) {
        setForm((prev) => ({ ...prev, qrImage: res.url }));
        toast.success('QR code uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'QR upload failed');
    } finally {
      setUploadingQr(false);
      e.target.value = '';
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    const hasBank = form.bankName.trim() && form.accountNumber.trim() && form.ifsc.trim();
    const hasUpiOrQr = form.upiId.trim() || form.qrImage.trim();

    if (!hasBank && !hasUpiOrQr) {
      toast.error('Please enter either Bank Account details or a UPI ID / QR Code image.');
      return;
    }

    const cleaned = {
      ...(form._id ? { _id: form._id } : {}),
      label: form.label.trim() || form.bankName.trim() || 'Showroom Payment Account',
      bankName: form.bankName.trim(),
      accountHolder: form.accountHolder.trim(),
      accountNumber: form.accountNumber.trim(),
      ifsc: form.ifsc.trim().toUpperCase(),
      branch: form.branch.trim(),
      accountType: form.accountType.trim() || 'Current',
      upiId: form.upiId.trim(),
      qrImage: form.qrImage.trim(),
      instructions: form.instructions.trim(),
      isActive: form.isActive !== false,
    };

    const nextList =
      editingIndex === -1
        ? [...accounts, cleaned]
        : accounts.map((item, idx) => (idx === editingIndex ? cleaned : item));

    const ok = await persistAccounts(
      nextList,
      editingIndex === -1 ? 'Bank / QR account added to checkout!' : 'Account details updated!'
    );
    if (ok) setEditingIndex(null);
  };

  const handleToggleActive = async (idx) => {
    const nextList = accounts.map((acc, i) =>
      i === idx ? { ...acc, isActive: acc.isActive === false } : acc
    );
    await persistAccounts(nextList, 'Account availability updated');
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetIdx === null) return;
    const nextList = accounts.filter((_, i) => i !== deleteTargetIdx);
    const ok = await persistAccounts(nextList, 'Bank / QR account removed');
    if (ok) setDeleteTargetIdx(null);
  };

  const copyText = (text) => {
    navigator.clipboard?.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <style>{`
        dialog.pay-dialog:modal { overscroll-behavior: contain; }
        dialog.pay-dialog::backdrop {
          background: rgba(20, 14, 11, 0.55);
          overflow: hidden;
          overscroll-behavior: contain;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#930303] flex items-center gap-1.5">
            <Landmark size={13} />
            <span>Direct Bank Transfer & UPI QR Configuration</span>
          </p>
          <h1 className="text-2xl font-bold text-stone-900 mt-1">Bank & QR Payment Accounts</h1>
          <p className="text-xs text-stone-500 mt-1">
            Add as many bank accounts and UPI QR codes as you need. Active accounts appear live inside the Checkout payment accordion.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="inline-flex items-center gap-2 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer transition"
        >
          <Plus size={15} />
          <span>Add Bank / QR Account</span>
        </button>
      </div>

      {/* Accounts List */}
      {loading ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-xs text-stone-500">
          Loading configured bank accounts & QR codes…
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
          <QrCode className="mx-auto text-[#930303]" size={36} />
          <h2 className="text-lg font-semibold text-stone-900">No Bank Accounts or QR Codes Added Yet</h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Add your showroom bank account details (Account Number, IFSC, Holder Name) and upload a UPI QR code so customers can pay directly at checkout and upload payment proof.
          </p>
          <button
            type="button"
            onClick={openNewModal}
            className="inline-flex items-center gap-2 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
          >
            <Plus size={15} />
            <span>Add First Bank / QR Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {accounts.map((acc, idx) => (
            <article
              key={acc._id || idx}
              className={`bg-white rounded-2xl border p-5 space-y-4 transition ${
                acc.isActive !== false ? 'border-stone-200 shadow-xs' : 'border-stone-200 opacity-70'
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-3 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{acc.label || 'Bank Account'}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        acc.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                    >
                      {acc.isActive !== false ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {acc.isActive !== false ? 'Live at Checkout' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {acc.bankName || 'UPI / QR Payment'} {acc.accountType ? `· ${acc.accountType}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleToggleActive(idx)}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-[11px] font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    {acc.isActive !== false ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(idx)}
                    aria-label="Edit account"
                    className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:text-[#930303] hover:border-[#930303] cursor-pointer"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetIdx(idx)}
                    aria-label="Delete account"
                    className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-red-700 hover:border-red-200 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {acc.qrImage && (
                  <div className="w-32 h-32 rounded-xl border border-[#E9DED2] bg-[#FAF7F2] p-2 shrink-0 flex items-center justify-center">
                    <img
                      src={acc.qrImage}
                      alt={`${acc.label} QR Code`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                )}

                <div className="flex-1 space-y-2 text-xs">
                  {acc.accountHolder && (
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500">Account Holder</span>
                      <span className="font-semibold text-stone-900">{acc.accountHolder}</span>
                    </div>
                  )}
                  {acc.accountNumber && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-stone-500">Account No.</span>
                      <button
                        type="button"
                        onClick={() => copyText(acc.accountNumber)}
                        className="inline-flex items-center gap-1 font-mono font-bold text-[#930303] cursor-pointer hover:underline"
                      >
                        {acc.accountNumber}
                        <Copy size={11} />
                      </button>
                    </div>
                  )}
                  {acc.ifsc && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-stone-500">IFSC Code</span>
                      <button
                        type="button"
                        onClick={() => copyText(acc.ifsc)}
                        className="inline-flex items-center gap-1 font-mono font-semibold text-stone-900 cursor-pointer hover:underline"
                      >
                        {acc.ifsc}
                        <Copy size={11} />
                      </button>
                    </div>
                  )}
                  {acc.branch && (
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500">Branch</span>
                      <span className="text-stone-800">{acc.branch}</span>
                    </div>
                  )}
                  {acc.upiId && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-stone-500">UPI ID</span>
                      <button
                        type="button"
                        onClick={() => copyText(acc.upiId)}
                        className="inline-flex items-center gap-1 font-semibold text-[#930303] cursor-pointer hover:underline"
                      >
                        {acc.upiId}
                        <Copy size={11} />
                      </button>
                    </div>
                  )}
                  {acc.instructions && (
                    <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                      {acc.instructions}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Native Dialog */}
      <dialog
        ref={formDialogRef}
        closedby="any"
        aria-labelledby="bank-modal-title"
        onClose={() => setEditingIndex(null)}
        onCancel={() => setEditingIndex(null)}
        className="pay-dialog m-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl max-w-2xl w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto"
      >
        <div className="flex justify-between items-center pb-3 border-b border-stone-100">
          <h2 id="bank-modal-title" className="text-lg font-bold text-stone-900">
            {editingIndex === -1 ? 'Add Bank / QR Account' : 'Edit Bank / QR Account'}
          </h2>
          <button
            type="button"
            onClick={() => setEditingIndex(null)}
            aria-label="Close"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveForm} className="space-y-4 mt-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="acc-label" className="block font-semibold text-stone-700 mb-1">
                Display Title <span aria-hidden="true">*</span>
              </label>
              <input
                id="acc-label"
                name="label"
                type="text"
                required
                autoFocus
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. HDFC Primary Current / ICICI Bridal Escrow"
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs"
              />
            </div>

            <div>
              <label htmlFor="acc-type" className="block font-semibold text-stone-700 mb-1">
                Account Type
              </label>
              <select
                id="acc-type"
                name="accountType"
                value={form.accountType}
                onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs bg-white"
              >
                <option value="Current">Current Account</option>
                <option value="Savings">Savings Account</option>
                <option value="UPI / Merchant QR">UPI / Merchant QR Only</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="acc-bankName" className="block font-semibold text-stone-700 mb-1">
                Bank Name
              </label>
              <input
                id="acc-bankName"
                name="bankName"
                type="text"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank Ltd."
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs"
              />
            </div>

            <div>
              <label htmlFor="acc-holder" className="block font-semibold text-stone-700 mb-1">
                Account Holder / Beneficiary Name
              </label>
              <input
                id="acc-holder"
                name="accountHolder"
                type="text"
                value={form.accountHolder}
                onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
                placeholder="e.g. B.L. Jewels Pvt Ltd"
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="acc-number" className="block font-semibold text-stone-700 mb-1">
                Account Number
              </label>
              <input
                id="acc-number"
                name="accountNumber"
                type="text"
                autoCorrect="off"
                spellCheck={false}
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                placeholder="e.g. 50200012345678"
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs"
              />
            </div>

            <div>
              <label htmlFor="acc-ifsc" className="block font-semibold text-stone-700 mb-1">
                IFSC Code
              </label>
              <input
                id="acc-ifsc"
                name="ifsc"
                type="text"
                autoCorrect="off"
                spellCheck={false}
                value={form.ifsc}
                onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFC0001234"
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs uppercase"
              />
            </div>

            <div>
              <label htmlFor="acc-branch" className="block font-semibold text-stone-700 mb-1">
                Branch Name
              </label>
              <input
                id="acc-branch"
                name="branch"
                type="text"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                placeholder="e.g. Civil Lines, Agra"
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs"
              />
            </div>
          </div>

          {/* UPI ID + QR Upload */}
          <div className="rounded-xl bg-[#FAF7F2] border border-[#E9DED2] p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-4 items-end">
              <div>
                <label htmlFor="acc-upi" className="block font-semibold text-stone-700 mb-1">
                  UPI ID (Optional)
                </label>
                <input
                  id="acc-upi"
                  name="upiId"
                  type="text"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  placeholder="e.g. bljewels@hdfcbank"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs"
                />
              </div>

              <div>
                <label htmlFor="acc-qr-file" className="block font-semibold text-stone-700 mb-1">
                  Upload QR Code Image
                </label>
                <label
                  htmlFor="acc-qr-file"
                  className="flex items-center justify-center gap-2 border border-dashed border-[#930303]/50 bg-white hover:bg-[#FFF6F2] rounded-xl px-3 py-2 cursor-pointer text-[#930303] font-semibold"
                >
                  {uploadingQr ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Uploading QR…</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} />
                      <span>{form.qrImage ? 'Replace QR Code' : 'Choose QR Image'}</span>
                    </>
                  )}
                </label>
                <input
                  id="acc-qr-file"
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="sr-only"
                />
              </div>
            </div>

            <div>
              <label htmlFor="acc-qr-url" className="block font-semibold text-stone-700 mb-1">
                Or Paste QR Code Image URL
              </label>
              <input
                id="acc-qr-url"
                name="qrImage"
                type="url"
                value={form.qrImage}
                onChange={(e) => setForm({ ...form, qrImage: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs"
              />
            </div>

            {form.qrImage && (
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={form.qrImage}
                  alt="QR preview"
                  className="w-20 h-20 object-contain rounded-xl border border-stone-200 bg-white p-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, qrImage: '' });
                    toast.success('QR Code removed');
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove QR Image</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="acc-inst" className="block font-semibold text-stone-700 mb-1">
              Customer Transfer Instructions (Shown at Checkout)
            </label>
            <textarea
              id="acc-inst"
              name="instructions"
              rows={2}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="e.g. Transfer via NEFT/IMPS/RTGS or scan QR, then enter UTR number and upload screenshot."
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs"
            />
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
            <input
              type="checkbox"
              checked={form.isActive !== false}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-[#930303]"
            />
            <span>Active on Checkout (Customers can choose this account)</span>
          </label>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setEditingIndex(null)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingQr}
              className="px-5 py-2 rounded-xl bg-[#930303] hover:bg-[#7A0303] disabled:opacity-60 text-white font-semibold cursor-pointer"
            >
              {saving ? 'Saving…' : 'Save Account & QR'}
            </button>
          </div>
        </form>
      </dialog>

      {/* Delete Confirmation Dialog */}
      <dialog
        ref={deleteDialogRef}
        closedby="any"
        aria-labelledby="del-bank-title"
        onClose={() => setDeleteTargetIdx(null)}
        onCancel={() => setDeleteTargetIdx(null)}
        className="pay-dialog m-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl max-w-md w-[calc(100%-2rem)]"
      >
        <h2 id="del-bank-title" className="text-lg font-bold text-stone-900">
          Remove Bank / QR Account?
        </h2>
        <p className="text-xs text-stone-600 mt-2">
          Are you sure you want to delete{' '}
          <strong>{deleteTargetIdx !== null ? accounts[deleteTargetIdx]?.label : ''}</strong>? Customers will no longer see it at checkout.
        </p>
        <div className="flex justify-end gap-2.5 mt-5">
          <button
            type="button"
            autoFocus
            onClick={() => setDeleteTargetIdx(null)}
            className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleConfirmDelete}
            className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold cursor-pointer"
          >
            {saving ? 'Removing…' : 'Delete Account'}
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default AdminPaymentAccounts;

