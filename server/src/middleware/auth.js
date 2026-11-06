import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'bl_jewels_super_secret_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);

    let user;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch {}

    if (!user) {
      const memUser = (memoryStore.users || []).find(u => u._id === decoded.id || (decoded.role === 'admin' && u.role === 'admin'));
      if (memUser) user = memUser;
    }

    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (!['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) return res.status(503).json({ success: false, message: 'Account service is temporarily unavailable.' });
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: BL Jewels Admin privileges required.',
    });
  }
};

export const requireAuth = protect;
export const requireAdmin = adminOnly;

export const optionalAuth = async (req, res, next) => {
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'bl_jewels_super_secret_jwt_key_2026_dev';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore token validation failure in optionalAuth
    }
  }
  next();
};

