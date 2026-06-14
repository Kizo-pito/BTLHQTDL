import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, BarChart2, PieChart,
  LogOut, GraduationCap, Bell, Zap,
  UserCircle, ClipboardList, History, PlusCircle, ShieldX,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

import Home             from './pages/Home';
import Auth             from './pages/Auth';
import TutorManage      from './pages/TutorManage';
import StudentManage    from './pages/StudentManage';
import StatsTutor       from './pages/StatsTutor';
import StatsStudent     from './pages/StatsStudent';
import Matching         from './pages/Matching';
import MyProfile        from './pages/MyProfile';
import AvailableDemands from './pages/AvailableDemands';
import TeachingHistory  from './pages/TeachingHistory';
import CreateDemand     from './pages/CreateDemand';
import MyDemands        from './pages/MyDemands';
import MatchHistory     from './pages/MatchHistory';

// ─── Protected Route ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ─── Role Route ────────────────────────────────────────────────────────────────
const RoleRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

// ─── Unauthorized Page ─────────────────────────────────────────────────────────
const Unauthorized = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, textAlign: 'center' }}>
    <ShieldX size={52} color="#ef4444" strokeWidth={1.5} />
    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Không có quyền truy cập</h2>
    <p style={{ color: '#6b7280', margin: 0 }}>Tài khoản của bạn không có quyền xem trang này.</p>
    <NavLink to="/" className="btn btn-primary" style={{ marginTop: 8 }}>← Về trang chủ</NavLink>
  </div>
);

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const NAV_CONFIG = {
  admin: {
    main: [
      { path: '/',         label: 'Tổng quan',      icon: LayoutDashboard },
      { path: '/tutors',   label: 'Gia sư',          icon: Users           },
      { path: '/students', label: 'Nhu cầu Học tập', icon: BookOpen        },
      { path: '/matching', label: 'Ghép đôi',         icon: Zap             },
    ],
    stats: [
      { path: '/stats-tutor',   label: 'Analytics Gia sư',   icon: BarChart2 },
      { path: '/stats-student', label: 'Analytics Học viên', icon: PieChart  },
    ],
  },
  gia_su: {
    main: [
      { path: '/my-profile',        label: 'Hồ sơ của tôi',    icon: UserCircle    },
      { path: '/available-demands', label: 'Nhu cầu học sinh', icon: BookOpen      },
      { path: '/teaching-history',  label: 'Lịch sử dạy',      icon: ClipboardList },
    ],
    stats: [],
  },
  hoc_sinh: {
    main: [
      { path: '/create-demand', label: 'Tạo nhu cầu',        icon: PlusCircle    },
      { path: '/my-demands',    label: 'Trạng thái nhu cầu', icon: ClipboardList },
      { path: '/match-history', label: 'Lịch sử ghép đôi',   icon: History       },
    ],
    stats: [],
  },
};

const Sidebar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const role = user?.role ?? 'admin';
  const { main: navItems, stats: statItems } = NAV_CONFIG[role] ?? NAV_CONFIG.admin;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <GraduationCap size={22} strokeWidth={2} />
        </div>
        <div className="sidebar-logo-text">
          <span className="name">TutorSystem</span>
          <span className="tagline">Kho dữ liệu Gia sư</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menu chính</span>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="icon" />
              {item.label}
            </NavLink>
          );
        })}

        {isAuthenticated && statItems.length > 0 && (
          <>
            <span className="sidebar-section-label" style={{ marginTop: 8 }}>Phân tích</span>
            {statItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className="icon" />
                  {item.label}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {isAuthenticated ? (
          <>
            <div className="sidebar-user" style={{ marginBottom: 8 }}>
              <div className="sidebar-user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name || 'Admin'}</div>
                <div className="sidebar-user-role">{user?.role || 'Quản trị viên'}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="sidebar-link"
              style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
            >
              <LogOut size={16} className="icon" style={{ opacity: 1 }} />
              Đăng xuất
            </button>
          </>
        ) : (
          <NavLink to="/login" className="sidebar-link" style={{ justifyContent: 'center' }}>
            Đăng nhập
          </NavLink>
        )}
      </div>
    </aside>
  );
};

// ─── Page Header ───────────────────────────────────────────────────────────────
const PageHeader = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const titleMap = {
    '/':                    { title: 'Tổng quan hệ thống',    subtitle: 'Dashboard phân tích dữ liệu thời gian thực' },
    '/tutors':              { title: 'Quản lý Gia sư',         subtitle: 'Khám phá và lọc hồ sơ gia sư trong hệ thống' },
    '/students':            { title: 'Nhu cầu Học tập',        subtitle: 'Danh sách yêu cầu tìm gia sư đang mở' },
    '/matching':            { title: 'Ghép đôi Gia sư',        subtitle: 'Dùng Stored Procedure tính điểm phù hợp và kết nối gia sư với học sinh' },
    '/stats-tutor':         { title: 'Analytics · Gia sư',     subtitle: 'Phân tích chuyên sâu dữ liệu gia sư' },
    '/stats-student':       { title: 'Analytics · Học viên',   subtitle: 'Phân tích xu hướng học tập và đánh giá' },
    '/my-profile':          { title: 'Hồ sơ của tôi',          subtitle: 'Thông tin và năng lực giảng dạy' },
    '/available-demands':   { title: 'Nhu cầu học sinh',        subtitle: 'Danh sách nhu cầu phù hợp với bạn' },
    '/teaching-history':    { title: 'Lịch sử dạy',            subtitle: 'Các buổi học đã hoàn thành' },
    '/create-demand':       { title: 'Tạo nhu cầu học tập',    subtitle: 'Đăng yêu cầu tìm gia sư mới' },
    '/my-demands':          { title: 'Trạng thái nhu cầu',      subtitle: 'Theo dõi tiến độ tìm gia sư' },
    '/match-history':       { title: 'Lịch sử ghép đôi',        subtitle: 'Các lần ghép đôi thành công' },
    '/unauthorized':        { title: 'Không có quyền truy cập', subtitle: '' },
    '/login':               { title: 'Xác thực',               subtitle: '' },
  };

  const info = titleMap[location.pathname] || { title: 'TutorSystem', subtitle: '' };

  return (
    <header className="page-header">
      <div className="page-title-block">
        <h1 className="page-title">{info.title}</h1>
        {info.subtitle && <p className="page-subtitle">{info.subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isAuthenticated && (
          <button className="btn btn-ghost btn-sm" style={{ gap: 6, color: 'var(--gray-500)' }}>
            <Bell size={15} /> Thông báo
          </button>
        )}
      </div>
    </header>
  );
};

// ─── App Root ──────────────────────────────────────────────────────────────────
const AppInner = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-wrapper">
        <PageHeader />
        <main className="page-content">
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/tutors"        element={<RoleRoute roles={['admin']}><TutorManage /></RoleRoute>} />
            <Route path="/students"      element={<RoleRoute roles={['admin']}><StudentManage /></RoleRoute>} />
            <Route path="/matching"      element={<RoleRoute roles={['admin']}><Matching /></RoleRoute>} />
            <Route path="/stats-tutor"   element={<RoleRoute roles={['admin']}><StatsTutor /></RoleRoute>} />
            <Route path="/stats-student" element={<RoleRoute roles={['admin']}><StatsStudent /></RoleRoute>} />
            {/* gia_su routes */}
            <Route path="/my-profile"        element={<RoleRoute roles={['gia_su']}><MyProfile /></RoleRoute>} />
            <Route path="/available-demands" element={<RoleRoute roles={['gia_su']}><AvailableDemands /></RoleRoute>} />
            <Route path="/teaching-history"  element={<RoleRoute roles={['gia_su']}><TeachingHistory /></RoleRoute>} />
            {/* hoc_sinh routes */}
            <Route path="/create-demand" element={<RoleRoute roles={['hoc_sinh']}><CreateDemand /></RoleRoute>} />
            <Route path="/my-demands"    element={<RoleRoute roles={['hoc_sinh']}><MyDemands /></RoleRoute>} />
            <Route path="/match-history" element={<RoleRoute roles={['hoc_sinh']}><MatchHistory /></RoleRoute>} />
            <Route path="/unauthorized"  element={<Unauthorized />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppInner />
    </Router>
  </AuthProvider>
);

export default App;
