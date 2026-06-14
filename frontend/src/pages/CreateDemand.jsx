import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, CheckCircle2 } from 'lucide-react';

const MON_HOC   = ['Toán', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Sinh học', 'Lịch sử', 'Địa lý'];
const LOP_HOC   = ['Lớp 1','Lớp 2','Lớp 3','Lớp 4','Lớp 5','Lớp 6','Lớp 7','Lớp 8','Lớp 9','Lớp 10','Lớp 11','Lớp 12'];
const KHU_VUC   = ['Cầu Giấy','Đống Đa','Thủ Đức','Sơn Trà','Hải Châu','Bình Thạnh','Long Biên','Thanh Xuân','Quận 7','Quận 10'];
const HINH_THUC = [
  { value: 'online',    label: '🌐 Online'    },
  { value: 'truc_tiep', label: '🏠 Trực tiếp' },
  { value: 'ca_hai',    label: '🔀 Cả hai'    },
];

const INIT = {
  ten_mon_hoc: '', ten_lop_hoc: '', ten_khu_vuc: '',
  hinh_thuc_hoc: 'online', ngan_sach_toi_da_gio: '',
  so_buoi_moi_tuan: '2', muc_tieu_hoc_tap: '',
};

const Field = ({ label, required, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
    </label>
    {children}
  </div>
);

const selectStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid var(--gray-200)',
  borderRadius: 10, fontSize: 14, color: 'var(--gray-800)',
  background: 'white', outline: 'none',
};

const inputStyle = { ...selectStyle };

const CreateDemand = () => {
  const { user } = useAuth();
  const [form, setForm]       = useState(INIT);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.ten_mon_hoc)         e.ten_mon_hoc = 'Vui lòng chọn môn học';
    if (!form.ten_lop_hoc)         e.ten_lop_hoc = 'Vui lòng chọn lớp';
    if (!form.ten_khu_vuc)         e.ten_khu_vuc = 'Vui lòng chọn khu vực';
    if (!form.muc_tieu_hoc_tap)    e.muc_tieu_hoc_tap = 'Vui lòng nhập mục tiêu';
    if (!form.ngan_sach_toi_da_gio || Number(form.ngan_sach_toi_da_gio) <= 0)
                                    e.ngan_sach_toi_da_gio = 'Ngân sách phải lớn hơn 0';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    setSubmitting(true);

    // Demo: ghi vào mock json-server
    const payload = {
      ...form,
      hoc_sinh_id: user?.lien_ket_id ?? 1,
      ngan_sach_toi_da_gio: Number(form.ngan_sach_toi_da_gio),
      so_buoi_moi_tuan: Number(form.so_buoi_moi_tuan),
      trang_thai_nhu_cau: 'dang_tim_gia_su',
      ngay_dang: new Date().toISOString().slice(0, 10),
    };

    fetch('http://localhost:3001/my_demands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(() => { setSuccess(true); setForm(INIT); })
      .catch(() => { setSuccess(true); setForm(INIT); }) // demo: always succeed
      .finally(() => setSubmitting(false));
  };

  if (success) return (
    <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
      <CheckCircle2 size={56} color="#16a34a" style={{ marginBottom: 16 }} />
      <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--gray-900)', marginBottom: 8 }}>
        Đã đăng nhu cầu thành công!
      </h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: 24, lineHeight: 1.7 }}>
        Hệ thống sẽ gợi ý gia sư phù hợp. Bạn có thể theo dõi trạng thái ở trang <strong>Trạng thái nhu cầu</strong>.
      </p>
      <button className="btn btn-primary" onClick={() => setSuccess(false)} style={{ gap: 8 }}>
        <PlusCircle size={16} /> Tạo nhu cầu khác
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Môn học" required>
              <select style={selectStyle} value={form.ten_mon_hoc} onChange={e => set('ten_mon_hoc', e.target.value)}>
                <option value="">-- Chọn môn --</option>
                {MON_HOC.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.ten_mon_hoc && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.ten_mon_hoc}</div>}
            </Field>

            <Field label="Lớp" required>
              <select style={selectStyle} value={form.ten_lop_hoc} onChange={e => set('ten_lop_hoc', e.target.value)}>
                <option value="">-- Chọn lớp --</option>
                {LOP_HOC.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.ten_lop_hoc && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.ten_lop_hoc}</div>}
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Khu vực" required>
              <select style={selectStyle} value={form.ten_khu_vuc} onChange={e => set('ten_khu_vuc', e.target.value)}>
                <option value="">-- Chọn khu vực --</option>
                {KHU_VUC.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              {errors.ten_khu_vuc && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.ten_khu_vuc}</div>}
            </Field>

            <Field label="Hình thức học">
              <select style={selectStyle} value={form.hinh_thuc_hoc} onChange={e => set('hinh_thuc_hoc', e.target.value)}>
                {HINH_THUC.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Ngân sách tối đa (₫/giờ)" required>
              <input
                type="number" min="0" step="10000"
                style={inputStyle}
                placeholder="VD: 120000"
                value={form.ngan_sach_toi_da_gio}
                onChange={e => set('ngan_sach_toi_da_gio', e.target.value)}
              />
              {errors.ngan_sach_toi_da_gio && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.ngan_sach_toi_da_gio}</div>}
            </Field>

            <Field label="Số buổi/tuần">
              <select style={selectStyle} value={form.so_buoi_moi_tuan} onChange={e => set('so_buoi_moi_tuan', e.target.value)}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} buổi</option>)}
              </select>
            </Field>
          </div>

          <Field label="Mục tiêu học tập" required>
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="VD: Ôn thi đại học khối A, nâng điểm học kỳ 2..."
              value={form.muc_tieu_hoc_tap}
              onChange={e => set('muc_tieu_hoc_tap', e.target.value)}
            />
            {errors.muc_tieu_hoc_tap && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.muc_tieu_hoc_tap}</div>}
          </Field>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ height: 46, fontSize: 15, fontWeight: 700, marginTop: 4, gap: 8 }}
          >
            {submitting ? 'Đang gửi...' : <><PlusCircle size={16} /> Đăng nhu cầu</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDemand;
