require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api', require('./routes/misc'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Initialize DB
async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database initialized');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await initDB();
  console.log(`SRCPTS Backend running on port ${PORT}`);
});
