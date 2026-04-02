// Shared UI components

export function Card({ children, style = {}, ...props }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px',
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }} {...props}>
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', loading, style = {}, ...props }) {
  const variants = {
    primary: { background: 'var(--primary)', color: '#fff', border: 'none' },
    secondary: { background: 'var(--surface-3)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger: { background: '#FEF2F2', color: 'var(--danger)', border: '1px solid #FECACA' },
    ghost: { background: 'transparent', color: 'var(--text-2)', border: 'none' },
    success: { background: '#F0FDF4', color: 'var(--success)', border: '1px solid #BBF7D0' },
  };
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 13 },
    md: { padding: '9px 18px', fontSize: 14 },
    lg: { padding: '12px 24px', fontSize: 15 },
  };
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      borderRadius: 'var(--radius-sm)', fontWeight: 500,
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      transition: 'all 0.15s ease',
      ...variants[variant], ...sizes[size], ...style,
    }} disabled={loading} {...props}>
      {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
      {children}
    </button>
  );
}

export function Input({ label, error, style = {}, containerStyle = {}, ...props }) {
  return (
    <div style={{ ...containerStyle }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>{label}</label>}
      <input style={{
        width: '100%', padding: '9px 12px',
        border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface)',
        color: 'var(--text)',
        outline: 'none',
        transition: 'border-color 0.15s',
        ...style,
      }}
        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
        {...props} />
      {error && <span style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4, display: 'block' }}>{error}</span>}
    </div>
  );
}

export function Select({ label, children, style = {}, containerStyle = {}, ...props }) {
  return (
    <div style={containerStyle}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>{label}</label>}
      <select style={{
        width: '100%', padding: '9px 12px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface)',
        color: 'var(--text)',
        outline: 'none',
        ...style,
      }} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, style = {}, containerStyle = {}, ...props }) {
  return (
    <div style={containerStyle}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>{label}</label>}
      <textarea style={{
        width: '100%', padding: '9px 12px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface)',
        color: 'var(--text)',
        outline: 'none',
        resize: 'vertical', minHeight: 80,
        fontFamily: 'var(--font)',
        ...style,
      }}
        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
        {...props} />
    </div>
  );
}

export function Badge({ children, color = 'default' }) {
  const colors = {
    default: { bg: 'var(--surface-3)', text: 'var(--text-2)' },
    blue: { bg: 'var(--primary-light)', text: 'var(--primary)' },
    green: { bg: '#F0FDF4', text: 'var(--success)' },
    yellow: { bg: '#FFFBEB', text: '#92400E' },
    red: { bg: '#FEF2F2', text: 'var(--danger)' },
    purple: { bg: '#F5F3FF', text: '#6D28D9' },
  };
  const c = colors[color] || colors.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 100,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
      background: c.bg, color: c.text,
    }}>{children}</span>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-2)', marginTop: 4, fontSize: 14 }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{children}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      backdropFilter: 'blur(4px)',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        animation: 'pageEnter 0.2s ease',
      }}>
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontWeight: 600, fontSize: 17 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'var(--surface-3)', border: 'none',
            borderRadius: 8, width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-2)', fontSize: 18,
          }}>×</button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color = 'blue', sublabel }) {
  const colors = {
    blue: { bg: 'var(--primary-light)', icon: 'var(--primary)' },
    green: { bg: '#F0FDF4', icon: 'var(--success)' },
    yellow: { bg: '#FFFBEB', icon: '#D97706' },
    orange: { bg: '#FFF7ED', icon: '#EA580C' },
    purple: { bg: '#F5F3FF', icon: '#7C3AED' },
  };
  const c = colors[color] || colors.blue;
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} color={c.icon} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>{value}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
          {sublabel && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{sublabel}</div>}
        </div>
      </div>
    </Card>
  );
}

export function ProgressBar({ value, color = 'var(--primary)' }) {
  return (
    <div style={{ background: 'var(--surface-3)', borderRadius: 100, height: 6, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, value))}%`,
        height: '100%', background: color, borderRadius: 100,
        transition: 'width 0.5s ease',
      }} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-3)' }}>
      {Icon && <Icon size={40} style={{ marginBottom: 12, opacity: 0.5 }} />}
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>{title}</div>
      {description && <div style={{ fontSize: 13 }}>{description}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    'Active': 'green', 'Completed': 'blue', 'Pending': 'yellow',
    'On Hold': 'yellow', 'In Progress': 'purple', 'Cancelled': 'red',
  };
  return <Badge color={map[status] || 'default'}>{status}</Badge>;
}
