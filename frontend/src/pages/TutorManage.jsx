import React, { useEffect, useState, useCallback } from 'react';
import { getTutors, getFilters } from '../services/api';
import { Search, Filter, Star, MapPin, GraduationCap, Clock, DollarSign, BookOpen, CheckCircle, Wifi, Users, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Stars ─────────────────────────────────────────────────────────────────────
const StarRating = ({ score, count }) => {
  const s = parseFloat(score) || 0;
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} color={i <= Math.round(s) ? '#fbbf24' : '#e2e8f0'} fill={i <= Math.round(s) ? '#fbbf24' : 'none'} />
      ))}
      <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 2 }}>
        {s > 0 ? `${s.toFixed(1)} (${count || 0})` : 'Chưa có'}
      </span>
    </div>
  );
};

// ── Hình thức dạy badge ────────────────────────────────────────────────────────
const ModeBadge = ({ mode }) => {
  const map = {
    online:     { label: 'Online',     cls: 'badge-teal'   },
    truc_tiep:  { label: 'Trực tiếp', cls: 'badge-amber'  },
    ca_hai:     { label: 'Cả hai',     cls: 'badge-purple' },
  };
  const m = map[mode] || { label: mode || 'N/A', cls: 'badge-gray' };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
};

// ── Avatar với chữ cái đầu ─────────────────────────────────────────────────────
const avatarColors = [
  ['#dbeafe','#1d4ed8'], ['#dcfce7','#15803d'], ['#fce7f3','#be185d'],
  ['#fef9c3','#92400e'], ['#ede9fe','#6d28d9'], ['#ccfbf1','#0f766e'],
];
const TutorAvatar = ({ name, id }) => {
  const [bg, fg] = avatarColors[id % avatarColors.length];
  const letter = name ? name.trim().charAt(0).toUpperCase() : '?';
  return (
    <div style={{ width: 52, height: 52, background: bg, color: fg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, flexShrink: 0, border: `2px solid ${fg}22` }}>
      {letter}
    </div>
  );
};

// ── Subject Tags ───────────────────────────────────────────────────────────────
const SubjectTags = ({ subjects }) => {
  if (!subjects) return <span className="text-muted text-xs">Chưa cập nhật môn dạy</span>;
  const list = subjects.split(',').map(s => s.trim()).filter(Boolean);
  const show = list.slice(0, 3);
  const more = list.length - show.length;
  return (
    <div className="tutor-subjects">
      {show.map((s, i) => <span key={i} className="badge badge-blue">{s}</span>)}
      {more > 0 && <span className="badge badge-gray">+{more}</span>}
    </div>
  );
};

// ── Tutor Card ─────────────────────────────────────────────────────────────────
const TutorCard = ({ tutor }) => {
  const age = tutor.nam_sinh ? new Date().getFullYear() - tutor.nam_sinh : null;
  return (
    <div className="card card-hover tutor-card">
      {/* Header */}
      <div className="flex gap-3 items-center">
        <TutorAvatar name={tutor.ho_ten} id={tutor.gia_su_id} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tutor-name truncate">{tutor.ho_ten}</div>
          <span className="tutor-id">{tutor.ma_gia_su}</span>
        </div>
        <ModeBadge mode={tutor.hinh_thuc_day} />
      </div>

      {/* Rating */}
      <StarRating score={tutor.diem_trung_binh} count={tutor.so_luot_danh_gia} />

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="tutor-info-row">
          <GraduationCap size={15} color="var(--gray-400)" />
          <span>{tutor.hoc_vi || 'N/A'}</span>
          {tutor.chuyen_nganh && <span style={{ color: 'var(--gray-400)' }}>· {tutor.chuyen_nganh}</span>}
        </div>
        <div className="tutor-info-row">
          <MapPin size={15} color="var(--gray-400)" />
          <span>{tutor.ten_khu_vuc || 'Chưa rõ khu vực'}</span>
          {tutor.tinh_thanh && <span style={{ color: 'var(--gray-400)' }}>· {tutor.tinh_thanh}</span>}
        </div>
        {tutor.ten_truong_hoc && (
          <div className="tutor-info-row">
            <BookOpen size={15} color="var(--gray-400)" />
            <span className="truncate">{tutor.ten_truong_hoc}</span>
          </div>
        )}
      </div>

      {/* Subjects */}
      <SubjectTags subjects={tutor.danh_sach_mon_day} />

      {/* Stats row */}
      <div className="tutor-stats-row">
        <div className="tutor-stat">
          <div className="tutor-stat-value" style={{ color: 'var(--brand-700)' }}>
            {tutor.hoc_phi_trung_binh_gio ? `${Math.round(tutor.hoc_phi_trung_binh_gio / 1000)}k` : 'TT'}
          </div>
          <div className="tutor-stat-label">đ/giờ</div>
        </div>
        <div style={{ width: 1, background: 'var(--gray-200)' }} />
        <div className="tutor-stat">
          <div className="tutor-stat-value">{tutor.nam_kinh_nghiem ?? '—'}</div>
          <div className="tutor-stat-label">năm KN</div>
        </div>
        <div style={{ width: 1, background: 'var(--gray-200)' }} />
        <div className="tutor-stat">
          <div className="tutor-stat-value">{age || '—'}</div>
          <div className="tutor-stat-label">tuổi</div>
        </div>
        <div style={{ width: 1, background: 'var(--gray-200)' }} />
        <div className="tutor-stat">
          <div className="tutor-stat-value">
            {tutor.gioi_tinh === 'nam' ? '♂' : tutor.gioi_tinh === 'nu' ? '♀' : '—'}
          </div>
          <div className="tutor-stat-label">giới tính</div>
        </div>
      </div>
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div className="flex gap-3 items-center">
      <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 14 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton" style={{ height: 16, width: '70%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
      </div>
    </div>
    {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 14, borderRadius: 6 }} />)}
    <div className="skeleton" style={{ height: 48, borderRadius: 8 }} />
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const TutorManage = () => {
  const [tutors, setTutors]       = useState([]);
  const [filters, setFilters]     = useState({ khu_vuc: [], mon_hoc: [], hinh_thuc: [] });
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const LIMIT = 12;

  const [search,   setSearch]   = useState('');
  const [khuVuc,   setKhuVuc]   = useState('');
  const [hinhThuc, setHinhThuc] = useState('');
  const [monHoc,   setMonHoc]   = useState('');

  // Load filters once
  useEffect(() => {
    getFilters().then(r => setFilters(r.data.data)).catch(console.error);
  }, []);

  // Load tutors whenever params change
  const loadTutors = useCallback(() => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (search)   params.search   = search;
    if (khuVuc)   params.khu_vuc  = khuVuc;
    if (hinhThuc) params.hinh_thuc = hinhThuc;
    if (monHoc)   params.mon_hoc  = monHoc;

    getTutors(params)
      .then(r => setTutors(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, khuVuc, hinhThuc, monHoc]);

  useEffect(() => { loadTutors(); }, [loadTutors]);

  const resetFilters = () => {
    setSearch(''); setKhuVuc(''); setHinhThuc(''); setMonHoc(''); setPage(1);
  };

  const hasFilter = search || khuVuc || hinhThuc || monHoc;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Filter bar */}
      <div className="filter-bar">
        {/* Search */}
        <div className="search-bar" style={{ flex: '1 1 260px', minWidth: 200 }}>
          <Search size={16} color="var(--gray-400)" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên hoặc chuyên ngành..."
          />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0 }}>✕</button>}
        </div>

        <div className="divider" />

        {/* Khu vực */}
        <select className="filter-select" value={khuVuc} onChange={e => { setKhuVuc(e.target.value); setPage(1); }}>
          <option value="">Tất cả khu vực</option>
          {filters.khu_vuc.map(kv => (
            <option key={kv.ten_khu_vuc} value={kv.ten_khu_vuc}>{kv.ten_khu_vuc}</option>
          ))}
        </select>

        {/* Hình thức */}
        <select className="filter-select" value={hinhThuc} onChange={e => { setHinhThuc(e.target.value); setPage(1); }}>
          <option value="">Hình thức dạy</option>
          <option value="online">Online</option>
          <option value="truc_tiep">Trực tiếp</option>
          <option value="ca_hai">Cả hai</option>
        </select>

        {/* Môn học */}
        <select className="filter-select" value={monHoc} onChange={e => { setMonHoc(e.target.value); setPage(1); }}>
          <option value="">Tất cả môn học</option>
          {filters.mon_hoc.map(m => (
            <option key={m.ten_mon_hoc} value={m.ten_mon_hoc}>{m.ten_mon_hoc}</option>
          ))}
        </select>

        {hasFilter && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilters} style={{ gap: 5 }}>
            <RefreshCw size={14} /> Xóa lọc
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-400)', fontWeight: 500, flexShrink: 0 }}>
          Hiển thị {tutors.length} hồ sơ
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="tutors-grid">
          {[...Array(LIMIT)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : tutors.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="empty-state-icon" />
          <h3>Không tìm thấy gia sư</h3>
          <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
          {hasFilter && <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Xóa tất cả bộ lọc</button>}
        </div>
      ) : (
        <div className="tutors-grid">
          {tutors.map(t => <TutorCard key={t.gia_su_id} tutor={t} />)}
        </div>
      )}

      {/* Pagination */}
      {!loading && tutors.length > 0 && (
        <div className="flex items-center justify-between" style={{ padding: '0.5rem 0' }}>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{ opacity: page === 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} /> Trang trước
          </button>
          <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>Trang {page}</span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={tutors.length < LIMIT}
            onClick={() => setPage(p => p + 1)}
            style={{ opacity: tutors.length < LIMIT ? 0.4 : 1 }}
          >
            Trang sau <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorManage;
