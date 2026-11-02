import jwt from 'jsonwebtoken';

export const generateTokens = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'bl_jewels_super_secret_jwt_key_2026_dev';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'bl_jewels_refresh_secret_key_2026_dev';

  const accessToken = jwt.sign(
    { id: userId, role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

