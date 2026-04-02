import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, CheckSquare, TrendingUp, Users, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Card, StatCard, ProgressBar, Badge, StatusBadge, PageHeader } from '../../components/UI';
import api from '../../api';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/projects'), ]).then(([pRes]) => {
      setProjects(pRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalTasks = projects.reduce((a, p) => a + Number(p.pending_tasks || 0), 0);
  const avgProgress = projects.length
    ? Math.round(projects.reduce((a, p) => a + Number(p.avg_progress || 0), 0) / projects.length)
    : 0;

  return (
    <Layout>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening with your research projects"
      />

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={FolderKanban} label="Active Projects" value={projects.filter(p => p.status === 'Active').length} color="blue" />
        <StatCard icon={CheckSquare} label="Pending Tasks" value={totalTasks} color="yellow" />
        <StatCard icon={TrendingUp} label="Avg. Progress" value={`${avgProgress}%`} color="green" />
        <StatCard icon={Users} label="Total Projects" value={projects.length} color="purple" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Projects List */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 600, fontSize: 15 }}>My Projects</h3>
            <Link to="/projects/new" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              New Project <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><span className="spinner" /></div>
          ) : projects.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
              <FolderKanban size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
              <div style={{ fontWeight: 600, color: 'var(--text-2)' }}>No projects yet</div>
              <Link to="/projects/new" style={{ color: 'var(--primary)', fontSize: 13, marginTop: 6, display: 'inline-block' }}>Create your first project →</Link>
            </div>
          ) : (
            projects.slice(0, 6).map((p, i) => (
              <Link key={p.project_id} to={`/projects/${p.project_id}`} style={{ display: 'block', padding: '16px 20px', borderBottom: i < projects.length - 1 ? '1px solid var(--border-light)' : 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {p.pending_tasks > 0 ? `${p.pending_tasks} pending task${p.pending_tasks !== 1 ? 's' : ''}` : 'All tasks done'}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ProgressBar value={p.avg_progress || 0} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{Math.round(p.avg_progress || 0)}%</span>
                </div>
              </Link>
            ))
          )}
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick actions */}
          <Card>
            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Create New Project', to: '/projects/new', color: 'var(--primary)' },
                { label: 'View All Tasks', to: '/tasks', color: 'var(--success)' },
                { label: 'Check Milestones', to: '/milestones', color: '#D97706' },
                { label: 'Add Publication', to: '/publications', color: '#7C3AED' },
              ].map(({ label, to, color }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 8,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: 13, fontWeight: 500,
                  transition: 'all 0.12s',
                }}>
                  <span>{label}</span>
                  <ArrowRight size={13} style={{ color }} />
                </Link>
              ))}
            </div>
          </Card>

          {/* Project status summary */}
          <Card>
            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Project Status</h3>
            {['Active', 'Completed', 'On Hold', 'Pending'].map(status => {
              const count = projects.filter(p => p.status === status).length;
              return count > 0 ? (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <StatusBadge status={status} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{count}</span>
                </div>
              ) : null;
            })}
            {projects.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No projects to display</div>}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
