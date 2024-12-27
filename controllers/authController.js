import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getAdmin, updateAdmin, createAdmin } from '../data/store.js';
import { JWT_SECRET, BCRYPT_ROUNDS } from '../config/constants.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('authController');

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await getAdmin(username);

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      logger.warn(`Failed login attempt for username: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Successful login for admin: ${username}`);
    res.json({ token, admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const admin = await getAdmin(req.admin.username);

    if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const updatedAdmin = {
      ...admin,
      username: username || admin.username,
      password: newPassword ? await bcrypt.hash(newPassword, BCRYPT_ROUNDS) : admin.password,
    };

    await updateAdmin(updatedAdmin);
    logger.info(`Profile updated for admin: ${admin.username}`);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const initializeAdmin = async () => {
  try {
    const admin = await getAdmin('admin');
    if (!admin) {
      const defaultAdmin = {
        id: uuidv4(),
        username: 'admin',
        password: await bcrypt.hash('admin123', BCRYPT_ROUNDS),
      };
      await createAdmin(defaultAdmin);
      logger.info('Default admin account created');
    }
  } catch (error) {
    logger.error('Failed to initialize admin:', error);
    throw error;
  }
};