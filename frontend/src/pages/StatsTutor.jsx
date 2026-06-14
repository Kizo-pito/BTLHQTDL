import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getStatsTutorsByArea, getStatsTutorsBySchool, getStatsTeachingMode, getStatsDegreeDistrib } from '../services/api';
import { MapPin, GraduationCap, Wifi, BookOpen } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const PALETTE = ['#2563eb','#16a34a','#d97706','#9333ea','#0891b2','#e11d48','#7c3aed','#059669','#b45309','#0284c7'];

const chartDefaults = {
  plugins: {
    legend: { display: false },
    datalabels: {
      color: '#fff',
      font: { family: "'Be Vietnam Pro', sans-serif", weight: 'bold', size: 12 },
      formatter: (value) => value > 0 ? value.toLocaleString('vi-VN') : '',
    },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.92)',
      padding: 12, cornerRadius: 10, titleSpacing: 6,
      titleFont: { family: "'Be Vietnam Pro', sans-serif", size: 13, weight: 'bold' },
      bodyFont:  { family: "'Be Vietnam Pro', sans-serif", size: 13 },
      callbacks: {
        label: ctx => ` ${ctx.parsed.y?.toLocaleString('vi-VN') ?? ctx.parsed} gia sư`
      }
    }
  },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { family: "'Be Vietnam Pro'" }, color: '#94a3b8', padding: 8 } },
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: "'Be Vietnam Pro'" }, color: '#64748b', maxRotation: 30 } }
  },
  responsive: true, maintainAspectRatio: false,
};

const doughnutDefaults = {
  responsive: true, maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: { position: 'right', labels: { font: { family: "'Be Vietnam Pro'", size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 10 } },
    datalabels: {
      color: '#fff',
      font: { family: "'Be Vietnam Pro', sans-serif", weight: 'bold', size: 12 },
      formatter: (value, context) => {
        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        if (!total || value === 0) return '';
        return Math.round((value / total) * 100) + '%';
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.92)',
      padding: 12, cornerRadius: 10,
      titleFont: { family: "'Be Vietnam Pro'", size: 13, weight: 'bold' },
      bodyFont:  { family: "'Be Vietnam Pro'", size: 13 },
    }
  }
};

const ChartCard = ({ icon: Icon, iconBg, iconColor, title, subtitle, children, height = 300 }) => (
  <div className="card chart-card">
    <div className="chart-header">
      <div className="chart-icon" style={{ background: iconBg }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <div className="chart-title">{title}</div>
        {subtitle && <div className="chart-subtitle">{subtitle}</div>}
      </div>
    </div>
    <div style={{ height }}>
      {children}
    </div>
  </div>
);

const LoadingChart = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-300)', flexDirection: 'column', gap: 12 }}>
    <div style={{ width: 32, height: 32, border: '3px solid var(--gray-100)', borderTopColor: 'var(--brand-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Đang phân tích dữ liệu...</span>
  </div>
);

const StatsTutor = () => {
  const [areaData,   setAreaData]   = useState(null);
  const [schoolData, setSchoolData] = useState(null);
  const [modeData,   setModeData]   = useState(null);
  const [degreeData, setDegreeData] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      getStatsTutorsByArea(),
      getStatsTutorsBySchool(),
      getStatsTeachingMode(),
      getStatsDegreeDistrib(),
    ])
      .then(([areaR, schoolR, modeR, degR]) => {
        // Area — bar chart
        setAreaData({
          labels: areaR.data.data.map(d => d.label),
          datasets: [{
            label: 'Gia sư', data: areaR.data.data.map(d => d.count),
            backgroundColor: '#2563eb', hoverBackgroundColor: '#1d4ed8',
            borderRadius: { topLeft: 6, topRight: 6 }, borderSkipped: false,
          }]
        });

        // School — doughnut
        setSchoolData({
          labels: schoolR.data.data.map(d => d.label),
          datasets: [{
            data: schoolR.data.data.map(d => d.count),
            backgroundColor: PALETTE, hoverOffset: 8, borderWidth: 3, borderColor: '#fff',
          }]
        });

        // Mode — doughnut
        const modeLabels = { online: '🌐 Online', truc_tiep: '🏠 Trực tiếp', ca_hai: '🔀 Cả hai' };
        setModeData({
          labels: modeR.data.data.map(d => modeLabels[d.label] || d.label),
          datasets: [{
            data: modeR.data.data.map(d => d.count),
            backgroundColor: ['#0891b2', '#d97706', '#9333ea'],
            hoverOffset: 8, borderWidth: 3, borderColor: '#fff',
          }]
        });

        // Degree — horizontal bar
        setDegreeData({
          labels: degR.data.data.map(d => d.label),
          datasets: [{
            label: 'Gia sư', data: degR.data.data.map(d => d.count),
            backgroundColor: '#16a34a', hoverBackgroundColor: '#15803d',
            borderRadius: { topLeft: 6, topRight: 6 }, borderSkipped: false,
          }]
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="charts-grid">
        <ChartCard icon={MapPin} iconBg="#eff6ff" iconColor="#2563eb"
          title="Phân bổ theo Khu vực"
          subtitle="Top 10 khu vực có nhiều gia sư đang hoạt động nhất"
          height={300}>
          {loading ? <LoadingChart /> : areaData && <Bar data={areaData} options={chartDefaults} />}
        </ChartCard>

        <ChartCard icon={GraduationCap} iconBg="#f0fdf4" iconColor="#16a34a"
          title="Phân bổ theo Học vị"
          subtitle="Tỉ lệ các cấp bậc học vị của gia sư"
          height={300}>
          {loading ? <LoadingChart /> : degreeData && <Bar data={degreeData} options={chartDefaults} />}
        </ChartCard>

        <ChartCard icon={BookOpen} iconBg="#faf5ff" iconColor="#9333ea"
          title="Nguồn trường Đại học"
          subtitle="Top 10 trường ĐH có nhiều gia sư đang hoạt động"
          height={320}>
          {loading ? <LoadingChart /> : schoolData && (
            <Doughnut data={schoolData} options={{ ...doughnutDefaults,
              plugins: { ...doughnutDefaults.plugins, tooltip: { ...doughnutDefaults.plugins.tooltip, callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} gia sư` } } }
            }} />
          )}
        </ChartCard>

        <ChartCard icon={Wifi} iconBg="#f0fdfa" iconColor="#0891b2"
          title="Hình thức dạy học"
          subtitle="Phân bổ online / trực tiếp / cả hai"
          height={320}>
          {loading ? <LoadingChart /> : modeData && (
            <Doughnut data={modeData} options={{ ...doughnutDefaults,
              plugins: { ...doughnutDefaults.plugins, tooltip: { ...doughnutDefaults.plugins.tooltip, callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} gia sư` } } }
            }} />
          )}
        </ChartCard>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default StatsTutor;
