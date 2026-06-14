import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, MapPin, BookOpen, DollarSign, Edit3, X, Save } from 'lucide-react';

const KHU_VUC_LIST = ['Cầu Giấy','Đống Đa','Thủ Đức','Sơn Trà','Hải Châu','Bình Thạnh','Long Biên','Thanh Xuân','Quận 7','Quận 10'];
const MON_LIST     = ['Toán','Tiếng Anh','Vật lý','Hóa học','Ngữ văn','Sinh học','Lịch sử','Địa lý','Tin học'];

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
    <span style={{ color: 'var(--gray-400)', marginTop: 2, flexShrink: 0 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>{value || '—'}</div>
    </div>
  </div>
);

const inputSt = {
  width: '100%', padding: '9px 12px',
  border: '1px solid var(--gray-200)', borderRadius: 10,
  fontSize: 14, color: 'var(--gray-800)',
  background: 'white', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [draft,   setDraft]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [toast,   setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const id = user?.lien_ket_id ?? 1;
    fetch(`http://localhost:3001/tutor_profile/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setProfile(data); setDraft(data); })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [user]);

  const set = (k, v) => setDraft(p => ({ ...p, [k]: v }));

  const toggleMon = (mon) => {
    const cur = Array.isArray(draft.mon_day) ? draft.mon_day : [];
    setDraft(p => ({
      ...p,
      mon_day: cur.includes(mon) ? cur.filter(m => m !== mon) : [...cur, mon],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const id = profile.id;
      const body = { ...draft, gia_theo_gio: Number(draft.gia_theo_gio) };
      const res = await fetch(`http://localhost:3001/tutor_profile/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProfile(updated);
      setDraft(updated);
      setEditing(false);
      showToast('Đã lưu hồ sơ thành công!');
    } catch {
      showToast('Lỗi khi lưu — json-server có đang chạy không?');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setDraft(profile); setEditing(false); };

  /* ── Loading / Error ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
      <GraduationCap size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
      <p>Không tìm thấy hồ sơ gia sư (id={user?.lien_ket_id}).</p>
    </div>
  );

  const monDay = Array.isArray(profile.mon_day) ? profile.mon_day : [];
  const draftMon = Array.isArray(draft?.mon_day) ? draft.mon_day : [];

  /* ── View mode ── */
  const viewCard = (
    <div className="card" style={{ padding: '2rem' }}>
      {/* Avatar + header */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'var(--brand-600)', flexShrink: 0 }}>
          {profile.ho_ten?.charAt(0) ?? 'G'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--gray-900)', margin: '0 0 8px' }}>{profile.ho_ten}</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-green">✓ Đang hoạt động</span>
            <span className="badge badge-blue">{profile.trinh_do_hoc_van}</span>
            {profile.chuyen_nganh && <span className="badge badge-purple">{profile.chuyen_nganh}</span>}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--gray-50)', borderRadius: 12 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
            ⭐ {profile.diem_trung_binh?.toFixed(1) ?? '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{profile.so_luot_danh_gia ?? 0} đánh giá</div>
        </div>
      </div>

      <hr style={{ margin: '0 0 1.5rem', borderColor: 'var(--gray-100)' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <InfoRow icon={<GraduationCap size={15} />} label="Trường đại học"  value={profile.ten_truong_hoc} />
        <InfoRow icon={<MapPin size={15} />}        label="Khu vực dạy"     value={`${profile.ten_khu_vuc ?? ''}, ${profile.tinh_thanh ?? ''}`} />
        <InfoRow icon={<DollarSign size={15} />}    label="Học phí"          value={`${(profile.gia_theo_gio ?? 0).toLocaleString('vi-VN')} ₫/giờ`} />
        <InfoRow icon={<BookOpen size={15} />}      label="Môn dạy"          value={monDay.join(' · ') || '—'} />
      </div>

      {profile.mo_ta && (
        <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--gray-50)', borderRadius: 10, fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.75, borderLeft: '3px solid var(--brand-300)' }}>
          {profile.mo_ta}
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} style={{ gap: 6 }}>
          <Edit3 size={14} /> Chỉnh sửa hồ sơ
        </button>
      </div>
    </div>
  );

  /* ── Edit mode ── */
  const editCard = (
    <div className="card" style={{ padding: '2rem' }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-800)', marginBottom: 20 }}>Chỉnh sửa hồ sơ</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Họ tên</label>
            <input style={inputSt} value={draft?.ho_ten ?? ''} onChange={e => set('ho_ten', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Trình độ học vấn</label>
            <select style={inputSt} value={draft?.trinh_do_hoc_van ?? ''} onChange={e => set('trinh_do_hoc_van', e.target.value)}>
              {['Đại học','Thạc sĩ','Tiến sĩ','Cao đẳng'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Trường đại học</label>
            <input style={inputSt} value={draft?.ten_truong_hoc ?? ''} onChange={e => set('ten_truong_hoc', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Chuyên ngành</label>
            <input style={inputSt} value={draft?.chuyen_nganh ?? ''} onChange={e => set('chuyen_nganh', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Khu vực dạy</label>
            <select style={inputSt} value={draft?.ten_khu_vuc ?? ''} onChange={e => set('ten_khu_vuc', e.target.value)}>
              {KHU_VUC_LIST.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Học phí (₫/giờ)</label>
            <input type="number" min="0" step="10000" style={inputSt} value={draft?.gia_theo_gio ?? ''} onChange={e => set('gia_theo_gio', e.target.value)} />
          </div>
        </div>

        {/* Môn dạy checkboxes */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>Môn dạy</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MON_LIST.map(mon => {
              const checked = draftMon.includes(mon);
              return (
                <button
                  key={mon}
                  type="button"
                  onClick={() => toggleMon(mon)}
                  className={`badge ${checked ? 'badge-blue' : 'badge-gray'}`}
                  style={{ cursor: 'pointer', border: checked ? '1px solid var(--brand-300)' : '1px solid var(--gray-200)', fontSize: 13, padding: '5px 12px' }}
                >
                  {checked ? '✓ ' : ''}{mon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Mô tả bản thân</label>
          <textarea
            style={{ ...inputSt, minHeight: 90, resize: 'vertical' }}
            value={draft?.mo_ta ?? ''}
            onChange={e => set('mo_ta', e.target.value)}
            placeholder="Kinh nghiệm, phương pháp dạy..."
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleCancel} style={{ gap: 6 }}>
            <X size={14} /> Hủy
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving} style={{ gap: 6 }}>
            <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {toast && (
        <div style={{ padding: '12px 16px', background: toast.startsWith('Lỗi') ? '#fef2f2' : '#dcfce7', border: `1px solid ${toast.startsWith('Lỗi') ? '#fecdd3' : '#86efac'}`, borderRadius: 10, color: toast.startsWith('Lỗi') ? '#be123c' : '#15803d', fontSize: 14 }}>
          {toast.startsWith('Lỗi') ? '✗ ' : '✓ '}{toast}
        </div>
      )}
      {editing ? editCard : viewCard}
    </div>
  );
};

export default MyProfile;
