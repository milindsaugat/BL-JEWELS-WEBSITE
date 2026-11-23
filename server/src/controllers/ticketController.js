import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';
import { getDbStatus } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';
import { sendTicketReplyEmail, sendTicketCreatedEmail, isEmailConfigured } from '../services/emailService.js';

const VALID_STATUSES = ['open', 'in_progress', 'replied', 'resolved', 'closed'];
const VALID_PRIORITIES = ['normal', 'high', 'urgent'];

const ensureMemoryTickets = () => {
  if (!Array.isArray(memoryStore.tickets)) {
    memoryStore.tickets = [];
  }
  return memoryStore.tickets;
};

const generateTicketNumber = (type = 'ticket') => {
  const prefix = type === 'contact' ? 'INQ' : 'TKT';
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const ts = String(Date.now()).slice(-5);
  return `BL-${prefix}-${ts}${rand}`;
};

const cleanStr = (val = '', maxLen = 500) => String(val ?? '').trim().slice(0, maxLen);

const buildStats = (list = []) => {
  const counts = {
    total: list.length,
    open: 0,
    in_progress: 0,
    replied: 0,
    resolved: 0,
    closed: 0,
    contactCount: 0,
    ticketCount: 0,
  };
  for (const item of list) {
    if (counts[item.status] !== undefined) counts[item.status] += 1;
    if (item.type === 'contact') counts.contactCount += 1;
    else counts.ticketCount += 1;
  }
  return counts;
};

/**
 * POST /api/v1/tickets/contact
 * Public storefront contact/appointment inquiry (attaches req.user if logged in via optionalAuth)
 */
export const submitContactInquiry = async (req, res) => {
  try {
    const name = cleanStr(req.body.name, 120);
    const phone = cleanStr(req.body.phone, 40);
    const email = cleanStr(req.body.email, 160).toLowerCase();
    const occasion = cleanStr(req.body.occasion || 'Showroom Consultation', 100);
    const message = cleanStr(req.body.message, 3000);
    const subject = cleanStr(
      req.body.subject || `Contact Inquiry — ${occasion || 'General Consultation'}`,
      200
    );

    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name and inquiry message.',
      });
    }
    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a phone number or email so our concierge can reach you.',
      });
    }

    const ticketNumber = generateTicketNumber('contact');
    const docData = {
      ticketNumber,
      type: 'contact',
      user: req.user?._id || null,
      name,
      email: email || cleanStr(req.user?.email, 160).toLowerCase(),
      phone,
      occasion,
      category: occasion || 'Showroom & Contact Inquiry',
      orderNumber: cleanStr(req.body.orderNumber, 60),
      subject,
      message,
      status: 'open',
      priority: 'normal',
      adminViewed: false,
      replies: [],
      lastRepliedAt: null,
    };

    let created;
    if (getDbStatus()) {
      created = await SupportTicket.create(docData);
    } else {
      created = {
        _id: `tkt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ...docData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      ensureMemoryTickets().unshift(created);
    }

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been received by our showroom team.',
      data: created,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/v1/tickets/my
 * Customer dashboard: create a support ticket
 */
export const createMyTicket = async (req, res) => {
  try {
    const subject = cleanStr(req.body.subject, 200);
    const category = cleanStr(req.body.category || 'Order Support', 100);
    const orderNumber = cleanStr(req.body.orderNumber, 60);
    const message = cleanStr(req.body.message, 3000);
    const priority = VALID_PRIORITIES.includes(req.body.priority) ? req.body.priority : 'normal';

    const returnReasons = Array.isArray(req.body.returnReasons)
      ? req.body.returnReasons.map((r) => cleanStr(r, 200)).filter(Boolean)
      : [];

    const attachments = Array.isArray(req.body.attachments)
      ? req.body.attachments
          .filter((a) => a && a.url)
          .map((a) => ({
            url: cleanStr(a.url, 1000),
            publicId: cleanStr(a.publicId || '', 200),
            fileType: a.fileType === 'video' ? 'video' : 'image',
            originalName: cleanStr(a.originalName || a.name || '', 200),
            size: Number(a.size) || 0,
          }))
      : [];

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a subject and describe your issue.',
      });
    }

    const registeredEmail = cleanStr(req.user?.email || req.body.email, 160).toLowerCase();
    const registeredName = cleanStr(req.user?.name || req.body.name || 'Valued Customer', 120);
    const registeredPhone = cleanStr(req.user?.phone || req.body.phone || '', 40);

    const ticketNumber = generateTicketNumber('ticket');
    const docData = {
      ticketNumber,
      type: 'ticket',
      user: req.user._id,
      name: registeredName,
      email: registeredEmail,
      phone: registeredPhone,
      occasion: '',
      category,
      orderNumber,
      subject,
      message,
      status: 'open',
      priority,
      returnReasons,
      adminViewed: false,
      attachments,
      replies: [],
      lastRepliedAt: null,
    };

    let created;
    if (getDbStatus()) {
      created = await SupportTicket.create(docData);
    } else {
      created = {
        _id: `tkt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ...docData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      ensureMemoryTickets().unshift(created);
    }

    // Send confirmation email notification to user's registered account email
    let emailSent = false;
    let emailReason = '';
    if (registeredEmail) {
      try {
        const result = await sendTicketCreatedEmail({
          to: registeredEmail,
          ticketNumber,
          customerName: registeredName,
          subject,
          category,
          orderNumber,
          message,
          priority,
        });
        emailSent = Boolean(result?.sent);
        if (!emailSent) emailReason = result?.reason || '';
      } catch (err) {
        console.warn('Ticket created email notification error:', err.message);
        emailReason = err.message;
      }
    }

    return res.status(201).json({
      success: true,
      message: `Support ticket ${ticketNumber} created.${emailSent ? ' Confirmation email sent to your registered email.' : ''}`,
      data: created,
      emailSent,
      emailReason,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/tickets/my
 * Customer dashboard: list tickets and contact inquiries matching user ID or email
 */
export const getMyTickets = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const userEmail = String(req.user.email || '').trim().toLowerCase();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let tickets = [];
    if (getDbStatus()) {
      const orConditions = [{ user: req.user._id }];
      if (userEmail) orConditions.push({ email: userEmail });
      tickets = await SupportTicket.find({
        $and: [
          { $or: orConditions },
          {
            $or: [
              { status: { $ne: 'closed' } },
              { closedAt: { $gte: thirtyDaysAgo } },
              { closedAt: null, updatedAt: { $gte: thirtyDaysAgo } },
            ],
          },
        ],
      })
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean();
    } else {
      tickets = ensureMemoryTickets()
        .filter((t) => {
          const isOwner =
            String(t.user || '') === userId ||
            (userEmail && String(t.email || '').toLowerCase() === userEmail);
          if (!isOwner) return false;
          // Purge closed tickets older than 30 days
          if (t.status === 'closed') {
            const closedDate = new Date(t.closedAt || t.updatedAt || t.createdAt);
            if (closedDate < thirtyDaysAgo) return false;
          }
          return true;
        })
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }

    return res.json({ success: true, data: tickets });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/v1/tickets/my/:id/reply
 * Customer dashboard: add follow-up reply to own ticket/inquiry
 */
export const replyToMyTicket = async (req, res) => {
  try {
    const message = cleanStr(req.body.message, 3000);
    const attachments = Array.isArray(req.body.attachments)
      ? req.body.attachments
          .filter((a) => a && a.url)
          .map((a) => ({
            url: cleanStr(a.url, 1000),
            publicId: cleanStr(a.publicId || '', 200),
            fileType: a.fileType === 'video' ? 'video' : 'image',
            originalName: cleanStr(a.originalName || a.name || '', 200),
            size: Number(a.size) || 0,
          }))
      : [];

    if (!message && attachments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply cannot be empty. Please enter a message or attach photos/videos.',
      });
    }

    const userId = String(req.user._id);
    const userEmail = String(req.user.email || '').trim().toLowerCase();

    if (getDbStatus()) {
      const ticket = await SupportTicket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }
      const isOwner =
        (ticket.user && String(ticket.user) === userId) ||
        (userEmail && String(ticket.email || '').toLowerCase() === userEmail);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      // If ticket is closed, customer cannot send replies
      if (ticket.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'This support ticket is closed. You can no longer send replies to this conversation.',
        });
      }

      const replyEntry = {
        senderRole: 'customer',
        senderName: cleanStr(req.user.name || 'Customer', 120),
        message: message || (attachments.length ? `[Attached ${attachments.length} file(s)]` : ''),
        attachments,
        createdAt: new Date(),
      };

      ticket.replies.push(replyEntry);
      if (ticket.status === 'resolved' || ticket.status === 'replied') {
        ticket.status = 'open';
      }
      ticket.lastRepliedAt = new Date();
      ticket.adminViewed = false;
      await ticket.save();
      return res.json({ success: true, data: ticket });
    }

    const list = ensureMemoryTickets();
    const idx = list.findIndex((t) => String(t._id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }
    const ticket = list[idx];
    const isOwner =
      String(ticket.user || '') === userId ||
      (userEmail && String(ticket.email || '').toLowerCase() === userEmail);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'This support ticket is closed. You can no longer send replies to this conversation.',
      });
    }

    const replyEntry = {
      senderRole: 'customer',
      senderName: cleanStr(req.user.name || 'Customer', 120),
      message: message || (attachments.length ? `[Attached ${attachments.length} file(s)]` : ''),
      attachments,
      createdAt: new Date(),
    };

    ticket.replies = [
      ...(ticket.replies || []),
      { _id: `rep_${Date.now()}`, ...replyEntry, createdAt: replyEntry.createdAt.toISOString() },
    ];
    if (['resolved', 'replied'].includes(ticket.status)) {
      ticket.status = 'open';
    }
    ticket.adminViewed = false;
    ticket.lastRepliedAt = replyEntry.createdAt.toISOString();
    ticket.updatedAt = replyEntry.createdAt.toISOString();
    return res.json({ success: true, data: ticket });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/tickets
 * Admin unified inbox: supports ?type=all|contact|ticket, ?status=all|open|..., ?search=...
 */
export const getAllTickets = async (req, res) => {
  try {
    const typeFilter = String(req.query.type || 'all').trim();
    const statusFilter = String(req.query.status || 'all').trim();
    const search = String(req.query.search || '').trim().toLowerCase();

    let allDocs = [];
    if (getDbStatus()) {
      allDocs = await SupportTicket.find({})
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean();
    } else {
      allDocs = [...ensureMemoryTickets()].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
    }

    const stats = buildStats(allDocs);

    const filtered = allDocs.filter((doc) => {
      if (typeFilter && typeFilter !== 'all' && doc.type !== typeFilter) return false;
      if (statusFilter && statusFilter !== 'all' && doc.status !== statusFilter) return false;
      if (search) {
        const hay = `${doc.ticketNumber} ${doc.name} ${doc.email} ${doc.phone} ${doc.subject} ${doc.category} ${doc.orderNumber} ${doc.message}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    return res.json({
      success: true,
      data: filtered,
      stats,
      smtpConfigured: isEmailConfigured(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/v1/tickets/:id/reply
 * Admin: post reply to ticket/contact inquiry + best-effort email notification
 */
export const replyTicket = async (req, res) => {
  try {
    const message = cleanStr(req.body.message, 4000);
    const nextStatus = VALID_STATUSES.includes(req.body.status) ? req.body.status : 'replied';

    const attachments = Array.isArray(req.body.attachments)
      ? req.body.attachments
          .filter((a) => a && a.url)
          .map((a) => ({
            url: cleanStr(a.url, 1000),
            publicId: cleanStr(a.publicId || '', 200),
            fileType: a.fileType === 'video' ? 'video' : 'image',
            originalName: cleanStr(a.originalName || a.name || '', 200),
            size: Number(a.size) || 0,
          }))
      : [];

    if (!message && attachments.length === 0) {
      return res.status(400).json({ success: false, message: 'Reply message or attachment is required.' });
    }

    const replyType = req.body.replyType === 'attachment_request' ? 'attachment_request' : 'message';

    const replyEntry = {
      senderRole: 'admin',
      senderName: cleanStr(req.user?.name || 'BL Jewels Concierge', 120),
      message: message || (attachments.length ? `[Attached ${attachments.length} file(s)]` : ''),
      replyType,
      attachments,
      createdAt: new Date(),
    };

    let updatedTicket;
    if (getDbStatus()) {
      const ticket = await SupportTicket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }
      if (ticket.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'This ticket is permanently closed and cannot receive new replies.',
        });
      }
      ticket.replies.push(replyEntry);
      ticket.status = nextStatus;
      ticket.closedAt = nextStatus === 'closed' ? new Date() : null;
      ticket.lastRepliedAt = new Date();
      ticket.adminViewed = true;
      await ticket.save();
      updatedTicket = ticket.toObject();
    } else {
      const list = ensureMemoryTickets();
      const idx = list.findIndex((t) => String(t._id) === String(req.params.id));
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }
      const ticket = list[idx];
      if (ticket.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'This ticket is permanently closed and cannot receive new replies.',
        });
      }
      ticket.replies = [
        ...(ticket.replies || []),
        { _id: `rep_${Date.now()}`, ...replyEntry, createdAt: replyEntry.createdAt.toISOString() },
      ];
      ticket.status = nextStatus;
      ticket.closedAt = nextStatus === 'closed' ? new Date().toISOString() : null;
      ticket.lastRepliedAt = replyEntry.createdAt.toISOString();
      ticket.updatedAt = replyEntry.createdAt.toISOString();
      ticket.adminViewed = true;
      updatedTicket = ticket;
    }

    let recipientEmail = updatedTicket.email;
    let recipientName = updatedTicket.name;

    // Ensure notification is always sent to the user's registered account email
    if (updatedTicket.user) {
      try {
        const regUser = await User.findById(updatedTicket.user).select('email name');
        if (regUser?.email) {
          recipientEmail = regUser.email;
          if (regUser.name) recipientName = regUser.name;
        }
      } catch {}
    }

    let emailSent = false;
    let emailNote = '';
    if (req.body.sendEmail !== false && recipientEmail) {
      try {
        const emailResult = await sendTicketReplyEmail({
          to: recipientEmail,
          ticketNumber: updatedTicket.ticketNumber,
          customerName: recipientName,
          subject: updatedTicket.subject,
          replyText: message,
        });
        emailSent = Boolean(emailResult?.sent);
        if (!emailSent) emailNote = emailResult?.reason || 'smtp_not_configured';
      } catch (emailErr) {
        emailNote = emailErr.message;
      }
    }

    return res.json({
      success: true,
      data: updatedTicket,
      emailSent,
      emailNote,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/v1/tickets/:id/status
 * Admin: update ticket status or priority
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const updates = {};
    if (req.body.status !== undefined) {
      if (!VALID_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
      }
      updates.status = req.body.status;
      updates.closedAt = req.body.status === 'closed' ? new Date() : null;
    }
    if (req.body.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(req.body.priority)) {
        return res.status(400).json({ success: false, message: 'Invalid priority value.' });
      }
      updates.priority = req.body.priority;
    }

    if (getDbStatus()) {
      const existing = await SupportTicket.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }
      if (existing.status === 'closed' && req.body.status && req.body.status !== 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Closed tickets are permanently finalized and cannot be reopened.',
        });
      }
      const updated = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      ).lean();
      return res.json({ success: true, data: updated });
    }

    const list = ensureMemoryTickets();
    const idx = list.findIndex((t) => String(t._id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }
    if (list[idx].status === 'closed' && req.body.status && req.body.status !== 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Closed tickets are permanently finalized and cannot be reopened.',
      });
    }
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    return res.json({ success: true, data: list[idx] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/v1/tickets/:id
 * Admin: remove spam or closed ticket
 */
export const deleteTicket = async (req, res) => {
  try {
    if (getDbStatus()) {
      const deleted = await SupportTicket.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }
      return res.json({ success: true, message: 'Deleted successfully.' });
    }

    const list = ensureMemoryTickets();
    const idx = list.findIndex((t) => String(t._id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }
    list.splice(idx, 1);
    return res.json({ success: true, message: 'Deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markTicketViewed = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDbStatus()) {
      await SupportTicket.findByIdAndUpdate(id, { $set: { adminViewed: true } });
    } else {
      const t = (memoryStore.tickets || []).find((tkt) => String(tkt._id) === String(id));
      if (t) t.adminViewed = true;
    }
    return res.json({ success: true, message: 'Ticket marked as viewed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllTicketsViewed = async (req, res) => {
  try {
    if (getDbStatus()) {
      await SupportTicket.updateMany({ adminViewed: { $ne: true } }, { $set: { adminViewed: true } });
    } else {
      (memoryStore.tickets || []).forEach((t) => {
        t.adminViewed = true;
      });
    }
    return res.json({ success: true, message: 'All tickets marked as viewed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


