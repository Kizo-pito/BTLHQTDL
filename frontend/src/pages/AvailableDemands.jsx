import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, BookOpen, Clock, Wallet, Search, CheckCircle2, Layers } from 'lucide-react';

const MODE_LABEL = {
  online:    { label: '🌐 Online',     cls: 'badge-teal'   },
  truc_tiep: { label: '🏠 Trực tiếp', cls: 'badge-amber'  },
  ca_hai:    { label: '🔀 Cả hai',    cls: 'badge-purple' },
};

const DemandCard = ({ demand, onAccept, accepted }) => {
  const mode = MODE_LABEL[demand.hinh_thuc_hoc] ?? { label: demand.hinh_thuc_hoc, cls: 'badge-gray' };
  const daysAgo = demand.ngay_dang
    ? Math.floor((Date.now() - new Date(demand.ngay_dang)) / 86400000)
    : null;

  return (
    <div className="card card-hover" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-blue" style={{ fontSize: 13, padding: '4px 12px' }}>
            <BookOpen size={12} /> {demand.ten_mon_hoc}
          </span>
          <span className="badge badge-purple" style={{ fontSize: 13, padding: '4px 12px' }}>
            <Layers size={12} /> {demand.ten_lop_hoc}
          </span>
        </div>
        <span className={`badge ${mode.cls}`}>{mode.label}</span>
      </div>

      {/* Mục tiêu */}
      <div style={{ fontSize: 14, color: 'var(--gray-700)', fontWeight: 600 }}>
        {demand.muc_tieu_hoc_tap}
      </div>

      {/* Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
        <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <MapPin size={13} color="var(--gray-400)" /> {demand.ten_khu_vuc}
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Clock size={13} color="var(--gray-400)" /> {demand.so_buoi_moi_tuan} buổi/tuần
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Wallet size={13} color="var(--gray-400)" />
          Tối đa {(demand.ngan_sach_toi_da_gio ?? 0).toLocaleString('vi-VN')} ₫/giờ
        </span>
        {daysAgo !== null && (
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            Đăng {daysAgo === 0 ? 'hôm nay' : `${daysAgo} ngày trước`}
          </span>
        )}
      </div>

      {/* Action */}
      <div style={{ marginTop: 4 }}>
        {accepted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
            <CheckCircle2 size={18} /> Đã nhận yêu cầu
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
            onClick={() => onAccept(demand.id)}
          >
            Nhận yêu cầu này
          </button>
        )}
      </div>
    </div>
  );
};

const AvailableDemands = () => {
  const [demands, setDemands]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [accepted, setAccepted]   = useState(new Set());
  const [toast, setToast]         = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/available_demands')
      .then(r => r.json())
      .then(setDemands)
      .catch(() => setDemands([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = useCallback((id) => {
    setAccepted(prev => new Set([...prev, id]));
    setToast('Đã nhận yêu cầu! SP sp_ghep_doi sẽ được gọi khi có backend.');
    setTimeout(() => setToast(''), 3500);
  }, []);

  const filtered = demands.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.ten_mon_hoc?.toLowerCase().includes(q) ||
      d.ten_khu_vuc?.toLowerCase().includes(q) ||
      d.ten_lop_hoc?.toLowerCase().includes(q) ||
      d.muc_tieu_hoc_tap?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {toast && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, color: '#15803d', fontSize: 14 }}>
          ✓ {toast}
        </div>
      )}

      {/* Bộ lọc */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div className="search-bar">
          <Search size={16} color="var(--gray-400)" />
          <input
            type="text"
            placeholder="Tìm theo môn, khu vực, lớp..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Summary */}
      <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>
        {loading ? 'Đang tải...' : `${filtered.length} nhu cầu đang mở`}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30vh' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Không tìm thấy nhu cầu phù hợp.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(d => (
            <DemandCard
              key={d.id}
              demand={d}
              onAccept={handleAccept}
              accepted={accepted.has(d.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableDemands;
