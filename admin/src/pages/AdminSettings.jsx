import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  FileText,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Lock,
  Mail,
  User,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Phone,
  MapPin,
  Globe,
  Share2,
  FileCheck,
  X,
  Layers,
  ArrowRight,
  Key,
} from 'lucide-react';
import { settingsService, legalService, authService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { RichTextEditor } from '../components/RichTextEditor';
import { toast } from 'sonner';

export const AdminSettings = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'legal' | 'security'

  // ──────────────────────────────────────────────────────────
  // TAB 1: STORE & BRAND SETTINGS STATE
  // ──────────────────────────────────────────────────────────
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeSaving, setStoreSaving] = useState(false);
  const [storeForm, setStoreForm] = useState({
    brandName: 'BL Jewels',
    tagline: 'Purity With Auspiciousness',
    contact: {
      phone: '+91 98765 43210',
      email: 'contact@bljewels.com',
      address: 'BL Jewels Flagship Atelier, Sanjay Place, MG Road, Agra, Uttar Pradesh - 282002',
      whatsapp: '+91 98765 43210',
      showroomTiming: 'Mon - Sun: 10:30 AM - 8:30 PM (Closed on Tuesdays)',
      gstin: '09AAACB2345M1Z2 | BIS-HM/22K-AGR-4019',
    },
    socialLinks: {
      instagram: 'https://instagram.com/bljewels_official',
      facebook: 'https://facebook.com/bljewelsofficial',
      youtube: 'https://youtube.com/@bljewels',
      whatsapp: 'https://wa.me/919876543210',
    },
  });

  // ──────────────────────────────────────────────────────────
  // TAB 2: LEGAL PAGES CMS STATE
  // ──────────────────────────────────────────────────────────
  const [legalPages, setLegalPages] = useState([]);
  const [legalLoading, setLegalLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState(null);
  const [legalSaving, setLegalSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    isPublished: true,
    order: 0,
  });

  // ──────────────────────────────────────────────────────────
  // TAB 3: SEPARATE FLOW 1: EMAIL & USERNAME STATE
  // ──────────────────────────────────────────────────────────
  const [adminName, setAdminName] = useState(user?.name || 'BL Jewels Administrator');
  const [usernameInput, setUsernameInput] = useState(user?.username || 'admin');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtpStep, setEmailOtpStep] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailUpdating, setEmailUpdating] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });

  // ──────────────────────────────────────────────────────────
  // TAB 3: SEPARATE FLOW 2: PASSWORD STATE (WITH EYE BUTTONS)
  // ──────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passOtpStep, setPassOtpStep] = useState(false);
  const [passOtpCode, setPassOtpCode] = useState('');
  const [passOtpSending, setPassOtpSending] = useState(false);
  const [passUpdating, setPassUpdating] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  // Load Settings and Legal Pages on mount
  useEffect(() => {
    fetchStoreSettings();
    fetchLegalPages();
  }, []);

  // Update credentials form when user in store changes
  useEffect(() => {
    if (user) {
      setAdminName(user.name || 'BL Jewels Administrator');
      setUsernameInput(user.username || 'admin');
    }
  }, [user]);

  const fetchStoreSettings = async () => {
    setStoreLoading(true);
    try {
      const res = await settingsService.getSettings();
      const raw = res?.settings || res?.data;
      if (res?.success && raw) {
        setStoreForm({
          brandName: raw.brandName || 'BL Jewels',
          tagline: raw.tagline || 'Purity With Auspiciousness',
          contact: {
            phone: raw.contact?.phone || '+91 98765 43210',
            email: raw.contact?.email || 'contact@bljewels.com',
            address: raw.contact?.address || 'BL Jewels Flagship Atelier, Sanjay Place, MG Road, Agra, UP - 282002',
            whatsapp: raw.contact?.whatsapp || '+91 98765 43210',
            showroomTiming: raw.contact?.showroomTiming || 'Mon - Sun: 10:30 AM - 8:30 PM (Closed on Tuesdays)',
            gstin: raw.contact?.gstin || '09AAACB2345M1Z2 | BIS-HM/22K-AGR-4019',
          },
          socialLinks: {
            instagram: raw.socialLinks?.instagram || 'https://instagram.com/bljewels_official',
            facebook: raw.socialLinks?.facebook || 'https://facebook.com/bljewelsofficial',
            youtube: raw.socialLinks?.youtube || 'https://youtube.com/@bljewels',
            whatsapp: raw.socialLinks?.whatsapp || 'https://wa.me/919876543210',
          },
        });
      }
    } catch (err) {
      console.warn('Failed to load store settings:', err.message);
    } finally {
      setStoreLoading(false);
    }
  };

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setStoreSaving(true);
    try {
      const res = await settingsService.updateSettings(storeForm);
      if (res.success) {
        toast.success('Store & Showroom settings updated across the website!');
      } else {
        toast.error(res.message || 'Failed to update store settings');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error saving settings');
    } finally {
      setStoreSaving(false);
    }
  };

  const fetchLegalPages = async () => {
    setLegalLoading(true);
    try {
      const res = await legalService.getAdminPages();
      const list = res?.pages || res?.data || [];
      if (res?.success && Array.isArray(list)) {
        setLegalPages(list);
      }
    } catch (err) {
      console.warn('Failed to fetch legal pages:', err.message);
    } finally {
      setLegalLoading(false);
    }
  };

  const openNewPageModal = () => {
    setEditingPageId(null);
    setPageForm({
      title: '',
      slug: '',
      summary: '',
      content: '',
      isPublished: true,
      order: legalPages.length,
    });
    setModalOpen(true);
  };

  const openEditPageModal = (page) => {
    setEditingPageId(page._id);
    setPageForm({
      title: page.title || '',
      slug: page.slug || '',
      summary: page.summary || '',
      content: page.content || '',
      isPublished: Boolean(page.isPublished),
      order: page.order ?? 0,
    });
    setModalOpen(true);
  };

  const handleTitleChange = (val) => {
    setPageForm((prev) => {
      const updated = { ...prev, title: val };
      if (!editingPageId) {
        updated.slug = val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      return updated;
    });
  };

  const handleSaveLegalPage = async (e) => {
    e.preventDefault();
    if (!pageForm.title.trim()) {
      toast.error('Page title is required');
      return;
    }
    if (!pageForm.slug.trim()) {
      toast.error('Page URL slug is required');
      return;
    }
    if (!pageForm.content.trim()) {
      toast.error('Page policy content is required');
      return;
    }

    setLegalSaving(true);
    try {
      if (editingPageId) {
        const res = await legalService.updatePage(editingPageId, pageForm);
        if (res.success) {
          toast.success(`"${pageForm.title}" updated successfully!`);
          setModalOpen(false);
          fetchLegalPages();
        } else {
          toast.error(res.message || 'Failed to update legal page');
        }
      } else {
        const res = await legalService.createPage(pageForm);
        if (res.success) {
          toast.success(`"${pageForm.title}" published! Automatically linked in Footer.`);
          setModalOpen(false);
          fetchLegalPages();
        } else {
          toast.error(res.message || 'Failed to create legal page');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save page');
    } finally {
      setLegalSaving(false);
    }
  };

  const handleTogglePublish = async (page) => {
    try {
      const res = await legalService.updatePage(page._id, {
        isPublished: !page.isPublished,
      });
      if (res.success) {
        toast.success(`"${page.title}" ${!page.isPublished ? 'published to' : 'removed from'} storefront footer`);
        fetchLegalPages();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error toggling publication state');
    }
  };

  const handleDeleteLegalPage = async (id) => {
    try {
      const res = await legalService.deletePage(id);
      if (res.success) {
        toast.success('Legal page removed from store');
        setDeleteConfirmId(null);
        fetchLegalPages();
      } else {
        toast.error(res.message || 'Failed to delete page');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting page');
    }
  };

  // ──────────────────────────────────────────────────────────
  // TAB 3 - FLOW 1: EMAIL & USERNAME HANDLERS
  // ──────────────────────────────────────────────────────────
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    setEmailMessage({ type: '', text: '' });

    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanNewEmail = newEmailInput.trim().toLowerCase();

    const usernameChanged = cleanUsername !== (user?.username || '').toLowerCase();
    const emailChanged = Boolean(cleanNewEmail && cleanNewEmail !== (user?.email || '').toLowerCase());

    if (!usernameChanged && !emailChanged) {
      setEmailMessage({
        type: 'error',
        text: 'Please enter a new username or a new email address to update.',
      });
      return;
    }

    if (usernameChanged && !/^[a-z0-9_-]{3,30}$/.test(cleanUsername)) {
      setEmailMessage({
        type: 'error',
        text: 'Username must be 3-30 characters (lowercase letters, numbers, underscores or hyphens).',
      });
      return;
    }

    if (emailChanged && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanNewEmail)) {
      setEmailMessage({
        type: 'error',
        text: 'Please enter a valid new email address.',
      });
      return;
    }

    setEmailOtpSending(true);
    try {
      const res = await authService.requestCredentialOtp({ action: 'email_username' });
      if (res.success) {
        setEmailOtpStep(true);
        setEmailMessage({
          type: 'success',
          text: res.message || `Verification code sent to current email: ${user?.email}. Enter below to verify.`,
        });
        toast.success(`Verification code sent to ${user?.email}!`);
      } else {
        setEmailMessage({ type: 'error', text: res.message || 'Failed to dispatch verification code.' });
      }
    } catch (err) {
      setEmailMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to send OTP to registered email.',
      });
    } finally {
      setEmailOtpSending(false);
    }
  };

  const handleVerifyAndUpdateEmail = async (e) => {
    e.preventDefault();
    if (!emailOtpCode || emailOtpCode.trim().length !== 6) {
      setEmailMessage({ type: 'error', text: 'Please enter the 6-digit verification code.' });
      return;
    }

    setEmailUpdating(true);
    setEmailMessage({ type: '', text: '' });

    try {
      const payload = {
        otp: emailOtpCode.trim(),
        name: adminName.trim(),
        username: usernameInput.trim().toLowerCase(),
        action: 'email_username',
      };
      if (newEmailInput.trim()) {
        payload.newEmail = newEmailInput.trim().toLowerCase();
      }

      const res = await authService.updateCredentials(payload);
      if (res.success) {
        toast.success('Done! Admin email & username successfully updated.');
        setEmailMessage({
          type: 'success',
          text: 'Done! Your administrator email and username have been successfully updated. You can log in using either.',
        });
        if (res.user) {
          setUser(res.user);
          setUsernameInput(res.user.username || '');
        }
        setNewEmailInput('');
        setEmailOtpCode('');
        setEmailOtpStep(false);
      } else {
        setEmailMessage({ type: 'error', text: res.message || 'Failed to verify and update.' });
      }
    } catch (err) {
      setEmailMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Verification failed. Please check the code.',
      });
    } finally {
      setEmailUpdating(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // TAB 3 - FLOW 2: PASSWORD CHANGE HANDLERS
  // ──────────────────────────────────────────────────────────
  const handleSendPassOtp = async (e) => {
    e.preventDefault();
    setPassMessage({ type: '', text: '' });

    if (!newPassword || newPassword.length < 8) {
      setPassMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'Passwords do not match. Please verify.' });
      return;
    }

    setPassOtpSending(true);
    try {
      const res = await authService.requestCredentialOtp({ action: 'password' });
      if (res.success) {
        setPassOtpStep(true);
        setPassMessage({
          type: 'success',
          text: res.message || `Password authorization code dispatched to ${user?.email}.`,
        });
        toast.success(`Password security OTP sent to ${user?.email}!`);
      } else {
        setPassMessage({ type: 'error', text: res.message || 'Failed to dispatch security OTP.' });
      }
    } catch (err) {
      setPassMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to dispatch security OTP.',
      });
    } finally {
      setPassOtpSending(false);
    }
  };

  const handleVerifyAndUpdatePass = async (e) => {
    e.preventDefault();
    if (!passOtpCode || passOtpCode.trim().length !== 6) {
      setPassMessage({ type: 'error', text: 'Please enter the 6-digit authorization code.' });
      return;
    }

    setPassUpdating(true);
    setPassMessage({ type: '', text: '' });

    try {
      const payload = {
        otp: passOtpCode.trim(),
        password: newPassword,
        action: 'password',
      };

      const res = await authService.updateCredentials(payload);
      if (res.success) {
        toast.success('Done! Password changed successfully.');
        setPassMessage({
          type: 'success',
          text: 'Done! Administrator password updated successfully. Please keep your new credentials secure.',
        });
        setNewPassword('');
        setConfirmPassword('');
        setPassOtpCode('');
        setPassOtpStep(false);
      } else {
        setPassMessage({ type: 'error', text: res.message || 'Failed to update password.' });
      }
    } catch (err) {
      setPassMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Authorization failed. Please check the code.',
      });
    } finally {
      setPassUpdating(false);
    }
  };

  const storefrontBase = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FAF0ED] text-[#930303] border border-[#930303]/20">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Store Settings & Atelier Administration
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Manage showroom contact identity, dynamic legal pages CMS, and administrator security credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── LUXURY TABS ── */}
      <div className="flex border-b border-stone-200 gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('store')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'store'
              ? 'border-[#930303] text-[#930303]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Basic Store & Showroom Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'legal'
              ? 'border-[#930303] text-[#930303]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Legal Pages CMS</span>
          {legalPages.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF0ED] text-[#930303]">
              {legalPages.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'border-[#930303] text-[#930303]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin Security & Dual Login</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: BASIC STORE & BRAND IDENTITY                       */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'store' && (
        <form onSubmit={handleSaveStoreSettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Brand & Showroom Card */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h2 className="text-sm font-bold text-stone-900 tracking-wide uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9A44A]" />
                    Brand Identity & Storefront Names
                  </h2>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                    Live Dynamic Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.brandName}
                      onChange={(e) => setStoreForm({ ...storeForm, brandName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                      placeholder="BL Jewels"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Royal Tagline / Motto
                    </label>
                    <input
                      type="text"
                      value={storeForm.tagline}
                      onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                      placeholder="Purity With Auspiciousness"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Flagship Showroom Address (Displays in Footer & Contact Us)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={storeForm.contact.address}
                    onChange={(e) =>
                      setStoreForm({
                        ...storeForm,
                        contact: { ...storeForm.contact, address: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                    placeholder="BL Jewels Showroom, Sanjay Place, MG Road, Agra, Uttar Pradesh - 282002"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Showroom Operating Timings
                    </label>
                    <input
                      type="text"
                      value={storeForm.contact.showroomTiming}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          contact: { ...storeForm.contact, showroomTiming: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                      placeholder="Mon - Sun: 10:30 AM - 8:30 PM (Closed on Tuesdays)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      GSTIN & BIS Hallmarking Certification No.
                    </label>
                    <input
                      type="text"
                      value={storeForm.contact.gstin}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          contact: { ...storeForm.contact, gstin: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                      placeholder="09AAACB2345M1Z2 | BIS-HM/22K-AGR-4019"
                    />
                  </div>
                </div>
              </div>

              {/* Direct Communications & Channels */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-stone-900 tracking-wide uppercase flex items-center gap-2 pb-3 border-b border-stone-100">
                  <Phone className="w-4 h-4 text-[#930303]" />
                  Direct Customer Communications & Concierge
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Showroom Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.contact.phone}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          contact: { ...storeForm.contact, phone: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      required
                      value={storeForm.contact.email}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          contact: { ...storeForm.contact, email: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                      placeholder="contact@bljewels.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      WhatsApp Concierge Number
                    </label>
                    <input
                      type="text"
                      value={storeForm.contact.whatsapp}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          contact: { ...storeForm.contact, whatsapp: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <h3 className="text-xs font-semibold text-stone-800 mb-3">
                    Social Media & Official Channels
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={storeForm.socialLinks.instagram}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            socialLinks: { ...storeForm.socialLinks, instagram: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                        placeholder="https://instagram.com/bljewels_official"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">
                        Facebook Page URL
                      </label>
                      <input
                        type="url"
                        value={storeForm.socialLinks.facebook}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            socialLinks: { ...storeForm.socialLinks, facebook: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                        placeholder="https://facebook.com/bljewelsofficial"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">
                        YouTube Channel URL
                      </label>
                      <input
                        type="url"
                        value={storeForm.socialLinks.youtube}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            socialLinks: { ...storeForm.socialLinks, youtube: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                        placeholder="https://youtube.com/@bljewels"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">
                        WhatsApp Direct Chat Link
                      </label>
                      <input
                        type="url"
                        value={storeForm.socialLinks.whatsapp}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            socialLinks: { ...storeForm.socialLinks, whatsapp: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                        placeholder="https://wa.me/919876543210"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Live Storefront Footer Preview */}
            <div className="space-y-6">
              <div className="bg-[#170E0D] text-stone-200 rounded-2xl p-5 border border-stone-800 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C9A44A]">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Storefront Footer Live Preview</span>
                  </div>
                  <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded">
                    Real-time
                  </span>
                </div>

                {/* Showroom preview widget */}
                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#C9A44A]">
                    Atelier & Showroom
                  </p>
                  <p className="font-serif text-sm font-bold text-white">
                    {storeForm.brandName}
                  </p>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {storeForm.contact.address}
                  </p>
                  <div className="pt-2 text-[11px] text-stone-300 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#C9A44A]" />
                      <span>{storeForm.contact.showroomTiming}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#C9A44A]" />
                      <span>{storeForm.contact.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-[#C9A44A]" />
                      <span>{storeForm.contact.email}</span>
                    </p>
                  </div>
                </div>

                {/* BIS & GSTIN bar */}
                <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800/80 text-[10px] text-stone-400">
                  <p className="font-medium text-stone-300">GSTIN / BIS Certification</p>
                  <p className="font-mono text-stone-400 mt-0.5 break-all">
                    {storeForm.contact.gstin}
                  </p>
                </div>

                <p className="text-[11px] text-stone-500 leading-normal">
                  ✦ Updating details here automatically updates the customer storefront footer, showroom inquiry modal, contact cards, and order receipt meta.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={storeSaving || storeLoading}
                className="w-full py-3.5 px-4 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white rounded-xl text-xs font-semibold tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {storeSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Propagating Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Store & Showroom Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: DYNAMIC LEGAL PAGES CMS                            */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-[#FAF0ED] to-white rounded-2xl border border-[#930303]/15">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900">
                Storefront Legal Policies CMS
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Manage Privacy Policy, Terms & Conditions, Hallmarking Disclaimers, and add new custom policies. All published policies automatically appear in the storefront footer!
              </p>
            </div>

            <button
              type="button"
              onClick={openNewPageModal}
              className="px-4 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Legal Policy</span>
            </button>
          </div>

          {/* Legal Pages List Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            {legalLoading ? (
              <div className="p-8 text-center text-stone-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#930303]" />
                <span>Loading legal documents...</span>
              </div>
            ) : legalPages.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <FileText className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-600 font-medium">No legal pages configured yet.</p>
                <button
                  type="button"
                  onClick={openNewPageModal}
                  className="text-xs text-[#930303] font-semibold hover:underline"
                >
                  Create your first policy page →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Policy Document</th>
                      <th className="py-3.5 px-4">Storefront URL Slug</th>
                      <th className="py-3.5 px-4 text-center">Footer Status</th>
                      <th className="py-3.5 px-4 text-center">Display Order</th>
                      <th className="py-3.5 px-4">Last Updated</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {legalPages.map((page) => (
                      <tr key={page._id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-stone-900 flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-[#930303]" />
                            <span>{page.title}</span>
                          </div>
                          {page.summary && (
                            <p className="text-[11px] text-stone-500 truncate max-w-sm mt-0.5">
                              {page.summary}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                          <a
                            href={`${storefrontBase}/page/${page.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:text-[#930303] transition-colors"
                            title="Preview on storefront"
                          >
                            <span>/page/{page.slug}</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </a>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(page)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                              page.isPublished
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                            }`}
                            title="Click to toggle published status"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                page.isPublished ? 'bg-emerald-600' : 'bg-stone-400'
                              }`}
                            />
                            <span>{page.isPublished ? 'Live in Footer' : 'Draft / Hidden'}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center font-semibold text-stone-700">
                          {page.order ?? 0}
                        </td>

                        <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                          {page.lastUpdated
                            ? new Date(page.lastUpdated).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Recently'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`${storefrontBase}/page/${page.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer transition-colors"
                              title="View on storefront"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => openEditPageModal(page)}
                              className="p-1.5 rounded-lg text-stone-600 hover:text-[#930303] hover:bg-[#FAF0ED] cursor-pointer transition-colors"
                              title="Edit policy content"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(page._id)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                              title="Delete policy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {deleteConfirmId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-stone-200 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-red-50 text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Delete Legal Policy?</h3>
                    <p className="text-xs text-stone-500">
                      This page and its link in the storefront footer will be permanently removed.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLegalPage(deleteConfirmId)}
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-xl"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── CREATE / EDIT LEGAL PAGE MODAL ── */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
              <div className="bg-white rounded-2xl border border-stone-200 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl my-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-[#FAF0ED] text-[#930303]">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900">
                        {editingPageId ? 'Edit Legal Policy' : 'Create New Legal Page'}
                      </h3>
                      <p className="text-xs text-stone-500">
                        Published pages instantly surface in the storefront footer without manual code updates.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Form Body */}
                <form onSubmit={handleSaveLegalPage} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Page Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={pageForm.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. BIS Hallmarking & Buyback Guarantee"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#930303]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Storefront URL Slug *
                      </label>
                      <div className="flex items-center rounded-xl bg-stone-50 border border-stone-200 px-3 py-1.5">
                        <span className="text-stone-400 font-mono text-[11px] select-none">/page/</span>
                        <input
                          type="text"
                          required
                          value={pageForm.slug}
                          onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                          placeholder="bis-hallmarking-guarantee"
                          className="w-full bg-transparent border-0 text-stone-900 font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Legal Summary / Excerpt (Optional)
                      </label>
                      <input
                        type="text"
                        value={pageForm.summary}
                        onChange={(e) => setPageForm({ ...pageForm, summary: e.target.value })}
                        placeholder="Brief 1-2 sentence overview shown in meta description & header preview"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#930303]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Display Order Priority
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={pageForm.order}
                        onChange={(e) => setPageForm({ ...pageForm, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#930303]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 pb-1">
                    <input
                      type="checkbox"
                      id="isPublishedCheck"
                      checked={pageForm.isPublished}
                      onChange={(e) => setPageForm({ ...pageForm, isPublished: e.target.checked })}
                      className="w-4 h-4 text-[#930303] accent-[#930303] rounded cursor-pointer"
                    />
                    <label htmlFor="isPublishedCheck" className="text-xs font-semibold text-stone-800 cursor-pointer">
                      Publish to Storefront (Immediately appears in Footer links)
                    </label>
                  </div>

                  {/* Rich Text Editor for Content */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Legal Content (WYSIWYG Rich Editor with Headings & Formatting) *
                    </label>
                    <div className="border border-stone-200 rounded-xl overflow-hidden min-h-[300px]">
                      <RichTextEditor
                        value={pageForm.content}
                        onChange={(val) => setPageForm({ ...pageForm, content: val })}
                        placeholder="Type or paste the official legal policy terms, BIS hallmarking clauses, grievance contacts..."
                      />
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={legalSaving}
                      className="px-5 py-2.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      {legalSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving Document...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{editingPageId ? 'Update Legal Policy' : 'Publish Legal Policy'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: ADMIN SECURITY & CREDENTIALS (DUAL LOGIN + OTP)    */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Current Profile Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-[#930303] text-white flex items-center justify-center font-bold text-base shadow-sm">
                {(user?.name || 'A')[0].toUpperCase()}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-stone-900">{user?.name || 'Administrator'}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF0ED] text-[#930303] border border-[#930303]/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Super Admin</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Username: <strong className="text-stone-800">{user?.username || 'admin'}</strong></span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>Email: <strong className="text-stone-800">{user?.email || 'admin@bljewels.com'}</strong></span>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-stone-500 sm:text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dual Login Active (Username or Email)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ────────────────────────────────────────────────────────── */}
            {/* CARD 1: SEPARATE EMAIL & USERNAME CHANGE                   */}
            {/* ────────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#FAF0ED] text-[#930303]">
                      <Mail className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">
                      Change Admin Email & Username
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Update your registered email or custom username. Changes require verification OTP sent to your current email.
                  </p>
                </div>

                {/* Email Feedback alert */}
                {emailMessage.text && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                      emailMessage.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {emailMessage.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    )}
                    <span className="leading-snug">{emailMessage.text}</span>
                  </div>
                )}

                <form onSubmit={emailOtpStep ? handleVerifyAndUpdateEmail : handleSendEmailOtp} className="space-y-3.5 text-xs">
                  {/* Current Email (Read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                      <span>Current Registered Email</span>
                      <span className="text-[10px] text-stone-400 font-normal">Active OTP Destination</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={user?.email || 'admin@bljewels.com'}
                        className="w-full pl-8 pr-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 font-mono text-xs cursor-not-allowed select-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* New Email */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      New Email Address (Optional if only changing username)
                    </label>
                    <input
                      type="email"
                      disabled={emailOtpStep}
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      placeholder="e.g. newadmin@bljewels.com"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:outline-none focus:border-[#930303] disabled:bg-stone-100"
                    />
                  </div>

                  {/* Custom Username */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                      <span>Username (For Dual Login)</span>
                      <span className="text-[10px] text-stone-400 font-mono">3-30 chars</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={emailOtpStep}
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="admin"
                        className="w-full pl-8 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono text-xs focus:outline-none focus:border-[#930303] disabled:bg-stone-100"
                      />
                      <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">
                      Lowercase letters, numbers, hyphens or underscores.
                    </p>
                  </div>

                  {/* Step 2: OTP Verification Box */}
                  {emailOtpStep ? (
                    <div className="p-3.5 rounded-xl bg-[#FAF0ED] border border-[#930303]/25 space-y-3 mt-2">
                      <div className="flex items-center gap-1.5 text-stone-900 font-semibold text-xs">
                        <KeyRound className="w-4 h-4 text-[#930303]" />
                        <span>Enter 6-Digit Email Verification Code</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Code sent to <strong>{user?.email}</strong>. Enter code below:
                      </p>

                      <div className="space-y-2">
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={emailOtpCode}
                          onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full px-3.5 py-2.5 bg-white border border-[#930303]/40 rounded-xl font-mono text-center text-lg tracking-[.25em] font-bold text-stone-900 focus:outline-none focus:border-[#930303]"
                        />

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={emailUpdating || emailOtpCode.length !== 6}
                            className="flex-1 py-2.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                          >
                            {emailUpdating ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verify & Done</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setEmailOtpStep(false)}
                            className="px-3 py-2.5 text-xs text-stone-600 hover:bg-stone-200/50 rounded-xl cursor-pointer"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={emailOtpSending}
                        className="w-full py-2.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                      >
                        {emailOtpSending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Send OTP & Update Email/Username</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────── */}
            {/* CARD 2: SEPARATE PASSWORD CHANGE WITH EYE BUTTONS          */}
            {/* ────────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#FAF0ED] text-[#930303]">
                      <Key className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">
                      Change Administrator Password
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Update your admin login password securely. Requires 2-step OTP verification sent to current email.
                  </p>
                </div>

                {/* Password Feedback alert */}
                {passMessage.text && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                      passMessage.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {passMessage.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    )}
                    <span className="leading-snug">{passMessage.text}</span>
                  </div>
                )}

                <form onSubmit={passOtpStep ? handleVerifyAndUpdatePass : handleSendPassOtp} className="space-y-3.5 text-xs">
                  {/* New Password Field with Eye Button */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      New Password (Minimum 8 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        disabled={passOtpStep}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new strong password"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303] disabled:bg-stone-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#930303] p-1 cursor-pointer transition-colors"
                        title={showNewPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password Field with Eye Button */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        disabled={passOtpStep}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#930303] disabled:bg-stone-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#930303] p-1 cursor-pointer transition-colors"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: OTP Verification Box for Password */}
                  {passOtpStep ? (
                    <div className="p-3.5 rounded-xl bg-[#FAF0ED] border border-[#930303]/25 space-y-3 mt-2">
                      <div className="flex items-center gap-1.5 text-stone-900 font-semibold text-xs">
                        <KeyRound className="w-4 h-4 text-[#930303]" />
                        <span>Enter 6-Digit Password Authorization Code</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Authorization code sent to <strong>{user?.email}</strong>. Enter code below:
                      </p>

                      <div className="space-y-2">
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={passOtpCode}
                          onChange={(e) => setPassOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full px-3.5 py-2.5 bg-white border border-[#930303]/40 rounded-xl font-mono text-center text-lg tracking-[.25em] font-bold text-stone-900 focus:outline-none focus:border-[#930303]"
                        />

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={passUpdating || passOtpCode.length !== 6}
                            className="flex-1 py-2.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                          >
                            {passUpdating ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verify & Done</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setPassOtpStep(false)}
                            className="px-3 py-2.5 text-xs text-stone-600 hover:bg-stone-200/50 rounded-xl cursor-pointer"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={passOtpSending}
                        className="w-full py-2.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                      >
                        {passOtpSending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending Password OTP...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Send OTP & Update Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
