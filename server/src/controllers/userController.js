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
      const users = memoryStore.users || [];
      const totalUsers = users.length;
      const totalCustomers = users.filter(u => u.role === 'customer').length;
      const totalAdmins = users.filter(u => u.role === 'admin').length;
      const activeUsers = users.filter(u => u.isActive !== false).length;

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalCustomers,
          totalAdmins,
          activeUsers,
          newThisMonth: totalCustomers,
        },
      });
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Run all 5 metric queries concurrently via Promise.all
    const [totalUsers, totalCustomers, totalAdmins, activeUsers, newThisMonth] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalAdmins,
        activeUsers,
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
 */
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const { search, role, status, sort } = req.query;

    if (!isMongoConnected()) {
      let users = [...(memoryStore.users || [])];

      if (search) {
        const s = search.toLowerCase();
        users = users.filter(
          u =>
            (u.name && u.name.toLowerCase().includes(s)) ||
            (u.email && u.email.toLowerCase().includes(s)) ||
            (u.phone && u.phone.toLowerCase().includes(s))
        );
      }
      if (role && role !== 'all') {
        users = users.filter(u => u.role === role);
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

    // Build Mongo Filter
    const query = {};

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
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
 * Promote or demote user role ('customer' <-> 'admin')
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    if (req.user && String(req.user._id) === id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove administrative privileges from yourself.',
      });
    }

    if (!isMongoConnected()) {
      const user = (memoryStore.users || []).find(u => u._id === id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      user.role = role;
      return res.json({ success: true, message: `Role updated to ${role}.`, user });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: `User role has been updated to ${role} successfully.`,
      user,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role.' });
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

