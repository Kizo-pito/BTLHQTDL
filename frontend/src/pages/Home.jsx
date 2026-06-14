import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, MapPin, BookMarked, Star, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { getDashboardSummary, getStatsTutorsByArea, getStatsTopRating } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Mini Star Rating ───────────────────────────────────────────────────────────
const StarRating = ({ score }) => {
  const full = Math.floor(score || 0);
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} className={i <= full ? 'star-filled' : 'star-empty'} fill={i <= full ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const KpiSkeleton = () => (
  <div className="kpi-grid">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="card kpi-card" style={{ gap: '0.75rem' }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
        <div className="skeleton" style={{ width: '60%', height: 14 }} />
        <div className="skeleton" style={{ width: '40%', height: 28 }} />
      </div>
    ))}
  </div>
);

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, color, bg, link }) => (
  <div className="card kpi-card card-hover">
    <div className="kpi-icon-wrapper" style={{ background: bg }}>
      <Icon size={24} color={color} strokeWidth={2} />
    </div>
    <div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>{value ?? '—'}</div>
    </div>
    {link && (
      <Link to={link} className="flex items-center gap-1 text-sm" style={{ color, fontWeight: 600, marginTop: 'auto' }}>
        Xem chi tiết <ArrowRight size={14} />
      </Link>
    )}
  </div>
);

// ─── Home Component ────────────────────────────────────────────────────────────
const Home = () => {
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(null);
  const [topAreas, setTopAreas] = useState([]);
  const [topRating, setTopRating] = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardSummary(),
      getStatsTutorsByArea(),
      getStatsTopRating(),
    ])
      .then(([sumRes, areaRes, ratingRes]) => {
        setSummary(sumRes.data.data);
        setTopAreas(areaRes.data.data?.slice(0, 5) || []);
        setTopRating(ratingRes.data.data?.slice(0, 5) || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── KPI Section ── */}
      <section>
        <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
          <Activity size={18} color="var(--brand-600)" />
          <h2 style={{ fontWeight: 700, fontSize: 17 }}>Chỉ số Hệ thống</h2>
        </div>

        {loading ? <KpiSkeleton /> : (
          <div className="kpi-grid">
            <KpiCard
              icon={Users}
              label="Gia sư đang hoạt động"
              value={summary?.tong_gia_su_hoat_dong?.toLocaleString('vi-VN')}
              color="var(--brand-600)" bg="var(--brand-50)"
              link="/tutors"
            />
            <KpiCard
              icon={BookOpen}
              label="Nhu cầu đang mở"
              value={summary?.tong_nhu_cau_dang_mo?.toLocaleString('vi-VN')}
              color="#16a34a" bg="#f0fdf4"
              link="/students"
            />
            <KpiCard
              icon={MapPin}
              label="Khu vực phủ sóng"
              value={summary?.tong_khu_vuc}
              color="#d97706" bg="#fffbeb"
            />
            <KpiCard
              icon={BookMarked}
              label="Môn học hỗ trợ"
              value={summary?.tong_mon_hoc}
              color="#9333ea" bg="#faf5ff"
            />
          </div>
        )}
      </section>

      {/* ── 2 columns: Top Areas + Top Rating ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Top khu vực */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Top Khu vực · Gia sư</h3>
              <p className="text-muted text-sm" style={{ marginTop: 2 }}>10 khu vực có nhiều gia sư nhất</p>
            </div>
            <Link to="/stats-tutor" className="btn btn-ghost btn-sm">Xem thêm</Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
            </div>
          ) : topAreas.length === 0 ? (
            <p className="text-muted text-sm">Chưa có dữ liệu khu vực</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topAreas.map((area, i) => {
                const max = topAreas[0]?.count || 1;
                const pct = Math.round((area.count / max) * 100);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textAlign: 'right' }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 13, fontWeight: 500 }}>
                        <span style={{ color: 'var(--gray-800)' }}>{area.label}</span>
                        <span style={{ color: 'var(--brand-600)', fontWeight: 700 }}>{area.count}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--gray-100)', borderRadius: 9999 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand-500)', borderRadius: 9999, transition: 'width 0.8s var(--ease-out)' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Rating */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Gia sư được đánh giá cao</h3>
              <p className="text-muted text-sm" style={{ marginTop: 2 }}>Xếp hạng theo điểm bình quân</p>
            </div>
            <Link to="/stats-student" className="btn btn-ghost btn-sm">Xem thêm</Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
            </div>
          ) : topRating.length === 0 ? (
            <p className="text-muted text-sm">Chưa có dữ liệu đánh giá</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topRating.map((gs, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: i === 0 ? 'var(--brand-50)' : 'var(--gray-50)', borderRadius: 10, border: `1px solid ${i === 0 ? 'var(--brand-200)' : 'var(--gray-100)'}` }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? 'var(--brand-600)' : 'var(--gray-200)', color: i === 0 ? 'white' : 'var(--gray-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-900)' }}>{gs.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{gs.ten_khu_vuc}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: i === 0 ? 'var(--brand-700)' : 'var(--gray-700)' }}>{gs.count}</div>
                    <StarRating score={gs.count} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CTA nếu chưa đăng nhập ── */}
      {!isAuthenticated && (
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'white', marginBottom: 8 }}>Truy cập đầy đủ kho dữ liệu gia sư</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Đăng nhập để xem hồ sơ chi tiết, bộ lọc nâng cao và bảng phân tích.</p>
          </div>
          <Link to="/login" className="btn btn-lg" style={{ background: 'white', color: 'var(--brand-700)', fontWeight: 700, flexShrink: 0 }}>
            Đăng nhập ngay <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
