import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { addUser, removeUser, getAllUsers, updateUser, getUser } from '../data/store.js';
import { BCRYPT_ROUNDS } from '../config/constants.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('userController');

export const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if username already exists
    const users = await getAllUsers();
    if (users.some(user => user.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await addUser(user);
    logger.info(`User created: ${username}`);
    
    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    logger.error('Failed to create user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    logger.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;
    
    const existingUser = await getUser(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = {
      ...existingUser,
      username: username || existingUser.username,
      password: password ? await bcrypt.hash(password, BCRYPT_ROUNDS) : existingUser.password,
    };

    await updateUser(updatedUser);
    logger.info(`User updated: ${username}`);

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    logger.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUser(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await removeUser(id);
    logger.info(`User deleted: ${user.username}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await getUser(username);
    if (!user) {
      logger.warn(`Login attempt failed: User not found - ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn(`Login attempt failed: Invalid password - ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    logger.info(`User logged in successfully: ${username}`);
    res.json({ user: userWithoutPassword });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};