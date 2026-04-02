import { useEffect, useState } from 'react';
import { FileText, Plus, ExternalLink, Download } from 'lucide-react';
import Layout from '../../components/Layout';
import { Card, PageHeader, Button, Badge, Modal, EmptyState } from '../../components/UI';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Publications() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [publications, setPublications] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', journal_name: '', publication_date: '', doi: '', file_url: '' });

  useEffect(() => {
    api.get('/projects').then(r => {
      setProjects(r.data);
      if (r.data.length > 0) setSelectedProject(String(r.data[0].project_id));
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api.get(`/publications/${selectedProject}`).then(r => setPublications(r.data)).finally(() => setLoading(false));
  }, [selectedProject]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/publications', { ...form, project_id: selectedProject });
    const r = await api.get(`/publications/${selectedProject}`);
    setPublications(r.data);
    setShowAdd(false);
    setForm({ title: '', journal_name: '', publication_date: '', doi: '', file_url: '' });
  };

  return (
    <Layout>
      <PageHeader title="Publications" subtitle="Manage research papers and journal articles">
        {user.role === 'faculty' && selectedProject && (
          <Button onClick={() => setShowAdd(true)}><Plus size={15} />Add Publication</Button>
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
        <Card><EmptyState icon={FileText} title="Select a project" description="Choose a project to view publications" /></Card>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" /></div>
      ) : publications.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No publications yet" description="Add research papers or journal articles" /></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {publications.map(pub => (
            <Card key={pub.publication_id} style={{ transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ flex: 1, marginRight: 10 }}>
                  <h3 style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', lineHeight: 1.4, marginBottom: 4 }}>{pub.title}</h3>
                  {pub.journal_name && (
                    <div style={{ fontSize: 12, color: 'var(--primary)', fontStyle: 'italic' }}>{pub.journal_name}</div>
                  )}
                </div>
                <FileText size={18} color="var(--text-3)" style={{ flexShrink: 0 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                {pub.publication_date && (
                  <Badge>{new Date(pub.publication_date).getFullYear()}</Badge>
                )}
                {pub.doi && (
                  <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--primary)', padding: '2px 8px', background: 'var(--primary-light)', borderRadius: 100, fontWeight: 600 }}>
                    <ExternalLink size={10} /> DOI
                  </a>
                )}
                {pub.file_url && (
                  <a href={pub.file_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--success)', padding: '2px 8px', background: '#F0FDF4', borderRadius: 100, fontWeight: 600 }}>
                    <Download size={10} /> PDF
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Publication">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { name: 'title', label: 'Title *', placeholder: 'Publication title', required: true },
            { name: 'journal_name', label: 'Journal Name', placeholder: 'Nature, Science, IEEE…' },
            { name: 'doi', label: 'DOI', placeholder: '10.1234/example' },
            { name: 'file_url', label: 'PDF URL / Link', placeholder: 'https://…' },
          ].map(f => (
            <div key={f.name}>
              <label style={lbl}>{f.label}</label>
              <input required={f.required} value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                placeholder={f.placeholder} style={inp} />
            </div>
          ))}
          <div>
            <label style={lbl}>Publication Date</label>
            <input type="date" value={form.publication_date} onChange={e => setForm({ ...form, publication_date: e.target.value })} style={inp} />
          </div>
          <Button type="submit" style={{ marginTop: 6 }}>Add Publication</Button>
        </form>
      </Modal>
    </Layout>
  );
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 5 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--surface-2)', fontFamily: 'var(--font)' };
