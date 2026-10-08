import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminLogin } from './adminLogin.model.js';
import { AdminSession } from './adminSession.model.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';

// Simple user-agent parser helper for device/browser/os detection
function parseUserAgent(userAgentStr = '', ip = '127.0.0.1') {
  const ua = userAgentStr.toLowerCase();
  let deviceType = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) deviceType = 'Mobile';
  else if (ua.includes('ipad') || ua.includes('tablet')) deviceType = 'Tablet';

  let browser = 'Chrome';
  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';

  let os = 'Windows';
  if (ua.includes('mac os') || ua.includes('macintosh')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return { deviceType, browser, os, ipAddress: ip || '127.0.0.1', location: ip === '127.0.0.1' || ip === '::1' ? 'Local System' : 'India' };
}

export const adminLoginService = {
  /**
   * Authenticate admin user with username/email & password
   */
  async login(username, password, meta = {}) {
    // Find admin record including password field via withPassword scope
    const admin = await AdminLogin.scope('withPassword').findOne({
      where: { username }
    });

    if (!admin) {
      throw new ApiError(401, 'Invalid username or password');
    }

    if (!admin.isActive) {
      throw new ApiError(403, 'Admin account is deactivated');
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid username or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || '24h' }
    );

    // Save session record
    try {
      const agent = parseUserAgent(meta.userAgent, meta.ip);
      await AdminSession.create({
        adminId: admin.id,
        token,
        deviceType: agent.deviceType,
        browser: agent.browser,
        os: agent.os,
        ipAddress: agent.ipAddress,
        location: agent.location,
        lastActiveAt: new Date(),
      });
    } catch (e) {
      console.warn('Session record warning:', e?.message);
    }

    const adminPlain = admin.toJSON();
    delete adminPlain.password;

    return { admin: adminPlain, token };
  },

  /**
   * Get Current Admin Profile
   */
  async getProfile(adminId) {
    const admin = await AdminLogin.findByPk(adminId);
    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }
    return admin;
  },

  /**
   * Update Admin Profile (Username, Email, Full Name, Avatar)
   */
  async updateProfile(adminId, payload) {
    const admin = await AdminLogin.findByPk(adminId);
    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }

    if (payload.username && payload.username !== admin.username) {
      const existing = await AdminLogin.findOne({ where: { username: payload.username } });
      if (existing && existing.id !== adminId) {
        throw new ApiError(400, 'Username is already taken by another account');
      }
    }

    if (payload.email && payload.email !== admin.email) {
      const existingEmail = await AdminLogin.findOne({ where: { email: payload.email } });
      if (existingEmail && existingEmail.id !== adminId) {
        throw new ApiError(400, 'Email address is already registered');
      }
    }

    await admin.update({
      username: payload.username || admin.username,
      email: payload.email !== undefined ? payload.email : admin.email,
      fullName: payload.fullName !== undefined ? payload.fullName : admin.fullName,
      avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : admin.avatarUrl,
    });

    return admin;
  },

  /**
   * Change Password with current password verification & real hashing
   */
  async changePassword(adminId, currentPassword, newPassword) {
    const admin = await AdminLogin.scope('withPassword').findByPk(adminId);
    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      throw new ApiError(400, 'Current password entered is incorrect.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await admin.update({
      password: hashedPassword,
    });

    console.log(`🔑 Password updated in database for Admin ID: ${adminId}`);
    return { success: true };
  },

  /**
   * Get Active Devices / Sessions
   */
  async getSessions(adminId, currentToken) {
    try {
      const sessions = await AdminSession.findAll({
        where: { adminId, isRevoked: false },
        order: [['lastActiveAt', 'DESC']],
      });

      return sessions.map((s) => ({
        id: s.id,
        deviceType: s.deviceType,
        browser: s.browser,
        os: s.os,
        ipAddress: s.ipAddress,
        location: s.location,
        lastActiveAt: s.lastActiveAt,
        isCurrent: s.token === currentToken,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Revoke single session
   */
  async revokeSession(adminId, sessionId) {
    const session = await AdminSession.findOne({ where: { id: sessionId, adminId } });
    if (!session) {
      throw new ApiError(404, 'Session not found');
    }
    await session.update({ isRevoked: true });
    return { success: true };
  },

  /**
   * Revoke all other sessions except current
   */
  async revokeOtherSessions(adminId, currentToken) {
    const sessions = await AdminSession.findAll({
      where: { adminId, isRevoked: false },
    });

    for (const s of sessions) {
      if (s.token !== currentToken) {
        await s.update({ isRevoked: true });
      }
    }
    return { success: true };
  },

  /**
   * Seed default admin account if table is empty and sync database schema once
   */
  async seedDefaultAdmin() {
    try {
      await AdminLogin.sync({ alter: true });
      await AdminSession.sync({ alter: true });
    } catch (e) {
      console.warn('Admin sync notice:', e?.message);
    }

    const count = await AdminLogin.count();
    if (count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await AdminLogin.create({
        username: 'admin',
        email: 'admin@docgen.com',
        fullName: 'System Admin',
        password: hashedPassword,
      });
      console.log('✅ Default demo admin created (username: admin, password: admin123)');
    }
  }
};
