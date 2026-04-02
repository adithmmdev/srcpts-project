const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Local upload storage for project publications.
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const publicationStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    const safeExt = ext === '.pdf' ? ext : '.pdf';
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `publication_${unique}${safeExt}`);
  }
});

const publicationUpload = multer({
  storage: publicationStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (_req, file, cb) {
    const isPdf =
      file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
    cb(null, isPdf);
  }
});

// MILESTONES
router.get('/milestones/:project_id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM Milestone WHERE project_id=$1 ORDER BY milestone_no',
      [req.params.project_id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/milestones', authenticate, requireRole('faculty'), async (req, res) => {
  const { project_id, description, due_date } = req.body;
  try {
    const countRes = await pool.query('SELECT COALESCE(MAX(milestone_no),0)+1 as next FROM Milestone WHERE project_id=$1', [project_id]);
    const milestone_no = countRes.rows[0].next;
    const result = await pool.query(
      'INSERT INTO Milestone (project_id, milestone_no, description, due_date, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [project_id, milestone_no, description, due_date, 'Pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.put('/milestones/:project_id/:milestone_no', authenticate, async (req, res) => {
  const { status, description, due_date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Milestone SET status=$1, description=COALESCE($2,description), due_date=COALESCE($3,due_date) WHERE project_id=$4 AND milestone_no=$5 RETURNING *',
      [status, description, due_date, req.params.project_id, req.params.milestone_no]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PROGRESS REPORTS
router.get('/reports/:project_id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM Progress_Report WHERE project_id=$1 ORDER BY report_no DESC',
      [req.params.project_id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/reports', authenticate, requireRole('faculty'), async (req, res) => {
  const { project_id, remarks, completion_percentage } = req.body;
  try {
    const countRes = await pool.query('SELECT COALESCE(MAX(report_no),0)+1 as next FROM Progress_Report WHERE project_id=$1', [project_id]);
    const report_no = countRes.rows[0].next;
    const result = await pool.query(
      'INSERT INTO Progress_Report (project_id, report_no, remarks, completion_percentage) VALUES ($1,$2,$3,$4) RETURNING *',
      [project_id, report_no, remarks, completion_percentage]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PUBLICATIONS
router.get('/publications/file', authenticate, async (req, res) => {
  const { file_url } = req.query;
  if (!file_url) return res.status(400).json({ error: 'file_url required' });

  try {
    const pubRes = await pool.query(
      'SELECT publication_id, project_id, file_url FROM Publication WHERE file_url=$1',
      [file_url]
    );
    if (!pubRes.rows.length) return res.status(404).json({ error: 'Not found' });

    const pub = pubRes.rows[0];
    const projectId = pub.project_id;

    // Enforce access control for downloads.
    if (req.user.role === 'faculty') {
      const access = await pool.query(
        'SELECT 1 FROM Research_Project WHERE project_id=$1 AND lead_faculty_id=$2',
        [projectId, req.user.id]
      );
      if (!access.rows.length) return res.status(403).json({ error: 'Forbidden' });
    } else if (req.user.role === 'student') {
      const access = await pool.query(
        'SELECT 1 FROM Project_Assignment WHERE project_id=$1 AND student_id=$2',
        [projectId, req.user.id]
      );
      if (!access.rows.length) return res.status(403).json({ error: 'Forbidden' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Prevent path traversal by using basename only.
    const filename = path.basename(pub.file_url);
    const filePath = path.join(uploadDir, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    return res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post(
  '/publications/upload',
  authenticate,
  requireRole('faculty'),
  publicationUpload.single('file'),
  async (req, res) => {
    try {
      const { title, journal_name, publication_date, doi, project_id } = req.body;

      if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

      // Faculty can only upload for projects they lead.
      const access = await pool.query(
        'SELECT 1 FROM Research_Project WHERE project_id=$1 AND lead_faculty_id=$2',
        [project_id, req.user.id]
      );
      if (!access.rows.length) return res.status(403).json({ error: 'Forbidden' });

      const file_url = `uploads/${req.file.filename}`;
      const result = await pool.query(
        'INSERT INTO Publication (title, journal_name, publication_date, doi, file_url, project_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [title, journal_name || null, publication_date || null, doi || null, file_url, project_id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.get('/publications/:project_id', authenticate, async (req, res) => {
  const projectId = req.params.project_id;

  try {
    // Enforce access control for listing publications.
    // Spec: students can only view assigned projects; faculty can view.
    if (req.user.role === 'student') {
      const access = await pool.query(
        'SELECT 1 FROM Project_Assignment WHERE project_id=$1 AND student_id=$2',
        [projectId, req.user.id]
      );
      if (!access.rows.length) return res.status(403).json({ error: 'Forbidden' });
    } else {
      // Allow faculty viewing; deny other roles (e.g., agency).
      if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await pool.query(
      'SELECT * FROM Publication WHERE project_id=$1 ORDER BY publication_date DESC NULLS LAST',
      [projectId]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/publications', authenticate, requireRole('faculty'), async (req, res) => {
  const { title, journal_name, publication_date, doi, file_url, project_id } = req.body;
  try {
    // Faculty can only insert publications for projects they lead.
    const access = await pool.query(
      'SELECT 1 FROM Research_Project WHERE project_id=$1 AND lead_faculty_id=$2',
      [project_id, req.user.id]
    );
    if (!access.rows.length) return res.status(403).json({ error: 'Forbidden' });

    const result = await pool.query(
      'INSERT INTO Publication (title, journal_name, publication_date, doi, file_url, project_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, journal_name, publication_date, doi, file_url, project_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// CHAT
router.get('/chat/:project_id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cm.*, 
        CASE cm.sender_role
          WHEN 'faculty' THEN (SELECT name FROM Faculty WHERE faculty_id = cm.sender_id)
          WHEN 'student' THEN (SELECT name FROM Student WHERE student_id = cm.sender_id)
          WHEN 'agency' THEN (SELECT agency_name FROM Funding_Agency WHERE agency_id = cm.sender_id)
        END as sender_name
       FROM Chat_Message cm WHERE cm.project_id=$1 ORDER BY cm.timestamp ASC`,
      [req.params.project_id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/chat/send', authenticate, async (req, res) => {
  const { project_id, message } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Chat_Message (project_id, sender_id, sender_role, message) VALUES ($1,$2,$3,$4) RETURNING *',
      [project_id, req.user.id, req.user.role, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GRANTS (Agency)
router.get('/grants', authenticate, requireRole('agency'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, rp.title as project_title, rp.status as project_status, f.name as faculty_name
       FROM Project_Grant g JOIN Research_Project rp ON g.project_id = rp.project_id
       JOIN Faculty f ON rp.lead_faculty_id = f.faculty_id
       WHERE g.agency_id=$1 ORDER BY g.grant_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/grants', authenticate, requireRole('agency'), async (req, res) => {
  const { project_id, amount, grant_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Project_Grant (project_id, agency_id, amount, grant_date) VALUES ($1,$2,$3,$4) ON CONFLICT (project_id, agency_id) DO UPDATE SET amount=$3, grant_date=$4 RETURNING *',
      [project_id, req.user.id, amount, grant_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET all projects (for agency funding page)
router.get('/all-projects', authenticate, requireRole('agency'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rp.*, f.name as faculty_name,
       (SELECT COALESCE(AVG(completion_percentage),0) FROM Progress_Report WHERE project_id = rp.project_id) as avg_progress
       FROM Research_Project rp JOIN Faculty f ON rp.lead_faculty_id = f.faculty_id ORDER BY rp.project_id DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
