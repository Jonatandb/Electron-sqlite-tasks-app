// src/renderer.js
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  function showLogin() {
    app.innerHTML = `
      <h1>Login</h1>
      <input type="text" id="username" placeholder="Username">
      <input type="password" id="password" placeholder="Password">
      <button id="loginBtn">Login</button>
      <div id="error"></div>
    `;

    document.getElementById('loginBtn').addEventListener('click', async () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const user = await window.api.login(username, password);

      if (user) {
        if (user.role === 'admin') {
          showAdminPanel(user);
        } else {
          showTasks(user);
        }
      } else {
        document.getElementById('error').textContent = 'Invalid credentials';
      }
    });
  }

  function showAdminPanel(user) {
    app.innerHTML = `
      <h1>Admin Panel</h1>
      <h2>Logged in as ${user.username} (Admin)</h2>
      <input type="text" id="newUsername" placeholder="New User Username">
      <input type="password" id="newPassword" placeholder="New User Password">
      <select id="newUserRole">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button id="createUserBtn">Create User</button>
      <div id="tasks"></div>
      <button id="logoutBtn">Logout</button>
    `;

    document.getElementById('createUserBtn').addEventListener('click', async () => {
      const newUsername = document.getElementById('newUsername').value;
      const newPassword = document.getElementById('newPassword').value;
      const newUserRole = document.getElementById('newUserRole').value;
      await window.api.createUser(newUsername, newPassword, newUserRole);
      alert('User created');
    });

    document.getElementById('logoutBtn').addEventListener('click', showLogin);
  }

  function showTasks(user) {
    app.innerHTML = `
      <h1>Tasks</h1>
      <h2>Logged in as ${user.username}</h2>
      <input type="text" id="newTask" placeholder="New Task">
      <button id="createTaskBtn">Create Task</button>
      <ul id="taskList"></ul>
      <button id="logoutBtn">Logout</button>
    `;

    loadTasks(user.id);

    document.getElementById('createTaskBtn').addEventListener('click', async () => {
      const newTask = document.getElementById('newTask').value;
      await window.api.createTask(user.id, newTask);
      loadTasks(user.id);
    });

    document.getElementById('logoutBtn').addEventListener('click', showLogin);
  }

  async function loadTasks(userId) {
    const tasks = await window.api.getTasks(userId);
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
      const taskItem = document.createElement('li');
      taskItem.textContent = task.task;
      taskItem.setAttribute('data-id', task.id);

      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => editTask(task.id, task.task));

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', async () => {
        await window.api.deleteTask(task.id);
        loadTasks(userId);
      });

      taskItem.appendChild(editButton);
      taskItem.appendChild(deleteButton);
      taskList.appendChild(taskItem);
    });
  }

  function editTask(taskId, currentTask) {
    const newTask = prompt('Edit Task', currentTask);
    if (newTask) {
      window.api.updateTask(taskId, newTask).then(() => {
        const user = { id: document.querySelector('h2').textContent.split(' ')[3] };
        loadTasks(user.id);
      });
    }
  }

  showLogin();
});