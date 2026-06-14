import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, MapPin, BookOpen, Calendar, History, DollarSign, Star, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const MODE_LABEL = {
  online:    '🌐 Online',
  truc_tiep: '🏠 Trực tiếp',
  ca_hai:    '🔀 Cả hai',
};

// ── Trạng thái buổi học thử ────────────────────────────────────────────────────
const THU_CONFIG = {
  chua_bat_dau: { label: 'Chưa diễn ra',    cls: 'badge-gray',  icon: <Clock size={12} /> },
  dang_hoc:     { label: 'Đang học thử',     cls: 'badge-amber', icon: <AlertCircle size={12} /> },
  hoan_thanh:   { label: 'Đã hoàn thành',    cls: 'badge-green', icon: <CheckCircle2 size={12} /> },
  khong_tiep:   { label: 'Không tiếp tục',   cls: 'badge-red',   icon: null },
};

// ── Star rating hiển thị ──────────────────────────────────────────────────────
const Stars = ({ value, size = 14 }) => {
  if (!value) return <span style={{ color: 'var(--gray-300)', fontSize: size }}>Chưa đánh giá</span>;
  const full = Math.floor(value);
  return (
    <span style={{ fontSize: size }}>
      <span style={{ color: '#f59e0b' }}>{'★'.repeat(full)}</span>
      <span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - full)}</span>
      <span style={{ marginLeft: 5, fontWeight: 700, color: '#f59e0b', fontSize: size - 1 }}>{value.toFixed(1)}</span>
    </span>
  );
};

// ── Star rating input ──────────────────────────────────────────────────────────
const StarInput = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1,2,3,4,5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: n <= value ? '#f59e0b' : '#e2e8f0', padding: 0, lineHeight: 1 }}
      >★</button>
    ))}
  </div>
);

// ── Panel đánh giá / xác nhận sau buổi thử ───────────────────────────────────
const TrialPanel = ({ match, onConfirm }) => {
  const thu = THU_CONFIG[match.trang_thai_buoi_thu] ?? THU_CONFIG.chua_bat_dau;

  if (!match.co_buoi_thu) return (
    <div style={{ padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 10, fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 8, alignItems: 'center' }}>
      <Clock size={14} /> Chưa có buổi học thử — liên hệ gia sư để sắp xếp.
    </div>
  );

  if (match.trang_thai_buoi_thu === 'hoan_thanh' && match.da_xac_nhan_tiep_tuc) return (
    <div style={{ padding: '12px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, fontSize: 13, color: '#15803d', display: 'flex', gap: 8, alignItems: 'center' }}>
      <CheckCircle2 size={14} /> Đã xác nhận tiếp tục học sau buổi thử <strong>{match.ngay_buoi_thu}</strong>.
    </div>
  );

  if (match.trang_thai_buoi_thu === 'hoan_thanh' && !match.da_xac_nhan_tiep_tuc) {
    return <ConfirmAfterTrial match={match} onConfirm={onConfirm} />;
  }

  return (
    <div style={{ padding: '12px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
      <span className={`badge ${thu.cls}`} style={{ fontSize: 11 }}>{thu.icon} {thu.label}</span>
      <span style={{ color: 'var(--gray-600)' }}>
        Buổi học thử: <strong>{match.ngay_buoi_thu ?? 'Chưa có lịch'}</strong>
      </span>
    </div>
  );
};

const ConfirmAfterTrial = ({ match, onConfirm }) => {
  const [stars,   setStars]   = useState(0);
  const [comment, setComment] = useState('');
  const [done,    setDone]    = useState(false);

  if (done) return (
    <div style={{ padding: '12px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, fontSize: 13, color: '#15803d' }}>
      <CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
      Đã ghi nhận đánh giá. Hệ thống sẽ cập nhật trạng thái.
    </div>
  );

  return (
    <div style={{ padding: '14px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>
        📋 Buổi học thử đã hoàn thành — hãy đánh giá để xác nhận tiếp tục
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>Gia sư có phù hợp với trình độ của bạn không?</div>
        <StarInput value={stars} onChange={setStars} />
      </div>

      <textarea
        placeholder="Nhận xét về phương pháp dạy, sự phù hợp với trình độ của bạn..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13, minHeight: 70, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-primary btn-sm"
          disabled={stars === 0}
          onClick={() => { onConfirm(match.id, true, stars, comment); setDone(true); }}
          style={{ gap: 6 }}
        >
          <CheckCircle2 size={13} /> Tiếp tục học
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { onConfirm(match.id, false, stars, comment); setDone(true); }}
          style={{ color: 'var(--gray-400)' }}
        >
          Không tiếp tục
        </button>
      </div>
    </div>
  );
};

// ── Match Card ────────────────────────────────────────────────────────────────
const MatchCard = ({ item, onConfirm }) => {
  const monDay = Array.isArray(item.mon_day) ? item.mon_day : [];

  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Thông tin gia sư ── */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'var(--brand-600)', flexShrink: 0 }}>
          {item.ten_gia_su?.charAt(0) ?? 'G'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--gray-900)' }}>{item.ten_gia_su}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{item.ma_gia_su}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-blue" style={{ fontSize: 11 }}>{item.trinh_do_hoc_van}</span>
            {item.chuyen_nganh && <span className="badge badge-purple" style={{ fontSize: 11 }}>{item.chuyen_nganh}</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Stars value={item.diem_trung_binh_gia_su} />
          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3 }}>Rating gia sư</div>
        </div>
      </div>

      {/* ── Grid thông tin chi tiết ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 20px', padding: '14px 0', borderTop: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-100)' }}>
        <span style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <GraduationCap size={13} color="var(--gray-400)" /> {item.ten_truong_hoc}
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <MapPin size={13} color="var(--gray-400)" /> {item.ten_khu_vuc}
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <BookOpen size={13} color="var(--gray-400)" /> {item.ten_mon_hoc} · {item.ten_lop_hoc}
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <DollarSign size={13} color="var(--gray-400)" />
          {item.gia_theo_gio ? `${item.gia_theo_gio.toLocaleString('vi-VN')} ₫/giờ` : '—'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Calendar size={13} color="var(--gray-400)" /> Ghép đôi: {item.ngay_ghep}
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: 6, alignItems: 'center' }}>
          {MODE_LABEL[item.hinh_thuc_hoc] ?? item.hinh_thuc_hoc}
          {item.so_buoi_da_day ? <span style={{ color: 'var(--gray-400)' }}>· {item.so_buoi_da_day} buổi đã dạy</span> : null}
        </span>
      </div>

      {/* ── Môn dạy ── */}
      {monDay.length > 0 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--gray-400)', marginRight: 4 }}>Có thể dạy:</span>
          {monDay.map(m => <span key={m} className="badge badge-teal" style={{ fontSize: 11 }}>{m}</span>)}
        </div>
      )}

      {/* ── Buổi học thử ── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Buổi học thử</div>
        <TrialPanel match={item} onConfirm={onConfirm} />
      </div>

      {/* ── Đánh giá của học sinh ── */}
      {item.diem_danh_gia && (
        <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Đánh giá của bạn</div>
          <Stars value={item.diem_danh_gia} size={16} />
          {item.ghi_chu && (
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--gray-600)', fontStyle: 'italic' }}>"{item.ghi_chu}"</div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const MatchHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = user?.lien_ket_id ?? 1;
    fetch(`http://localhost:3001/match_history?hoc_sinh_id=${id}`)
      .then(r => r.json())
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [user]);

  // Xác nhận sau buổi thử: PATCH match_history/:id
  const handleConfirm = async (matchId, tiepTuc, stars, comment) => {
    const payload = {
      da_xac_nhan_tiep_tuc: tiepTuc,
      trang_thai_buoi_thu: tiepTuc ? 'hoan_thanh' : 'khong_tiep',
      diem_danh_gia: stars || undefined,
      ghi_chu: comment || undefined,
      trang_thai: tiepTuc ? 'da_ghep' : 'ket_thuc',
    };
    try {
      await fetch(`http://localhost:3001/match_history/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setHistory(prev => prev.map(h => h.id === matchId ? { ...h, ...payload } : h));
    } catch { /* demo: update local state anyway */ }
  };

  const avgRating = history.filter(h => h.diem_danh_gia).length
    ? (history.reduce((s, h) => s + (h.diem_danh_gia ?? 0), 0) / history.filter(h => h.diem_danh_gia).length).toFixed(1)
    : '—';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Lần ghép đôi',  value: history.length,   color: 'var(--brand-600)' },
          { label: 'Đánh giá TB',   value: avgRating === '—' ? '—' : `⭐ ${avgRating}`, color: '#f59e0b' },
          { label: 'Đang học',      value: history.filter(h => h.trang_thai === 'da_ghep' && h.da_xac_nhan_tiep_tuc).length, color: '#16a34a' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Cơ chế học thử — note */}
      <div style={{ padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 13, color: '#1e40af', lineHeight: 1.7 }}>
        <strong>Cơ chế buổi học thử:</strong> Sau khi ghép đôi, học sinh có 1 buổi học thử miễn phí (hoặc giảm giá).
        Sau buổi thử, học sinh đánh giá mức độ phù hợp (phương pháp dạy, tốc độ, trình độ tương xứng) và quyết định tiếp tục.
        Điểm đánh giá từ buổi thử được tính vào rating tổng của gia sư.
      </div>

      {/* List */}
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
          <History size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Chưa có lịch sử ghép đôi.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {history.map(h => <MatchCard key={h.id} item={h} onConfirm={handleConfirm} />)}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
