import Subscriber from '../models/Subscriber.js';
import { getDbStatus } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = ['homepage', 'footer', 'admin', 'checkout'];

const ensureMemorySubscribers = () => {
  if (!Array.isArray(memoryStore.subscribers)) {
    memoryStore.subscribers = [];
  }
  return memoryStore.subscribers;
};

const computeStats = (list) => {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let newThisWeek = 0;
  let homepageCount = 0;
  let footerCount = 0;

  for (const s of list) {
    const ts = new Date(s.createdAt || s.consentAt || Date.now()).getTime();
    if (ts >= weekAgo) newThisWeek += 1;
    const src = s.source || 'homepage';
    if (src === 'footer') footerCount += 1;
    else if (src === 'homepage') homepageCount += 1;
  }

  return {
    total: list.length,
    newThisWeek,
    homepageCount,
    footerCount,
  };
};

/**
 * POST /api/v1/subscribers  &  POST /api/v1/auth/subscribe
 * Public newsletter signup (or admin add)
 */
export const subscribeEmail = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }

  const rawSource = String(req.body.source || 'homepage').trim().toLowerCase();
  const source = ALLOWED_SOURCES.includes(rawSource) ? rawSource : 'homepage';

  try {
    if (getDbStatus()) {
      const existing = await Subscriber.findOne({ email }).lean();
      if (existing) {
        if (existing.status === 'unsubscribed') {
          await Subscriber.updateOne(
            { _id: existing._id },
            { $set: { status: 'subscribed', consentAt: new Date(), adminViewed: false } }
          );
        }
        return res.json({
          success: true,
          alreadySubscribed: true,
          message: 'You are already subscribed to BL Jewels updates.',
          subscriber: existing,
        });
      }

      const created = await Subscriber.create({
        email,
        source,
        status: 'subscribed',
        consentAt: new Date(),
        adminViewed: source === 'admin',
      });
      return res.status(201).json({
        success: true,
        alreadySubscribed: false,
        message: 'Thank you for joining The BL Jewels Circle.',
        subscriber: created,
      });
    }

    const list = ensureMemorySubscribers();
    const existing = list.find((s) => s.email === email);
    if (existing) {
      return res.json({
        success: true,
        alreadySubscribed: true,
        message: 'You are already subscribed to BL Jewels updates.',
        subscriber: existing,
      });
    }

    const record = {
      _id: `sub_${Date.now()}`,
      email,
      source,
      status: 'subscribed',
      consentAt: new Date().toISOString(),
      adminViewed: source === 'admin',
      createdAt: new Date().toISOString(),
    };
    list.unshift(record);
    return res.status(201).json({
      success: true,
      alreadySubscribed: false,
      message: 'Thank you for joining The BL Jewels Circle.',
      subscriber: record,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.json({
        success: true,
        alreadySubscribed: true,
        message: 'You are already subscribed to BL Jewels updates.',
      });
    }
    return res.status(503).json({
      success: false,
      message: 'Unable to subscribe right now. Please try again.',
    });
  }
};

/**
 * GET /api/v1/subscribers
 * Admin list of all newsletter & VIP subscribers
 */
export const getSubscribers = async (req, res) => {
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const source = String(req.query.source || 'all').trim().toLowerCase();

    let allList = [];
    if (getDbStatus()) {
      allList = await Subscriber.find().sort({ createdAt: -1 }).lean();
    } else {
      allList = [...ensureMemorySubscribers()];
    }

    const stats = computeStats(allList);
    const filtered = allList.filter((item) => {
      const itemSource = (item.source || 'homepage').toLowerCase();
      if (source !== 'all' && itemSource !== source) return false;
      if (search && !String(item.email || '').toLowerCase().includes(search)) return false;
      return true;
    });

    return res.json({
      success: true,
      count: filtered.length,
      stats,
      subscribers: filtered,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/v1/subscribers/:id
 * Admin remove subscriber
 */
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDbStatus()) {
      const deleted = await Subscriber.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Subscriber not found.' });
      }
      return res.json({ success: true, message: 'Subscriber removed.' });
    }

    const list = ensureMemorySubscribers();
    const prevLen = list.length;
    memoryStore.subscribers = list.filter((s) => s._id !== id);
    if (memoryStore.subscribers.length === prevLen) {
      return res.status(404).json({ success: false, message: 'Subscriber not found.' });
    }
    return res.json({ success: true, message: 'Subscriber removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markSubscriberViewed = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDbStatus()) {
      await Subscriber.findByIdAndUpdate(id, { $set: { adminViewed: true } });
    } else {
      const s = (memoryStore.subscribers || []).find((sub) => String(sub._id) === String(id));
      if (s) s.adminViewed = true;
    }
    return res.json({ success: true, message: 'Subscriber marked as viewed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllSubscribersViewed = async (req, res) => {
  try {
    if (getDbStatus()) {
      await Subscriber.updateMany({ adminViewed: { $ne: true } }, { $set: { adminViewed: true } });
    } else {
      (memoryStore.subscribers || []).forEach((s) => {
        s.adminViewed = true;
      });
    }
    return res.json({ success: true, message: 'All subscribers marked as viewed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


