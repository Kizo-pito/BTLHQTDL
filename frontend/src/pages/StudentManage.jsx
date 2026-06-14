import React, { useEffect, useState, useCallback } from 'react';
import { getStudents, getFilters } from '../services/api';
import {
  Search, MapPin, BookOpen, Calendar, Wallet, Target,
  Clock, RefreshCw, ChevronLeft, ChevronRight, BookMarked, Layers
} from 'lucide-react';

// ── Hình thức học badge ────────────────────────────────────────────────────────
const ModeBadge = ({ mode }) => {
  const map = {
    online:    { label: '🌐 Online',       cls: 'badge-teal',   modeKey: 'mode-online'    },
    truc_tiep: { label: '🏠 Trực tiếp',   cls: 'badge-amber',  modeKey: 'mode-truc_tiep' },
    ca_hai:    { label: '🔀 Cả hai',       cls: 'badge-purple', modeKey: 'mode-ca_hai'    },
  };
  const m = map[mode] || { label: mode || 'Linh hoạt', cls: 'badge-gray', modeKey: 'mode-unknown' };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
};

// ── Học lực badge ──────────────────────────────────────────────────────────────
const HocLucBadge = ({ hocLuc }) => {
  const map = {
    xuat_sac:  { label: '🏆 Xuất sắc',  cls: 'badge-blue'   },
    gioi:      { label: '⭐ Giỏi',       cls: 'badge-green'  },
    kha:       { label: '✅ Khá',        cls: 'badge-teal'   },
    trung_binh:{ label: '📘 Trung bình', cls: 'badge-amber'  },
    yeu:       { label: '📖 Yếu',        cls: 'badge-red'    },
  };
  const m = map[hocLuc] || null;
  if (!m) return null;
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
};

// ── Demand Card ────────────────────────────────────────────────────────────────
const DemandCard = ({ demand }) => {
  const modeKey = {
    online: 'mode-online', truc_tiep: 'mode-truc_tiep', ca_hai: 'mode-ca_hai'
  }[demand.hinh_thuc_hoc] || 'mode-unknown';

  const daysAgo = demand.ngay_dang
    ? Math.floor((Date.now() - new Date(demand.ngay_dang)) / 86400000)
    : null;

  return (
    <div className={`card card-hover demand-card ${modeKey}`}>
      {/* Header: môn + lớp */}
      <div className="flex items-center justify-between gap-2" style={{ flexWrap: 'wrap' }}>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <span className="badge badge-blue" style={{ fontSize: 13, padding: '4px 12px' }}>
            <BookOpen size={13} /> {demand.ten_mon_hoc}
          </span>
          <span className="badge badge-purple" style={{ fontSize: 13, padding: '4px 12px' }}>
            <Layers size={13} /> {demand.ten_lop_hoc}
          </span>
        </div>
        <ModeBadge mode={demand.hinh_thuc_hoc} />
      </div>

      {/* Student & học lực */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)', marginBottom: 4 }}>
          {demand.ten_hoc_sinh || 'Học sinh (ẩn danh)'}
        </div>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          {demand.hoc_luc && <HocLucBadge hocLuc={demand.hoc_luc} />}
          <span className="badge badge-gray">{demand.cap_hoc}</span>
          {demand.nhom_mon_hoc && <span className="badge badge-gray">{demand.nhom_mon_hoc}</span>}
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
        <div className="flex gap-2 items-center" style={{ fontSize: 13, color: 'var(--gray-600)' }}>
          <MapPin size={14} color="var(--gray-400)" />
          <span className="truncate">{demand.ten_khu_vuc}</span>
        </div>
        <div className="flex gap-2 items-center" style={{ fontSize: 13, color: 'var(--gray-600)' }}>
          <Clock size={14} color="var(--gray-400)" />
          <span>{demand.so_buoi_moi_tuan ? `${demand.so_buoi_moi_tuan} buổi/tuần` : 'Chưa rõ'}</span>
        </div>
        <div className="flex gap-2 items-center" style={{ fontSize: 13, color: 'var(--gray-600)' }}>
          <Wallet size={14} color="var(--gray-400)" />
          <span style={{ fontWeight: 600, color: 'var(--success-600)' }}>
            {demand.ngan_sach_toi_da_gio
              ? `≤ ${demand.ngan_sach_toi_da_gio.toLocaleString('vi-VN')}đ/h`
              : 'Thỏa thuận'}
          </span>
        </div>
        {daysAgo !== null && (
          <div className="flex gap-2 items-center" style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            <Calendar size={14} color="var(--gray-400)" />
            <span>{daysAgo === 0 ? 'Hôm nay' : `${daysAgo} ngày trước`}</span>
          </div>
        )}
      </div>

      {/* Mục tiêu */}
      {demand.muc_tieu_hoc_tap && (
        <div style={{ padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-100)' }}>
          <div className="flex gap-2 items-center" style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 4 }}>
            <Target size={13} /> MỤC TIÊU HỌC TẬP
          </div>
          <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.6, margin: 0 }}>
            {demand.muc_tieu_hoc_tap}
          </p>
        </div>
      )}

      {/* ID + Nguồn */}
      <div className="flex items-center justify-between" style={{ fontSize: 11, color: 'var(--gray-300)' }}>
        <span className="font-mono">#{demand.id}</span>
        {demand.nguon_du_lieu && <span>{demand.nguon_du_lieu}</span>}
      </div>
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
    <div className="flex gap-2">
      <div className="skeleton" style={{ width: 80, height: 26, borderRadius: 999 }} />
      <div className="skeleton" style={{ width: 60, height: 26, borderRadius: 999 }} />
    </div>
    <div className="skeleton" style={{ width: '65%', height: 18, borderRadius: 6 }} />
    <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
    <div className="skeleton" style={{ height: 48, borderRadius: 8 }} />
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const StudentManage = () => {
  const [demands,  setDemands]  = useState([]);
  const [filters,  setFilters]  = useState({ khu_vuc: [], mon_hoc: [], hinh_thuc: [] });
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const LIMIT = 12;

  const [search,   setSearch]   = useState('');
  const [khuVuc,   setKhuVuc]   = useState('');
  const [monHoc,   setMonHoc]   = useState('');
  const [hinhThuc, setHinhThuc] = useState('');

  useEffect(() => {
    getFilters().then(r => setFilters(r.data.data)).catch(console.error);
  }, []);

  const loadDemands = useCallback(() => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (search)   params.search   = search;
    if (khuVuc)   params.khu_vuc  = khuVuc;
    if (monHoc)   params.mon_hoc  = monHoc;
    if (hinhThuc) params.hinh_thuc = hinhThuc;

    getStudents(params)
      .then(r => setDemands(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, khuVuc, monHoc, hinhThuc]);

  useEffect(() => { loadDemands(); }, [loadDemands]);

  const resetFilters = () => {
    setSearch(''); setKhuVuc(''); setMonHoc(''); setHinhThuc(''); setPage(1);
  };

  const hasFilter = search || khuVuc || monHoc || hinhThuc;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-bar" style={{ flex: '1 1 260px', minWidth: 200 }}>
          <Search size={16} color="var(--gray-400)" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên học sinh hoặc môn học..."
          />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0 }}>✕</button>}
        </div>

        <div className="divider" />

        <select className="filter-select" value={khuVuc} onChange={e => { setKhuVuc(e.target.value); setPage(1); }}>
          <option value="">Tất cả khu vực</option>
          {filters.khu_vuc.map(kv => (
            <option key={kv.ten_khu_vuc} value={kv.ten_khu_vuc}>{kv.ten_khu_vuc}</option>
          ))}
        </select>

        <select className="filter-select" value={monHoc} onChange={e => { setMonHoc(e.target.value); setPage(1); }}>
          <option value="">Tất cả môn học</option>
          {filters.mon_hoc.map(m => (
            <option key={m.ten_mon_hoc} value={m.ten_mon_hoc}>{m.ten_mon_hoc}</option>
          ))}
        </select>

        <select className="filter-select" value={hinhThuc} onChange={e => { setHinhThuc(e.target.value); setPage(1); }}>
          <option value="">Hình thức học</option>
          <option value="online">🌐 Online</option>
          <option value="truc_tiep">🏠 Trực tiếp</option>
          <option value="ca_hai">🔀 Cả hai</option>
        </select>

        {hasFilter && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilters} style={{ gap: 5 }}>
            <RefreshCw size={14} /> Xóa lọc
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-400)', fontWeight: 500, flexShrink: 0 }}>
          {demands.length} nhu cầu
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="demands-grid">
          {[...Array(LIMIT)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : demands.length === 0 ? (
        <div className="empty-state">
          <BookMarked size={48} className="empty-state-icon" />
          <h3>Không có nhu cầu học tập nào</h3>
          <p>Không tìm thấy kết quả phù hợp. Hãy thử thay đổi bộ lọc.</p>
          {hasFilter && <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Xóa tất cả bộ lọc</button>}
        </div>
      ) : (
        <div className="demands-grid">
          {demands.map(d => <DemandCard key={d.id} demand={d} />)}
        </div>
      )}

      {/* Pagination */}
      {!loading && demands.length > 0 && (
        <div className="flex items-center justify-between" style={{ padding: '0.5rem 0' }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ opacity: page === 1 ? 0.4 : 1 }}>
            <ChevronLeft size={16} /> Trang trước
          </button>
          <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>Trang {page}</span>
          <button className="btn btn-ghost btn-sm" disabled={demands.length < LIMIT} onClick={() => setPage(p => p + 1)} style={{ opacity: demands.length < LIMIT ? 0.4 : 1 }}>
            Trang sau <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentManage;
