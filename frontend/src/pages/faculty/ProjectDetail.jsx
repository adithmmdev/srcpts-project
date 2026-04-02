import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Plus, CheckCircle, Flag, MessageSquare, FileText, TrendingUp, X } from 'lucide-react';
import Layout from '../../components/Layout';
import { Card, PageHeader, Button, Badge, StatusBadge, ProgressBar, Modal, EmptyState } from '../../components/UI';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [assignForm, setAssignForm] = useState({ student_id: '', role: 'Research Assistant', hours_per_week: 10 });
  const [progressForm, setProgressForm] = useState({ remarks: '', completion_percentage: 0 });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/students`),
      api.get(`/tasks/project/${id}`),
      api.get(`/milestones/${id}`),
      api.get(`/reports/${id}`),
    ]).then(([pRes, sRes, tRes, mRes, rRes]) => {
      setProject(pRes.data);
      setStudents(sRes.data);
      setTasks(tRes.data);
      setMilestones(mRes.data);
      setReports(rRes.data);
    }).finally(() => setLoading(false));

    if (user.role === 'faculty') {
      api.get('/projects/all/students').then(r => setAllStudents(r.data));
    }
  }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    await api.post(`/projects/${id}/assign`, assignForm);
    const sRes = await api.get(`/projects/${id}/students`);
    setStudents(sRes.data);
    setShowAssign(false);
  };

  const handleProgressReport = async (e) => {
    e.preventDefault();
    await api.post('/reports', { project_id: id, ...progressForm });
    const rRes = await api.get(`/reports/${id}`);
    setReports(rRes.data);
    setShowProgress(false);
  };

  const latestProgress = reports.length ? reports[0].completion_percentage : 0;

  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" /></div></Layout>;
  if (!project) return <Layout><div>Project not found</div></Layout>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckCircle },
    { id: 'milestones', label: `Milestones (${milestones.length})`, icon: Flag },
    { id: 'students', label: `Team (${students.length})`, icon: Users },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <Layout>
      <div style={{ marginBottom: 8 }}>
        <Link to="/projects" style={{ fontSize: 13, color: 'var(--text-3)' }}>← Back to Projects</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600 }}>{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Led by {project.faculty_name} · Budget: ${Number(project.budget || 0).toLocaleString()}</p>
        </div>
        {user.role === 'faculty' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => setShowAssign(true)}><Users size={14} /> Assign Student</Button>
            <Button variant="secondary" onClick={() => setShowProgress(true)}><TrendingUp size={14} /> Add Progress</Button>
            <Link to={`/chat?project=${id}`}><Button variant="ghost"><MessageSquare size={14} /> Chat</Button></Link>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <Card style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Overall Progress</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{Math.round(latestProgress)}%</span>
        </div>
        <ProgressBar value={latestProgress} />
        <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 12, color: 'var(--text-3)' }}>
          {project.start_date && <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>}
          {project.end_date && <span>End: {new Date(project.end_date).toLocaleDateString()}</span>}
          <span>{tasks.filter(t => t.status === 'Completed').length}/{tasks.length} tasks done</span>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface)', padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: 'fit-content' }}>
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '7px 14px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: activeTab === id ? 600 : 400,
            background: activeTab === id ? 'var(--primary)' : 'transparent',
            color: activeTab === id ? '#fff' : 'var(--text-2)', cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Description</h3>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: 14 }}>{project.description || 'No description provided.'}</p>
        </Card>
      )}

      {activeTab === 'tasks' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 600 }}>Tasks</h3>
            {user.role === 'faculty' && <Link to={`/tasks?project=${id}`}><Button size="sm"><Plus size={13} />Add Task</Button></Link>}
          </div>
          {tasks.length === 0 ? <EmptyState icon={CheckCircle} title="No tasks yet" description="Add tasks to track work" /> :
            tasks.map((t, i) => (
              <div key={t.task_id} style={{ padding: '14px 20px', borderBottom: i < tasks.length - 1 ? '1px solid var(--border-light)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: t.status === 'Completed' ? 'var(--text-3)' : 'var(--text)', textDecoration: t.status === 'Completed' ? 'line-through' : 'none' }}>{t.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                    {t.student_name && `Assigned to ${t.student_name}`}
                    {t.deadline && ` · Due ${new Date(t.deadline).toLocaleDateString()}`}
                  </div>
                </div>
                <Badge color={t.status === 'Completed' ? 'green' : t.status === 'In Progress' ? 'purple' : 'yellow'}>{t.status}</Badge>
              </div>
            ))
          }
        </Card>
      )}

      {activeTab === 'milestones' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 600 }}>Milestones</h3>
            {user.role === 'faculty' && <Link to={`/milestones?project=${id}`}><Button size="sm"><Plus size={13} />Add Milestone</Button></Link>}
          </div>
          {milestones.length === 0 ? <EmptyState icon={Flag} title="No milestones yet" description="Break your project into milestones" /> :
            milestones.map((m, i) => (
              <div key={m.milestone_no} style={{ padding: '14px 20px', borderBottom: i < milestones.length - 1 ? '1px solid var(--border-light)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Milestone {m.milestone_no}: {m.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Due {m.due_date ? new Date(m.due_date).toLocaleDateString() : 'No date set'}</div>
                </div>
                <Badge color={m.status === 'Completed' ? 'green' : m.status === 'In Progress' ? 'purple' : 'yellow'}>{m.status}</Badge>
              </div>
            ))
          }
        </Card>
      )}

      {activeTab === 'students' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 600 }}>Team Members</h3>
            {user.role === 'faculty' && <Button size="sm" onClick={() => setShowAssign(true)}><Plus size={13} />Assign</Button>}
          </div>
          {students.length === 0 ? <EmptyState icon={Users} title="No team members" description="Assign students to this project" /> :
            students.map((s, i) => (
              <div key={s.student_id} style={{ padding: '14px 20px', borderBottom: i < students.length - 1 ? '1px solid var(--border-light)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>{s.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.email} · {s.program}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge color="blue">{s.role}</Badge>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{s.hours_per_week}h/week</div>
                </div>
              </div>
            ))
          }
        </Card>
      )}

      {activeTab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.length === 0 ? <Card><EmptyState icon={TrendingUp} title="No progress reports" description="Submit a progress report to track completion" /></Card> :
            reports.map(r => (
              <Card key={r.report_no}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Report #{r.report_no}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{new Date(r.submission_date).toLocaleDateString()}</div>
                  </div>
                  <Badge color="blue">{r.completion_percentage}% Complete</Badge>
                </div>
                <ProgressBar value={r.completion_percentage} />
                {r.remarks && <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 10, lineHeight: 1.6 }}>{r.remarks}</p>}
              </Card>
            ))
          }
        </div>
      )}

      {/* Assign Student Modal */}
      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Student">
        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Student</label>
            <select required value={assignForm.student_id} onChange={e => setAssignForm({ ...assignForm, student_id: e.target.value })} style={inp}>
              <option value="">Select a student…</option>
              {allStudents.map(s => <option key={s.student_id} value={s.student_id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Role</label>
            <input value={assignForm.role} onChange={e => setAssignForm({ ...assignForm, role: e.target.value })} style={inp} placeholder="Research Assistant" />
          </div>
          <div>
            <label style={lbl}>Hours per Week</label>
            <input type="number" value={assignForm.hours_per_week} onChange={e => setAssignForm({ ...assignForm, hours_per_week: e.target.value })} style={inp} min={1} max={40} />
          </div>
          <Button type="submit" style={{ marginTop: 8 }}>Assign Student</Button>
        </form>
      </Modal>

      {/* Progress Report Modal */}
      <Modal open={showProgress} onClose={() => setShowProgress(false)} title="Submit Progress Report">
        <form onSubmit={handleProgressReport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Completion % (0-100)</label>
            <input type="number" min={0} max={100} required value={progressForm.completion_percentage}
              onChange={e => setProgressForm({ ...progressForm, completion_percentage: e.target.value })} style={inp} />
          </div>
          <div>
            <label style={lbl}>Remarks</label>
            <textarea value={progressForm.remarks} onChange={e => setProgressForm({ ...progressForm, remarks: e.target.value })}
              rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'var(--font)' }} placeholder="Progress summary…" />
          </div>
          <Button type="submit" style={{ marginTop: 8 }}>Submit Report</Button>
        </form>
      </Modal>
    </Layout>
  );
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 5 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--surface-2)', fontFamily: 'var(--font)' };
