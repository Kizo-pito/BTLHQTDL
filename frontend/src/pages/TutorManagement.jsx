import React, { useState, useEffect } from 'react';
import { getTutors } from '../services/api';

const TutorManagement = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const data = await getTutors();
        setTutors(data);
      } finally {
        setLoading(false);
      }
    };
    fetchAPI();
  }, []);

  const filtered = tutors.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Bảng Quản lý Gia sư</h2>
      <div className="card">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Tìm theo tên..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ marginBottom: '1rem', maxWidth: '300px' }}
        />
        
        {loading ? <p>Đang tải dữ liệu từ API...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã GS</th>
                <th>Họ và Tên</th>
                <th>Trường Đại Học</th>
                <th>Khu vực dạy</th>
                <th>Học phí (đề xuất)</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{fontWeight: '500'}}>{t.ma_gia_su}</td>
                  <td>{t.name}</td>
                  <td>{t.school}</td>
                  <td>{t.area}</td>
                  <td style={{color: 'var(--primary)', fontWeight: '600'}}>{t.fee?.toLocaleString()}đ</td>
                  <td><span className={`badge ${t.status === 'Hoạt động' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TutorManagement;
