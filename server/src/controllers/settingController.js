import { getDbStatus } from '../config/db.js';
import Setting from '../models/Setting.js';

export const getSettings = async (req, res) => {
  try {
    if (getDbStatus()) {
      const settings = await Setting.findOne({ key: 'global_site_settings' });
      return res.json({ success: true, settings: settings ?? {} });
    }
    return res.status(503).json({ success: false, message: 'Database unavailable' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    if (getDbStatus()) {
      const settings = await Setting.findOneAndUpdate(
        { key: 'global_site_settings' },
        { $set: updates },
        { new: true, upsert: true }
      );
      return res.json({ success: true, settings });
    }
    return res.status(503).json({ success: false, message: 'Database unavailable' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

