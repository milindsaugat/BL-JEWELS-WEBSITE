import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Percent,
  Sparkles,
  Copy,
  Check,
  Edit,
  Clock,
  Calendar,
  Users,
  Eye,
  EyeOff,
  Search,
  Filter,
  Flame,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import { couponService, offerService, categoryService, uploadService } from '../services/api';
import { toast } from 'sonner';

export const AdminCoupons = () => {
  // Main Tab State: 'coupons' | 'section' | 'popup'
  const [mainTab, setMainTab] = useState('coupons');

  // ── COUPONS STATE ──
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [couponSearch, setCouponSearch] = useState('');
  const [couponStatusFilter, setCouponStatusFilter] = useState('all');

  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    value: 10,
    minOrderValue: 20000,
    maxDiscount: 10000,
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 500,
    isPublic: true,
    isActive: true,
  });

  // ── OFFERS STATE ──
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [offerForm, setOfferForm] = useState({
    title: '',
    badge: 'FESTIVE MAHOTSAV',
    subtitle: '',
    discountType: 'percentage',
    discountValue: 15,
    bannerImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    targetCategories: ['necklaces', 'choker-sets', 'bridal-heritage'],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    placement: 'section',
    showHeroSectionSale: true,
    showPopupModal: false,
    popupDelaySeconds: 0,
    ctaText: 'Shop Festive Sale',
    ctaLink: '/collections/necklaces',
    couponCode: 'SHUBH10',
    isActive: true,
  });

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      const res = await couponService.getCoupons();
      if (res.coupons) setCoupons(res.coupons);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // Fetch Offers
  const fetchOffers = async () => {
    try {
      const res = await offerService.getOffers();
      if (res.offers) setOffers(res.offers);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoadingOffers(false);
    }
  };

  // Fetch Categories for Checkbox Matrix
  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.categories) {
        setAvailableCategories(res.categories);
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err.message);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchOffers();
    fetchCategories();
  }, []);

  // Lock body scroll for any active modal
  useEffect(() => {
    if (showCouponModal || showOfferModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCouponModal, showOfferModal]);

  // ── COUPON ACTIONS ──
  const handleToggleCouponActive = async (c) => {
    const updated = !c.isActive;
    setCoupons((prev) =>
      prev.map((item) => (item._id === c._id || item.code === c.code ? { ...item, isActive: updated } : item))
    );
    try {
      await couponService.updateCoupon(c._id || c.code, { isActive: updated });
      toast.success(`Coupon ${c.code} is now ${updated ? 'Active' : 'Paused'}`);
      fetchCoupons();
    } catch {
      toast.error('Failed to update coupon status');
      fetchCoupons();
    }
  };

  const handleDeleteCoupon = async (c) => {
    if (!window.confirm(`Delete coupon code "${c.code}"?`)) return;
    try {
      await couponService.deleteCoupon(c._id || c.code);
      toast.success(`Coupon "${c.code}" deleted.`);
      fetchCoupons();
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      title: '',
      description: '',
      discountType: 'percentage',
      value: 15,
      minOrderValue: 0,
      maxDiscount: '',
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: '',
      isPublic: true,
      isActive: true,
    });
    setShowCouponModal(true);
  };

  const handleOpenEditCoupon = (c) => {
    setEditingCoupon(c);
    const dateStr = c.validUntil || c.expiresAt;
    const formatted = dateStr
      ? new Date(dateStr).toISOString().split('T')[0]
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setCouponForm({
      code: c.code || '',
      title: c.title || '',
      description: c.description || '',
      discountType: c.discountType || 'percentage',
      value: c.value !== undefined ? c.value : 0,
      minOrderValue: c.minOrderValue || 0,
      maxDiscount: (c.discountType === 'percentage' && c.maxDiscount && Number(c.maxDiscount) > 0) ? c.maxDiscount : '',
      validUntil: formatted,
      usageLimit: c.usageLimit !== undefined && c.usageLimit !== null ? c.usageLimit : '',
      isPublic: c.isPublic !== false,
      isActive: c.isActive !== false,
    });
    setShowCouponModal(true);
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const isPercentage = couponForm.discountType === 'percentage';
      const hasCap = isPercentage && couponForm.maxDiscount !== '' && couponForm.maxDiscount !== null && Number(couponForm.maxDiscount) > 0;

      const payload = {
        ...couponForm,
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        value: Number(couponForm.value),
        minOrderValue: Number(couponForm.minOrderValue) || 0,
        maxDiscount: hasCap ? Number(couponForm.maxDiscount) : null,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null,
      };

      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon._id || editingCoupon.code, payload);
        toast.success(`Coupon "${payload.code}" updated!`);
      } else {
        await couponService.createCoupon(payload);
        toast.success(`Coupon "${payload.code}" published!`);
      }
      setShowCouponModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // ── OFFER ACTIONS (Separated Section vs Popup) ──
  const handleToggleOfferActive = async (o, placementType) => {
    const willBeActive = !o.isActive;
    const resolvedPlacement = placementType || (o.placement === 'popup' ? 'popup' : 'section');
    const updates = {
      isActive: willBeActive,
      placement: resolvedPlacement,
      showHeroSectionSale: resolvedPlacement === 'section',
      showPopupModal: resolvedPlacement === 'popup',
    };
    setOffers((prev) => prev.map((item) => (item._id === o._id ? { ...item, ...updates } : item)));
    try {
      await offerService.updateOffer(o._id, updates);
      const label = resolvedPlacement === 'popup' ? 'Website Popup' : 'Homepage Sale Section';
      toast.success(`${label} "${o.title}" is now ${willBeActive ? 'Active (Live)' : 'Paused'}`);
      fetchOffers();
    } catch {
      toast.error('Failed to update status');
      fetchOffers();
    }
  };

  const handleDeleteOffer = async (o) => {
    if (!window.confirm(`Delete "${o.title}"?`)) return;
    try {
      await offerService.deleteOffer(o._id);
      toast.success(`"${o.title}" deleted.`);
      fetchOffers();
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  const handleOpenAddOffer = (placement = 'section') => {
    const isPopup = placement === 'popup';
    setEditingOffer(null);
    setOfferForm({
      title: '',
      badge: isPopup ? 'LIMITED TIME POPUP OFFER' : 'FESTIVE MAHOTSAV',
      subtitle: '',
      discountType: 'percentage',
      discountValue: 15,
      bannerImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
      targetCategories: ['necklaces', 'choker-sets', 'bridal-heritage'],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      placement: isPopup ? 'popup' : 'section',
      showHeroSectionSale: !isPopup,
      showPopupModal: isPopup,
      popupDelaySeconds: 0,
      ctaText: isPopup ? 'Claim Festive Offer' : 'Explore Festive Sale',
      ctaLink: '/collections/necklaces',
      couponCode: 'SHUBH10',
      isActive: true,
    });
    setShowOfferModal(true);
  };

  const handleOpenEditOffer = (o, placementOverride) => {
    setEditingOffer(o);
    const dateFormatted = o.endDate
      ? new Date(o.endDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

    const resolvedPlacement =
      placementOverride || (o.placement === 'popup' ? 'popup' : 'section');
    const isPopup = resolvedPlacement === 'popup';
    const isLive = o.isActive !== false;

    setOfferForm({
      title: o.title || '',
      badge: o.badge || (isPopup ? 'LIMITED TIME POPUP OFFER' : 'FESTIVE MAHOTSAV'),
      subtitle: o.subtitle || '',
      discountType: o.discountType || 'percentage',
      discountValue: o.discountValue || 15,
      bannerImage: o.bannerImage || '',
      targetCategories: Array.isArray(o.targetCategories) ? o.targetCategories : ['necklaces'],
      endDate: dateFormatted,
      placement: resolvedPlacement,
      showHeroSectionSale: !isPopup,
      showPopupModal: isPopup,
      popupDelaySeconds: o.popupDelaySeconds ?? 0,
      ctaText: o.ctaText || (isPopup ? 'Claim Festive Offer' : 'Explore Festive Sale'),
      ctaLink: o.ctaLink || '/collections/necklaces',
      couponCode: o.couponCode || 'SHUBH10',
      isActive: isLive,
    });
    setShowOfferModal(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      const targetPlacement = offerForm.placement === 'popup' ? 'popup' : 'section';
      const payload = {
        ...offerForm,
        title: offerForm.title.trim(),
        discountValue: Number(offerForm.discountValue) || 15,
        popupDelaySeconds:
          offerForm.popupDelaySeconds !== '' && offerForm.popupDelaySeconds !== undefined
            ? Number(offerForm.popupDelaySeconds)
            : 0,
        couponCode: (offerForm.couponCode || '').trim().toUpperCase(),
        placement: targetPlacement,
        showHeroSectionSale: targetPlacement === 'section',
        showPopupModal: targetPlacement === 'popup',
        isActive: Boolean(offerForm.isActive),
      };

      const kindLabel = targetPlacement === 'popup' ? 'Website Popup' : 'Homepage Sale Section';
      if (editingOffer) {
        await offerService.updateOffer(editingOffer._id, payload);
        toast.success(`${kindLabel} "${payload.title}" updated!`);
      } else {
        await offerService.createOffer(payload);
        toast.success(`${kindLabel} "${payload.title}" created & published!`);
      }
      setShowOfferModal(false);
      fetchOffers();
    } catch (err) {
      toast.error('Failed to save: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCategoryToggle = (slug) => {
    const current = offerForm.targetCategories || [];
    if (slug === 'all') {
      if (current.includes('all')) {
        setOfferForm({ ...offerForm, targetCategories: [] });
      } else {
        setOfferForm({ ...offerForm, targetCategories: ['all'] });
      }
      return;
    }

    const filtered = current.filter((c) => c !== 'all');
    if (filtered.includes(slug)) {
      setOfferForm({ ...offerForm, targetCategories: filtered.filter((c) => c !== slug) });
    } else {
      setOfferForm({ ...offerForm, targetCategories: [...filtered, slug] });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await uploadService.uploadImage(fd);
      if (res.url) {
        setOfferForm((prev) => ({ ...prev, bannerImage: res.url }));
        toast.success('Banner image uploaded to Cloudinary CDN');
      }
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Copy helper
  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    toast.success(`Code "${code}" copied to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const now = new Date();
  const sectionOffers = offers.filter(
    (o) =>
      o.placement === 'section' ||
      ((!o.placement || o.placement === 'both') && o.showHeroSectionSale !== false)
  );
  const popupOffers = offers.filter(
    (o) =>
      o.placement === 'popup' ||
      ((!o.placement || o.placement === 'both') && o.showPopupModal !== false)
  );

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#930303]/10 text-[#930303] text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Promotion & Campaign Suite</span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
            Coupons & Festive Offers Management
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Manage promo codes, Homepage Sale Section banners, and Website Popup Modals separately.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {mainTab === 'coupons' && (
            <button
              onClick={handleOpenAddCoupon}
              className="px-4 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-bold shadow-md shadow-[#930303]/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Promo Code</span>
            </button>
          )}
          {mainTab === 'section' && (
            <button
              onClick={() => handleOpenAddOffer('section')}
              className="px-4 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-bold shadow-md shadow-[#930303]/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Sale Section</span>
            </button>
          )}
          {mainTab === 'popup' && (
            <button
              onClick={() => handleOpenAddOffer('popup')}
              className="px-4 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-bold shadow-md shadow-[#930303]/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Popup Modal</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation (Promo Codes | Homepage Sale Section | Website Popup Modal) */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 flex-wrap">
        <button
          onClick={() => setMainTab('coupons')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            mainTab === 'coupons'
              ? 'bg-[#930303] text-white shadow-md shadow-[#930303]/20'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Auspicious Promo Codes ({coupons.length})</span>
        </button>

        <button
          onClick={() => setMainTab('section')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            mainTab === 'section'
              ? 'bg-[#930303] text-white shadow-md shadow-[#930303]/20'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Homepage Sale Section ({sectionOffers.length})</span>
        </button>

        <button
          onClick={() => setMainTab('popup')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            mainTab === 'popup'
              ? 'bg-[#930303] text-white shadow-md shadow-[#930303]/20'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Website Popup Modal ({popupOffers.length})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: AUSPICIOUS PROMO CODES
      ───────────────────────────────────────────────────────────── */}
      {mainTab === 'coupons' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search promo code or title..."
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
              {[
                { id: 'all', label: 'All Coupons' },
                { id: 'active', label: 'Active Live' },
                { id: 'inactive', label: 'Paused' },
                { id: 'expired', label: 'Expired' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCouponStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    couponStatusFilter === tab.id
                      ? 'bg-[#930303] text-white'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Coupons Grid */}
          {loadingCoupons ? (
            <div className="p-12 text-center text-stone-500 text-sm bg-white rounded-2xl border border-stone-200">
              Loading auspicious promo codes...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center text-stone-500 text-sm bg-white rounded-2xl border border-stone-200 space-y-2">
              <Tag className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-semibold text-stone-700">No promo codes found</p>
              <p className="text-xs text-stone-400">Click "Create New Promo Code" above to publish one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {coupons
                .filter((c) => {
                  const isExpired = new Date(c.validUntil || c.expiresAt) <= now;
                  if (couponStatusFilter === 'active' && (!c.isActive || isExpired)) return false;
                  if (couponStatusFilter === 'inactive' && c.isActive) return false;
                  if (couponStatusFilter === 'expired' && !isExpired) return false;
                  if (couponSearch.trim()) {
                    const q = couponSearch.toLowerCase();
                    return (c.code || '').toLowerCase().includes(q) || (c.title || '').toLowerCase().includes(q);
                  }
                  return true;
                })
                .map((coupon, idx) => {
                  const isExpired = new Date(coupon.validUntil || coupon.expiresAt) <= now;
                  const expiryFormatted = new Date(coupon.validUntil || coupon.expiresAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const usagePercent = coupon.usageLimit
                    ? Math.min(100, Math.round(((coupon.usedCount || 0) / coupon.usageLimit) * 100))
                    : null;

                  return (
                    <div
                      key={coupon._id || idx}
                      className={`bg-white rounded-2xl border p-5 space-y-4 shadow-sm relative transition-all ${
                        coupon.isActive && !isExpired
                          ? 'border-gold-300/80 shadow-gold-sm hover:border-gold-400'
                          : 'border-stone-200 opacity-80 bg-stone-50/50'
                      }`}
                    >
                      {/* Header inside card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-300 flex items-center justify-center text-[#930303] shrink-0">
                            <Tag className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-base tracking-wider text-stone-900">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => handleCopy(coupon.code)}
                                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                                title="Copy code"
                              >
                                {copiedCode === coupon.code ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <span className="text-[11px] font-bold text-[#930303] block">
                              {coupon.discountType === 'percentage'
                                ? (coupon.maxDiscount && Number(coupon.maxDiscount) > 0
                                    ? `${coupon.value}% Off (Capped at ₹${Number(coupon.maxDiscount).toLocaleString('en-IN')})`
                                    : `${coupon.value}% Off (Pure / No Limit)`)
                                : `₹${Number(coupon.value).toLocaleString('en-IN')} Flat Cash Off`}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleCouponActive(coupon)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 cursor-pointer ${
                            coupon.isActive && !isExpired
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : isExpired
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-stone-200 text-stone-600 border border-stone-300 hover:bg-stone-300'
                          }`}
                        >
                          {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Paused'}
                        </button>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-xs font-bold text-stone-800 truncate">
                          {coupon.title || `${coupon.code} Promotion`}
                        </h3>
                        {coupon.description && (
                          <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{coupon.description}</p>
                        )}
                      </div>

                      {/* Conditions */}
                      <div className="bg-[#FAF7F2] p-3 rounded-xl border border-stone-200 text-xs space-y-1.5 text-stone-600">
                        <div className="flex justify-between">
                          <span>Min. Order Value:</span>
                          <span className="font-bold text-stone-900">
                            ₹{(coupon.minOrderValue || 0).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {coupon.discountType === 'percentage' && (
                          <div className="flex justify-between">
                            <span>Max Discount Limit:</span>
                            <span className="font-bold text-stone-900">
                              {coupon.maxDiscount && Number(coupon.maxDiscount) > 0
                                ? `₹${Number(coupon.maxDiscount).toLocaleString('en-IN')}`
                                : 'Pure % (No Cap)'}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span>Storefront Offers Drawer:</span>
                          <span className="font-semibold flex items-center gap-1">
                            {coupon.isPublic !== false ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Public Offer
                              </span>
                            ) : (
                              <span className="text-stone-400 flex items-center gap-1">
                                <EyeOff className="w-3 h-3" /> Secret Code
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Valid Until:</span>
                          <span className={`font-semibold ${isExpired ? 'text-rose-600 font-bold' : 'text-stone-800'}`}>
                            {expiryFormatted}
                          </span>
                        </div>

                        {coupon.usageLimit && (
                          <div className="pt-1 border-t border-stone-200/60">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span>Redemptions Used:</span>
                              <span className="font-bold text-stone-900">
                                {coupon.usedCount || 0} / {coupon.usageLimit}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#930303] rounded-full transition-all"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                        <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#C9A44A]" />
                          <span>{coupon.isActive && !isExpired ? 'Live in checkout' : 'Inactive'}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditCoupon(coupon)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Coupon"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2 & 3: HOMEPAGE SALE SECTION / WEBSITE POPUP MODAL
      ───────────────────────────────────────────────────────────── */}
      {(mainTab === 'section' || mainTab === 'popup') && (() => {
        const isPopupTab = mainTab === 'popup';
        const filteredList = isPopupTab ? popupOffers : sectionOffers;
        const emptyTitle = isPopupTab ? 'No website popup modals configured' : 'No homepage sale sections configured';
        const emptyHint = isPopupTab
          ? 'Click "Create Popup Modal" to add an animated countdown popup.'
          : 'Click "Create Sale Section" to add a below-hero sale section.';

        return (
          <div className="space-y-4">
            {loadingOffers ? (
              <div className="p-12 text-center text-stone-500 text-sm bg-white rounded-2xl border border-stone-200">
                Loading {isPopupTab ? 'popup modals' : 'sale sections'}...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-12 text-center text-stone-500 text-sm bg-white rounded-2xl border border-stone-200 space-y-2">
                {isPopupTab ? (
                  <Sparkles className="w-10 h-10 text-stone-300 mx-auto" />
                ) : (
                  <Layers className="w-10 h-10 text-stone-300 mx-auto" />
                )}
                <p className="font-semibold text-stone-700">{emptyTitle}</p>
                <p className="text-xs text-stone-400">{emptyHint}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredList.map((offer) => {
                  const isExpired = new Date(offer.endDate) <= now;
                  const formattedEnd = new Date(offer.endDate).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={offer._id}
                      className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
                        offer.isActive && !isExpired
                          ? 'border-[#C9A44A]/80 shadow-gold-sm hover:border-gold-400'
                          : 'border-stone-200 opacity-75'
                      }`}
                    >
                      {/* Top Row: Visual + Title + Single Active/Paused Toggle */}
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-900 border border-[#C9A44A]/40 shrink-0">
                          <img
                            src={offer.bannerImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#930303] bg-[#930303]/10 px-2 py-0.5 rounded-full border border-[#930303]/20 truncate">
                              {offer.badge || (isPopupTab ? 'POPUP OFFER' : 'FESTIVE SALE')}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleOfferActive(offer, mainTab)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                offer.isActive && !isExpired
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                  : isExpired
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-stone-200 text-stone-700 border border-stone-300 hover:bg-stone-300'
                              }`}
                              title={offer.isActive ? 'Click to pause on website' : 'Click to activate on website'}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  offer.isActive && !isExpired
                                    ? 'bg-emerald-600 animate-pulse'
                                    : isExpired
                                    ? 'bg-rose-500'
                                    : 'bg-stone-500'
                                }`}
                              />
                              {isExpired ? 'Expired' : offer.isActive ? 'Active' : 'Paused'}
                            </button>
                          </div>

                          <h3 className="font-heading text-base font-bold text-stone-900 truncate mt-1">
                            {offer.title}
                          </h3>

                          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                            {offer.subtitle || 'Festive discount on hallmarked jewelry'}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold text-[#930303] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              {offer.discountType === 'percentage'
                                ? `${offer.discountValue}% Off`
                                : `₹${offer.discountValue.toLocaleString('en-IN')} Flat Off`}
                            </span>

                            {offer.couponCode && (
                              <span className="text-[11px] font-mono font-bold text-gold-900 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded">
                                Code: {offer.couponCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Placement Details & Category Targets */}
                      <div className="bg-[#FAF7F2] p-3 rounded-xl border border-stone-200 text-xs space-y-2">
                        <div className="flex items-center justify-between text-stone-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>Countdown Ends:</span>
                          </span>
                          <span className={`font-bold ${isExpired ? 'text-rose-600' : 'text-stone-900'}`}>
                            {formattedEnd}
                          </span>
                        </div>

                        {isPopupTab ? (
                          <div className="flex items-center justify-between pt-1.5 border-t border-stone-200 text-xs">
                            <span className="text-stone-600">Popup Open Speed:</span>
                            <span className="font-bold text-stone-900">
                              {(offer.popupDelaySeconds ?? 0) <= 0
                                ? '⚡ Instant on refresh'
                                : `Opens after ${offer.popupDelaySeconds}s on refresh`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between pt-1.5 border-t border-stone-200 text-xs">
                            <span className="text-stone-600">Placement:</span>
                            <span className="font-bold text-stone-900">Below-Hero Sale Section</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-600">CTA Destination:</span>
                          <span className="font-mono text-[11px] font-semibold text-[#930303]">
                            {offer.ctaLink || '/collections/necklaces'}
                          </span>
                        </div>

                        {/* Targeted Categories Pills */}
                        <div className="pt-1.5 border-t border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                            Target Categories ("SALE" Badge Applied):
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(offer.targetCategories || []).map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-0.5 rounded-md bg-white border border-stone-300 text-[10px] font-semibold text-stone-800 capitalize"
                              >
                                {cat === 'all' ? '✦ All Categories' : cat.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                        <span className="text-[11px] text-stone-400">
                          {offer.isActive && !isExpired
                            ? isPopupTab
                              ? '✦ Live popup active on website refresh'
                              : '✦ Live section visible below hero'
                            : isPopupTab
                            ? 'Popup paused on website'
                            : 'Section hidden on website'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditOffer(offer, mainTab)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title={isPopupTab ? 'Edit Popup' : 'Edit Section'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOffer(offer)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={isPopupTab ? 'Delete Popup' : 'Delete Section'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          COUPON MODAL via createPortal to document.body
      ───────────────────────────────────────────────────────────── */}
      {showCouponModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-2xl border border-stone-200 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-accent uppercase tracking-widest text-[#930303] font-bold block">
                  BL Jewels • Promotion Engine
                </span>
                <h3 className="font-heading text-base font-bold text-stone-900 mt-0.5">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Auspicious Promo Code'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCouponSubmit} className="space-y-3.5 text-xs font-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Coupon Code (Uppercase) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIWALI15"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold focus:outline-none focus:border-[#930303]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Campaign Title / Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Auspicious Festive 10% Off"
                    value={couponForm.title}
                    onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#930303]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Description (Shown to Shoppers)</label>
                <input
                  type="text"
                  placeholder="e.g. Enjoy 10% instant discount up to ₹15,000 on hallmark jewelry"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#930303]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Discount Type *</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-semibold focus:outline-none focus:border-[#930303]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash Off (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {couponForm.discountType === 'percentage' ? 'Percentage Value (%) *' : 'Flat Cash Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={couponForm.discountType === 'percentage' ? 'e.g. 15 for 15%' : 'e.g. 2500 for ₹2,500'}
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-bold focus:outline-none focus:border-[#930303]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Min. Cart Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="e.g. 0 or 20000"
                    value={couponForm.minOrderValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                  />
                </div>

                {couponForm.discountType === 'percentage' ? (
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      Max Discount Cap (₹) <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="Blank = Unlimited Pure %"
                      value={couponForm.maxDiscount ?? ''}
                      onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                    />
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Khali chhodne par bina kisi limit ke pure {couponForm.value || 'X'}% discount milega.
                    </span>
                  </div>
                ) : (
                  <div className="bg-emerald-50/70 border border-dashed border-emerald-200 rounded-xl p-2.5 flex flex-col justify-center text-[11px] text-emerald-900">
                    <span className="font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Flat Cash Discount
                    </span>
                    <span className="text-emerald-700 mt-0.5">
                      Cart value par seedha flat ₹{Number(couponForm.value || 0).toLocaleString('en-IN')} instant discount milega (No cap required).
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Valid Until (Expiry Date)</label>
                  <input
                    type="date"
                    required
                    value={couponForm.validUntil}
                    onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Usage Limit <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 500 (blank = unlimited)"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <input
                    type="checkbox"
                    id="isPublicCoupon"
                    checked={couponForm.isPublic}
                    onChange={(e) => setCouponForm({ ...couponForm, isPublic: e.target.checked })}
                    className="w-4 h-4 text-[#930303] rounded border-stone-300 focus:ring-[#930303]"
                  />
                  <label htmlFor="isPublicCoupon" className="text-stone-800 font-semibold text-xs cursor-pointer">
                    Show in 1-Click Offers Drawer
                  </label>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <input
                    type="checkbox"
                    id="isActiveCoupon"
                    checked={couponForm.isActive}
                    onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#930303] rounded border-stone-300 focus:ring-[#930303]"
                  />
                  <label htmlFor="isActiveCoupon" className="text-stone-800 font-semibold text-xs cursor-pointer">
                    Activate immediately
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl font-bold shadow-md shadow-[#930303]/25 transition-all cursor-pointer"
                >
                  {editingCoupon ? 'Update Promo Code' : 'Save & Publish Code'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────────────
          OFFER MODAL via createPortal to document.body
      ───────────────────────────────────────────────────────────── */}
      {showOfferModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-5 space-y-4 shadow-2xl border border-stone-200 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-accent uppercase tracking-widest text-[#930303] font-bold block">
                  {offerForm.placement === 'popup'
                    ? 'BL Jewels • Website Popup Modal Campaign'
                    : 'BL Jewels • Homepage Sale Section Banner'}
                </span>
                <h3 className="font-heading text-base font-bold text-stone-900 mt-0.5">
                  {editingOffer
                    ? `Edit ${offerForm.placement === 'popup' ? 'Popup Modal' : 'Sale Section'}: ${editingOffer.title}`
                    : offerForm.placement === 'popup'
                    ? 'Create Website Popup Modal'
                    : 'Create Homepage Sale Section'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-3.5 text-xs font-body">
              {/* Campaign Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali & Dhanteras Gold Mahotsav"
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-[#930303]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Festival Badge Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHANTERAS SALE, DIWALI MAHOTSAV"
                    value={offerForm.badge}
                    onChange={(e) => setOfferForm({ ...offerForm, badge: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold uppercase tracking-wider focus:outline-none focus:border-[#930303]"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Subtitle / Marketing Description</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 15% Auspicious Rebate on all 22K (916) BIS Hallmarked Gold Necklaces"
                  value={offerForm.subtitle}
                  onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#930303]"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Discount Type</label>
                  <select
                    value={offerForm.discountType}
                    onChange={(e) => setOfferForm({ ...offerForm, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash Off (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {offerForm.discountType === 'percentage' ? 'Discount Percentage (%) *' : 'Flat Discount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={offerForm.discountValue}
                    onChange={(e) => setOfferForm({ ...offerForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-bold focus:outline-none focus:border-[#930303]"
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div className="space-y-1.5">
                <label className="block text-stone-700 font-semibold">
                  {offerForm.placement === 'popup' ? 'Popup Artwork Image' : 'Section Banner Artwork Image'}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    placeholder="Paste image URL (or upload below)"
                    value={offerForm.bannerImage}
                    onChange={(e) => setOfferForm({ ...offerForm, bannerImage: e.target.value })}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 text-xs focus:outline-none focus:border-[#930303]"
                  />
                  <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 border border-stone-300">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-[#930303]" /> : <UploadCloud className="w-4 h-4" />}
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {offerForm.bannerImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setOfferForm({ ...offerForm, bannerImage: '' });
                        toast.success('Artwork image removed');
                      }}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 border border-rose-200 transition-colors"
                      title="Remove artwork image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                {offerForm.bannerImage && (
                  <div className="w-full h-24 rounded-xl overflow-hidden border border-stone-200 mt-1">
                    <img src={offerForm.bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Target Categories Checkbox Matrix */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-stone-800 font-bold text-xs">
                    Target Categories (Products will get "SALE" badge & offer price):
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle('all')}
                    className="text-[11px] text-[#930303] font-bold underline cursor-pointer"
                  >
                    {offerForm.targetCategories?.includes('all') ? 'Unselect All' : 'Select All Categories'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { slug: 'necklaces', label: 'Necklaces' },
                    { slug: 'rings', label: 'Rings' },
                    { slug: 'earrings', label: 'Earrings' },
                    { slug: 'choker-sets', label: 'Choker Sets' },
                    { slug: 'bangles-bracelets', label: 'Bangles & Bracelets' },
                    { slug: 'mangalsutras', label: 'Mangalsutras' },
                    { slug: 'bridal-heritage', label: 'Bridal Heritage' },
                    { slug: 'pendants', label: 'Pendants' },
                    { slug: 'chains', label: 'Chains' },
                  ].map((cat) => {
                    const isSelected =
                      offerForm.targetCategories?.includes('all') ||
                      offerForm.targetCategories?.includes(cat.slug);
                    return (
                      <label
                        key={cat.slug}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-red-50 border-[#930303] text-[#930303] font-bold'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCategoryToggle(cat.slug)}
                          className="w-3.5 h-3.5 text-[#930303] rounded border-stone-300 focus:ring-[#930303]"
                        />
                        <span className="truncate">{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Countdown End Date & Linked Coupon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Countdown Timer End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={offerForm.endDate}
                    onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-mono focus:outline-none focus:border-[#930303]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Linked Coupon Code <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SHUBH10"
                    value={offerForm.couponCode}
                    onChange={(e) => setOfferForm({ ...offerForm, couponCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold uppercase focus:outline-none focus:border-[#930303]"
                  />
                </div>
              </div>

              {/* CTA Text, CTA Link, and Popup Delay (when Popup) */}
              <div className={`grid grid-cols-1 ${offerForm.placement === 'popup' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Explore Festive Sale"
                    value={offerForm.ctaText}
                    onChange={(e) => setOfferForm({ ...offerForm, ctaText: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">CTA Destination Link</label>
                  <input
                    type="text"
                    placeholder="/collections/necklaces"
                    value={offerForm.ctaLink}
                    onChange={(e) => setOfferForm({ ...offerForm, ctaLink: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-mono focus:outline-none focus:border-[#930303]"
                  />
                </div>

                {offerForm.placement === 'popup' && (
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Popup Open Delay (Sec)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={offerForm.popupDelaySeconds}
                      onChange={(e) => setOfferForm({ ...offerForm, popupDelaySeconds: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-bold focus:outline-none focus:border-[#930303]"
                    />
                  </div>
                )}
              </div>

              {/* Single Clean Status Switch */}
              <div
                onClick={() => setOfferForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                  offerForm.isActive
                    ? 'bg-emerald-50/90 border-emerald-400 shadow-xs'
                    : 'bg-stone-50 border-stone-300 opacity-85 hover:opacity-100'
                }`}
              >
                <div>
                  <span className="font-bold text-xs text-stone-900 block">
                    {offerForm.placement === 'popup' ? 'Website Popup Status' : 'Homepage Sale Section Status'}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {offerForm.isActive
                      ? offerForm.placement === 'popup'
                        ? 'Popup modal will open automatically when customers load or refresh the website.'
                        : 'Below-Hero sale section is live and visible on the homepage.'
                      : 'Currently paused and hidden from customers.'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                      offerForm.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {offerForm.isActive ? '✓ Active' : '⏸ Paused'}
                  </span>
                  <div
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                      offerForm.isActive ? 'bg-[#930303]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        offerForm.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl font-bold shadow-md shadow-[#930303]/25 transition-all cursor-pointer"
                >
                  {editingOffer
                    ? offerForm.placement === 'popup'
                      ? 'Update Popup Modal'
                      : 'Update Sale Section'
                    : offerForm.placement === 'popup'
                    ? 'Publish Popup Modal'
                    : 'Publish Sale Section'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AdminCoupons;
