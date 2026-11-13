import User from '../models/User.js';
import Order from '../models/Order.js';
import { memoryStore } from '../config/memoryStore.js';
import mongoose from 'mongoose';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * GET /api/v1/users/stats
 * High-performance concurrent dashboard stats for users
 */
export const getUserStats = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const customers = (memoryStore.users || []).filter(u => u.role !== 'admin');
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(u => u.isActive !== false).length;
      const verifiedMobile = customers.filter(u => u.phone && u.phone.trim()).length;

      return res.json({
        success: true,
        stats: {
          totalUsers: totalCustomers,
          totalCustomers,
          activeUsers: activeCustomers,
          verifiedMobile,
          newThisMonth: totalCustomers,
        },
      });
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Concurrently count customers only (exclude administrative accounts)
    const customerFilter = { role: { $ne: 'admin' } };
    const [totalCustomers, activeCustomers, verifiedMobile, newThisMonth] = await Promise.all([
      User.countDocuments(customerFilter),
      User.countDocuments({ ...customerFilter, isActive: { $ne: false } }),
      User.countDocuments({ ...customerFilter, phone: { $exists: true, $ne: '' } }),
      User.countDocuments({ ...customerFilter, createdAt: { $gte: startOfMonth } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers: totalCustomers,
        totalCustomers,
        activeUsers: activeCustomers,
        verifiedMobile,
        newThisMonth,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user metrics.' });
  }
};

/**
 * GET /api/v1/users
 * High-performance paginated & filtered user list with concurrent order spend aggregation
 * NOTE: Administration accounts are strictly excluded from the customer directory.
 */
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const { search, status, sort } = req.query;

    if (!isMongoConnected()) {
      // Exclude admin accounts strictly
      let users = (memoryStore.users || []).filter(u => u.role !== 'admin');

      if (search) {
        const s = search.toLowerCase();
        users = users.filter(
          u =>
            (u.name && u.name.toLowerCase().includes(s)) ||
            (u.email && u.email.toLowerCase().includes(s)) ||
            (u.phone && u.phone.toLowerCase().includes(s))
        );
      }
      if (status && status !== 'all') {
        users = users.filter(u => (status === 'active' ? u.isActive !== false : u.isActive === false));
      }

      const total = users.length;
      const paginated = users.slice(skip, skip + limit).map(u => ({
        ...u,
        totalOrders: 2,
        totalSpent: 48500,
      }));

      return res.json({
        success: true,
        users: paginated,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit) || 1,
          limit,
        },
      });
    }

    // Build Mongo Filter - Always exclude admin accounts
    const query = { role: { $ne: 'admin' } };

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    // Determine sorting
    let sortQuery = { createdAt: -1 };
    if (sort === 'oldest') sortQuery = { createdAt: 1 };
    else if (sort === 'name_asc') sortQuery = { name: 1 };
    else if (sort === 'name_desc') sortQuery = { name: -1 };

    // Concurrently fetch users, count, and order aggregation in parallel!
    const [rawUsers, total, orderAgg] = await Promise.all([
      User.find(query)
        .select('-password -resetToken -resetOtp -refreshToken')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
      Order.aggregate([
        {
          $group: {
            _id: '$user',
            totalOrders: { $sum: 1 },
            totalSpent: {
              $sum: {
                $cond: [{ $ne: ['$status', 'cancelled'] }, { $ifNull: ['$pricing.total', 0] }, 0],
              },
            },
          },
        },
      ]),
    ]);

    // Map order stats by user id
    const orderMap = new Map();
    if (Array.isArray(orderAgg)) {
      orderAgg.forEach(item => {
        if (item._id) {
          orderMap.set(String(item._id), {
            totalOrders: item.totalOrders || 0,
            totalSpent: item.totalSpent || 0,
          });
        }
      });
    }

    // Augment users with order stats
    const users = rawUsers.map(u => {
      const stats = orderMap.get(String(u._id)) || { totalOrders: 0, totalSpent: 0 };
      return {
        ...u,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
      };
    });

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve user directory.' });
  }
};

/**
 * GET /api/v1/users/:id
 * Fetch single user profile + recent orders concurrently
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const user = (memoryStore.users || []).find(u => u._id === id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      return res.json({ success: true, user, orders: [] });
    }

    // Fetch user and orders concurrently
    const [user, orders] = await Promise.all([
      User.findById(id).select('-password -resetToken -resetOtp -refreshToken').lean(),
      Order.find({ user: id }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    res.json({
      success: true,
      user,
      orders: orders || [],
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ success: false, message: 'Failed to load user details.' });
  }
};

/**
 * PATCH /api/v1/users/:id/status
 * Toggle active / suspended status
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (req.user && String(req.user._id) === id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.',
      });
    }

    if (!isMongoConnected()) {
      const user = (memoryStore.users || []).find(u => u._id === id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      user.isActive = Boolean(isActive);
      return res.json({ success: true, message: `User marked as ${isActive ? 'Active' : 'Blocked'}.`, user });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: Boolean(isActive) },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'blocked'} successfully.`,
      user,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

/**
 * PATCH /api/v1/users/:id/role
 * Administrative role promotion is permanently disabled for customer accounts.
 */
export const updateUserRole = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Administrative role assignment is disabled. External accounts cannot be granted administrative privileges.',
  });
};

/**
 * PUT /api/v1/users/:id
 * Admin updates customer details (name, email, phone, isActive, avatar)
 */
export const updateUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, isActive, avatar, panNumber, panCardImage } = req.body;

    if (!isMongoConnected()) {
      const user = (memoryStore.users || []).find(u => u._id === id);
      if (!user) return res.status(404).json({ success: false, message: 'Customer account not found.' });
      if (user.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Administrator accounts cannot be modified here.' });
      }

      if (name !== undefined) user.name = String(name).trim();
      if (email !== undefined) {
        const normalized = String(email).trim().toLowerCase();
        const existing = (memoryStore.users || []).find(u => u.email === normalized && u._id !== id);
        if (existing) {
          return res.status(400).json({ success: false, message: 'Another user account already uses this email.' });
        }
        user.email = normalized;
      }
      if (phone !== undefined) user.phone = String(phone).trim();
      if (isActive !== undefined) user.isActive = Boolean(isActive);
      if (avatar !== undefined) user.avatar = String(avatar).trim();
      if (panNumber !== undefined) user.panNumber = String(panNumber).trim().toUpperCase();
      if (panCardImage !== undefined) user.panCardImage = String(panCardImage).trim();
      user.role = 'customer'; // Strictly customer

      return res.json({ success: true, message: 'Customer details updated successfully.', user });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Customer account not found.' });
    }
    if (targetUser.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator accounts cannot be modified from the customer management directory.' });
    }

    const updateFields = { role: 'customer' };
    if (name !== undefined) updateFields.name = String(name).trim();
    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another user account already uses this email.' });
      }
      updateFields.email = normalizedEmail;
    }
    if (phone !== undefined) updateFields.phone = String(phone).trim();
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive);
    if (avatar !== undefined) updateFields.avatar = String(avatar).trim();
    if (panNumber !== undefined) updateFields.panNumber = String(panNumber).trim().toUpperCase();
    if (panCardImage !== undefined) updateFields.panCardImage = String(panCardImage).trim();

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Customer details updated successfully by administrator.',
      user,
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update user details.' });
  }
};

/**
 * DELETE /api/v1/users/:id
 * Delete user account permanently
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user && String(req.user._id) === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account.',
      });
    }

    if (!isMongoConnected()) {
      const idx = (memoryStore.users || []).findIndex(u => u._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'User not found.' });
      memoryStore.users.splice(idx, 1);
      return res.json({ success: true, message: 'User account removed.' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: 'User account deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user account.' });
  }
};

