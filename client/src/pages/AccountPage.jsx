import React, { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  Package, Heart, MapPin, User, LogOut, ArrowUpRight, LifeBuoy, Plus, Send,
  UploadCloud, Camera, Trash2, Loader2, CheckCircle2, Lock, ShieldCheck,
  FileText, ExternalLink, Eye, EyeOff, AlertCircle, Video, Image as ImageIcon, Paperclip,
  X, ShieldAlert, ChevronDown, ChevronUp, KeyRound, Printer, Truck, Award, Clock, CreditCard
} from 'lucide-react';
import { api, orderService, authService, ticketService, uploadService, productService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { ProductCard } from '../components/product/ProductCard';
import OtpInput from '../components/common/OtpInput';

const emptyAddress = { label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };
const emptyTicket = {
  category: 'Order & Delivery',
  orderNumber: '',
  priority: 'normal',
  subject: '',
  message: '',
  returnReasons: [],
  otherReasonText: '',
  attachments: [],
};
const money = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const numberToWordsIndian = (num) => {
  if (!num || isNaN(num) || num <= 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  };

  const integerPart = Math.floor(num);
  return 'INR ' + inWords(integerPart) + ' Only';
};

const RETURN_REASONS = [
  { id: 'damaged', label: 'Item arrived damaged or broken', hindi: 'टूटा हुआ या क्षतिग्रस्त आभूषण' },
  { id: 'defective', label: 'Defective clasp / loose gemstone or pearl', hindi: 'नगीना ढीला या लॉक खराब' },
  { id: 'wrong_item', label: 'Wrong item or different design received', hindi: 'गलत सामान या दूसरा डिज़ाइन मिला' },
  { id: 'mismatch_photo', label: 'Item does not match website pictures / finish issue', hindi: 'वेबसाइट फोटो से मेल नहीं खाता' },
  { id: 'size_fit', label: 'Size or fitting does not fit', hindi: 'नाप या साइज़ की समस्या' },
  { id: 'missing_hallmark', label: 'Missing BIS hallmark certificate or invoice bill', hindi: 'हॉलमार्क सर्टिफिकेट या बिल नहीं मिला' },
  { id: 'tampered_parcel', label: 'Outer parcel packaging was tampered / unsealed', hindi: 'पार्सल की सील टूटी या खुली हुई मिली' },
  { id: 'other', label: 'Other issue', hindi: 'अन्य कारण' },
];

const CANCEL_REASONS = [
  { id: 'wrong_address', label: 'Incorrect delivery address or contact number' },
  { id: 'change_design', label: 'Want to change jewellery piece / ring size / purity variant' },
  { id: 'placed_by_mistake', label: 'Placed order by mistake or duplicate order' },
  { id: 'delivery_delay', label: 'Expected faster delivery / change in wedding or occasion date' },
  { id: 'coupon_pricing', label: 'Forgot to apply auspicious coupon / pricing query' },
  { id: 'payment_issue', label: 'Payment issue or bank account query' },
  { id: 'other', label: 'Other personal reason' },
];

const STATUS_BADGE = {
  open: 'bg-amber-50 text-amber-800 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-800 border-blue-200',
  replied: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  resolved: 'bg-stone-100 text-stone-700 border-stone-200',
  closed: 'bg-stone-100 text-stone-500 border-stone-200',
};

export const AccountPage = () => {
  const { user, isAuthenticated, logout, updateUser, wishlist } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const validTabs = ['orders', 'support', 'addresses', 'profile', 'wishlist'];

  const [tab, setTab] = useState(() => {
    if (urlTab && validTabs.includes(urlTab)) return urlTab;
    try {
      const saved = localStorage.getItem('bl_account_active_tab');
      if (saved && validTabs.includes(saved)) return saved;
    } catch {}
    return 'orders';
  });

  const handleTabChange = (nextTab) => {
    if (!validTabs.includes(nextTab)) return;
    setTab(nextTab);
    setSearchParams({ tab: nextTab }, { replace: true });
    try {
      localStorage.setItem('bl_account_active_tab', nextTab);
    } catch {}
  };

  useEffect(() => {
    if (urlTab && validTabs.includes(urlTab) && urlTab !== tab) {
      setTab(urlTab);
      try {
        localStorage.setItem('bl_account_active_tab', urlTab);
      } catch {}
    }
  }, [urlTab]);

  useEffect(() => {
    if (tab && validTabs.includes(tab)) {
      if (searchParams.get('tab') !== tab) {
        setSearchParams({ tab }, { replace: true });
      }
      try {
        localStorage.setItem('bl_account_active_tab', tab);
      } catch {}
    }
  }, [tab]);

  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showTicketUpload, setShowTicketUpload] = useState(false);
  const [ticketForm, setTicketForm] = useState(emptyTicket);
  const [ticketUploadBusy, setTicketUploadBusy] = useState(false);
  const [ticketUploadError, setTicketUploadError] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyAttachments, setReplyAttachments] = useState({});
  const [replyUploadBusy, setReplyUploadBusy] = useState({});
  const [replyUploadError, setReplyUploadError] = useState({});
  const [showReplyUpload, setShowReplyUpload] = useState({});
  const [closedChatExpanded, setClosedChatExpanded] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    panNumber: user?.panNumber || '',
    panCardImage: user?.panCardImage || '',
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [uploadingPan, setUploadingPan] = useState(false);
  const [panError, setPanError] = useState('');
  const [savingPan, setSavingPan] = useState(false);
  const [panSuccessNotice, setPanSuccessNotice] = useState('');
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [address, setAddress] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Inline Order Expansion & Single-Page Tax Invoice Printing
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);

  const handlePrintOrder = (orderToPrint) => {
    setPrintOrder(orderToPrint);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Order Cancellation Reason & Confirmation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelComments, setCancelComments] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Change Password state (OTP Protected)
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwdStep, setPwdStep] = useState('initial'); // 'initial' | 'otp'
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdShow, setPwdShow] = useState(false);
  const [pwdOtp, setPwdOtp] = useState('');
  const [pwdServerOtp, setPwdServerOtp] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdCooldown, setPwdCooldown] = useState(0);

  useEffect(() => {
    if (pwdCooldown <= 0) return;
    const timer = setInterval(() => {
      setPwdCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [pwdCooldown]);

  useEffect(() => {
    if (tab !== 'wishlist' || !isAuthenticated) return;
    if (!wishlist || wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    let cancelled = false;
    const fetchWishlist = async () => {
      setLoadingWishlist(true);
      try {
        const res = await productService.getProducts({});
        if (!cancelled && res?.products) {
          const filtered = res.products.filter((p) => wishlist.includes(p._id));
          setWishlistProducts(filtered);
        }
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      } finally {
        if (!cancelled) setLoadingWishlist(false);
      }
    };
    fetchWishlist();
    return () => {
      cancelled = true;
    };
  }, [tab, wishlist, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    Promise.all([
      orderService.getMyOrders(),
      authService.getMe(),
      ticketService.getMyTickets().catch(() => ({ data: [] })),
    ])
      .then(([o, u, t]) => {
        if (active) {
          setOrders(o.orders || []);
          updateUser(u.user);
          setAddresses(u.user.addresses || []);
          setProfile({
            name: u.user.name,
            phone: u.user.phone || '',
            avatar: u.user.avatar || '',
            panNumber: u.user.panNumber || '',
            panCardImage: u.user.panCardImage || '',
          });
          setTickets(t?.data || []);
        }
      })
      .catch((e) => {
        if (active) setError(e.response?.data?.message || 'Unable to load your account. Please reload.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  // Live Real-Time Chat Sync for Support Tickets (updates live without page refresh)
  useEffect(() => {
    if (tab !== 'support' || !isAuthenticated) return;
    let isMounted = true;

    const syncInterval = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await ticketService.getMyTickets();
        if (isMounted && res?.data) {
          setTickets((prev) => {
            const prevStr = JSON.stringify(prev.map(t => ({ id: t._id, rCount: t.replies?.length, status: t.status, updatedAt: t.updatedAt })));
            const newStr = JSON.stringify(res.data.map(t => ({ id: t._id, rCount: t.replies?.length, status: t.status, updatedAt: t.updatedAt })));
            return prevStr !== newStr ? res.data : prev;
          });
        }
      } catch {
        // Silent background poll
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, [tab, isAuthenticated]);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveAddresses = async (list) => {
    const { data } = await api.put('/auth/addresses', { addresses: list });
    updateUser(data.user);
    setAddresses(data.user.addresses);
    setAddress(null);
    setNotice('Addresses saved.');
  };

  const action = (id, act) =>
    run(async () => {
      const { data } = await api.post(`/auth/orders/${id}/action`, { action: act });
      setOrders(orders.map((o) => (o._id === id ? data.order : o)));
      setNotice('Request recorded. Contact us for refund or return assistance.');
    });

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    if (!cancelReason) {
      setCancelError('Please select a cancellation reason before proceeding.');
      return;
    }
    setCancelSubmitting(true);
    setCancelError('');
    try {
      const { data } = await api.post(`/auth/orders/${cancelModalOrder._id}/action`, {
        action: 'cancel',
        reason: cancelReason,
        comments: cancelComments,
      });
      setOrders(orders.map((o) => (o._id === cancelModalOrder._id ? data.order : o)));
      setNotice(`Order #${cancelModalOrder.orderNumber} has been successfully cancelled. If debited, 100% refund will be processed to your original payment method.`);
      setCancelModalOrder(null);
      setCancelReason('');
      setCancelComments('');
    } catch (err) {
      setCancelError(err.response?.data?.message || err.message || 'Unable to cancel this order. Please try again or contact atelier support.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const uploadMediaFile = async (file) => {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
    const maxBytes = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error(
        isVideo
          ? `Video "${file.name}" exceeds 50MB limit.`
          : `Photo "${file.name}" exceeds 10MB limit.`
      );
    }
    const res = await uploadService.uploadImage(file, 'bl-jewels/tickets');
    const url = res?.url || res?.secure_url;
    if (!url) throw new Error('Upload failed to return file URL.');
    return {
      url,
      publicId: res?.publicId || res?.public_id || '',
      fileType: (res?.fileType === 'video' || isVideo) ? 'video' : 'image',
      originalName: file.name,
      size: file.size,
    };
  };

  const handleTicketFilesSelected = async (fileList) => {
    if (!fileList || !fileList.length) return;
    setTicketUploadError('');
    const curAttachments = ticketForm.attachments || [];
    let curPhotos = curAttachments.filter(a => a.fileType === 'image').length;
    let curVideos = curAttachments.filter(a => a.fileType === 'video').length;

    const files = Array.from(fileList);
    const toUpload = [];
    for (const f of files) {
      const isVid = f.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(f.name);
      if (isVid) {
        if (curVideos >= 2) {
          setTicketUploadError('Maximum 2 videos allowed (अधिकतम 2 वीडियो की अनुमति है).');
          continue;
        }
        curVideos++;
        toUpload.push(f);
      } else {
        if (curPhotos >= 4) {
          setTicketUploadError('Maximum 4 photos allowed (अधिकतम 4 फोटो की अनुमति है).');
          continue;
        }
        curPhotos++;
        toUpload.push(f);
      }
    }

    if (!toUpload.length) return;

    setTicketUploadBusy(true);
    try {
      for (const f of toUpload) {
        const uploaded = await uploadMediaFile(f);
        setTicketForm(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), uploaded],
        }));
      }
    } catch (err) {
      setTicketUploadError(err.message || 'Failed to upload media. Please try again.');
    } finally {
      setTicketUploadBusy(false);
    }
  };

  const handleRemoveTicketAttachment = (idx) => {
    setTicketForm(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== idx),
    }));
  };

  const handleToggleReturnReason = (reasonId) => {
    setTicketForm(prev => {
      const existing = prev.returnReasons || [];
      const next = existing.includes(reasonId)
        ? existing.filter(r => r !== reasonId)
        : [...existing, reasonId];
      return { ...prev, returnReasons: next };
    });
  };

  const handleReplyFilesSelected = async (ticketId, fileList) => {
    if (!fileList || !fileList.length) return;
    setReplyUploadError(prev => ({ ...prev, [ticketId]: '' }));
    const curAttachments = replyAttachments[ticketId] || [];
    let curPhotos = curAttachments.filter(a => a.fileType === 'image').length;
    let curVideos = curAttachments.filter(a => a.fileType === 'video').length;

    const files = Array.from(fileList);
    const toUpload = [];
    for (const f of files) {
      const isVid = f.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(f.name);
      if (isVid) {
        if (curVideos >= 2) {
          setReplyUploadError(prev => ({ ...prev, [ticketId]: 'Maximum 2 videos allowed (अधिकतम 2 वीडियो की अनुमति है).' }));
          continue;
        }
        curVideos++;
        toUpload.push(f);
      } else {
        if (curPhotos >= 4) {
          setReplyUploadError(prev => ({ ...prev, [ticketId]: 'Maximum 4 photos allowed (अधिकतम 4 फोटो की अनुमति है).' }));
          continue;
        }
        curPhotos++;
        toUpload.push(f);
      }
    }

    if (!toUpload.length) return;

    setReplyUploadBusy(prev => ({ ...prev, [ticketId]: true }));
    try {
      for (const f of toUpload) {
        const uploaded = await uploadMediaFile(f);
        setReplyAttachments(prev => ({
          ...prev,
          [ticketId]: [...(prev[ticketId] || []), uploaded],
        }));
      }
    } catch (err) {
      setReplyUploadError(prev => ({ ...prev, [ticketId]: err.message || 'Upload failed.' }));
    } finally {
      setReplyUploadBusy(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleRemoveReplyAttachment = (ticketId, idx) => {
    setReplyAttachments(prev => ({
      ...prev,
      [ticketId]: (prev[ticketId] || []).filter((_, i) => i !== idx),
    }));
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    let finalReasons = ticketForm.returnReasons || [];
    if (ticketForm.category === 'Return & Refund') {
      if (finalReasons.length === 0) {
        setError('Please select at least one return reason (कृपया वापसी का कारण चुनें).');
        return;
      }
      if (finalReasons.includes('other') && ticketForm.otherReasonText?.trim()) {
        finalReasons = finalReasons.map(r => r === 'other' ? `Other: ${ticketForm.otherReasonText.trim()}` : r);
      }
    }

    run(async () => {
      const payload = {
        ...ticketForm,
        returnReasons: finalReasons,
        attachments: ticketForm.attachments || [],
      };
      const res = await ticketService.createMyTicket(payload);
      if (res?.data) {
        setTickets((prev) => [res.data, ...prev]);
        setTicketForm(emptyTicket);
        setShowNewTicket(false);
        setNotice(`Support ticket ${res.data.ticketNumber} created successfully. Our concierge will review your claim and attachments.`);
      }
    });
  };

  const handleCustomerReply = (e, ticketId) => {
    e.preventDefault();
    const msg = (replyDrafts[ticketId] || '').trim();
    const atts = replyAttachments[ticketId] || [];
    if (!msg && atts.length === 0) {
      setError('Please enter a message or attach photos/unboxing videos.');
      return;
    }
    run(async () => {
      const res = await ticketService.replyMyTicket(ticketId, {
        message: msg,
        attachments: atts,
      });
      if (res?.data) {
        setTickets((prev) => prev.map((t) => (t._id === ticketId ? res.data : t)));
        setReplyDrafts((prev) => ({ ...prev, [ticketId]: '' }));
        setReplyAttachments((prev) => ({ ...prev, [ticketId]: [] }));
        setShowReplyUpload((prev) => ({ ...prev, [ticketId]: false }));
        setNotice('Your reply with attachments has been sent to our concierge team.');
      }
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image file size must be less than 5MB.');
      return;
    }
    setUploadingAvatar(true);
    setAvatarError('');
    setError('');
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/avatars');
      if (res?.url) {
        const nextProfile = { ...profile, avatar: res.url };
        setProfile(nextProfile);
        const { data } = await api.put('/auth/profile', nextProfile);
        if (data?.user) {
          updateUser(data.user);
        }
        setNotice('Profile photo updated successfully!');
      } else {
        setAvatarError('Photo upload did not return a valid URL.');
      }
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    setAvatarError('');
    try {
      const nextProfile = { ...profile, avatar: '' };
      setProfile(nextProfile);
      const { data } = await api.put('/auth/profile', nextProfile);
      if (data?.user) {
        updateUser(data.user);
      }
      setNotice('Profile photo removed.');
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to remove photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePanNumberChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setProfile((prev) => ({ ...prev, panNumber: val }));
    setPanError('');
    setPanSuccessNotice('');
  };

  const handlePanCardUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPanError('PAN Card file size must be less than 5MB.');
      e.target.value = '';
      return;
    }

    setUploadingPan(true);
    setPanError('');
    setPanSuccessNotice('');
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/pancards');
      const url = res?.url || res?.secure_url || res?.imageUrl || res?.image;
      if (url) {
        setProfile((prev) => ({ ...prev, panCardImage: url }));
        setPanSuccessNotice('PAN card image uploaded! Click "Save PAN Details" to apply.');
      } else {
        setPanError('Upload did not return a valid URL.');
      }
    } catch (err) {
      setPanError(err.response?.data?.message || 'Failed to upload PAN card. Please try again.');
    } finally {
      setUploadingPan(false);
      e.target.value = '';
    }
  };

  const handleRemovePanCard = () => {
    setProfile((prev) => ({ ...prev, panCardImage: '' }));
    setPanSuccessNotice('PAN card image removed. Click "Save PAN Details" to apply changes.');
  };

  const handleSavePan = async (e) => {
    if (e) e.preventDefault();
    const pan = (profile.panNumber || '').trim().toUpperCase();
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      setPanError('Please enter a valid 10-character Indian PAN number (e.g. ABCDE1234F).');
      return;
    }

    setSavingPan(true);
    setPanError('');
    setPanSuccessNotice('');
    try {
      const { data } = await api.put('/auth/profile', {
        panNumber: pan,
        panCardImage: profile.panCardImage || '',
      });
      if (data?.user) {
        updateUser(data.user);
        setProfile((prev) => ({
          ...prev,
          panNumber: data.user.panNumber || '',
          panCardImage: data.user.panCardImage || '',
        }));
      }
      setPanSuccessNotice('PAN card & KYC compliance details updated successfully!');
    } catch (err) {
      setPanError(err.response?.data?.message || 'Failed to update PAN details.');
    } finally {
      setSavingPan(false);
    }
  };

  const handleRequestPasswordOtp = async () => {
    if (!pwdNew || pwdNew.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError('Passwords do not match. Please verify.');
      return;
    }

    setPwdLoading(true);
    setPwdError('');
    setPwdSuccess('');

    try {
      const res = await authService.changePasswordOtp();
      if (res.success) {
        setPwdStep('otp');
        setPwdCooldown(60);
        setPwdServerOtp(res.otp || res.demoOtp || '');
        setPwdSuccess(res.message || `A 6-digit verification code has been dispatched to ${user.email}.`);
      } else {
        setPwdError(res.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setPwdError(err.response?.data?.message || err.message || 'Failed to dispatch verification code.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleConfirmChangePassword = async () => {
    if (!pwdOtp || pwdOtp.trim().length < 6) {
      setPwdError('Please enter the 6-digit verification code.');
      return;
    }

    setPwdLoading(true);
    setPwdError('');
    setPwdSuccess('');

    try {
      const res = await authService.changePassword(pwdOtp.trim(), pwdNew);
      if (res.success) {
        setPwdSuccess(res.message || 'Password updated successfully! You can now use your new password.');
        setPwdOtp('');
        setPwdNew('');
        setPwdConfirm('');
        setPwdStep('initial');
        setTimeout(() => {
          setShowChangePassword(false);
          setPwdSuccess('');
        }, 3500);
      } else {
        setPwdError(res.message || 'Failed to update password. Please check your verification code.');
      }
    } catch (err) {
      setPwdError(err.response?.data?.message || err.message || 'Failed to update password. Please check your verification code.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleResendPasswordOtp = async () => {
    if (pwdCooldown > 0 || pwdLoading) return;
    setPwdLoading(true);
    setPwdError('');
    setPwdSuccess('');

    try {
      const res = await authService.changePasswordOtp();
      if (res.success) {
        setPwdCooldown(60);
        setPwdServerOtp(res.otp || res.demoOtp || '');
        setPwdSuccess(`A new verification code has been dispatched to ${user.email}.`);
      } else {
        setPwdError(res.message || 'Could not resend verification code.');
      }
    } catch (err) {
      setPwdError(err.response?.data?.message || err.message || 'Could not resend verification code.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  const openTicketCount = tickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length;
  const tabs = [
    ['orders', 'My orders', Package],
    ['support', `Support tickets${openTicketCount ? ` (${openTicketCount})` : ''}`, LifeBuoy],
    ['addresses', 'Address book', MapPin],
    ['profile', 'My profile', User],
    ['wishlist', `Wishlist${wishlist?.length ? ` (${wishlist.length})` : ''}`, Heart],
  ];

  return (
    <section className="bg-[#FAF7F4] py-8 sm:py-12 min-h-[70vh] print:p-0 print:bg-white print:min-h-0">
      <div className="container-bl print:hidden">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FAF7F2] border-2 border-[#C9A44A]/40 overflow-hidden flex items-center justify-center font-display font-bold text-2xl sm:text-3xl text-[#930303] shadow-sm shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || 'Customer'} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-[#930303] font-semibold">My account</p>
              <h1 className="font-display text-2xl sm:text-3xl mt-1 text-stone-900">Hello, {user?.name}</h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">Your jewellery, orders, support tickets and details. All in one place.</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="flex items-center gap-2 text-sm text-stone-600 hover:text-[#930303] cursor-pointer self-start sm:self-center transition-colors">
            <LogOut size={16} />
            Sign out
          </button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
          {[
            ['Orders', orders.length, 'orders'],
            ['On the way', orders.filter((o) => ['shipped', 'out_for_delivery'].includes(o.status)).length, 'orders'],
            ['Support tickets', tickets.length, 'support'],
            ['Saved favourites', wishlist.length, 'wishlist'],
          ].map(([label, value, tabKey]) => (
            <div
              key={label}
              onClick={() => handleTabChange(tabKey)}
              className="p-5 bg-white border border-stone-200 rounded-2xl cursor-pointer hover:border-[#930303]/40 transition-colors shadow-2xs group"
              title={`View ${label}`}
            >
              <p className="text-xs text-stone-500 group-hover:text-stone-700">{label}</p>
              <p className="text-2xl font-semibold mt-2 text-[#930303]">{loading ? '—' : value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[235px_1fr] gap-6">
          <nav className="flex flex-wrap lg:flex-col gap-2 self-start bg-white border rounded-2xl p-3">
            {tabs.map(([id, label, Icon]) => (
              <button
                type="button"
                key={id}
                onClick={() => handleTabChange(id)}
                className={`flex items-center gap-3 p-3 text-sm rounded-xl text-left cursor-pointer transition-colors ${
                  tab === id ? 'bg-[#930303] text-white shadow-xs' : 'hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
            <Link to="/contact" className="flex gap-3 p-3 text-sm hover:bg-stone-50 rounded-xl text-stone-700 transition-colors">
              <ArrowUpRight size={18} />
              <span>Showroom inquiry</span>
            </Link>
          </nav>

          <div className="min-w-0 space-y-4">
            {error && (
              <p role="alert" className="bg-red-50 text-red-800 p-4 rounded-xl text-sm">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="bg-green-50 text-green-800 p-4 rounded-xl text-sm">
                {notice}
              </p>
            )}
            {loading ? (
              <p role="status">Loading your account…</p>
            ) : (
              <>
                {tab === 'orders' && (
                  <>
                    <h2 className="text-xl font-semibold">Order history</h2>
                    {!orders.length && (
                      <div className="bg-white rounded-2xl border p-10 text-center">
                        <Package className="mx-auto text-[#930303]" />
                        <h3 className="text-lg mt-4">Your first favourite awaits</h3>
                        <p className="text-stone-500 text-sm my-3">Your orders will appear here after checkout.</p>
                        <Link to="/collections" className="text-[#930303] underline">
                          Explore jewellery
                        </Link>
                      </div>
                    )}
                    {orders.map((o) => {
                      const isExpanded = expandedOrderId === o._id;
                      const subtotal = o.pricing?.subtotal ?? 0;
                      const discount = o.pricing?.discount ?? 0;
                      const shipping = o.pricing?.shipping ?? 0;
                      const total = o.pricing?.total ?? 0;

                      return (
                        <article
                          key={o._id}
                          className={`bg-white border rounded-2xl p-5 space-y-4 transition-all duration-200 ${
                            isExpanded
                              ? 'border-[#930303]/40 shadow-lg ring-1 ring-[#930303]/20 bg-stone-50/20'
                              : 'hover:border-stone-300'
                          }`}
                        >
                          <div className="flex flex-wrap justify-between items-start gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-stone-900 text-base">{o.orderNumber}</h3>
                                {isExpanded && (
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                    Expanded View
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 mt-0.5">
                                Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#930303] capitalize">
                                {o.status?.replaceAll('_', ' ')}
                              </p>
                              <p className="font-bold text-stone-900 text-base">{money(total)}</p>
                            </div>
                          </div>

                          {/* Quick Previews (Shown when collapsed, or as item list) */}
                          {!isExpanded && (
                            <>
                              {o.items?.map((i, n) => (
                                <div key={n} className="flex items-center gap-3 text-sm">
                                  {i.snapshot?.image && (
                                    <img src={i.snapshot.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-stone-200" />
                                  )}
                                  <div>
                                    <p className="font-medium text-stone-800">{i.snapshot?.name}</p>
                                    <p className="text-stone-500 text-xs">
                                      Quantity {i.quantity} · {money(i.price)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              <div className="border-t pt-3 text-xs text-stone-500 flex flex-wrap justify-between gap-2">
                                <span>
                                  Payment: <strong className="capitalize text-stone-700">{o.payment?.status || 'Pending'}</strong>
                                </span>
                                {o.tracking?.trackingId ? (
                                  <span>
                                    {o.tracking.carrier || 'Blue Dart Armored'} · Tracking: <strong className="font-mono text-stone-700">{o.tracking.trackingId}</strong>
                                  </span>
                                ) : (
                                  <span className="text-stone-400">Tracking assigned upon armored dispatch</span>
                                )}
                              </div>
                            </>
                          )}

                          {/* Actions Bar (Collapsed State) */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <button
                                type="button"
                                onClick={() => setExpandedOrderId(isExpanded ? null : o._id)}
                                className="font-bold text-[#930303] hover:text-[#700202] hover:underline flex items-center gap-1.5 cursor-pointer py-1"
                              >
                                <span>{isExpanded ? 'Close order details' : 'Order details & receipt'}</span>
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180 text-[#930303]' : ''
                                  }`}
                                />
                              </button>

                              {!isExpanded && (
                                <button
                                  type="button"
                                  onClick={() => handlePrintOrder(o)}
                                  className="text-stone-600 hover:text-stone-900 hover:underline flex items-center gap-1 cursor-pointer"
                                  title="Quick print tax invoice"
                                >
                                  <Printer size={13} />
                                  <span>Print receipt</span>
                                </button>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#930303]">
                              <button
                                type="button"
                                onClick={() => {
                                  setTicketForm({
                                    ...emptyTicket,
                                    category: 'Order & Delivery',
                                    orderNumber: o.orderNumber || '',
                                    subject: `Help with Order ${o.orderNumber}`,
                                  });
                                  setShowNewTicket(true);
                                  handleTabChange('support');
                                }}
                                className="cursor-pointer hover:underline text-stone-600 hover:text-[#930303]"
                              >
                                Need help with this order?
                              </button>
                              {['placed', 'confirmed'].includes(o.status) && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => {
                                    setCancelModalOrder(o);
                                    setCancelReason('');
                                    setCancelComments('');
                                    setCancelError('');
                                  }}
                                  className="text-stone-500 hover:text-red-700 cursor-pointer hover:underline"
                                >
                                  Cancel order
                                </button>
                              )}
                              {o.status === 'delivered' && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => {
                                    setTicketForm({
                                      ...emptyTicket,
                                      category: 'Return & Refund',
                                      orderNumber: o.orderNumber || '',
                                      subject: `Return & Refund Request for Order ${o.orderNumber}`,
                                      returnReasons: [],
                                      attachments: [],
                                    });
                                    setShowNewTicket(true);
                                    handleTabChange('support');
                                  }}
                                  className="cursor-pointer hover:underline font-medium text-[#930303]"
                                >
                                  Request a return
                                </button>
                              )}
                            </div>
                          </div>

                          {/* ══════════════════════════════════════════════════════════════════
                              EXPANDED ORDER DETAILS (Inline inside this exact card)
                              ══════════════════════════════════════════════════════════════════ */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t-2 border-stone-200 space-y-5 animate-in fade-in duration-200">
                              {/* Order Timeline / Status Tracker */}
                              <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-stone-100">
                                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                                    Current Fulfillment Stage: <span className="text-[#930303] font-black">{o.status?.replaceAll('_', ' ').toUpperCase()}</span>
                                  </span>
                                  <span className="text-xs text-stone-500 font-mono">
                                    Order ID: #{o._id}
                                  </span>
                                </div>

                                {o.status !== 'cancelled' ? (
                                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                                    {[
                                      { label: 'Placed', desc: 'Received & Logged', active: true },
                                      { label: 'Confirmed', desc: 'BIS 916 Verified', active: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'].includes(o.status) },
                                      { label: 'Armored Transit', desc: 'Blue Dart Armored', active: ['shipped', 'out_for_delivery', 'delivered'].includes(o.status) },
                                      { label: 'Delivered', desc: 'Secure Handover', active: o.status === 'delivered' },
                                    ].map((st, idx) => (
                                      <div key={idx} className="flex flex-col items-center">
                                        <div
                                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 shadow-2xs transition-colors ${
                                            st.active ? 'bg-[#930303] text-white ring-2 ring-[#930303]/30' : 'bg-stone-200 text-stone-500'
                                          }`}
                                        >
                                          {st.active ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-[11px] font-bold ${st.active ? 'text-stone-900' : 'text-stone-400'}`}>
                                          {st.label}
                                        </span>
                                        <span className="text-[10px] text-stone-400 hidden sm:block">
                                          {st.desc}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="bg-red-50 text-red-900 p-3.5 rounded-xl border border-red-200 text-xs space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-red-800">
                                      <AlertCircle size={16} className="text-red-700 shrink-0" />
                                      <span>Order Cancelled</span>
                                    </div>
                                    {o.cancelReason && (
                                      <p className="text-stone-700 pl-6 text-[11px]">
                                        <strong className="text-stone-900">Reason:</strong> {o.cancelReason}
                                        {o.cancelComments ? ` (${o.cancelComments})` : ''}
                                      </p>
                                    )}
                                    <p className="text-stone-600 pl-6 text-[11px]">
                                      Any debited amount is returned to the original payment source within 5-7 banking days.
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Delivery Address & Armored Transit Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {/* Consignee & Shipping Address */}
                                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-stone-700 font-bold uppercase tracking-wider text-[11px] pb-1.5 border-b border-stone-100">
                                    <MapPin size={14} className="text-[#930303]" />
                                    <span>Delivery & Consignee Address</span>
                                  </div>
                                  <p className="font-bold text-stone-900 text-sm">
                                    {o.shippingAddress?.name || user?.name || 'Valued Customer'}
                                  </p>
                                  <p className="text-stone-600 font-mono text-[11px]">
                                    Phone: {o.shippingAddress?.phone || user?.phone || '—'}
                                  </p>
                                  <p className="text-stone-600 leading-relaxed pt-0.5">
                                    {[
                                      o.shippingAddress?.line1,
                                      o.shippingAddress?.line2,
                                      o.shippingAddress?.city,
                                      o.shippingAddress?.state,
                                      o.shippingAddress?.pincode,
                                    ].filter(Boolean).join(', ')}
                                  </p>
                                  <p className="text-[11px] text-stone-500 font-medium">
                                    Country: {o.shippingAddress?.country || 'India'}
                                  </p>
                                </div>

                                {/* Armored Transit & Security */}
                                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                                  <div className="flex items-center gap-1.5 text-stone-700 font-bold uppercase tracking-wider text-[11px] pb-1.5 border-b border-stone-100">
                                    <Truck size={14} className="text-emerald-700" />
                                    <span>Armored Transit & Insurance</span>
                                  </div>
                                  <div className="flex justify-between items-center text-stone-600">
                                    <span>Carrier:</span>
                                    <span className="font-semibold text-stone-900">
                                      {o.tracking?.carrier || 'Blue Dart Armored / SafeVault'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-stone-600">
                                    <span>Tracking ID:</span>
                                    <span className="font-mono font-bold text-stone-800">
                                      {o.tracking?.trackingId || 'Assigned upon vault dispatch'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-stone-600">
                                    <span>Transit Security:</span>
                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                      <ShieldCheck size={13} /> 100% Insured High-Value Cover
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-stone-600">
                                    <span>Packaging:</span>
                                    <span className="font-medium text-stone-800">Tamper-evident royal velvet box</span>
                                  </div>
                                </div>
                              </div>

                              {/* Itemized Jewellery Breakdown */}
                              <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
                                <div className="p-3 bg-stone-50 border-b border-stone-200 font-bold text-xs uppercase tracking-wider text-stone-700 flex justify-between items-center">
                                  <span>Itemized Jewellery Breakdown</span>
                                  <span className="text-stone-500 font-mono text-[11px]">
                                    {o.items?.length || 0} {o.items?.length === 1 ? 'Piece' : 'Pieces'}
                                  </span>
                                </div>
                                <div className="divide-y divide-stone-100">
                                  {o.items?.map((item, idx) => {
                                    const snap = item.snapshot || {};
                                    const variant = snap.variant || {};
                                    const metal = snap.metal || {};
                                    const karat = variant.karat || metal.karat || '22K (916)';
                                    const weight = variant.weight ? `${variant.weight}g` : null;

                                    return (
                                      <div
                                        key={idx}
                                        className="p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs hover:bg-stone-50/40"
                                      >
                                        <div className="flex items-center gap-3">
                                          {snap.image ? (
                                            <img
                                              src={snap.image}
                                              alt={snap.name}
                                              className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                                            />
                                          ) : (
                                            <div className="w-14 h-14 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                                              <Package size={20} />
                                            </div>
                                          )}
                                          <div>
                                            <h4 className="font-bold text-stone-900 text-sm">
                                              {snap.name || 'Fine Jewellery Article'}
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-stone-600">
                                              <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-700 font-medium">
                                                Purity: {karat}
                                              </span>
                                              {weight && (
                                                <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-700 font-medium">
                                                  Gross Wt: {weight}
                                                </span>
                                              )}
                                              <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded font-medium border border-amber-200 flex items-center gap-1">
                                                <Award size={11} className="text-[#930303]" /> 100% BIS Hallmarked
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="text-right sm:shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-0 pt-2 sm:pt-0">
                                          <span className="text-stone-500 text-xs">
                                            Qty: {item.quantity} × {money(item.price)}
                                          </span>
                                          <span className="font-bold text-stone-900 text-sm">
                                            {money(item.quantity * item.price)}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Payment & Financial Calculations Summary */}
                              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Left: Payment Info & Words */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-stone-700">
                                      <CreditCard size={14} className="text-[#930303]" />
                                      <span>Payment & Transaction Summary</span>
                                    </div>
                                    <div className="space-y-1 text-stone-600">
                                      <p>
                                        <strong>Mode:</strong> {o.payment?.method?.toUpperCase() || 'RAZORPAY'}
                                      </p>
                                      <p>
                                        <strong>Status:</strong>{' '}
                                        <span className="text-emerald-700 font-bold capitalize">
                                          {o.payment?.status === 'paid' ? 'Paid & Verified' : o.payment?.status || 'Pending'}
                                        </span>
                                      </p>
                                      {o.payment?.transactionId && (
                                        <p className="font-mono text-[11px]">
                                          <strong>Txn / UTR Ref:</strong> {o.payment.transactionId}
                                        </p>
                                      )}
                                      {o.payment?.razorpayPaymentId && (
                                        <p className="font-mono text-[11px]">
                                          <strong>Payment ID:</strong> {o.payment.razorpayPaymentId}
                                        </p>
                                      )}
                                    </div>

                                    <div className="pt-2 border-t border-stone-100">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                        Amount in Words:
                                      </span>
                                      <p className="font-bold text-stone-800 italic mt-0.5 text-xs">
                                        {numberToWordsIndian(total)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Right: Calculations */}
                                  <div className="space-y-1.5 font-mono text-xs md:border-l md:border-stone-200 md:pl-4">
                                    <div className="flex justify-between text-stone-600">
                                      <span>Gross Merchandise Value:</span>
                                      <span>{money(subtotal)}</span>
                                    </div>
                                    {discount > 0 && (
                                      <div className="flex justify-between text-emerald-700 font-semibold">
                                        <span>Festive Discount {o.pricing?.coupon ? `(${o.pricing.coupon})` : ''}:</span>
                                        <span>-{money(discount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-stone-600">
                                      <span>Insured Armored Shipping:</span>
                                      <span className={shipping === 0 ? 'text-emerald-700 font-bold' : ''}>
                                        {shipping === 0 ? 'FREE' : money(shipping)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-stone-600 text-[11px]">
                                      <span>Integrated GST (3% Inclusive):</span>
                                      <span>Included</span>
                                    </div>
                                    <div className="border-t-2 border-stone-800 pt-2 flex justify-between text-sm font-bold text-stone-950">
                                      <span>Total Amount Paid:</span>
                                      <span className="text-[#930303] text-base">{money(total)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Quality Guarantees Bar */}
                              <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-semibold text-stone-700">
                                <div className="flex items-center justify-center gap-1.5">
                                  <img
                                    src="/images/bis-bureau-of-indian-standards.png"
                                    alt="BIS Hallmark"
                                    className="h-3.5 w-auto object-contain inline-block"
                                  />
                                  <span>100% BIS 916 Hallmarked</span>
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  <Truck size={12} className="text-emerald-700" />
                                  <span>Armored Blue Dart Cover</span>
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  <ShieldCheck size={12} className="text-[#930303]" />
                                  <span>Lifetime Jewellery Buyback</span>
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  <Clock size={12} className="text-stone-700" />
                                  <span>15-Day Easy Returns</span>
                                </div>
                              </div>

                              {/* Expanded Action Toolbar */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handlePrintOrder(o)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#930303] text-white hover:bg-[#720202] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                                  >
                                    <Printer size={14} />
                                    <span>Print Tax Invoice</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setExpandedOrderId(null)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                  >
                                    <ChevronUp size={14} />
                                    <span>Collapse Details</span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTicketForm({
                                        ...emptyTicket,
                                        category: 'Order & Delivery',
                                        orderNumber: o.orderNumber || '',
                                        subject: `Help with Order ${o.orderNumber}`,
                                      });
                                      setShowNewTicket(true);
                                      handleTabChange('support');
                                    }}
                                    className="text-[#930303] hover:underline cursor-pointer font-medium"
                                  >
                                    Need help with this order?
                                  </button>

                                  {['placed', 'confirmed'].includes(o.status) && (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => {
                                        setCancelModalOrder(o);
                                        setCancelReason('');
                                        setCancelComments('');
                                        setCancelError('');
                                      }}
                                      className="text-stone-500 hover:text-red-700 hover:underline cursor-pointer"
                                    >
                                      Cancel order
                                    </button>
                                  )}

                                  {o.status === 'delivered' && (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => {
                                        setTicketForm({
                                          ...emptyTicket,
                                          category: 'Return & Refund',
                                          orderNumber: o.orderNumber || '',
                                          subject: `Return & Refund Request for Order ${o.orderNumber}`,
                                          returnReasons: [],
                                          attachments: [],
                                        });
                                        setShowNewTicket(true);
                                        handleTabChange('support');
                                      }}
                                      className="cursor-pointer hover:underline font-medium text-[#930303]"
                                    >
                                      Request a return
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-stone-500 pt-1">
                            Returns and refunds are subject to store review and policy.
                          </p>
                        </article>
                      );
                    })}
                  </>
                )}

                {tab === 'support' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-xl font-semibold">Support Tickets & Inquiries</h2>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Live Chat</span>
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Raise a ticket or track responses to your contact form inquiries live in real-time.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewTicket((v) => !v)}
                        className="inline-flex items-center gap-2 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                      >
                        <Plus size={15} />
                        <span>{showNewTicket ? 'Close Form' : 'Raise Support Ticket'}</span>
                      </button>
                    </div>

                    {showNewTicket && (
                      <form
                        onSubmit={handleCreateTicket}
                        aria-labelledby="new-ticket-heading"
                        className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4"
                      >
                        <h3 id="new-ticket-heading" className="text-base font-semibold text-stone-900">
                          New Support Ticket
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="tkt-category" className="block text-xs font-medium text-stone-700 mb-1">
                              Category
                            </label>
                            <select
                              id="tkt-category"
                              name="category"
                              value={ticketForm.category}
                              onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                              className="w-full border border-stone-300 rounded-xl p-2.5 text-base sm:text-sm bg-white"
                            >
                              <option value="Order & Delivery">Order & Delivery</option>
                              <option value="Return & Refund">Return & Refund Assistance</option>
                              <option value="BIS Hallmark & Purity">BIS Hallmark & Purity</option>
                              <option value="Sizing & Custom Jewellery">Sizing & Custom Jewellery</option>
                              <option value="General Concierge">General Concierge</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="tkt-order" className="block text-xs font-medium text-stone-700 mb-1">
                              Related Order (optional)
                            </label>
                            <select
                              id="tkt-order"
                              name="orderNumber"
                              value={ticketForm.orderNumber}
                              onChange={(e) => setTicketForm({ ...ticketForm, orderNumber: e.target.value })}
                              className="w-full border border-stone-300 rounded-xl p-2.5 text-base sm:text-sm bg-white"
                            >
                              <option value="">No specific order</option>
                              {orders.map((ord) => (
                                <option key={ord._id} value={ord.orderNumber}>
                                  {ord.orderNumber} ({money(ord.pricing?.total)})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="tkt-priority" className="block text-xs font-medium text-stone-700 mb-1">
                              Priority
                            </label>
                            <select
                              id="tkt-priority"
                              name="priority"
                              value={ticketForm.priority}
                              onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                              className="w-full border border-stone-300 rounded-xl p-2.5 text-base sm:text-sm bg-white"
                            >
                              <option value="normal">Normal</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>

                        {/* E-Commerce Style Return Reasons Checkboxes */}
                        {ticketForm.category === 'Return & Refund' && (
                          <div className="rounded-2xl border border-red-200 bg-[#FFF9F6] p-4 sm:p-5 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-[#930303]" />
                                <span className="text-sm font-bold text-stone-900">
                                  Select Return Issue / Reason (वापसी का कारण चुनें)
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-[#930303] bg-red-100 px-2.5 py-0.5 rounded-full">
                                Required for Return
                              </span>
                            </div>
                            <p className="text-xs text-stone-600">
                              Please select the exact issue with your fine jewellery item. This directly speeds up the inspection and refund approval process.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                              {RETURN_REASONS.map((r) => {
                                const isChecked = (ticketForm.returnReasons || []).includes(r.id);
                                return (
                                  <label
                                    key={r.id}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                                      isChecked
                                        ? 'bg-white border-[#930303] text-stone-900 shadow-xs ring-1 ring-[#930303]/30 font-medium'
                                        : 'bg-white/70 border-stone-200 text-stone-700 hover:bg-white'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleReturnReason(r.id)}
                                      className="mt-0.5 accent-[#930303] w-4 h-4 rounded shrink-0 cursor-pointer"
                                    />
                                    <div className="leading-snug">
                                      <div className="text-stone-900 font-semibold">{r.label}</div>
                                      <div className="text-[11px] text-stone-500 font-normal mt-0.5">{r.hindi}</div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                            {(ticketForm.returnReasons || []).includes('other') && (
                              <div className="pt-1">
                                <input
                                  type="text"
                                  value={ticketForm.otherReasonText || ''}
                                  onChange={(e) => setTicketForm({ ...ticketForm, otherReasonText: e.target.value })}
                                  placeholder="Please describe other return issue in detail..."
                                  className="w-full border border-stone-300 rounded-xl p-2.5 text-xs bg-white"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <label htmlFor="tkt-subject" className="block text-xs font-medium text-stone-700 mb-1">
                            Subject <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="tkt-subject"
                            name="subject"
                            type="text"
                            required
                            value={ticketForm.subject}
                            onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                            placeholder="Brief summary of your request..."
                            className="w-full border border-stone-300 rounded-xl p-2.5 text-base sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="tkt-message" className="block text-xs font-medium text-stone-700 mb-1">
                            Describe Your Concern <span aria-hidden="true">*</span>
                          </label>
                          <textarea
                            id="tkt-message"
                            name="message"
                            rows={3}
                            required
                            value={ticketForm.message}
                            onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                            placeholder="Share details so our jewellery concierge can resolve this quickly..."
                            className="w-full border border-stone-300 rounded-xl p-2.5 text-base sm:text-sm"
                          />
                        </div>

                        {/* Optional Attachment Toggle */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setShowTicketUpload((v) => !v)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#930303] hover:underline cursor-pointer"
                          >
                            <Paperclip size={14} />
                            <span>
                              {showTicketUpload || (ticketForm.attachments || []).length > 0
                                ? 'Hide photo/video attachment box'
                                : '+ Attach photos or unboxing video (Optional / वैकल्पिक)'}
                            </span>
                            {(ticketForm.attachments || []).length > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-[#930303] text-white text-[10px]">
                                {(ticketForm.attachments || []).length}
                              </span>
                            )}
                          </button>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Photos and unboxing videos can also be uploaded later directly in the chat thread when our concierge requests them.
                          </p>
                        </div>

                        {/* Collapsible Media Upload Box */}
                        {(showTicketUpload || (ticketForm.attachments || []).length > 0) && (() => {
                          const ticketPhotos = (ticketForm.attachments || []).filter((a) => a.fileType === 'image');
                          const ticketVideos = (ticketForm.attachments || []).filter((a) => a.fileType === 'video');
                          return (
                            <div className="rounded-2xl border border-stone-200 bg-[#FAF7F2] p-4 sm:p-5 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-[#930303]" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                                      Attach Proof: Photos & Unboxing Video (प्रमाण अपलोड करें)
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-500 mt-0.5">
                                    Upload clear photos of defect/hallmark and 360° unboxing video for instant claim processing.
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                                      ticketPhotos.length >= 4
                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                        : 'bg-white text-stone-700 border-stone-200'
                                    }`}
                                  >
                                    Photos: {ticketPhotos.length} / 4
                                  </span>
                                  <span
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                                      ticketVideos.length >= 2
                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                        : 'bg-white text-stone-700 border-stone-200'
                                    }`}
                                  >
                                    Videos: {ticketVideos.length} / 2
                                  </span>
                                </div>
                              </div>

                              <label
                                className={`block border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-colors ${
                                  ticketPhotos.length >= 4 && ticketVideos.length >= 2
                                    ? 'border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed'
                                    : 'border-[#C9A44A]/50 hover:border-[#930303] bg-white/70 hover:bg-white'
                                }`}
                              >
                                <input
                                  type="file"
                                  multiple
                                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                                  disabled={ticketUploadBusy || (ticketPhotos.length >= 4 && ticketVideos.length >= 2)}
                                  onChange={(e) => handleTicketFilesSelected(e.target.files)}
                                  className="hidden"
                                />
                                {ticketUploadBusy ? (
                                  <div className="flex items-center justify-center gap-2 text-stone-600 text-xs py-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#930303]" />
                                    <span>Uploading files to secure vault... please wait</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5 py-1">
                                    <div className="flex items-center justify-center gap-3 text-[#930303]">
                                      <ImageIcon size={22} />
                                      <span className="text-stone-300">|</span>
                                      <Video size={22} />
                                    </div>
                                    <p className="text-xs font-semibold text-stone-800">
                                      Click to select or drag & drop files here
                                    </p>
                                    <p className="text-[11px] text-stone-500">
                                      Up to 4 Photos (JPG, PNG, WEBP max 10MB) · Up to 2 Videos (MP4, WEBM, MOV max 50MB)
                                    </p>
                                  </div>
                                )}
                              </label>

                              {ticketUploadError && (
                                <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-1.5">
                                  <AlertCircle size={14} className="shrink-0" />
                                  <span>{ticketUploadError}</span>
                                </p>
                              )}

                              {ticketForm.attachments?.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                  {ticketForm.attachments.map((att, idx) => (
                                    <div
                                      key={idx}
                                      className="relative group rounded-xl overflow-hidden border border-stone-200 bg-white shadow-xs"
                                    >
                                      {att.fileType === 'video' ? (
                                        <div className="relative aspect-video bg-black flex items-center justify-center">
                                          <video src={att.url} className="w-full h-full object-cover" />
                                          <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                                            <Video size={10} /> Video
                                          </span>
                                        </div>
                                      ) : (
                                        <div
                                          onClick={() => setLightboxImage(att.url)}
                                          className="relative aspect-video bg-stone-100 cursor-pointer overflow-hidden"
                                        >
                                          <img
                                            src={att.url}
                                            alt={att.originalName || 'Attachment'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Eye className="w-5 h-5 text-white drop-shadow" />
                                          </div>
                                        </div>
                                      )}
                                      <div className="p-2 flex items-center justify-between gap-1 text-[11px]">
                                        <span className="truncate text-stone-700 font-medium" title={att.originalName || 'File'}>
                                          {att.originalName || (att.fileType === 'video' ? 'Video' : 'Photo')}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveTicketAttachment(idx)}
                                          className="text-stone-400 hover:text-red-700 p-1 cursor-pointer shrink-0"
                                          title="Remove file"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={busy || ticketUploadBusy}
                            className="bg-[#930303] hover:bg-[#7A0303] disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer shadow-xs"
                          >
                            {busy ? 'Submitting…' : 'Submit Ticket'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewTicket(false)}
                            className="text-xs text-stone-600 px-4 py-2.5 rounded-xl border border-stone-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {!tickets.length && !showNewTicket ? (
                      <div className="bg-white rounded-2xl border p-10 text-center space-y-3">
                        <LifeBuoy className="mx-auto text-[#930303]" size={28} />
                        <h3 className="text-lg font-medium">No support tickets or inquiries yet</h3>
                        <p className="text-stone-500 text-sm max-w-md mx-auto">
                          Have a question about an order, custom sizing, hallmarking, or return? Raise a ticket and our concierge team will respond directly here.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowNewTicket(true)}
                          className="inline-flex items-center gap-2 bg-[#930303] text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
                        >
                          <Plus size={15} />
                          <span>Raise Support Ticket</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tickets.map((t) => {
                          const isClosed = t.status === 'closed';
                          const isExpanded = isClosed ? Boolean(closedChatExpanded[t._id]) : true;
                          const replyPhotos = (replyAttachments[t._id] || []).filter((a) => a.fileType === 'image');
                          const replyVideos = (replyAttachments[t._id] || []).filter((a) => a.fileType === 'video');

                          return (
                            <article key={t._id} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-xs">
                              <div className="flex flex-wrap justify-between items-start gap-3">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-mono font-semibold text-[#930303] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                                      {t.ticketNumber}
                                    </span>
                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
                                      {t.type === 'contact' ? 'Contact Inquiry' : 'Support Ticket'}
                                    </span>
                                    {t.orderNumber && (
                                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E9DED2] text-stone-700 font-medium">
                                        Order: {t.orderNumber}
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="font-semibold text-stone-900">{t.subject}</h3>
                                  <p className="text-xs text-stone-500">
                                    {t.category} · {new Date(t.createdAt).toLocaleString('en-IN')}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs capitalize font-medium px-2.5 py-1 rounded-full border ${
                                      STATUS_BADGE[t.status] || STATUS_BADGE.open
                                    }`}
                                  >
                                    {t.status?.replaceAll('_', ' ')}
                                  </span>
                                  {isClosed && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setClosedChatExpanded((prev) => ({ ...prev, [t._id]: !prev[t._id] }))
                                      }
                                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 cursor-pointer transition-colors"
                                      title={isExpanded ? 'Hide closed chat history' : 'Click to view closed chat history'}
                                    >
                                      <span>{isExpanded ? 'Hide Chat' : 'View Closed Chat'}</span>
                                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Compact preview when closed and collapsed */}
                              {isClosed && !isExpanded ? (
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
                                  <span className="flex items-center gap-1.5 text-stone-600 font-medium">
                                    <Lock size={13} className="text-stone-400" />
                                    <span>Ticket closed · Chat is closed</span>
                                  </span>
                                  <span className="text-[11px] text-stone-400">
                                    Closed chat will be automatically deleted after 30 days
                                  </span>
                                </div>
                              ) : (
                                <>
                                  {/* Selected Return Reasons Tags */}
                                  {Array.isArray(t.returnReasons) && t.returnReasons.length > 0 && (
                                    <div className="p-3 bg-red-50/60 border border-red-200/80 rounded-xl space-y-1.5">
                                      <p className="text-[11px] font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                                        <ShieldAlert size={13} className="text-[#930303]" />
                                        <span>Return Issues Reported:</span>
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {t.returnReasons.map((r, i) => (
                                          <span
                                            key={i}
                                            className="text-[11px] px-2.5 py-0.5 rounded-md bg-white text-red-900 font-medium border border-red-200 shadow-2xs"
                                          >
                                            {RETURN_REASONS.find((opt) => opt.id === r)?.label || r}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Initial Customer Message & Attached Proof */}
                                  <div className="rounded-xl bg-[#FAF7F2] border border-[#E9DED2] p-4 text-sm text-stone-800 space-y-3">
                                    <p className="whitespace-pre-line leading-relaxed">{t.message}</p>

                                    {Array.isArray(t.attachments) && t.attachments.length > 0 && (
                                      <div className="pt-2 border-t border-[#E9DED2]/60 space-y-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                                          Attached Proof ({t.attachments.length} files)
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                          {t.attachments.map((att, aIdx) => (
                                            <div
                                              key={aIdx}
                                              className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-2xs"
                                            >
                                              {att.fileType === 'video' ? (
                                                <div className="space-y-1">
                                                  <video
                                                    src={att.url}
                                                    controls
                                                    className="w-full aspect-video object-cover bg-black"
                                                    preload="metadata"
                                                  />
                                                  <p className="text-[10px] text-stone-600 px-1.5 py-1 truncate">
                                                    {att.originalName || 'Unboxing Video'}
                                                  </p>
                                                </div>
                                              ) : (
                                                <div
                                                  onClick={() => setLightboxImage(att.url)}
                                                  className="relative aspect-video bg-stone-100 cursor-pointer overflow-hidden group"
                                                >
                                                  <img
                                                    src={att.url}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                  />
                                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Eye className="w-5 h-5 text-white drop-shadow" />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                              {/* Conversation History */}
                              {Array.isArray(t.replies) && t.replies.length > 0 && (
                                <div className="space-y-3 pl-3 border-l-2 border-[#D4AF66]">
                                  {t.replies.map((rep, idx) => {
                                    // Check if this is an "attachment_request" from admin — Blinkit/Zomato style upload card
                                    const isAttachmentRequest = rep.senderRole === 'admin' && rep.replyType === 'attachment_request';
                                    // Check if customer already responded AFTER this attachment request (any customer reply after this one)
                                    const hasCustomerRespondedAfter = isAttachmentRequest && t.replies.slice(idx + 1).some(
                                      r => r.senderRole === 'customer' && (r.attachments?.length > 0 || r.message)
                                    );
                                    const reqPhotos = (replyAttachments[`${t._id}_req_${rep._id}`] || []).filter(a => a.fileType === 'image');
                                    const reqVideos = (replyAttachments[`${t._id}_req_${rep._id}`] || []).filter(a => a.fileType === 'video');
                                    const reqKey = `${t._id}_req_${rep._id}`;

                                    return (
                                    <div
                                      key={rep._id || idx}
                                      className={`rounded-2xl p-4 text-sm space-y-2 ${
                                        isAttachmentRequest
                                          ? 'bg-gradient-to-br from-[#FFF6F2] to-[#FFF0E8] border-2 border-[#C9A44A]/50 shadow-sm'
                                          : rep.senderRole === 'admin'
                                            ? 'bg-[#FFF6F2] border border-[#EADBD4]'
                                            : 'bg-stone-50 border border-stone-200'
                                      }`}
                                    >
                                      <div className="flex flex-wrap justify-between gap-2 text-xs">
                                        <span
                                          className={`font-semibold ${
                                            rep.senderRole === 'admin' ? 'text-[#930303]' : 'text-stone-800'
                                          }`}
                                        >
                                          {rep.senderRole === 'admin'
                                            ? `${rep.senderName || 'BL Jewels Concierge'} (Admin)`
                                            : 'You'}
                                        </span>
                                        <span className="text-stone-400">
                                          {rep.createdAt ? new Date(rep.createdAt).toLocaleString('en-IN') : ''}
                                        </span>
                                      </div>
                                      <p className="text-stone-700 whitespace-pre-line leading-relaxed">{rep.message}</p>

                                      {/* ===== BLINKIT/ZOMATO STYLE EMBEDDED UPLOAD BOX ===== */}
                                      {isAttachmentRequest && (
                                        <div className="mt-3 rounded-2xl border-2 border-dashed border-[#C9A44A]/60 bg-[#FAF7F2] p-4 space-y-3">
                                          {hasCustomerRespondedAfter ? (
                                            /* ✅ Already submitted */
                                            <div className="flex items-center gap-2.5 py-2">
                                              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                                              <div>
                                                <p className="text-sm font-bold text-emerald-800">Proof Submitted ✓</p>
                                                <p className="text-xs text-stone-500 mt-0.5">
                                                  Your photos & videos have been sent. Our concierge is reviewing them.
                                                </p>
                                              </div>
                                            </div>
                                          ) : (
                                            /* 📎 Upload box — active */
                                            <>
                                              <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#930303]/10 flex items-center justify-center shrink-0">
                                                  <Camera className="w-4 h-4 text-[#930303]" />
                                                </div>
                                                <div>
                                                  <p className="text-xs font-bold text-stone-900">
                                                    📎 Upload Your Proof Here (यहाँ अपलोड करें)
                                                  </p>
                                                  <p className="text-[11px] text-stone-500">
                                                    Max 4 Photos (JPG/PNG 10MB) + 2 Videos (MP4/WEBM 50MB)
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-2">
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${reqPhotos.length >= 4 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-stone-700 border-stone-200'}`}>
                                                  📷 {reqPhotos.length}/4
                                                </span>
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${reqVideos.length >= 2 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-stone-700 border-stone-200'}`}>
                                                  🎥 {reqVideos.length}/2
                                                </span>
                                              </div>

                                              <label
                                                className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                                                  reqPhotos.length >= 4 && reqVideos.length >= 2
                                                    ? 'border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed'
                                                    : 'border-[#C9A44A]/50 hover:border-[#930303] bg-white/80 hover:bg-white'
                                                }`}
                                              >
                                                <input
                                                  type="file"
                                                  multiple
                                                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                                                  disabled={
                                                    replyUploadBusy[reqKey] || (reqPhotos.length >= 4 && reqVideos.length >= 2)
                                                  }
                                                  onChange={(e) => handleReplyFilesSelected(reqKey, e.target.files)}
                                                  className="hidden"
                                                />
                                                {replyUploadBusy[reqKey] ? (
                                                  <div className="flex items-center justify-center gap-2 text-stone-600 text-xs py-1">
                                                    <Loader2 className="w-4 h-4 animate-spin text-[#930303]" />
                                                    <span>Uploading proof to BL Jewels vault...</span>
                                                  </div>
                                                ) : (
                                                  <div className="flex items-center justify-center gap-3 text-xs text-stone-600 py-1">
                                                    <UploadCloud size={18} className="text-[#930303]" />
                                                    <span className="font-medium">Click to select photos & unboxing video</span>
                                                  </div>
                                                )}
                                              </label>

                                              {replyUploadError[reqKey] && (
                                                <p className="text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-1.5">
                                                  <AlertCircle size={13} />
                                                  <span>{replyUploadError[reqKey]}</span>
                                                </p>
                                              )}

                                              {/* Preview uploaded files */}
                                              {(replyAttachments[reqKey]?.length > 0) && (
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                  {replyAttachments[reqKey].map((att, aIdx) => (
                                                    <div key={aIdx} className="relative group rounded-lg overflow-hidden border border-stone-200 bg-white shadow-2xs">
                                                      {att.fileType === 'video' ? (
                                                        <div className="relative aspect-video bg-black flex items-center justify-center">
                                                          <video src={att.url} className="w-full h-full object-cover" />
                                                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded font-mono">VIDEO</span>
                                                        </div>
                                                      ) : (
                                                        <div onClick={() => setLightboxImage(att.url)} className="relative aspect-video bg-stone-100 cursor-pointer overflow-hidden">
                                                          <img src={att.url} alt="" className="w-full h-full object-cover" />
                                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <Eye className="w-4 h-4 text-white" />
                                                          </div>
                                                        </div>
                                                      )}
                                                      <div className="p-1.5 flex items-center justify-between text-[10px]">
                                                        <span className="truncate text-stone-700 font-medium">{att.originalName || 'Proof'}</span>
                                                        <button type="button" onClick={() => handleRemoveReplyAttachment(reqKey, aIdx)} className="text-stone-400 hover:text-red-700 p-0.5 cursor-pointer">
                                                          <Trash2 size={12} />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}

                                              {/* Submit button for this embedded upload */}
                                              {(replyAttachments[reqKey]?.length > 0) && (
                                                <button
                                                  type="button"
                                                  disabled={busy || replyUploadBusy[reqKey]}
                                                  onClick={() => {
                                                    const atts = replyAttachments[reqKey] || [];
                                                    if (atts.length === 0) return;
                                                    run(async () => {
                                                      const res = await ticketService.replyMyTicket(t._id, {
                                                        message: `[Proof submitted: ${atts.length} file(s) uploaded]`,
                                                        attachments: atts,
                                                      });
                                                      if (res?.data) {
                                                        setTickets((prev) => prev.map((tk) => (tk._id === t._id ? res.data : tk)));
                                                        setReplyAttachments((prev) => ({ ...prev, [reqKey]: [] }));
                                                        setNotice('✅ Proof submitted successfully! Our concierge team will review your photos & videos.');
                                                      }
                                                    });
                                                  }}
                                                  className="w-full inline-flex items-center justify-center gap-2 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-sm transition-colors"
                                                >
                                                  <Send size={14} />
                                                  <span>{busy ? 'Sending…' : `Submit Proof (${(replyAttachments[reqKey] || []).length} files)`}</span>
                                                </button>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      )}

                                      {/* Attached media in reply (normal attachments) */}
                                      {Array.isArray(rep.attachments) && rep.attachments.length > 0 && (
                                        <div className="pt-2 border-t border-stone-200/60 space-y-1.5">
                                          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                            Attached Files ({rep.attachments.length})
                                          </p>
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {rep.attachments.map((att, aIdx) => (
                                              <div
                                                key={aIdx}
                                                className="rounded-lg overflow-hidden border border-stone-200 bg-white shadow-2xs"
                                              >
                                                {att.fileType === 'video' ? (
                                                  <video
                                                    src={att.url}
                                                    controls
                                                    className="w-full aspect-video object-cover bg-black"
                                                    preload="metadata"
                                                  />
                                                ) : (
                                                  <div
                                                    onClick={() => setLightboxImage(att.url)}
                                                    className="relative aspect-video bg-stone-100 cursor-pointer overflow-hidden group"
                                                  >
                                                    <img
                                                      src={att.url}
                                                      alt=""
                                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <Eye className="w-4 h-4 text-white" />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                  })}
                                </div>
                              )}

                              {/* Follow-up Reply Form OR Closed Ticket Notice */}
                              {isClosed ? (
                                <div className="pt-3 border-t border-stone-200">
                                  <div className="rounded-xl bg-[#FAF7F2] border border-[#E9DED2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                                    <div className="flex items-start sm:items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                        <Lock size={15} />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-stone-900">
                                          This support ticket is closed (यह टिकट बंद हो चुका है)
                                        </p>
                                        <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                                          You cannot send messages to this closed conversation. For data privacy and policy compliance, closed tickets and chat history will be automatically deleted after 30 days.
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTicketForm({
                                          ...emptyTicket,
                                          category: t.category || 'General Concierge',
                                          orderNumber: t.orderNumber || '',
                                          subject: `Follow-up regarding ${t.ticketNumber}`,
                                        });
                                        setShowNewTicket(true);
                                        window.scrollTo({ top: 250, behavior: 'smooth' });
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 hover:text-[#930303] hover:border-[#930303] text-xs font-semibold cursor-pointer transition-colors shrink-0 shadow-2xs"
                                    >
                                      <Plus size={13} />
                                      <span>Need help? Raise new ticket</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="pt-2 border-t border-stone-100 space-y-2.5">
                                  <form onSubmit={(e) => handleCustomerReply(e, t._id)} className="space-y-2.5">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <label htmlFor={`reply-${t._id}`} className="sr-only">
                                        Follow-up reply
                                      </label>
                                      <input
                                        id={`reply-${t._id}`}
                                        name="reply"
                                        type="text"
                                        value={replyDrafts[t._id] || ''}
                                        onChange={(e) => setReplyDrafts({ ...replyDrafts, [t._id]: e.target.value })}
                                        placeholder="Write a follow-up message..."
                                        className="flex-1 border border-stone-300 rounded-xl px-3.5 py-2 text-base sm:text-sm bg-white"
                                      />
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setShowReplyUpload((prev) => ({ ...prev, [t._id]: !prev[t._id] }))
                                          }
                                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                                            (replyAttachments[t._id] || []).length > 0 || showReplyUpload[t._id]
                                              ? 'bg-[#FFF6F2] border-[#EADBD4] text-[#930303]'
                                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                                          }`}
                                          title="Attach photos and unboxing video"
                                        >
                                          <Paperclip size={14} />
                                          <span>Attach Proof</span>
                                          {(replyAttachments[t._id] || []).length > 0 && (
                                            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#930303] text-white text-[10px]">
                                              {(replyAttachments[t._id] || []).length}
                                            </span>
                                          )}
                                        </button>

                                        <button
                                          type="submit"
                                          disabled={
                                            busy ||
                                            (!(replyDrafts[t._id] || '').trim() &&
                                              !(replyAttachments[t._id]?.length > 0))
                                          }
                                          className="inline-flex items-center justify-center gap-1.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                                        >
                                          <Send size={13} />
                                          <span>Send Reply</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Toggleable / Active Reply Attachment Box (Photos up to 4, Videos up to 2) */}
                                    {(showReplyUpload[t._id] || (replyAttachments[t._id]?.length > 0)) && (
                                      <div className="p-3.5 bg-[#FAF7F2] border border-[#E9DED2] rounded-xl space-y-2.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <Camera size={14} className="text-[#930303]" />
                                            <span className="text-xs font-bold text-stone-800">
                                              Attach Proof for Concierge (Photos: {replyPhotos.length}/4 · Videos: {replyVideos.length}/2)
                                            </span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setShowReplyUpload((prev) => ({ ...prev, [t._id]: false }))
                                            }
                                            className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>

                                        <label
                                          className={`block border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                                            replyPhotos.length >= 4 && replyVideos.length >= 2
                                              ? 'border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed'
                                              : 'border-[#C9A44A]/50 hover:border-[#930303] bg-white'
                                          }`}
                                        >
                                          <input
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                                            disabled={
                                              replyUploadBusy[t._id] ||
                                              (replyPhotos.length >= 4 && replyVideos.length >= 2)
                                            }
                                            onChange={(e) => handleReplyFilesSelected(t._id, e.target.files)}
                                            className="hidden"
                                          />
                                          {replyUploadBusy[t._id] ? (
                                            <div className="flex items-center justify-center gap-2 text-stone-600 text-xs py-1">
                                              <Loader2 className="w-4 h-4 animate-spin text-[#930303]" />
                                              <span>Uploading proof to BL Jewels vault...</span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-center gap-2 text-xs text-stone-600">
                                              <UploadCloud size={16} className="text-[#930303]" />
                                              <span>
                                                Click to add photos (max 4, 10MB) or unboxing video (max 2, 50MB)
                                              </span>
                                            </div>
                                          )}
                                        </label>

                                        {replyUploadError[t._id] && (
                                          <p className="text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-1.5">
                                            <AlertCircle size={13} />
                                            <span>{replyUploadError[t._id]}</span>
                                          </p>
                                        )}

                                        {/* Attached files preview */}
                                        {replyAttachments[t._id]?.length > 0 && (
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                            {replyAttachments[t._id].map((att, aIdx) => (
                                              <div
                                                key={aIdx}
                                                className="relative group rounded-lg overflow-hidden border border-stone-200 bg-white shadow-2xs"
                                              >
                                                {att.fileType === 'video' ? (
                                                  <div className="relative aspect-video bg-black flex items-center justify-center">
                                                    <video src={att.url} className="w-full h-full object-cover" />
                                                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded font-mono">
                                                      VIDEO
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <div
                                                    onClick={() => setLightboxImage(att.url)}
                                                    className="relative aspect-video bg-stone-100 cursor-pointer overflow-hidden"
                                                  >
                                                    <img src={att.url} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                      <Eye className="w-4 h-4 text-white" />
                                                    </div>
                                                  </div>
                                                )}
                                                <div className="p-1.5 flex items-center justify-between text-[10px]">
                                                  <span className="truncate text-stone-700 font-medium">
                                                    {att.originalName || 'Proof'}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleRemoveReplyAttachment(t._id, aIdx)}
                                                    className="text-stone-400 hover:text-red-700 p-0.5 cursor-pointer"
                                                  >
                                                    <Trash2 size={12} />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </form>
                                </div>
                              )}
                                </>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}

                    {/* Data Retention Notice */}
                    {tickets.length > 0 && (
                      <div className="rounded-2xl bg-white border border-stone-200 p-4 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-center gap-2 shadow-2xs">
                        <ShieldCheck size={16} className="text-[#C9A44A] shrink-0" />
                        <span>
                          <strong>Data Retention Notice:</strong> Closed support tickets and their complete chat history are automatically deleted after 30 days from ticket closure.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'profile' && (
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-stone-900 font-display">Personal Details & Profile</h2>
                      <p className="text-xs text-stone-500 mt-1">
                        Manage your profile photo and contact information.
                      </p>
                    </div>

                    {/* Profile Picture / Avatar Management */}
                    <div className="p-5 bg-gradient-to-br from-[#FAF7F2] to-[#F5ECE1] rounded-2xl border border-[#E9DED2] flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative group shrink-0">
                        <div className="w-24 h-24 rounded-full bg-white border-2 border-[#C9A44A] shadow-md overflow-hidden flex items-center justify-center font-display font-bold text-3xl text-[#930303]">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            profile.name?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        {uploadingAvatar && (
                          <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white">
                            <Loader2 className="w-6 h-6 animate-spin text-[#C9A44A]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs">
                            <UploadCloud size={15} />
                            <span>{uploadingAvatar ? 'Uploading…' : profile.avatar ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingAvatar}
                              onChange={handleAvatarUpload}
                              className="sr-only"
                            />
                          </label>

                          {profile.avatar && (
                            <button
                              type="button"
                              disabled={uploadingAvatar}
                              onClick={handleRemoveAvatar}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                              title="Remove profile photo"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-500 font-body">
                          Supported formats: JPEG, PNG, WEBP (Max 5MB). Stored securely on Cloudinary CDN.
                        </p>

                        {avatarError && (
                          <p className="text-xs text-rose-600 font-medium">
                            ⚠️ {avatarError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Protected Personal Details Notice & Support Trigger */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50/40 rounded-2xl border border-[#C9A44A]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                          <Lock className="w-4 h-4 text-[#930303]" />
                          <span>Personal Details Are Protected</span>
                        </div>
                        <p className="text-xs text-stone-600 max-w-xl">
                          To update your registered Full Name or Mobile Phone, please submit a support ticket. For security and billing compliance, our administration team verifies and updates customer records directly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTicketForm({
                            category: 'Account & Profile Update',
                            orderNumber: '',
                            priority: 'normal',
                            subject: 'Request to update personal details (Name / Phone)',
                            message: `Hello Support Team,\n\nI would like to request an official update to my registered account details:\n\n• Current Registered Name: ${user.name}\n• Current Registered Phone: ${user.phone || 'Not added'}\n• Registered Email: ${user.email}\n\nRequested Updates:\n• New Full Name: \n• New Phone Number: \n• Reason for Change: \n\nPlease verify and update my account details.\nThank you!`,
                          });
                          setShowNewTicket(true);
                          handleTabChange('support');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs shrink-0"
                      >
                        <LifeBuoy size={14} />
                        <span>Request Detail Change</span>
                      </button>
                    </div>

                    {/* Verified Customer Details (Read-only for security) */}
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>Full Name</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-normal lowercase">
                              <Lock size={11} className="text-stone-400" />
                              locked
                            </span>
                          </label>
                          <div className="w-full border border-stone-200 bg-stone-100/70 rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium select-text cursor-not-allowed">
                            {user.name}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>Phone Number</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-normal lowercase">
                              <Lock size={11} className="text-stone-400" />
                              locked
                            </span>
                          </label>
                          <div className="w-full border border-stone-200 bg-stone-100/70 rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium select-text cursor-not-allowed">
                            {user.phone || 'No phone number added'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Verified Email Address</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 size={12} />
                            verified
                          </span>
                        </label>
                        <div className="w-full border border-stone-200 bg-stone-100/70 rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium select-text cursor-not-allowed">
                          {user.email}
                        </div>
                      </div>

                      {/* Security & Password Change Section (OTP Protected) */}
                      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-stone-200 space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <KeyRound className="w-5 h-5 text-[#930303]" />
                              <h3 className="font-display font-bold text-base text-stone-900">
                                Account Security &amp; Password
                              </h3>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">
                              Change your account login password with 2-factor email OTP verification.
                            </p>
                          </div>

                          {!showChangePassword && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowChangePassword(true);
                                setPwdStep('initial');
                                setPwdError('');
                                setPwdSuccess('');
                                setPwdOtp('');
                                setPwdNew('');
                                setPwdConfirm('');
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                              <Lock size={13} className="text-[#930303]" />
                              <span>Change Password</span>
                            </button>
                          )}
                        </div>

                        {showChangePassword && (
                          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                            {/* Success Notification */}
                            {pwdSuccess && (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{pwdSuccess}</span>
                              </div>
                            )}

                            {/* Error Notification */}
                            {pwdError && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                                <span className="font-bold">⚠️</span>
                                <span>{pwdError}</span>
                              </div>
                            )}

                            {pwdStep === 'initial' ? (
                              /* STEP 1: Enter New Password & Request OTP */
                              <div className="space-y-3.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  <div>
                                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                                      New Password (Min 6 Characters) *
                                    </label>
                                    <div className="relative">
                                      <input
                                        type={pwdShow ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        value={pwdNew}
                                        onChange={(e) => setPwdNew(e.target.value)}
                                        className="w-full border border-stone-300 rounded-xl pl-3 pr-10 py-2.5 text-xs bg-white text-stone-900 focus:outline-none focus:border-[#930303]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setPwdShow(!pwdShow)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                                        tabIndex={-1}
                                        aria-label={pwdShow ? 'Hide password' : 'Show password'}
                                      >
                                        {pwdShow ? <EyeOff size={14} /> : <Eye size={14} />}
                                      </button>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                                      Confirm New Password *
                                    </label>
                                    <input
                                      type={pwdShow ? 'text' : 'password'}
                                      required
                                      minLength={6}
                                      placeholder="••••••••"
                                      value={pwdConfirm}
                                      onChange={(e) => setPwdConfirm(e.target.value)}
                                      className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-xs bg-white text-stone-900 focus:outline-none focus:border-[#930303]"
                                    />
                                  </div>
                                </div>

                                <p className="text-[11px] text-stone-500">
                                  Security note: Clicking below will send a 6-digit confirmation code to your registered email <strong>{user.email}</strong>.
                                </p>

                                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                  <button
                                    type="button"
                                    disabled={pwdLoading || !pwdNew || !pwdConfirm}
                                    onClick={handleRequestPasswordOtp}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs"
                                  >
                                    {pwdLoading ? (
                                      <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Sending Code…</span>
                                      </>
                                    ) : (
                                      <>
                                        <Send size={13} />
                                        <span>Send Verification Code to Email</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowChangePassword(false);
                                      setPwdError('');
                                      setPwdSuccess('');
                                    }}
                                    className="px-4 py-2.5 border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold rounded-xl cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* STEP 2: Verify OTP & Commit Change */
                              <div className="space-y-3.5 bg-[#FAF7F2] p-4 rounded-xl border border-[#E9DED2]">
                                <div className="space-y-1">
                                  <label className="block text-xs font-semibold text-stone-800">
                                    Enter 6-Digit Email Verification Code *
                                  </label>
                                  <p className="text-[11px] text-stone-500">
                                    Please enter the one-time code sent to <strong>{user.email}</strong> to verify this password change.
                                  </p>
                                </div>

                                {pwdServerOtp && (
                                  <div className="max-w-md p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-xl text-center space-y-1.5 shadow-xs my-2">
                                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-widest">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Your Verification Code</span>
                                    </div>
                                    <div className="text-2xl font-mono font-black text-[#930303] tracking-[0.25em] bg-white py-1 px-3 rounded-lg border border-amber-200 inline-block shadow-inner select-all">
                                      {pwdServerOtp}
                                    </div>
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => setPwdOtp(pwdServerOtp)}
                                        className="px-3 py-1 bg-[#930303] hover:bg-[#7A0303] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                                      >
                                        ⚡ Auto-Fill OTP
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <div className="max-w-md my-2">
                                  <OtpInput
                                    value={pwdOtp}
                                    onChange={setPwdOtp}
                                    autoFocus
                                  />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                  <button
                                    type="button"
                                    disabled={pwdLoading || pwdOtp.length < 6}
                                    onClick={handleConfirmChangePassword}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs"
                                  >
                                    {pwdLoading ? (
                                      <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Updating Password…</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 size={14} />
                                        <span>Confirm &amp; Update Password</span>
                                      </>
                                    )}
                                  </button>

                                  {pwdCooldown > 0 ? (
                                    <span className="text-xs text-stone-400">
                                      Resend in <strong className="font-mono text-stone-700">{pwdCooldown}s</strong>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={pwdLoading}
                                      onClick={handleResendPasswordOtp}
                                      className="text-xs font-semibold text-[#930303] hover:underline cursor-pointer"
                                    >
                                      Resend Code
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPwdStep('initial');
                                      setPwdOtp('');
                                      setPwdError('');
                                    }}
                                    className="text-xs text-stone-500 hover:text-stone-800 ml-auto cursor-pointer"
                                  >
                                    Back
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Government PAN Card & KYC Compliance Section */}
                      <div className="p-5 sm:p-6 bg-gradient-to-br from-[#FAF7F2] to-[#FFFDFB] rounded-2xl border border-[#E9DED2] space-y-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9DED2]">
                          <div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-[#930303]" />
                              <h3 className="font-display font-bold text-base sm:text-lg text-stone-900">
                                Government PAN Card &amp; KYC Compliance
                              </h3>
                            </div>
                            <p className="text-xs text-stone-600 mt-1 max-w-xl leading-relaxed">
                              As per Indian Income Tax guidelines (Rule 114B), submitting your PAN card details is required for fine jewellery purchases exceeding ₹2,00,000. Verified for insured armored transit and official GST billing.
                            </p>
                          </div>

                          <div className="shrink-0">
                            {profile.panNumber && profile.panCardImage ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                <span>KYC Complete (PAN On File)</span>
                              </span>
                            ) : profile.panNumber ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <AlertCircle size={13} className="text-amber-600" />
                                <span>PAN Number Added (Upload Photo)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                                <span>Pending PAN Submission</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                          {/* PAN Card Number */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                              PAN Card Number *
                            </label>
                            <input
                              type="text"
                              maxLength={10}
                              value={profile.panNumber || ''}
                              onChange={handlePanNumberChange}
                              placeholder="e.g. ABCDE1234F"
                              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl font-mono text-sm uppercase tracking-widest font-bold text-stone-900 focus:outline-none focus:border-[#930303] shadow-xs"
                            />
                            {profile.panNumber && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profile.panNumber) ? (
                              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 pt-0.5">
                                <CheckCircle2 size={12} />
                                <span>Valid Indian PAN format</span>
                              </p>
                            ) : profile.panNumber ? (
                              <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1 pt-0.5">
                                <AlertCircle size={12} />
                                <span>Enter complete 10 alphanumeric characters (5 letters, 4 digits, 1 letter)</span>
                              </p>
                            ) : (
                              <p className="text-[11px] text-stone-500 pt-0.5">
                                Format: 5 uppercase letters, 4 numbers, 1 letter (e.g. ABCDE1234F)
                              </p>
                            )}
                          </div>

                          {/* PAN Card Photo Upload */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                              PAN Card Document Copy / Photo
                            </label>

                            {profile.panCardImage ? (
                              <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={profile.panCardImage}
                                    alt="PAN Card Preview"
                                    className="w-16 h-12 rounded-lg object-cover border border-stone-300 shadow-xs shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                                      <CheckCircle2 size={12} className="text-emerald-600" />
                                      <span>Document Uploaded</span>
                                    </p>
                                    <p className="text-[11px] text-stone-500 truncate">
                                      Secured on Cloudinary CDN
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <a
                                    href={profile.panCardImage}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors"
                                    title="View full document"
                                  >
                                    <Eye size={13} />
                                    <span>View</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={handleRemovePanCard}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                                    title="Remove PAN card photo"
                                  >
                                    <Trash2 size={13} />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-[#C9A44A]/60 hover:border-[#930303] rounded-xl bg-white cursor-pointer transition-colors text-center group">
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={uploadingPan}
                                  onChange={handlePanCardUpload}
                                  className="sr-only"
                                />
                                {uploadingPan ? (
                                  <div className="flex items-center gap-2 text-xs text-[#930303] font-semibold py-1">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Uploading PAN Card…</span>
                                  </div>
                                ) : (
                                  <>
                                    <UploadCloud className="w-6 h-6 text-[#C9A44A] group-hover:text-[#930303] transition-colors mb-0.5" />
                                    <span className="text-xs font-semibold text-stone-700">
                                      Upload PAN Card Photo / Scan
                                    </span>
                                    <span className="text-[11px] text-stone-400">
                                      Supported formats: JPEG, PNG, WEBP (Max 5MB)
                                    </span>
                                  </>
                                )}
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Error & Success Feedback */}
                        {panError && (
                          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                            ⚠️ {panError}
                          </p>
                        )}
                        {panSuccessNotice && (
                          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium">
                            ✓ {panSuccessNotice}
                          </p>
                        )}

                        {/* Save Button */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <p className="text-[11px] text-stone-500">
                            PAN details are securely stored and verified for high-value invoice compliance.
                          </p>
                          <button
                            type="button"
                            disabled={savingPan || uploadingPan}
                            onClick={handleSavePan}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs"
                          >
                            {savingPan ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <ShieldCheck size={14} />
                            )}
                            <span>{savingPan ? 'Saving KYC Details…' : 'Save PAN Details'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2 text-xs text-stone-500 border-t border-stone-100">
                        <ShieldCheck size={14} className="text-[#C9A44A]" />
                        <span>All customer identity records are encrypted &amp; verified by BL Jewels Agra Flagship.</span>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'addresses' && (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Address book</h2>
                      <button
                        type="button"
                        disabled={busy || addresses.length >= 10}
                        onClick={() => {
                          setEditIndex(-1);
                          setAddress({ ...emptyAddress, name: user.name, phone: user.phone || '' });
                        }}
                        className="text-sm text-[#930303]"
                      >
                        + Add address
                      </button>
                    </div>
                    {!addresses.length && !address && (
                      <p className="bg-white border rounded-2xl p-8 text-stone-500">No saved addresses yet.</p>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map((a, i) => (
                        <article key={a._id || i} className="bg-white border rounded-2xl p-5 space-y-2">
                          <p className="text-xs text-[#930303]">
                            {a.label}
                            {i === 0 ? ' · Default' : ''}
                          </p>
                          <h3 className="font-semibold">{a.name}</h3>
                          <p className="text-sm text-stone-500">
                            {[a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-sm">{a.phone}</p>
                          <div className="flex gap-4 text-xs text-[#930303] pt-3">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                setEditIndex(i);
                                setAddress(a);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => run(() => saveAddresses(addresses.filter((_, n) => n !== i)))}
                            >
                              Remove
                            </button>
                            {i > 0 && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  run(() => saveAddresses([a, ...addresses.filter((_, n) => n !== i)]))
                                }
                              >
                                Make default
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                    {address && (
                      <form
                        className="bg-white border rounded-2xl p-6 grid sm:grid-cols-2 gap-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          run(() =>
                            saveAddresses(
                              editIndex < 0 ? [...addresses, address] : addresses.map((a, i) => (i === editIndex ? address : a))
                            )
                          );
                        }}
                      >
                        <h3 className="sm:col-span-2 font-semibold">{editIndex < 0 ? 'New' : 'Edit'} address</h3>
                        <label className="text-sm">
                          Label
                          <select
                            value={address.label}
                            onChange={(e) => setAddress({ ...address, label: e.target.value })}
                            className="block border rounded-xl p-3 w-full mt-1"
                          >
                            {['Home', 'Office', 'Other'].map((l) => (
                              <option key={l}>{l}</option>
                            ))}
                          </select>
                        </label>
                        {Object.keys(emptyAddress)
                          .filter((k) => k !== 'label')
                          .map((k) => (
                            <label key={k} className="text-sm capitalize">
                              {{ line1: 'Street address', line2: 'Apartment / landmark', pincode: 'PIN code' }[k] || k}
                              <input
                                required={k !== 'line2'}
                                value={address[k] || ''}
                                onChange={(e) => setAddress({ ...address, [k]: e.target.value })}
                                className="block border rounded-xl p-3 w-full mt-1"
                              />
                            </label>
                          ))}
                        <div className="sm:col-span-2 flex gap-4">
                          <button disabled={busy} className="bg-[#930303] text-white px-5 py-3 rounded-xl">
                            Save address
                          </button>
                          <button type="button" onClick={() => setAddress(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {tab === 'wishlist' && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                      <div>
                        <h2 className="text-xl font-semibold text-stone-900 font-heading">
                          My Saved Favourites ({wishlist.length})
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Your saved fine jewellery heirlooms and royal creations.
                        </p>
                      </div>
                      <Link
                        to="/collections"
                        className="text-xs font-semibold text-[#930303] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Discover More Jewels</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>

                    {loadingWishlist ? (
                      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-500 space-y-2">
                        <Loader2 className="mx-auto animate-spin text-[#930303]" size={24} />
                        <p>Loading your saved jewellery…</p>
                      </div>
                    ) : wishlist.length === 0 || wishlistProducts.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF7F2] border border-[#E9DED2] flex items-center justify-center text-[#930303]">
                          <Heart size={28} />
                        </div>
                        <h3 className="text-lg font-medium text-stone-900">Your Wishlist is Empty</h3>
                        <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                          Click the heart icon on any royal creation to save your favourite wedding chokers and diamond solitaires here.
                        </p>
                        <div className="pt-2">
                          <Link
                            to="/collections"
                            className="inline-block px-6 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                          >
                            Explore Fine Collections
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {wishlistProducts.map((p) => (
                          <ProductCard key={p._id} product={p} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ORDER CANCELLATION & REASON CONFIRMATION MODAL
          ══════════════════════════════════════════════════════════════════ */}
      {cancelModalOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            if (!cancelSubmitting) setCancelModalOrder(null);
          }}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-stone-900">
                    Cancel Order
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    #{cancelModalOrder.orderNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!cancelSubmitting) setCancelModalOrder(null);
                }}
                disabled={cancelSubmitting}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close cancel dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Order Highlight Box */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-stone-500">Order Amount:</span>
                <p className="font-bold text-stone-900 text-sm">{money(cancelModalOrder.pricing?.total)}</p>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-stone-500">Payment Status:</span>
                <p className="font-semibold text-emerald-700 capitalize">
                  {cancelModalOrder.payment?.status === 'paid' ? 'Paid & Verified' : cancelModalOrder.payment?.status || 'Pending'}
                </p>
              </div>
            </div>

            {/* Refund Assurance Note */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
              <strong>100% Refund Assurance:</strong> If payment was already completed, the full amount of{' '}
              <strong>{money(cancelModalOrder.pricing?.total)}</strong> will be automatically credited back to your original payment source (Bank/UPI/Card) within 5-7 working days.
            </div>

            {/* Cancellation Reason Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Why do you want to cancel this order? <span className="text-red-600">*</span>
              </label>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {CANCEL_REASONS.map((r) => {
                  const isSelected = cancelReason === r.label;
                  return (
                    <label
                      key={r.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#930303] bg-red-50/40 text-stone-900 font-semibold shadow-2xs'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={r.label}
                        checked={isSelected}
                        onChange={() => {
                          setCancelReason(r.label);
                          setCancelError('');
                        }}
                        className="mt-0.5 accent-[#930303]"
                      />
                      <span>{r.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional Comments (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Additional Comments <span className="text-stone-400 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                value={cancelComments}
                onChange={(e) => setCancelComments(e.target.value)}
                placeholder="Tell us if we can help you with sizing, delivery date, or anything else..."
                rows={2}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#930303] focus:bg-white resize-none"
              />
            </div>

            {/* Error Message */}
            {cancelError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {cancelError}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
              <button
                type="button"
                disabled={cancelSubmitting}
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Keep Order
              </button>

              <button
                type="button"
                disabled={!cancelReason || cancelSubmitting}
                onClick={handleConfirmCancel}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {cancelSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing Cancellation…</span>
                  </>
                ) : (
                  <span>Confirm & Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Resolution Photo Inspection */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-stone-900/90 border-b border-stone-800 flex justify-between items-center text-xs text-stone-300">
              <span className="font-semibold text-stone-200">Attached Proof Preview</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="text-stone-400 hover:text-white p-1 cursor-pointer"
                aria-label="Close image preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-black/40">
              <img
                src={lightboxImage}
                alt="Enlarged proof"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-stone-900 border-t border-stone-800 flex justify-between items-center text-xs text-stone-300">
              <a
                href={lightboxImage}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1.5 underline"
              >
                <ExternalLink size={14} /> Open original full resolution
              </a>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          OFFICIAL PRINTABLE TAX INVOICE (Hidden on screen, prints on A4)
          ══════════════════════════════════════════════════════════════════ */}
      {(printOrder || (expandedOrderId && orders.find((o) => o._id === expandedOrderId)) || orders[0]) && (() => {
        const po = printOrder || (expandedOrderId && orders.find((o) => o._id === expandedOrderId)) || orders[0];
        if (!po) return null;
        const pSubtotal = po.pricing?.subtotal ?? 0;
        const pDiscount = po.pricing?.discount ?? 0;
        const pShipping = po.pricing?.shipping ?? 0;
        const pTotal = po.pricing?.total ?? 0;
        const pDate = po.createdAt
          ? new Date(po.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '';
        const pTime = po.createdAt
          ? new Date(po.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          : '';
        const pMethod = (po.payment?.method || 'RAZORPAY').toUpperCase();
        const pStatus = (po.payment?.status || 'PAID').toUpperCase();

        return (
          <div
            id="print-receipt-container"
            className="print-receipt-sheet hidden print:block bg-white text-stone-900 border border-stone-800 p-6"
          >
            {/* Header Bar */}
            <div className="flex justify-between items-start gap-4 pb-4 border-b-2 border-stone-800">
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src="/images/bl-jewels-logo.png"
                    alt="BL Jewels — Purity with Auspiciousness"
                    className="h-12 sm:h-14 w-auto object-contain"
                  />
                </div>
                <p className="text-[10px] font-accent tracking-widest uppercase text-stone-600 font-semibold mt-1">
                  Purity with Auspiciousness · Since 1984
                </p>
                <p className="text-[11px] text-stone-700 font-semibold mt-1">
                  B.L. Jewels (P) Ltd.
                </p>
                <p className="text-[10px] text-stone-500 leading-tight">
                  Shop No. 01, Upper Ground Floor, Suresh Mall, MG Road, Civil Lines, Agra, UP 282002
                </p>
                <p className="text-[10px] text-stone-500">
                  Helpline: 074549 86610 · contact@bljewels.com · www.bljewels.com
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block bg-stone-900 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                  TAX INVOICE / CASH MEMO
                </span>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mt-1">
                  Original for Recipient
                </p>
                <div className="text-[10px] text-stone-600 mt-1.5 space-y-0.5 font-mono">
                  <p><strong>GSTIN:</strong> 09AABCB1234F1Z5</p>
                  <p><strong>State:</strong> Uttar Pradesh (09)</p>
                  <p><strong>BIS Hallmark Reg:</strong> HM/C-7591823961</p>
                </div>
              </div>
            </div>

            {/* Meta Grid (Order Info & Consignee) */}
            <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-stone-300 text-[11px]">
              {/* Left: Invoice & Payment */}
              <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Invoice / Order No:</span>
                  <span className="font-mono font-bold text-stone-900">{po.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Invoice Date & Time:</span>
                  <span className="font-medium text-stone-800">{pDate} · {pTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Payment Mode:</span>
                  <span className="font-semibold text-stone-800">{pMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Payment Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    ✓ {pStatus}
                  </span>
                </div>
                {po.payment?.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Txn / UTR Ref:</span>
                    <span className="font-mono text-[10px] text-stone-700">{po.payment.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Transit Insurance:</span>
                  <span className="text-emerald-800 font-medium">100% Blue Dart Armored Cover</span>
                </div>
              </div>

              {/* Right: Billed & Shipped To */}
              <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200/80 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Billed & Delivered To (Consignee)
                </p>
                <p className="font-bold text-stone-900 text-xs">
                  {po.shippingAddress?.name || user?.name || 'Valued Customer'}
                </p>
                <p className="text-stone-600 font-mono text-[10px]">
                  Phone: {po.shippingAddress?.phone || user?.phone}
                </p>
                <p className="text-stone-600 leading-snug pt-0.5">
                  {[
                    po.shippingAddress?.line1,
                    po.shippingAddress?.line2,
                    po.shippingAddress?.city,
                    po.shippingAddress?.state,
                    po.shippingAddress?.pincode,
                  ].filter(Boolean).join(', ')}
                </p>
                <p className="text-[10px] text-stone-500 font-medium">
                  Country: {po.shippingAddress?.country || 'India'} (State Code: 09)
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-3">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-800 uppercase text-[10px] font-bold border-y-2 border-stone-800 tracking-wider">
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-2">Description of Jewellery</th>
                    <th className="py-2 px-2 text-center">Purity</th>
                    <th className="py-2 px-2 text-center">HSN</th>
                    <th className="py-2 px-2 text-center">Gross Wt.</th>
                    <th className="py-2 px-2 text-center w-12">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Rate</th>
                    <th className="py-2 px-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {po.items?.map((item, index) => {
                    const snap = item.snapshot || {};
                    const variant = snap.variant || {};
                    const metal = snap.metal || {};
                    const karat = variant.karat || metal.karat || '22K (916)';
                    const weight = variant.weight ? `${variant.weight}g` : '—';

                    return (
                      <tr key={index} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-2 text-center font-mono text-stone-500">{index + 1}</td>
                        <td className="py-2.5 px-2">
                          <p className="font-bold text-stone-900">{snap.name || 'Fine Jewellery Article'}</p>
                          <p className="text-[10px] text-stone-500">
                            {variant.sku ? `SKU: ${variant.sku} · ` : ''}100% BIS Hallmarked Pure Gold
                          </p>
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-stone-800">{karat}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-[10px] text-stone-600">711319</td>
                        <td className="py-2.5 px-2 text-center font-mono text-stone-700">{weight}</td>
                        <td className="py-2.5 px-2 text-center font-semibold text-stone-800">{item.quantity}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-stone-700">{money(item.price)}</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-stone-900">
                          {money(item.quantity * item.price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Calculation & Summary */}
            <div className="pt-2 border-t-2 border-stone-800 grid grid-cols-12 gap-4 text-[11px]">
              {/* Left: Amount in Words & Notes */}
              <div className="col-span-7 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Amount Chargeable (in words)
                  </p>
                  <p className="font-bold text-stone-900 italic mt-0.5 text-xs">
                    {numberToWordsIndian(pTotal)}
                  </p>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/90 text-[10px] text-stone-600 space-y-0.5">
                  <p className="font-bold text-stone-800 uppercase tracking-wider text-[9px]">
                    Tax & Composition Scheme Declaration:
                  </p>
                  <p>
                    * GST (3% Composite Scheme) is inclusive in all product rates as per Section 10 of the CGST Act 2017.
                  </p>
                  <p>
                    * Certified by BIS Hallmarking Centre under Bureau of Indian Standards Regulations.
                  </p>
                </div>
              </div>

              {/* Right: Totals Breakdown Box */}
              <div className="col-span-5 bg-stone-50/80 p-3 rounded-lg border border-stone-200/90 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Gross Merchandise Value:</span>
                  <span>{money(pSubtotal)}</span>
                </div>

                {pDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Festive Discount {po.pricing?.coupon ? `(${po.pricing.coupon})` : ''}:</span>
                    <span>-{money(pDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Insured Armored Shipping:</span>
                  <span className={pShipping === 0 ? 'text-emerald-700 font-bold' : ''}>
                    {pShipping === 0 ? 'FREE' : money(pShipping)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600 text-[10px]">
                  <span>Integrated GST (3% Inclusive):</span>
                  <span>Included</span>
                </div>

                <div className="border-t-2 border-stone-800 pt-2 flex justify-between text-sm font-bold text-stone-950">
                  <span>Grand Total Paid:</span>
                  <span className="text-[#930303] text-base">{money(pTotal)}</span>
                </div>
              </div>
            </div>

            {/* Quality Guarantees Bar */}
            <div className="my-3 py-2 bg-amber-50/70 border border-amber-200/80 rounded-lg grid grid-cols-4 gap-2 text-center text-[9px] font-semibold text-stone-700">
              <div className="flex items-center justify-center gap-1.5">
                <img
                  src="/images/bis-bureau-of-indian-standards.png"
                  alt="BIS Hallmark"
                  className="h-3.5 w-auto object-contain inline-block"
                />
                <span>100% BIS 916 Hallmarked</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Truck size={12} className="text-emerald-700" />
                <span>Insured Armored Dispatch</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-[#930303]" />
                <span>Lifetime Jewellery Buyback</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Clock size={12} className="text-stone-700" />
                <span>15-Day Easy Returns</span>
              </div>
            </div>

            {/* Signatures & Bottom Signoff */}
            <div className="pt-4 border-t border-stone-300 grid grid-cols-2 items-end text-[10px]">
              <div>
                <p className="text-stone-500 font-medium">Customer Acceptance Signature:</p>
                <div className="h-10 border-b border-stone-400 border-dashed w-48 mt-2"></div>
                <p className="text-[9px] text-stone-400 mt-1 italic">Received in sealed tamper-evident armored packaging</p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-stone-900 uppercase tracking-wider text-[10px]">
                  For B.L. JEWELS (P) LTD.
                </p>
                <div className="font-serif italic text-stone-400 py-1 text-xs">
                  [BIS 916 CERTIFIED · DISPATCH AUTHORIZED]
                </div>
                <p className="font-bold text-stone-800 text-[10px]">Authorised Signatory</p>
                <p className="text-[9px] text-stone-400">Subject to Agra, UP Jurisdiction</p>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};
