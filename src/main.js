// src/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./database.sqlite');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('src/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Database setup
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, role TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, task TEXT, FOREIGN KEY(user_id) REFERENCES users(id))");
});

// IPC Handlers for interacting with the database
ipcMain.handle('login', (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
      if (err) reject(err);
      else if (row) resolve(row);
      else resolve(null);
    });
  });
});

ipcMain.handle('create-user', (event, { username, password, role }) => {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, password, role], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
});

ipcMain.handle('create-task', (event, { userId, task }) => {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO tasks (user_id, task) VALUES (?, ?)", [userId, task], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
});

ipcMain.handle('get-tasks', (event, userId) => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tasks WHERE user_id = ?", [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle('update-task', (event, { taskId, task }) => {
  return new Promise((resolve, reject) => {
    db.run("UPDATE tasks SET task = ? WHERE id = ?", [task, taskId], function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
});

ipcMain.handle('delete-task', (event, taskId) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM tasks WHERE id = ?", [taskId], function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
});
