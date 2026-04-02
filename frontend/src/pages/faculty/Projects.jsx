import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Search, Calendar, DollarSign } from 'lucide-react';
import Layout from '../../components/Layout';
import { Card, PageHeader, Button, ProgressBar, StatusBadge, EmptyState } from '../../components/UI';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export function ProjectsList() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <PageHeader title="My Projects" subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''} in your portfolio`}>
        {user.role === 'faculty' && (
          <Link to="/projects/new">
            <Button><Plus size={15} /> New Project</Button>
          </Link>
        )}
      </PageHeader>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input
          placeholder="Search projects…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', paddingLeft: 36, padding: '9px 12px 9px 36px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)', fontSize: 14, outline: 'none',
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={FolderKanban} title="No projects found" description={search ? 'Try a different search term' : 'Create your first research project'} /></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(p => (
            <Link key={p.project_id} to={`/projects/${p.project_id}`} style={{ textDecoration: 'none' }}>
              <Card style={{ cursor: 'pointer', transition: 'all 0.15s', height: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1, marginRight: 10 }}>
                    <h3 style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>{p.title}</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Led by {p.faculty_name}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description || 'No description provided.'}
                </p>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Progress</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{Math.round(p.avg_progress || 0)}%</span>
                  </div>
                  <ProgressBar value={p.avg_progress || 0} />
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-3)' }}>
                  {p.end_date && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {new Date(p.end_date).toLocaleDateString()}
                    </span>
                  )}
                  {p.budget && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <DollarSign size={12} /> {Number(p.budget).toLocaleString()}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}

export function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', start_date: '', end_date: '', status: 'Active', budget: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/projects', form);
      navigate(`/projects/${data.project_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <PageHeader title="New Research Project" subtitle="Fill in the details to create a new project" />
      <div style={{ maxWidth: 640 }}>
        <Card>
          {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--danger)' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Project Title *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Quantum Computing for Drug Discovery"
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of your research project…"
                  rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                    {['Active', 'Pending', 'On Hold', 'Completed'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Budget ($)</label>
                  <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                    placeholder="50000" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <Button type="button" variant="secondary" onClick={() => navigate('/projects')}>Cancel</Button>
                <Button type="submit" loading={loading}><Plus size={15} />Create Project</Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--surface-2)', fontFamily: 'var(--font)' };
