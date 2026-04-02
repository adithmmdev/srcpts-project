import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, CheckSquare, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Card, StatCard, ProgressBar, StatusBadge, PageHeader, Badge } from '../../components/UI';
import api from '../../api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  }, []);

  const totalPendingTasks = projects.reduce((a, p) => a + Number(p.pending_tasks || 0), 0);
  const avgProgress = projects.length
    ? Math.round(projects.reduce((a, p) => a + Number(p.avg_progress || 0), 0) / projects.length)
    : 0;

  return (
    <Layout>
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Your research assignments and tasks"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={FolderKanban} label="Assigned Projects" value={projects.length} color="blue" />
        <StatCard icon={CheckSquare} label="Pending Tasks" value={totalPendingTasks} color="yellow" />
        <StatCard icon={TrendingUp} label="Avg. Progress" value={`${avgProgress}%`} color="green" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, fontSize: 15 }}>My Projects</h3>
          </div>
          {loading ? (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><span className="spinner" /></div>
          ) : projects.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
              <FolderKanban size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
              <div style={{ fontWeight: 600, color: 'var(--text-2)' }}>No projects assigned yet</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Your faculty will assign you to projects soon</div>
            </div>
          ) : projects.map((p, i) => (
            <Link key={p.project_id} to={`/projects/${p.project_id}`} style={{ display: 'block', padding: '16px 20px', borderBottom: i < projects.length - 1 ? '1px solid var(--border-light)' : 'none', transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Led by {p.faculty_name} · Role: {p.student_role}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ProgressBar value={p.avg_progress || 0} />
                <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{Math.round(p.avg_progress || 0)}%</span>
              </div>
            </Link>
          ))}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Quick Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'My Tasks', to: '/tasks', color: 'var(--success)' },
                { label: 'Project Chat', to: '/chat', color: 'var(--primary)' },
                { label: 'Publications', to: '/publications', color: '#7C3AED' },
              ].map(({ label, to, color }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 8,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: 13, fontWeight: 500,
                }}>
                  {label}<ArrowRight size={13} style={{ color }} />
                </Link>
              ))}
            </div>
          </Card>
          {totalPendingTasks > 0 && (
            <Card style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={18} color="#D97706" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#92400E' }}>Tasks Due</div>
                  <div style={{ fontSize: 12, color: '#B45309' }}>{totalPendingTasks} task{totalPendingTasks !== 1 ? 's' : ''} pending</div>
                </div>
              </div>
              <Link to="/tasks" style={{ display: 'block', marginTop: 10, fontSize: 12, color: '#D97706', fontWeight: 600 }}>View tasks →</Link>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
