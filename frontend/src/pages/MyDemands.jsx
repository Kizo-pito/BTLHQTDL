import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, MapPin, Clock, Wallet, ClipboardList } from 'lucide-react';

const STATUS = {
  dang_tim_gia_su: { label: '🔍 Đang tìm gia sư', cls: 'badge-blue'   },
  da_ghep:         { label: '✓ Đã ghép đôi',       cls: 'badge-green'  },
  tam_dung:        { label: '⏸ Tạm dừng',           cls: 'badge-amber'  },
};

const MODE_LABEL = {
  online:    '🌐 Online',
  truc_tiep: '🏠 Trực tiếp',
  ca_hai:    '🔀 Cả hai',
};

const DemandCard = ({ item }) => {
  const st = STATUS[item.trang_thai_nhu_cau] ?? { label: item.trang_thai_nhu_cau, cls: 'badge-gray' };
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-blue" style={{ fontSize: 13, padding: '4px 12px' }}>
            <BookOpen size={12} /> {item.ten_mon_hoc}
          </span>
          <span className="badge badge-purple" style={{ fontSize: 13, padding: '4px 12px' }}>
            {item.ten_lop_hoc}
          </span>
        </div>
        <span className={`badge ${st.cls}`}>{st.label}</span>
      </div>

      {/* Mục tiêu */}
      <div style={{ fontSize: 14, color: 'var(--gray-700)', fontWeight: 600 }}>
        {item.muc_tieu_hoc_tap}
      </div>

      {/* Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
        <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <MapPin size={13} color="var(--gray-400)" /> {item.ten_khu_vuc}
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Clock size={13} color="var(--gray-400)" /> {item.so_buoi_moi_tuan} buổi/tuần
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Wallet size={13} color="var(--gray-400)" />
          Tối đa {(item.ngan_sach_toi_da_gio ?? 0).toLocaleString('vi-VN')} ₫/giờ
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>
          {MODE_LABEL[item.hinh_thuc_hoc] ?? item.hinh_thuc_hoc}
        </span>
      </div>

      <div style={{ fontSize: 12, color: 'var(--gray-400)', borderTop: '1px solid var(--gray-100)', paddingTop: 10 }}>
        Đăng ngày {item.ngay_dang}
      </div>
    </div>
  );
};

const MyDemands = () => {
  const { user } = useAuth();
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = user?.lien_ket_id ?? 1;
    fetch(`http://localhost:3001/my_demands?hoc_sinh_id=${id}`)
      .then(r => r.json())
      .then(setDemands)
      .catch(() => setDemands([]))
      .finally(() => setLoading(false));
  }, [user]);

  const counts = {
    dang_tim: demands.filter(d => d.trang_thai_nhu_cau === 'dang_tim_gia_su').length,
    da_ghep:  demands.filter(d => d.trang_thai_nhu_cau === 'da_ghep').length,
    tam_dung: demands.filter(d => d.trang_thai_nhu_cau === 'tam_dung').length,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Đang tìm gia sư', value: counts.dang_tim, color: 'var(--brand-600)' },
          { label: 'Đã ghép đôi',     value: counts.da_ghep,  color: '#16a34a'          },
          { label: 'Tạm dừng',        value: counts.tam_dung, color: '#d97706'           },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {demands.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
          <ClipboardList size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Chưa có nhu cầu nào. Hãy tạo nhu cầu mới!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {demands.map(d => <DemandCard key={d.id} item={d} />)}
        </div>
      )}
    </div>
  );
};

export default MyDemands;
