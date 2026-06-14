import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, BookOpen, Calendar, Star, ClipboardList } from 'lucide-react';

const MODE_LABEL = {
  online:    '🌐 Online',
  truc_tiep: '🏠 Trực tiếp',
  ca_hai:    '🔀 Cả hai',
};

const StarBar = ({ value }) => {
  const pct = ((value ?? 0) / 5) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--gray-100)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', minWidth: 32 }}>
        ⭐ {value?.toFixed(1)}
      </span>
    </div>
  );
};

const HistoryCard = ({ item }) => (
  <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>{item.ten_hoc_sinh}</div>
        <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
          {MODE_LABEL[item.hinh_thuc_hoc] ?? item.hinh_thuc_hoc}
        </div>
      </div>
      <span className="badge badge-green" style={{ fontSize: 12 }}>✓ Hoàn thành</span>
    </div>

    {/* Meta */}
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 6, alignItems: 'center' }}>
        <BookOpen size={13} color="var(--gray-400)" /> {item.ten_mon_hoc} · {item.ten_lop_hoc}
      </span>
      <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 6, alignItems: 'center' }}>
        <MapPin size={13} color="var(--gray-400)" /> {item.ten_khu_vuc}
      </span>
      <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 6, alignItems: 'center' }}>
        <Calendar size={13} color="var(--gray-400)" /> {item.ngay_ghep}
      </span>
    </div>

    {/* Mục tiêu */}
    {item.muc_tieu_hoc_tap && (
      <div style={{ fontSize: 13, color: 'var(--gray-600)', fontStyle: 'italic' }}>
        "{item.muc_tieu_hoc_tap}"
      </div>
    )}

    {/* Rating */}
    <StarBar value={item.diem_danh_gia} />
  </div>
);

const TeachingHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = user?.lien_ket_id ?? 1;
    fetch(`http://localhost:3001/teaching_history?gia_su_id=${id}`)
      .then(r => r.json())
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [user]);

  const avgRating = history.length
    ? (history.reduce((s, h) => s + (h.diem_danh_gia ?? 0), 0) / history.length).toFixed(2)
    : '—';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Tổng buổi dạy', value: history.length, color: 'var(--brand-600)' },
          { label: 'Đánh giá TB',    value: avgRating === '—' ? '—' : `⭐ ${avgRating}`, color: '#f59e0b' },
          { label: 'Hoàn thành',     value: history.filter(h => h.trang_thai === 'da_ghep').length, color: '#16a34a' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
          <ClipboardList size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Chưa có lịch sử dạy học.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map(h => <HistoryCard key={h.id} item={h} />)}
        </div>
      )}
    </div>
  );
};

export default TeachingHistory;
