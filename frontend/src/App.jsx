import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import FacultyDashboard from './pages/faculty/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import { AgencyDashboard, FundingPage } from './pages/agency/Agency';
import { ProjectsList, CreateProject } from './pages/faculty/Projects';
import ProjectDetail from './pages/faculty/ProjectDetail';
import Tasks from './pages/faculty/Tasks';
import Milestones from './pages/faculty/Milestones';
import Chat from './pages/faculty/Chat';
import Publications from './pages/faculty/Publications';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'faculty') return <FacultyDashboard />;
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'agency') return <AgencyDashboard />;
  return <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register/:role" element={<Register />} />
      <Route path="/register" element={<Navigate to="/register/student" />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />

      {/* Projects - both faculty and student can view */}
      <Route path="/projects" element={<ProtectedRoute roles={['faculty', 'student']}><ProjectsList /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute roles={['faculty']}><CreateProject /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute roles={['faculty', 'student']}><ProjectDetail /></ProtectedRoute>} />

      {/* Tasks */}
      <Route path="/tasks" element={<ProtectedRoute roles={['faculty', 'student']}><Tasks /></ProtectedRoute>} />

      {/* Milestones */}
      <Route path="/milestones" element={<ProtectedRoute roles={['faculty', 'student']}><Milestones /></ProtectedRoute>} />

      {/* Chat */}
      <Route path="/chat" element={<ProtectedRoute roles={['faculty', 'student', 'agency']}><Chat /></ProtectedRoute>} />

      {/* Publications */}
      <Route path="/publications" element={<ProtectedRoute roles={['faculty', 'student']}><Publications /></ProtectedRoute>} />

      {/* Agency */}
      <Route path="/funding" element={<ProtectedRoute roles={['agency']}><FundingPage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
