import React, { useEffect, useState } from 'react';
import {
  getStudents, getFilters, getCatalogLopHoc,
  findMatchingTutors, confirmMatch, getMatchLog
} from '../services/api';
import {
  Search, Zap, Star, MapPin, GraduationCap, CheckCircle,
  Clock, Wallet, BookOpen, ArrowRight, History, AlertCircle,
  ChevronLeft, Layers
} from 'lucide-react';

// ─── Star rating mini ───────────────────────────────────────────
const Stars = ({ score }) => {
  const s = parseFloat(score) || 0;
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} color={i <= Math.round(s) ? '#fbbf24' : '#e2e8f0'} fill={i <= Math.round(s) ? '#fbbf24' : 'none'} />
      ))}
      <span style={{ fontSize: 11, color: 'var(--gray-500)', marginLeft: 3 }}>{s > 0 ? s.toFixed(1) : 'Chưa có'}</span>
    </span>
  );
};

// ─── Score bar ─────────────────────────────────────────────────
const ScoreBar = ({ score }) => {
  const pct = Math.min(100, Math.round((score / 100) * 100));
  const color = score >= 70 ? 'var(--success-500)' : score >= 40 ? 'var(--warning-500)' : 'var(--gray-300)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--gray-100)', borderRadius: 9999 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 9999, transition: 'width 0.6s var(--ease-out)' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
    </div>
  );
};

// ─── View mode enum ────────────────────────────────────────────
const VIEW = { SELECT_DEMAND: 'select', MATCHING: 'matching', LOG: 'log' };

// ─── Main Component ─────────────────────────────────────────────
const Matching = () => {
  const [view, setView]             = useState(VIEW.SELECT_DEMAND);
  const [demands, setDemands]       = useState([]);
  const [filters, setFilters]       = useState({ khu_vuc: [], mon_hoc: [] });
  const [lopHoc, setLopHoc]         = useState([]);
  const [selectedDemand, setSelected] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [matchLog, setMatchLog]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [matching, setMatching]     = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [toast, setToast]           = useState(null);
  const [filterKV, setFilterKV]     = useState('');
  const [filterMon, setFilterMon]   = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    Promise.all([getStudents({ limit: 30 }), getFilters(), getCatalogLopHoc()])
      .then(([d, f, l]) => {
        setDemands(d.data.data || []);
        setFilters(f.data.data || { khu_vuc: [], mon_hoc: [] });
        setLopHoc(l.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadLog = () => {
    getMatchLog().then(r => setMatchLog(r.data.data || [])).catch(console.error);
    setView(VIEW.LOG);
  };

  const handleSelectDemand = async (demand) => {
    setSelected(demand);
    setMatching(true);
    setCandidates([]);
    setView(VIEW.MATCHING);
    try {
      const res = await findMatchingTutors({
        mon_hoc_id: demand.mon_hoc_id,
        khu_vuc_id: demand.khu_vuc_id,
        hinh_thuc:  demand.hinh_thuc_hoc,
        ngan_sach:  demand.ngan_sach_toi_da_gio,
        top_n: 10
      });
      setCandidates(res.data.data || []);
    } catch (err) {
      showToast('Lỗi khi tìm gia sư: ' + err.message, 'error');
    } finally {
      setMatching(false);
    }
  };

  const handleConfirm = async (candidate) => {
    if (!window.confirm(`Xác nhận ghép gia sư "${candidate.ho_ten}" với nhu cầu này?`)) return;
    setConfirming(candidate.gia_su_id);
    try {
      await confirmMatch({ nhu_cau_id: selectedDemand.id, gia_su_id: candidate.gia_su_id });
      showToast(`✅ Ghép đôi thành công! ${candidate.ho_ten} ↔ Nhu cầu #${selectedDemand.id}`);
      setDemands(prev => prev.filter(d => d.id !== selectedDemand.id));
      setView(VIEW.SELECT_DEMAND);
      setSelected(null);
    } catch (err) {
      showToast('Ghép đôi thất bại: ' + err.message, 'error');
    } finally {
      setConfirming(null);
    }
  };

  const filteredDemands = demands.filter(d =>
    (!filterKV  || d.ten_khu_vuc === filterKV) &&
    (!filterMon || d.ten_mon_hoc  === filterMon)
  );

  // ─── Toast ─────────────────────────────────────────────────────
  const Toast = () => toast && (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      padding: '14px 20px', borderRadius: 12,
      background: toast.type === 'error' ? '#be123c' : '#15803d',
      color: 'white', fontSize: 14, fontWeight: 600,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      animation: 'slideIn 0.3s ease', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 420
    }}>
      {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
      {toast.msg}
    </div>
  );

  // ─── VIEW 1: Chọn nhu cầu ─────────────────────────────────────
  if (view === VIEW.SELECT_DEMAND) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast />
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 17, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={20} color="var(--warning-500)" fill="var(--warning-500)" />
            Chọn nhu cầu để ghép đôi
          </h2>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
            Hệ thống sẽ dùng Stored Procedure để tính điểm phù hợp và đề xuất gia sư tốt nhất.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadLog} style={{ gap: 6 }}>
          <History size={15} /> Lịch sử ghép đôi
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select className="filter-select" value={filterKV} onChange={e => setFilterKV(e.target.value)}>
          <option value="">Tất cả khu vực</option>
          {filters.khu_vuc.map(kv => <option key={kv.ten_khu_vuc} value={kv.ten_khu_vuc}>{kv.ten_khu_vuc}</option>)}
        </select>
        <select className="filter-select" value={filterMon} onChange={e => setFilterMon(e.target.value)}>
          <option value="">Tất cả môn học</option>
          {filters.mon_hoc.map(m => <option key={m.ten_mon_hoc} value={m.ten_mon_hoc}>{m.ten_mon_hoc}</option>)}
        </select>
        {(filterKV || filterMon) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterKV(''); setFilterMon(''); }}>
            Xóa lọc
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-400)' }}>
          {filteredDemands.length} nhu cầu đang mở
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '1rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />)}
        </div>
      ) : filteredDemands.length === 0 ? (
        <div className="empty-state">
          <Zap size={48} className="empty-state-icon" />
          <h3>Không có nhu cầu nào phù hợp</h3>
          <p>Tất cả nhu cầu đã được ghép đôi hoặc chưa có dữ liệu.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '1rem' }}>
          {filteredDemands.map(d => (
            <div key={d.id} className="card card-hover" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', borderLeft: '4px solid var(--warning-400)' }}
              onClick={() => handleSelectDemand(d)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <span className="badge badge-amber" style={{ marginBottom: 6 }}>
                    <BookOpen size={12} /> {d.ten_mon_hoc}
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>
                    {d.ten_hoc_sinh || 'Học sinh ẩn danh'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{d.ten_lop_hoc} · {d.cap_hoc}</div>
                </div>
                <ArrowRight size={18} color="var(--gray-300)" />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'var(--gray-500)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} />{d.ten_khu_vuc}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Wallet size={13} />
                  {d.ngan_sach_toi_da_gio ? `≤ ${d.ngan_sach_toi_da_gio.toLocaleString('vi-VN')}đ/h` : 'Thỏa thuận'}
                </span>
                {d.so_buoi_moi_tuan && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} />{d.so_buoi_moi_tuan} buổi/tuần</span>}
              </div>
              <div style={{ fontSize: 12, padding: '6px 10px', background: 'var(--warning-50)', borderRadius: 8, color: 'var(--warning-600)', fontWeight: 600 }}>
                Click để tìm gia sư phù hợp →
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  );

  // ─── VIEW 2: Kết quả ghép đôi ─────────────────────────────────
  if (view === VIEW.MATCHING) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast />
      <button className="btn btn-ghost btn-sm" onClick={() => setView(VIEW.SELECT_DEMAND)} style={{ width: 'fit-content', gap: 6 }}>
        <ChevronLeft size={16} /> Quay lại
      </button>

      {/* Demand Info Card */}
      <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning-500)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Nhu cầu đang xử lý · #{selectedDemand?.id}
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--gray-900)', marginBottom: 4 }}>
            {selectedDemand?.ten_hoc_sinh || 'Học sinh ẩn danh'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span className="badge badge-amber"><BookOpen size={12} />{selectedDemand?.ten_mon_hoc}</span>
            <span className="badge badge-purple"><Layers size={12} />{selectedDemand?.ten_lop_hoc}</span>
            <span className="badge badge-gray"><MapPin size={12} />{selectedDemand?.ten_khu_vuc}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
          {[
            ['Ngân sách', selectedDemand?.ngan_sach_toi_da_gio ? `≤ ${selectedDemand.ngan_sach_toi_da_gio.toLocaleString('vi-VN')}đ/h` : 'Thỏa thuận'],
            ['Hình thức', selectedDemand?.hinh_thuc_hoc || 'Chưa rõ'],
            ['Số buổi/tuần', selectedDemand?.so_buoi_moi_tuan ? `${selectedDemand.so_buoi_moi_tuan} buổi` : 'Linh hoạt'],
            ['Mục tiêu', selectedDemand?.muc_tieu_hoc_tap || '—'],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidates */}
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={18} color="var(--brand-600)" />
          {matching ? 'Đang phân tích bằng Stored Procedure...' : `${candidates.length} gia sư phù hợp được đề xuất`}
        </h3>

        {matching ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 12 }} />)}
          </div>
        ) : candidates.length === 0 ? (
          <div className="empty-state">
            <Search size={40} className="empty-state-icon" />
            <h3>Không tìm thấy gia sư phù hợp</h3>
            <p>Không có gia sư nào dạy môn này trong khu vực và mức học phí phù hợp.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {candidates.map((c, i) => (
              <div key={c.gia_su_id} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', border: i === 0 ? '2px solid var(--brand-400)' : '1px solid var(--gray-200)' }}>
                {/* Rank badge */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : i === 1 ? '#d1d5db' : '#e7d5b3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i < 2 ? 'white' : '#6b4c1b', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  {i + 1}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gray-900)' }}>{c.ho_ten}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{c.hoc_vi} · {c.chuyen_nganh}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}><MapPin size={12} style={{ display: 'inline' }} /> {c.ten_khu_vuc}</div>
                </div>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', minWidth: 200 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>Rating</div>
                    <Stars score={c.diem_trung_binh} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>Kinh nghiệm</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nam_kinh_nghiem ?? '—'} năm</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>Học phí môn này</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success-600)' }}>
                      {c.hoc_phi_mon_nay ? `${c.hoc_phi_mon_nay.toLocaleString('vi-VN')}đ/h` : 'Thỏa thuận'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 2 }}>Điểm phù hợp</div>
                    <ScoreBar score={c.diem_phu_hop} />
                  </div>
                </div>
                {/* Action */}
                <button
                  className="btn btn-primary btn-sm"
                  disabled={confirming === c.gia_su_id}
                  onClick={() => handleConfirm(c)}
                  style={{ flexShrink: 0, gap: 6 }}
                >
                  {confirming === c.gia_su_id ? (
                    <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Đang ghép...</>
                  ) : (
                    <><CheckCircle size={15} /> Ghép đôi</>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideIn { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  );

  // ─── VIEW 3: Lịch sử ghép đôi (từ Trigger audit log) ──────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setView(VIEW.SELECT_DEMAND)} style={{ gap: 6 }}>
          <ChevronLeft size={16} /> Quay lại
        </button>
        <h2 style={{ fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={18} color="var(--purple-500)" /> Lịch sử ghép đôi
        </h2>
        <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>— Ghi nhận tự động bởi Trigger SQL</span>
      </div>

      {matchLog.length === 0 ? (
        <div className="empty-state">
          <History size={40} className="empty-state-icon" />
          <h3>Chưa có lịch sử ghép đôi</h3>
          <p>Hãy thực hiện ghép đôi gia sư – học sinh để dữ liệu xuất hiện ở đây.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-100)' }}>
                {['#Log', 'Nhu cầu', 'Môn học', 'Lớp', 'Khu vực', 'Trạng thái cũ', 'Trạng thái mới', 'Thời gian'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matchLog.map((log, i) => (
                <tr key={log.log_id} style={{ borderBottom: '1px solid var(--gray-100)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--gray-400)' }}>#{log.log_id}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>#{log.nhu_cau_id}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13 }}>{log.ten_mon_hoc}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13 }}>{log.ten_lop_hoc}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13 }}>{log.ten_khu_vuc}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span className="badge badge-amber">{log.trang_thai_cu}</span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span className="badge badge-green">{log.trang_thai_moi}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                    {new Date(log.thoi_gian).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Matching;
