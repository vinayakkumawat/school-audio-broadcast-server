import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { CSV_FILES } from '../config/constants.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('store');

let adminStore = [];
let userStore = [];
let audioStore = [];

export const loadCSV = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return parse(content, { columns: true, skip_empty_lines: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir('data', { recursive: true });
      const headers = getHeadersForFile(filePath);
      await fs.writeFile(filePath, headers);
      return [];
    }
    throw error;
  }
};

const getHeadersForFile = (filePath) => {
  switch (filePath) {
    case CSV_FILES.ADMIN:
      return 'id,username,password\n';
    case CSV_FILES.USERS:
      return 'id,username,password,createdAt\n';
    case CSV_FILES.AUDIO:
      return 'id,userId,url,createdAt,queue,played\n';
    default:
      return '';
  }
};

export const saveCSV = async (data, filePath) => {
  try {
    const csv = stringify(data, { header: true });
    await fs.writeFile(filePath, csv);
  } catch (error) {
    logger.error(`Failed to save CSV file ${filePath}:`, error);
    throw error;
  }
};

export const initializeStore = async () => {
  try {
    adminStore = await loadCSV(CSV_FILES.ADMIN);
    userStore = await loadCSV(CSV_FILES.USERS);
    audioStore = await loadCSV(CSV_FILES.AUDIO);
  } catch (error) {
    logger.error('Failed to initialize store:', error);
    throw error;
  }
};

// User operations
export const addUser = async (user) => {
  userStore.push(user);
  await saveCSV(userStore, CSV_FILES.USERS);
  return user;
};

export const getUser = async (username) => {
  return userStore.find(user => user.username === username);
};

export const getUserById = async (id) => {
  return userStore.find(user => user.id === id);
};

export const getAllUsers = async () => {
  return userStore;
};

export const updateUser = async (updatedUser) => {
  const index = userStore.findIndex(user => user.id === updatedUser.id);
  if (index !== -1) {
    userStore[index] = updatedUser;
    await saveCSV(userStore, CSV_FILES.USERS);
    return updatedUser;
  }
  return null;
};

export const removeUser = async (userId) => {
  const index = userStore.findIndex(user => user.id === userId);
  if (index !== -1) {
    userStore.splice(index, 1);
    await saveCSV(userStore, CSV_FILES.USERS);
    return true;
  }
  return false;
};

// Admin operations
export const getAdmin = async (username) => {
  return adminStore.find(admin => admin.username === username);
};

export const updateAdmin = async (updatedAdmin) => {
  const index = adminStore.findIndex(admin => admin.id === updatedAdmin.id);
  if (index !== -1) {
    adminStore[index] = updatedAdmin;
    await saveCSV(adminStore, CSV_FILES.ADMIN);
    return updatedAdmin;
  }
  return null;
};

export const createAdmin = async (admin) => {
  adminStore.push(admin);
  await saveCSV(adminStore, CSV_FILES.ADMIN);
  return admin;
};

// Audio operations
export const addAudio = async (audio) => {
  audioStore.push(audio);
  await saveCSV(audioStore, CSV_FILES.AUDIO);
  return audio;
};

export const getAudio = async (audioId) => {
  return audioStore.find(audio => audio.id === audioId);
};

export const removeAudio = async (audioId) => {
  const index = audioStore.findIndex(audio => audio.id === audioId);
  if (index !== -1) {
    audioStore.splice(index, 1);
    await saveCSV(audioStore, CSV_FILES.AUDIO);
    return true;
  }
  return false;
};