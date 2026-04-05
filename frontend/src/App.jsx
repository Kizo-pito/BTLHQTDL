import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutGrid, Database, Users, GraduationCap, BarChart3, LineChart, LogIn, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import TutorManage from './pages/TutorManage';
import StudentManage from './pages/StudentManage';
import StatsTutor from './pages/StatsTutor';
import StatsStudent from './pages/StatsStudent';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Đang kiểm tra quyền truy cập...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Tổng quan', icon: <Database size={18} /> },
    { path: '/tutors', label: 'Quản lý Gia sư', icon: <Users size={18} />, protected: true },
    { path: '/students', label: 'Quản lý Học sinh', icon: <GraduationCap size={18} />, protected: true },
    { path: '/stats-tutor', label: 'Thống kê GS', icon: <BarChart3 size={18} />, protected: true },
    { path: '/stats-student', label: 'Thống kê HS', icon: <LineChart size={18} />, protected: true },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <LayoutGrid size={24} />
        <span>TutorSystem</span>
      </Link>
      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        {isAuthenticated ? (
          <button onClick={logout} className="btn nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={18} /> Đăng xuất
          </button>
        ) : (
          <Link to="/login" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogIn size={18} /> Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/tutors" element={<ProtectedRoute><TutorManage /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><StudentManage /></ProtectedRoute>} />
              <Route path="/stats-tutor" element={<ProtectedRoute><StatsTutor /></ProtectedRoute>} />
              <Route path="/stats-student" element={<ProtectedRoute><StatsStudent /></ProtectedRoute>} />
            </Routes>
          </main>
          <footer style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '14px', borderTop: '1px solid #e2e8f0' }}>
            &copy; 2026 - Dự án Kho Dữ liệu Gia sư chuyên nghiệp (SSMS + Node.js + React)
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
