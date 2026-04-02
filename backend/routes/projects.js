const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');

// GET projects filtered by role
router.get('/', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'faculty') {
      result = await pool.query(
        `SELECT rp.*, f.name as faculty_name,
         (SELECT COALESCE(AVG(completion_percentage),0) FROM Progress_Report WHERE project_id = rp.project_id) as avg_progress,
         (SELECT COUNT(*) FROM Task WHERE project_id = rp.project_id AND status != 'Completed') as pending_tasks
         FROM Research_Project rp JOIN Faculty f ON rp.lead_faculty_id = f.faculty_id
         WHERE rp.lead_faculty_id = $1 ORDER BY rp.project_id DESC`,
        [req.user.id]
      );
    } else if (req.user.role === 'student') {
      result = await pool.query(
        `SELECT rp.*, f.name as faculty_name, pa.role as student_role,
         (SELECT COALESCE(AVG(completion_percentage),0) FROM Progress_Report WHERE project_id = rp.project_id) as avg_progress,
         (SELECT COUNT(*) FROM Task WHERE project_id = rp.project_id AND student_id = $1 AND status != 'Completed') as pending_tasks
         FROM Research_Project rp
         JOIN Project_Assignment pa ON rp.project_id = pa.project_id
         JOIN Faculty f ON rp.lead_faculty_id = f.faculty_id
         WHERE pa.student_id = $1 ORDER BY rp.project_id DESC`,
        [req.user.id]
      );
    } else if (req.user.role === 'agency') {
      result = await pool.query(
        `SELECT rp.*, f.name as faculty_name, g.amount, g.grant_date,
         (SELECT COALESCE(AVG(completion_percentage),0) FROM Progress_Report WHERE project_id = rp.project_id) as avg_progress
         FROM Research_Project rp
         JOIN Faculty f ON rp.lead_faculty_id = f.faculty_id
         LEFT JOIN Project_Grant g ON rp.project_id = g.project_id AND g.agency_id = $1
         ORDER BY rp.project_id DESC`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all students (for assignment dropdown) — must be BEFORE /:id
router.get('/all/students', authenticate, requireRole('faculty'), async (req, res) => {
  try {
    const result = await pool.query('SELECT student_id, name, email, program FROM Student ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rp.*, f.name as faculty_name, f.email as faculty_email
       FROM Research_Project rp JOIN Faculty f ON rp.lead_faculty_id = f.faculty_id
       WHERE rp.project_id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create project (faculty only)
router.post('/', authenticate, requireRole('faculty'), async (req, res) => {
  const { title, description, start_date, end_date, status, budget } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Research_Project (title, description, start_date, end_date, status, budget, lead_faculty_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, description, start_date, end_date, status || 'Active', budget, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update project
router.put('/:id', authenticate, requireRole('faculty'), async (req, res) => {
  const { title, description, start_date, end_date, status, budget } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Research_Project SET title=$1, description=$2, start_date=$3, end_date=$4, status=$5, budget=$6
       WHERE project_id=$7 AND lead_faculty_id=$8 RETURNING *`,
      [title, description, start_date, end_date, status, budget, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found or unauthorized' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET students assigned to a project
router.get('/:id/students', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.student_id, s.name, s.email, s.program, pa.role, pa.hours_per_week
       FROM Student s JOIN Project_Assignment pa ON s.student_id = pa.student_id
       WHERE pa.project_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST assign student to project
router.post('/:id/assign', authenticate, requireRole('faculty'), async (req, res) => {
  const { student_id, role, hours_per_week } = req.body;
  try {
    // verify faculty owns project
    const proj = await pool.query('SELECT 1 FROM Research_Project WHERE project_id=$1 AND lead_faculty_id=$2', [req.params.id, req.user.id]);
    if (!proj.rows.length) return res.status(403).json({ error: 'Not your project' });

    await pool.query(
      'INSERT INTO Project_Assignment (student_id, project_id, role, hours_per_week) VALUES ($1,$2,$3,$4) ON CONFLICT (student_id, project_id) DO UPDATE SET role=$3, hours_per_week=$4',
      [student_id, req.params.id, role, hours_per_week]
    );
    res.status(201).json({ message: 'Student assigned' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
