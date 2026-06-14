import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Lock, AlertCircle, Eye, EyeOff, GraduationCap, BarChart2, Users, BookOpen } from 'lucide-react';

const MOCK_USERS = [
  { username: 'admin',   password: '123', role: 'admin',    name: 'Quản trị viên', lien_ket_id: null },
  { username: 'gs_demo', password: '123', role: 'gia_su',   name: 'Gia sư Demo',   lien_ket_id: 1    },
  { username: 'hs_demo', password: '123', role: 'hoc_sinh', name: 'Học sinh Demo', lien_ket_id: 1    },
];

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const found = MOCK_USERS.find(
        u => u.username === username && u.password === password
      );
      if (found) {
        const { password: _pw, ...userData } = found;
        login(userData);
        navigate('/');
      } else {
        setError('Sai tài khoản hoặc mật khẩu. Vui lòng thử lại!');
        setLoading(false);
      }
    }, 600);
  };

  const features = [
    { icon: Users,     label: '58,000+ gia sư', sub: 'trong hệ thống' },
    { icon: BookOpen,  label: '24 khu vực',      sub: 'phủ sóng toàn TP.HCM' },
    { icon: BarChart2, label: 'Analytics',        sub: 'biểu đồ thời gian thực' },
  ];

  return (
    <div className="login-shell">

      {/* ── LEFT: Branding ── */}
      <div className="login-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '3rem' }}>
            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <GraduationCap size={24} color="white" />
            </div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 20, letterSpacing: '-0.3px' }}>TutorSystem</span>
          </div>

          <h1 style={{ color: 'white', fontWeight: 800, fontSize: '2.75rem', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: '1.25rem' }}>
            Hệ thống Quản trị<br />Kho dữ liệu Gia sư
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, lineHeight: 1.7, marginBottom: '3rem', maxWidth: 400 }}>
            Nền tảng phân tích dữ liệu gia sư – học sinh toàn diện. Được xây dựng trên SQL Server với 58,000+ hồ sơ thực.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{f.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{f.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            © 2026 TutorSystem · Dự án BTL HQTCSDL · Nhóm 5
          </p>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="login-right">
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ width: 52, height: 52, background: 'var(--brand-50)', border: '1px solid var(--brand-200)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Shield size={28} color="var(--brand-600)" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.75rem', color: 'var(--gray-900)', letterSpacing: '-0.5px', marginBottom: 6 }}>Chào mừng trở lại</h2>
            <p style={{ color: 'var(--gray-400)', fontSize: 15 }}>Đăng nhập để truy cập kho dữ liệu</p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--danger-50)', border: '1px solid #fecdd3', borderRadius: 10, marginBottom: '1.5rem', color: '#be123c', fontSize: 14 }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 7 }}>
                Tên đăng nhập
              </label>
              <div className="search-bar" style={{ height: 48 }}>
                <User size={18} color="var(--gray-400)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập..."
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 7 }}>
                Mật khẩu
              </label>
              <div className="search-bar" style={{ height: 48 }}>
                <Lock size={18} color="var(--gray-400)" style={{ flexShrink: 0 }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0 }}>
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ height: 48, fontSize: 15, fontWeight: 700, borderRadius: 12, marginTop: 4 }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Đang xác thực...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', padding: '14px 16px', background: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--gray-200)', fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.7 }}>
            💡 <strong>Demo</strong> — mật khẩu đều là <code style={{ background: 'var(--gray-200)', padding: '1px 5px', borderRadius: 4 }}>123</code><br />
            <code style={{ background: 'var(--gray-200)', padding: '1px 5px', borderRadius: 4 }}>admin</code> · Quản trị viên &nbsp;|&nbsp;
            <code style={{ background: 'var(--gray-200)', padding: '1px 5px', borderRadius: 4 }}>gs_demo</code> · Gia sư &nbsp;|&nbsp;
            <code style={{ background: 'var(--gray-200)', padding: '1px 5px', borderRadius: 4 }}>hs_demo</code> · Học sinh
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: 14, color: 'var(--gray-400)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              ← Về trang Tổng quan
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Auth;
