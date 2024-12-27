const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

const AUDIO_LOGS_FILE = path.join(__dirname, '../data/audioLogs.csv');
const AUDIO_STORAGE_DIR = path.join(__dirname, '../data/audio-files');

// Ensure audio storage directory exists
if (!fs.existsSync(AUDIO_STORAGE_DIR)) {
  fs.mkdirSync(AUDIO_STORAGE_DIR, { recursive: true });
}

const csvWriter = createCsvWriter({
  path: AUDIO_LOGS_FILE,
  header: [
    { id: 'id', title: 'id' },
    { id: 'userId', title: 'userId' },
    { id: 'timestamp', title: 'timestamp' },
    { id: 'filename', title: 'filename' }
  ]
});

class AudioService {
  async saveAudioFile(userId, audioBuffer) {
    const filename = `${Date.now()}-${userId}.wav`;
    const filepath = path.join(AUDIO_STORAGE_DIR, filename);
    
    await fs.promises.writeFile(filepath, audioBuffer);
    
    const logEntry = {
      id: Date.now().toString(),
      userId,
      timestamp: new Date().toISOString(),
      filename
    };

    const logs = await this.getAudioLogs();
    logs.push(logEntry);
    await csvWriter.writeRecords(logs);

    return logEntry;
  }

  async getAudioLogs() {
    return new Promise((resolve, reject) => {
      const logs = [];
      fs.createReadStream(AUDIO_LOGS_FILE)
        .pipe(csv())
        .on('data', (row) => logs.push(row))
        .on('end', () => resolve(logs))
        .on('error', reject);
    });
  }

  async getAudioFile(filename) {
    const filepath = path.join(AUDIO_STORAGE_DIR, filename);
    return fs.promises.readFile(filepath);
  }
}

module.exports = new AudioService();