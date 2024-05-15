// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  login: (username, password) => ipcRenderer.invoke('login', { username, password }),
  createUser: (username, password, role) => ipcRenderer.invoke('create-user', { username, password, role }),
  createTask: (userId, task) => ipcRenderer.invoke('create-task', { userId, task }),
  getTasks: (userId) => ipcRenderer.invoke('get-tasks', userId),
  updateTask: (taskId, task) => ipcRenderer.invoke('update-task', { taskId, task }),
  deleteTask: (taskId) => ipcRenderer.invoke('delete-task', taskId)
});
