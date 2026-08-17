const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Login - detects role dynamically
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    let result = await pool.query('SELECT * FROM Faculty WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.faculty_id, role: 'faculty', name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, role: 'faculty', name: user.name, id: user.faculty_id });
    }

    result = await pool.query('SELECT * FROM Student WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.student_id, role: 'student', name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, role: 'student', name: user.name, id: user.student_id });
    }

    result = await pool.query('SELECT * FROM Funding_Agency WHERE contact_email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.agency_id, role: 'agency', name: user.agency_name, email: user.contact_email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, role: 'agency', name: user.agency_name, id: user.agency_id });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register Student
router.post('/register/student', async (req, res) => {
  const { name, email, password, program, year, dept_id } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO Student (name, email, password, program, year, dept_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING student_id, name, email',
      [name, email, hashed, program, year, dept_id || 1]
    );
    res.status(201).json({ message: 'Student registered', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register Faculty
router.post('/register/faculty', async (req, res) => {
  const { name, email, password, specialization, salary, dept_id } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO Faculty (name, email, password, specialization, salary, dept_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING faculty_id, name, email',
      [name, email, hashed, specialization, salary, dept_id || 1]
    );
    res.status(201).json({ message: 'Faculty registered', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register Agency
router.post('/register/agency', async (req, res) => {
  const { agency_name, type, contact_email, password } = req.body;
  if (!agency_name || !contact_email || !password) return res.status(400).json({ error: 'Agency name, email and password are required' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO Funding_Agency (agency_name, type, contact_email, password) VALUES ($1,$2,$3,$4) RETURNING agency_id, agency_name, contact_email',
      [agency_name, type, contact_email, hashed]
    );
    res.status(201).json({ message: 'Agency registered', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
