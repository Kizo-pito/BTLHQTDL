import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { initialTutors } from '../data/mockDB';
import { ArrowLeft, MapPin, GraduationCap, Briefcase, DollarSign, Mail, Phone, CheckCircle, Star } from 'lucide-react';

const TutorProfile = () => {
  const { id } = useParams();
  const tutor = initialTutors.find(t => t.id === id);

  if (!tutor) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Không tìm thấy Gia sư</h2>
        <Link to="/admin/tutors" className="btn btn-primary" style={{ marginTop: '1rem' }}>Quay lại</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/admin/tutors" className="btn" style={{ border: '1px solid var(--border)', padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="card-title" style={{marginBottom: 0}}>Hồ sơ Gia sư</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left column - Avatar and Contact */}
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {tutor.name.charAt(0)}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{tutor.name}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Mã: {tutor.ma_gia_su}</p>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <span className={`badge ${tutor.status === 'Hoạt động' ? 'badge-success' : 'badge-warning'}`}>
                {tutor.status}
              </span>
              <span className="badge badge-primary">
                {tutor.degree}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
              <Mail size={18} /> <span style={{ color: 'var(--text)' }}>{tutor.email || 'Chưa cập nhật'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
              <Phone size={18} /> <span style={{ color: 'var(--text)' }}>{tutor.phone || 'Chưa cập nhật'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
              <MapPin size={18} /> <span style={{ color: 'var(--text)' }}>Khu vực: {tutor.area}</span>
            </div>
          </div>
        </div>

        {/* Right column - Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} style={{ color: 'var(--primary)' }} /> Thông tin Học vấn & Kinh nghiệm
            </h3>
            <div className="stat-grid">
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Năm sinh</p>
                <p style={{ fontWeight: '500' }}>{tutor.year} ({tutor.gender})</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Trường Đại học</p>
                <p style={{ fontWeight: '500' }}>{tutor.school}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Học vị</p>
                <p style={{ fontWeight: '500' }}>{tutor.degree}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Kinh nghiệm</p>
                <p style={{ fontWeight: '500' }}>{tutor.exp} năm</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} style={{ color: 'var(--primary)' }} /> Năng lực Giảng dạy
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Môn có thể dạy</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {tutor.subjects.map(s => (
                  <span key={s} className="badge" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {s}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Khối lớp</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {tutor.grades.map(g => (
                  <span key={g} className="badge" style={{ backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Học phí trung bình đề xuất</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>
                <DollarSign size={24} />
                {tutor.fee.toLocaleString()} đ/h
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               Đánh giá từ Học sinh
            </h3>
            <div style={{ backgroundColor: '#FFFBEB', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #FEF3C7', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F59E0B' }}>4.8</div>
              <div>
                <div style={{ display: 'flex', color: '#F59E0B', gap: '2px', marginBottom: '4px' }}>
                  <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="#D1D5DB" size={20} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Dựa trên 12 đánh giá</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;
