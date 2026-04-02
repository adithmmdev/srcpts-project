import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckSquare, Plus, Check, Clock, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { Card, PageHeader, Button, Badge, Modal, EmptyState } from '../../components/UI';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Tasks() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get('project');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(preselectedProject || '');
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ description: '', deadline: '', student_id: '', status: 'Pending' });

  useEffect(() => {
    api.get('/projects').then(r => {
      setProjects(r.data);
      if (!preselectedProject && r.data.length > 0) setSelectedProject(String(r.data[0].project_id));
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api.get(`/tasks/project/${selectedProject}`).then(r => setTasks(r.data)).finally(() => setLoading(false));
    if (user.role === 'faculty') {
      api.get(`/projects/${selectedProject}/students`).then(r => setStudents(r.data));
    }
  }, [selectedProject]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/tasks', { ...form, project_id: selectedProject });
    const r = await api.get(`/tasks/project/${selectedProject}`);
    setTasks(r.data);
    setShowAdd(false);
    setForm({ description: '', deadline: '', student_id: '', status: 'Pending' });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await api.put(`/tasks/${taskId}`, { status: newStatus });
    setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status: newStatus } : t));
  };

  const grouped = {
    Pending: tasks.filter(t => t.status === 'Pending'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    Completed: tasks.filter(t => t.status === 'Completed'),
  };

  return (
    <Layout>
      <PageHeader title="Tasks" subtitle="Manage and track project tasks">
        {user.role === 'faculty' && selectedProject && (
          <Button onClick={() => setShowAdd(true)}><Plus size={15} />Add Task</Button>
        )}
      </PageHeader>

      {/* Project selector */}
      <div style={{ marginBottom: 24 }}>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
          style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, background: 'var(--surface)', outline: 'none', minWidth: 260 }}>
          <option value="">Select a project…</option>
          {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.title}</option>)}
        </select>
      </div>

      {!selectedProject ? (
        <Card><EmptyState icon={CheckSquare} title="Select a project" description="Choose a project to view its tasks" /></Card>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {Object.entries(grouped).map(([status, items]) => (
            <div key={status}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {status === 'Completed' ? <Check size={14} color="var(--success)" /> : status === 'In Progress' ? <Clock size={14} color="#7C3AED" /> : <AlertCircle size={14} color="#D97706" />}
                <span style={{ fontWeight: 600, fontSize: 14 }}>{status}</span>
                <Badge color={status === 'Completed' ? 'green' : status === 'In Progress' ? 'purple' : 'yellow'}>{items.length}</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.length === 0 ? (
                  <div style={{ background: 'var(--surface-3)', borderRadius: 'var(--radius-sm)', padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)', border: '2px dashed var(--border)' }}>No tasks</div>
                ) : items.map(t => (
                  <Card key={t.task_id} style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>{t.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>
                      {t.student_name && <span>👤 {t.student_name}</span>}
                      {t.deadline && <span style={{ marginLeft: 8 }}>📅 {new Date(t.deadline).toLocaleDateString()}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {['Pending', 'In Progress', 'Completed'].filter(s => s !== t.status).map(s => (
                        <button key={s} onClick={() => handleStatusChange(t.task_id, s)}
                          style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text-2)' }}>
                          → {s}
                        </button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Task">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Description *</label>
            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'var(--font)' }} placeholder="Describe the task…" />
          </div>
          <div>
            <label style={lbl}>Assign To</label>
            <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} style={inp}>
              <option value="">Unassigned</option>
              {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={inp} />
          </div>
          <Button type="submit" style={{ marginTop: 6 }}>Create Task</Button>
        </form>
      </Modal>
    </Layout>
  );
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 5 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--surface-2)', fontFamily: 'var(--font)' };
