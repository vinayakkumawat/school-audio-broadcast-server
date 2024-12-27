import fs from 'fs/promises';
import path from 'path';
import { createLogger } from './logger.js';
import { CSV_FILES } from '../config/constants.js';

const logger = createLogger('csvBackup');

export const backupManager = {
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', timestamp);

    try {
      await fs.mkdir(backupDir, { recursive: true });

      for (const [key, filePath] of Object.entries(CSV_FILES)) {
        const fileName = path.basename(filePath);
        const backupPath = path.join(backupDir, fileName);

        try {
          await fs.copyFile(filePath, backupPath);
          logger.info(`Backup created for ${fileName}`);
        } catch (error) {
          logger.error(`Failed to backup ${fileName}:`, error);
        }
      }

      // Clean old backups (keep last 7 days)
      await this.cleanOldBackups();
    } catch (error) {
      logger.error('Backup creation failed:', error);
      throw error;
    }
  },

  async cleanOldBackups() {
    const backupDir = path.join(process.cwd(), 'backups');
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    try {
      const backups = await fs.readdir(backupDir);
      const now = new Date().getTime();

      for (const backup of backups) {
        const backupPath = path.join(backupDir, backup);
        const stats = await fs.stat(backupPath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.rm(backupPath, { recursive: true });
          logger.info(`Removed old backup: ${backup}`);
        }
      }
    } catch (error) {
      logger.error('Failed to clean old backups:', error);
    }
  }
};