const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// Load users
const getUsers = () => {
  if (!fs.existsSync('users.json')) return [];
  return JSON.parse(fs.readFileSync('users.json'));
};

// Save users
const saveUsers = (users) => {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
};

// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, username, password } = req.body;
  const users = getUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  users.push({ name, email, username, password: hashed });
  saveUsers(users);
  res.json({ success: true });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});