import React, { useState, useEffect } from 'react';
import { getStudents } from '../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const data = await getStudents();
        setStudents(data);
      } finally {
        setLoading(false);
      }
    };
    fetchAPI();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Bảng Quản lý Nhu cầu Học sinh</h2>
      <div className="card">
        {loading ? <p>Đang tải dữ liệu từ API...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã Nhu Cầu</th>
                <th>Tên Học sinh</th>
                <th>Lớp - Môn</th>
                <th>Ngân sách</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td style={{fontWeight: '500'}}>{s.ma_nhu_cau}</td>
                  <td>{s.studentName}</td>
                  <td>{s.grade} - {s.subject}</td>
                  <td style={{color: 'var(--primary)', fontWeight: '600'}}>{s.budget?.toLocaleString()}đ</td>
                  <td><span className={`badge ${s.status === 'Đã ghép' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
