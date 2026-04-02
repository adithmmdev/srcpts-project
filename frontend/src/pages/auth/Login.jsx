import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FlaskConical, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, { id: data.id, name: data.name, role: data.role, email: form.email });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #F0FDF4 100%)',
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'none',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 60%, #0EA5E9 100%)',
        padding: '48px', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }} className="left-panel">
        {/* Decorative circles */}
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: [300, 200, 150, 100][i], height: [300, 200, 150, 100][i],
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            top: ['-10%', '20%', '60%', '80%'][i],
            left: ['-5%', '50%', '-10%', '60%'][i],
          }} />
        ))}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={22} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', fontWeight: 600 }}>SRCPTS</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, color: '#fff', lineHeight: 1.2, marginBottom: 16, fontWeight: 300 }}>
            Accelerate your<br /><em>research journey</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 1.7, maxWidth: 360 }}>
            A unified platform for faculty, students, and funding agencies to collaborate on research projects seamlessly.
          </p>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: 24 }}>
          {['Projects', 'Publications', 'Grants'].map((t, i) => (
            <div key={t} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 20px', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{['50+', '120+', '$2M+'][i]}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FlaskConical size={20} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>SRCPTS</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Sign in to your research account</p>
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--danger)' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--surface-2)' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="password" required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--surface-2)' }}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '11px', borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                color: '#fff', border: 'none', fontWeight: 600, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Signing in…</> : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginBottom: 4 }}>Don't have an account? Register as:</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['Student', '/register/student'], ['Faculty', '/register/faculty'], ['Agency', '/register/agency']].map(([label, path]) => (
                  <Link key={path} to={path} style={{
                    flex: 1, textAlign: 'center', padding: '7px 4px',
                    borderRadius: 8, border: '1px solid var(--border)',
                    fontSize: 12, fontWeight: 500, color: 'var(--text-2)',
                    transition: 'all 0.15s',
                    background: 'var(--surface-2)',
                  }}>{label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
