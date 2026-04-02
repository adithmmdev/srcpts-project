import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flag, Plus, Calendar } from 'lucide-react';
import Layout from '../../components/Layout';
import { Card, PageHeader, Button, Badge, Modal, EmptyState } from '../../components/UI';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Milestones() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('project');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(preselected || '');
  const [milestones, setMilestones] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ description: '', due_date: '' });

  useEffect(() => {
    api.get('/projects').then(r => {
      setProjects(r.data);
      if (!preselected && r.data.length > 0) setSelectedProject(String(r.data[0].project_id));
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api.get(`/milestones/${selectedProject}`).then(r => setMilestones(r.data)).finally(() => setLoading(false));
  }, [selectedProject]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/milestones', { project_id: selectedProject, ...form });
    const r = await api.get(`/milestones/${selectedProject}`);
    setMilestones(r.data);
    setShowAdd(false);
    setForm({ description: '', due_date: '' });
  };

  const handleStatusUpdate = async (project_id, milestone_no, status) => {
    await api.put(`/milestones/${project_id}/${milestone_no}`, { status });
    setMilestones(prev => prev.map(m => m.milestone_no === milestone_no ? { ...m, status } : m));
  };

  const statusColor = { 'Pending': 'yellow', 'In Progress': 'purple', 'Completed': 'green' };

  return (
    <Layout>
      <PageHeader title="Milestones" subtitle="Track key project checkpoints">
        {user.role === 'faculty' && selectedProject && (
          <Button onClick={() => setShowAdd(true)}><Plus size={15} />Add Milestone</Button>
        )}
      </PageHeader>

      <div style={{ marginBottom: 24 }}>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
          style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, background: 'var(--surface)', outline: 'none', minWidth: 260 }}>
          <option value="">Select a project…</option>
          {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.title}</option>)}
        </select>
      </div>

      {!selectedProject ? (
        <Card><EmptyState icon={Flag} title="Select a project" description="Choose a project to view milestones" /></Card>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" /></div>
      ) : milestones.length === 0 ? (
        <Card><EmptyState icon={Flag} title="No milestones yet" description="Add milestones to break the project into phases" /></Card>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {milestones.map((m, i) => (
              <div key={m.milestone_no} style={{ display: 'flex', gap: 20, paddingBottom: 20, paddingLeft: 48, position: 'relative' }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute', left: 12, top: 14, width: 18, height: 18, borderRadius: '50%',
                  background: m.status === 'Completed' ? 'var(--success)' : m.status === 'In Progress' ? '#7C3AED' : 'var(--border)',
                  border: '3px solid var(--surface-2)', zIndex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} />
                <Card style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Milestone {m.milestone_no}</span>
                        <Badge color={statusColor[m.status] || 'default'}>{m.status}</Badge>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{m.description}</div>
                      {m.due_date && (
                        <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> Due {new Date(m.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {user.role === 'faculty' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['Pending', 'In Progress', 'Completed'].filter(s => s !== m.status).map(s => (
                          <button key={s} onClick={() => handleStatusUpdate(m.project_id, m.milestone_no, s)}
                            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text-2)' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Milestone">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Description *</label>
            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2} style={{ ...inp, resize: 'vertical', fontFamily: 'var(--font)' }} placeholder="Milestone description…" />
          </div>
          <div>
            <label style={lbl}>Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} style={inp} />
          </div>
          <Button type="submit" style={{ marginTop: 6 }}>Add Milestone</Button>
        </form>
      </Modal>
    </Layout>
  );
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 5 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--surface-2)', fontFamily: 'var(--font)' };
