import React from 'react';
import { Users, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div className="card-title">
        <h1>Tổng quan hệ thống</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Chào mừng bạn đến với Hệ thống Quản lý Gia sư - Học sinh.
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Tổng số Gia sư</h3>
            <p>1,245</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><BookOpen size={24} /></div>
          <div className="stat-info">
            <h3>Tổng số Câu hỏi/Lớp</h3>
            <p>3,820</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#D1FAE5', color: '#059669'}}><CheckCircle size={24} /></div>
          <div className="stat-info">
            <h3>Lớp đã ghép</h3>
            <p>845</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#FEF3C7', color: '#D97706'}}><TrendingUp size={24} /></div>
          <div className="stat-info">
            <h3>Tỉ lệ đánh giá Tốt</h3>
            <p>94%</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Lối tắt</h2>
        <div style={{display: 'flex', gap: '1rem'}}>
            <Link to="/tutors" className="btn btn-primary">Xem danh sách Gia sư</Link>
            <Link to="/students" className="btn" style={{background: '#EEF2FF', color: 'var(--primary)'}}>Xem nhu cầu Học sinh</Link>
            <Link to="/statistics" className="btn" style={{background: '#F3F4F6', color: 'var(--text)'}}>Báo cáo Thống kê</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
