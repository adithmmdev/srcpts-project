const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');

// GET tasks for a project
router.get('/project/:project_id', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'student') {
      result = await pool.query(
        `SELECT t.*, s.name as student_name FROM Task t LEFT JOIN Student s ON t.student_id = s.student_id
         WHERE t.project_id = $1 AND t.student_id = $2 ORDER BY t.deadline`,
        [req.params.project_id, req.user.id]
      );
    } else {
      result = await pool.query(
        `SELECT t.*, s.name as student_name FROM Task t LEFT JOIN Student s ON t.student_id = s.student_id
         WHERE t.project_id = $1 ORDER BY t.deadline`,
        [req.params.project_id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create task
router.post('/', authenticate, requireRole('faculty'), async (req, res) => {
  const { project_id, student_id, description, deadline } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Task (project_id, student_id, description, deadline, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [project_id, student_id, description, deadline, 'Pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update task status
router.put('/:id', authenticate, async (req, res) => {
  const { status } = req.body;
  try {
    let result;
    if (req.user.role === 'student') {
      result = await pool.query(
        'UPDATE Task SET status=$1 WHERE task_id=$2 AND student_id=$3 RETURNING *',
        [status, req.params.id, req.user.id]
      );
    } else {
      result = await pool.query(
        'UPDATE Task SET status=$1 WHERE task_id=$2 RETURNING *',
        [status, req.params.id]
      );
    }
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE task
router.delete('/:id', authenticate, requireRole('faculty'), async (req, res) => {
  try {
    await pool.query('DELETE FROM Task WHERE task_id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
