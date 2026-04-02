import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import Layout from '../../components/Layout';
import { PageHeader, Card, EmptyState } from '../../components/UI';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('project');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(preselected || '');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    api.get('/projects').then(r => {
      setProjects(r.data);
      if (!preselected && r.data.length > 0) setSelectedProject(String(r.data[0].project_id));
    });
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    fetchMessages();
    clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchMessages, 4000);
    return () => clearInterval(pollRef.current);
  }, [selectedProject]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const r = await api.get(`/chat/${selectedProject}`);
      setMessages(r.data);
    } catch {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedProject) return;
    const msg = message;
    setMessage('');
    await api.post('/chat/send', { project_id: selectedProject, message: msg });
    fetchMessages();
  };

  const roleColor = { faculty: '#2563EB', student: '#16A34A', agency: '#EA580C' };

  const selectedProjectTitle = projects.find(p => String(p.project_id) === String(selectedProject))?.title;

  return (
    <Layout>
      <PageHeader title="Project Chat" subtitle="Real-time messaging for your research teams" />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, height: 'calc(100vh - 200px)', minHeight: 500 }}>
        {/* Project list sidebar */}
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}>
            Projects
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {projects.map(p => (
              <button key={p.project_id} onClick={() => setSelectedProject(String(p.project_id))}
                style={{
                  display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left',
                  background: String(selectedProject) === String(p.project_id) ? 'var(--primary-light)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  borderLeft: String(selectedProject) === String(p.project_id) ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'all 0.12s',
                }}>
                <div style={{ fontSize: 13, fontWeight: String(selectedProject) === String(p.project_id) ? 600 : 400, color: String(selectedProject) === String(p.project_id) ? 'var(--primary)' : 'var(--text)', lineHeight: 1.3 }}>
                  {p.title}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat area */}
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!selectedProject ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState icon={MessageSquare} title="Select a project" description="Choose a project to start chatting" />
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedProjectTitle}</span>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, marginTop: 40 }}>
                    No messages yet. Start the conversation!
                  </div>
                ) : messages.map(msg => {
                  const isMe = msg.sender_id === user.id && msg.sender_role === user.role;
                  return (
                    <div key={msg.message_id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '72%' }}>
                        {!isMe && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: roleColor[msg.sender_role] || '#666', marginBottom: 3, paddingLeft: 12 }}>
                            {msg.sender_name} · {msg.sender_role}
                          </div>
                        )}
                        <div style={{
                          padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isMe ? 'var(--primary)' : 'var(--surface-3)',
                          color: isMe ? '#fff' : 'var(--text)',
                          fontSize: 14, lineHeight: 1.5,
                        }}>
                          {msg.message}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : 12, paddingRight: isMe ? 12 : 0 }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message…"
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 24, fontSize: 14, outline: 'none', background: 'var(--surface-2)' }}
                />
                <button type="submit" disabled={!message.trim()} style={{
                  width: 42, height: 42, borderRadius: '50%', border: 'none',
                  background: message.trim() ? 'var(--primary)' : 'var(--surface-3)',
                  color: message.trim() ? '#fff' : 'var(--text-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: message.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s', flexShrink: 0,
                }}>
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
