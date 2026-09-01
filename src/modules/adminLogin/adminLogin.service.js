import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminLogin } from './adminLogin.model.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';

export const adminLoginService = {
  /**
   * Authenticate admin user with username & password
   */
  async login(username, password) {
    // Find admin record including password field via withPassword scope
    const admin = await AdminLogin.scope('withPassword').findOne({ where: { username } });
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

    const adminPlain = admin.toJSON();
    delete adminPlain.password;

    return { admin: adminPlain, token };
  },

  /**
   * Seed default admin account if table is empty
   */
  async seedDefaultAdmin() {
    await AdminLogin.sync(); // ensure table exists in database
    const count = await AdminLogin.count();
    if (count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await AdminLogin.create({
        username: 'admin',
        password: hashedPassword,
      });
      console.log('✅ Default demo admin created (username: admin, password: admin123)');
    }
  }
};
