import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../user/user.model.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';

export const authService = {
  /**
   * Register a new user
   */
  async signup(userData) {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new ApiError(400, 'Email is already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create User
    const newUser = await User.create({
      ...userData,
      password: hashedPassword,
    });

    // Generate JWT Token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const userPlain = newUser.toJSON();
    delete userPlain.password;

    return { user: userPlain, token };
  },

  /**
   * Authenticate user with credentials
   */
  async login(email, password) {
    // Find user including password field via scope
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const userPlain = user.toJSON();
    delete userPlain.password;

    return { user: userPlain, token };
  },
};
