const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const bcrypt = require('bcryptjs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.csv');

const csvWriter = createCsvWriter({
  path: USERS_FILE,
  header: [
    { id: 'id', title: 'id' },
    { id: 'email', title: 'email' },
    { id: 'username', title: 'username' },
    { id: 'password', title: 'password' },
    { id: 'createdAt', title: 'createdAt' }
  ]
});

class UserService {
  async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const users = [];
      fs.createReadStream(USERS_FILE)
        .pipe(csv())
        .on('data', (row) => users.push(row))
        .on('end', () => {
          const user = users.find(u => u.email === email);
          resolve(user);
        })
        .on('error', reject);
    });
  }

  async findByUsername(username) {
    return new Promise((resolve, reject) => {
      const users = [];
      fs.createReadStream(USERS_FILE)
        .pipe(csv())
        .on('data', (row) => users.push(row))
        .on('end', () => {
          const user = users.find(u => u.username === username);
          resolve(user);
        })
        .on('error', reject);
    });
  }

  async createUser(email, username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    const users = await this.getAllUsers();
    users.push(newUser);
    await csvWriter.writeRecords(users);
    
    return newUser;
  }

  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const users = [];
      fs.createReadStream(USERS_FILE)
        .pipe(csv())
        .on('data', (row) => users.push(row))
        .on('end', () => resolve(users))
        .on('error', reject);
    });
  }

  async validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
}

module.exports = new UserService();