import React, { useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Statistics = () => {
  const [tab, setTab] = useState('tutor');

  // Dữ liệu giả lập mô phỏng theo SQL query
  const tutorBarData = {
    labels: ['Cầu Giấy', 'Đống Đa', 'Thủ Đức', 'Hải Châu'],
    datasets: [{
      label: 'Số lượng Gia sư',
      data: [120, 85, 40, 20],
      backgroundColor: '#4F46E5',
    }]
  };

  const studentPieData = {
    labels: ['Toán', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Ngữ văn'],
    datasets: [{
      data: [300, 250, 150, 100, 80],
      backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    }]
  };

  return (
    <div>
      <h1 className="card-title">Báo cáo Thống kê</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <button 
          className={`btn ${tab === 'tutor' ? 'btn-primary' : ''}`} 
          style={tab !== 'tutor' ? {background: '#F3F4F6', color: 'var(--text)'} : {}}
          onClick={() => setTab('tutor')}
        >
          Thống kê Gia sư
        </button>
        <button 
          className={`btn ${tab === 'student' ? 'btn-primary' : ''}`} 
          style={tab !== 'student' ? {background: '#F3F4F6', color: 'var(--text)'} : {}}
          onClick={() => setTab('student')}
        >
          Thống kê Nhu cầu Học tập
        </button>
      </div>

      {tab === 'tutor' ? (
        <div className="stat-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card">
            <h3 className="card-title">Top Khu vực có nhiều Gia sư hoạt động nhất</h3>
            <div className="chart-container">
              <Bar 
                data={tutorBarData} 
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="stat-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card">
            <h3 className="card-title">Cơ cấu nhu cầu tìm gia sư theo Môn học</h3>
            <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '400px' }}>
                <Pie 
                  data={studentPieData} 
                  options={{ responsive: true, maintainAspectRatio: false }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
