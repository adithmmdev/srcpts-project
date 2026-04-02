import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import { FlaskConical, GraduationCap, BookOpen, Building2 } from 'lucide-react';

const configs = {
  student: {
    title: 'Join as Student',
    subtitle: 'Collaborate on cutting-edge research projects',
    icon: GraduationCap,
    color: '#16A34A',
    endpoint: '/auth/register/student',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. Jane Smith' },
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@university.edu' },
      { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
      { name: 'program', label: 'Program', type: 'text', placeholder: 'M.Sc. Computer Science' },
      { name: 'year', label: 'Year of Study', type: 'number', placeholder: '2' },
    ],
  },
  faculty: {
    title: 'Join as Faculty',
    subtitle: 'Lead and manage research projects',
    icon: BookOpen,
    color: '#2563EB',
    endpoint: '/auth/register/faculty',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Prof. John Doe' },
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@university.edu' },
      { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
      { name: 'specialization', label: 'Specialization', type: 'text', placeholder: 'Machine Learning' },
      { name: 'salary', label: 'Salary (optional)', type: 'number', placeholder: '80000' },
    ],
  },
  agency: {
    title: 'Join as Funding Agency',
    subtitle: 'Fund and track research initiatives',
    icon: Building2,
    color: '#EA580C',
    endpoint: '/auth/register/agency',
    fields: [
      { name: 'agency_name', label: 'Agency Name', type: 'text', placeholder: 'National Science Foundation' },
      { name: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'grants@nsf.gov' },
      { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
      { name: 'type', label: 'Agency Type', type: 'text', placeholder: 'Government / Private / NGO' },
    ],
  },
};

export default function Register() {
  const { role } = useParams();
  const config = configs[role] || configs.student;
  const Icon = config.icon;
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post(config.endpoint, form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 60%, #F0FDF4 100%)',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--text-2)', fontSize: 13 }}>
            <FlaskConical size={16} style={{ color: config.color }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>SRCPTS</span>
          </Link>
          <div style={{ width: 52, height: 52, background: `${config.color}18`, borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Icon size={24} color={config.color} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{config.title}</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{config.subtitle}</p>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 600, color: 'var(--success)', marginBottom: 6 }}>Account created!</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Redirecting to login…</div>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--danger)' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {config.fields.map(field => (
                    <div key={field.name}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 5 }}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.name !== 'salary'}
                        value={form[field.name] || ''}
                        onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                        style={{
                          width: '100%', padding: '9px 12px',
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                          fontSize: 14, outline: 'none', background: 'var(--surface-2)',
                        }}
                      />
                    </div>
                  ))}
                  <button type="submit" disabled={loading} style={{
                    marginTop: 6, width: '100%', padding: '11px',
                    borderRadius: 'var(--radius-sm)',
                    background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
                    color: '#fff', border: 'none', fontWeight: 600, fontSize: 15,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    {loading ? <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : null}
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
          Already have an account? <Link to="/login" style={{ color: config.color, fontWeight: 600 }}>Sign in</Link>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
          Register as:{' '}
          {Object.keys(configs).filter(r => r !== role).map((r, i) => (
            <span key={r}>{i > 0 ? ' · ' : ''}<Link to={`/register/${r}`} style={{ color: 'var(--text-2)' }}>{r.charAt(0).toUpperCase() + r.slice(1)}</Link></span>
          ))}
        </div>
      </div>
    </div>
  );
}
