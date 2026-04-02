import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, PlusCircle, Users, CheckSquare,
  Flag, MessageSquare, FileText, DollarSign, LogOut, FlaskConical
} from 'lucide-react';

const navItems = {
  faculty: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'My Projects' },
    { to: '/projects/new', icon: PlusCircle, label: 'New Project' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/milestones', icon: Flag, label: 'Milestones' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/publications', icon: FileText, label: 'Publications' },
  ],
  student: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'My Projects' },
    { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/publications', icon: FileText, label: 'Publications' },
  ],
  agency: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/funding', icon: DollarSign, label: 'Funding' },
  ],
};

const roleColors = {
  faculty: { bg: '#EFF6FF', text: '#2563EB', label: 'Faculty' },
  student: { bg: '#F0FDF4', text: '#16A34A', label: 'Student' },
  agency: { bg: '#FFF7ED', text: '#EA580C', label: 'Agency' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];
  const roleStyle = roleColors[user?.role] || {};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      height: '100vh',
      position: 'fixed',
      left: 0, top: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FlaskConical size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>SRCPTS</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Research Platform</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <div style={{
            width: 34, height: 34,
            background: `linear-gradient(135deg, ${roleStyle.text}22, ${roleStyle.text}44)`,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: roleStyle.text, flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: roleStyle.text,
              background: roleStyle.bg, padding: '1px 6px', borderRadius: 4,
            }}>{roleStyle.label}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 'var(--radius-sm)',
            marginBottom: 2,
            color: isActive ? 'var(--primary)' : 'var(--text-2)',
            background: isActive ? 'var(--primary-light)' : 'transparent',
            fontWeight: isActive ? 600 : 400,
            fontSize: 14,
            transition: 'all 0.15s ease',
          })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-light)' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '9px 12px',
          borderRadius: 'var(--radius-sm)',
          border: 'none', background: 'none',
          color: 'var(--text-3)', fontSize: 14,
          transition: 'all 0.15s ease',
          cursor: 'pointer',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = '#FEF2F2'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
