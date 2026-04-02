import { useEffect, useState } from 'react';
import { DollarSign, FolderKanban, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Card, StatCard, PageHeader, Button, Badge, Modal, ProgressBar, StatusBadge, EmptyState } from '../../components/UI';
import api from '../../api';

export function AgencyDashboard() {
  const { user } = useAuth();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/grants').then(r => setGrants(r.data)).finally(() => setLoading(false));
  }, []);

  const totalFunded = grants.reduce((a, g) => a + Number(g.amount || 0), 0);

  return (
    <Layout>
      <PageHeader title={`Welcome, ${user?.name} 👋`} subtitle="Your funding portfolio overview" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={DollarSign} label="Total Funded" value={`$${(totalFunded / 1000).toFixed(0)}K`} color="green" />
        <StatCard icon={FolderKanban} label="Projects Funded" value={grants.length} color="blue" />
        <StatCard icon={TrendingUp} label="Active Grants" value={grants.filter(g => g.project_status === 'Active').length} color="purple" />
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontWeight: 600, fontSize: 15 }}>My Grants</h3>
        </div>
        {loading ? <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><span className="spinner" /></div>
          : grants.length === 0 ? <EmptyState icon={DollarSign} title="No grants yet" description="Fund a research project to see it here" />
          : grants.map((g, i) => (
            <div key={`${g.project_id}-${g.agency_id}`} style={{ padding: '16px 20px', borderBottom: i < grants.length - 1 ? '1px solid var(--border-light)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{g.project_title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Led by {g.faculty_name} · {g.grant_date ? new Date(g.grant_date).toLocaleDateString() : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--success)' }}>${Number(g.amount).toLocaleString()}</div>
                <StatusBadge status={g.project_status} />
              </div>
            </div>
          ))
        }
      </Card>
    </Layout>
  );
}

export function FundingPage() {
  const [allProjects, setAllProjects] = useState([]);
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFund, setShowFund] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [form, setForm] = useState({ amount: '', grant_date: '' });

  useEffect(() => {
    Promise.all([
      api.get('/all-projects'),
      api.get('/grants'),
    ]).then(([pRes, gRes]) => {
      setAllProjects(pRes.data);
      setGrants(gRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleFund = async (e) => {
    e.preventDefault();
    await api.post('/grants', { project_id: selectedProject.project_id, ...form });
    const gRes = await api.get('/grants');
    setGrants(gRes.data);
    setShowFund(false);
    setForm({ amount: '', grant_date: '' });
  };

  const fundedIds = new Set(grants.map(g => g.project_id));

  return (
    <Layout>
      <PageHeader title="Fund Research Projects" subtitle="Browse and fund active research projects" />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {allProjects.map(p => {
            const alreadyFunded = fundedIds.has(p.project_id);
            const myGrant = grants.find(g => g.project_id === p.project_id);
            return (
              <Card key={p.project_id} style={{ transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ fontWeight: 600, fontSize: 15, flex: 1, marginRight: 8, lineHeight: 1.3 }}>{p.title}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Led by {p.faculty_name}</div>
                {p.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                )}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-3)' }}>Progress</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{Math.round(p.avg_progress || 0)}%</span>
                  </div>
                  <ProgressBar value={p.avg_progress || 0} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {alreadyFunded ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge color="green">✓ Funded</Badge>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>${Number(myGrant?.amount || 0).toLocaleString()}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Budget: ${Number(p.budget || 0).toLocaleString()}</div>
                  )}
                  <Button size="sm" variant={alreadyFunded ? 'secondary' : 'primary'}
                    onClick={() => { setSelectedProject(p); setShowFund(true); }}>
                    <DollarSign size={13} /> {alreadyFunded ? 'Update Grant' : 'Fund Project'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showFund} onClose={() => setShowFund(false)} title={`Fund: ${selectedProject?.title}`}>
        <form onSubmit={handleFund} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Grant Amount ($) *</label>
            <input type="number" required min={1} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 50000" style={inp} />
          </div>
          <div>
            <label style={lbl}>Grant Date</label>
            <input type="date" value={form.grant_date} onChange={e => setForm({ ...form, grant_date: e.target.value })} style={inp} />
          </div>
          <Button type="submit" style={{ marginTop: 6 }}>Confirm Grant</Button>
        </form>
      </Modal>
    </Layout>
  );
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 5 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--surface-2)', fontFamily: 'var(--font)' };
