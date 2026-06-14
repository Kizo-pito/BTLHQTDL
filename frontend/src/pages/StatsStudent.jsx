import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getStatsSubjectsDemand, getStatsTopRating } from '../services/api';
import { BookOpen, Star, TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const PALETTE_WARM = ['#f59e0b','#ef4444','#f97316','#eab308','#84cc16','#10b981','#06b6d4','#8b5cf6','#ec4899','#6366f1'];

const barOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    datalabels: {
      color: '#fff',
      font: { family: "'Be Vietnam Pro'", weight: 'bold', size: 12 },
      formatter: (value) => value > 0 ? value.toLocaleString('vi-VN') : '',
    },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.92)', padding: 12, cornerRadius: 10,
      titleFont: { family: "'Be Vietnam Pro'", size: 13, weight: 'bold' },
      bodyFont:  { family: "'Be Vietnam Pro'", size: 13 },
      callbacks: { label: ctx => ` ${ctx.parsed.y?.toLocaleString('vi-VN')} nhu cầu` }
    }
  },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { family: "'Be Vietnam Pro'" }, color: '#94a3b8', padding: 8 } },
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: "'Be Vietnam Pro'" }, color: '#64748b', maxRotation: 30 } }
  }
};

const ratingBarOptions = {
  ...barOptions,
  indexAxis: 'y',
  scales: {
    x: { beginAtZero: true, max: 5, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { callback: v => `${v}⭐`, font: { family: "'Be Vietnam Pro'" }, color: '#94a3b8' } },
    y: { grid: { display: false }, border: { display: false }, ticks: { font: { family: "'Be Vietnam Pro'", size: 12 }, color: '#334155' } }
  },
  plugins: {
    ...barOptions.plugins,
    datalabels: {
      color: '#1e293b',
      font: { family: "'Be Vietnam Pro'", weight: 'bold', size: 12 },
      formatter: (value) => parseFloat(value).toFixed(2),
      anchor: 'end',
      align: 'start'
    },
    tooltip: { ...barOptions.plugins.tooltip, callbacks: { label: ctx => ` Điểm TB: ${ctx.parsed.x?.toFixed(2)} (${ctx.dataset.luot?.[ctx.dataIndex] || 0} lượt đánh giá)` } }
  }
};

const LoadingChart = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
    <div style={{ width: 32, height: 32, border: '3px solid var(--gray-100)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Đang phân tích dữ liệu...</span>
  </div>
);

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
    <div style={{ height }}>{children}</div>
  </div>
);

const StatsStudent = () => {
  const [subjectData, setSubjectData] = useState(null);
  const [ratingData,  setRatingData]  = useState(null);
  const [ratingRaw,   setRatingRaw]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getStatsSubjectsDemand(), getStatsTopRating()])
      .then(([subR, ratR]) => {
        // Subjects — bar
        setSubjectData({
          labels: subR.data.data.map(d => d.label),
          datasets: [{
            label: 'Nhu cầu', data: subR.data.data.map(d => d.count),
            backgroundColor: '#f59e0b', hoverBackgroundColor: '#d97706',
            borderRadius: { topLeft: 6, topRight: 6 }, borderSkipped: false,
          }]
        });

        // Rating — horizontal bar
        const raw = ratR.data.data;
        setRatingRaw(raw);
        setRatingData({
          labels: raw.map(d => d.label),
          datasets: [{
            label: 'Điểm TB',
            data: raw.map(d => parseFloat(d.count)),
            luot: raw.map(d => d.so_luot),
            backgroundColor: raw.map((_, i) => PALETTE_WARM[i % PALETTE_WARM.length]),
            hoverOffset: 4,
            borderRadius: 6, borderSkipped: false,
          }]
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="charts-grid">
        <ChartCard icon={BookOpen} iconBg="#fffbeb" iconColor="#d97706"
          title="Môn học được tìm nhiều nhất"
          subtitle="Top 10 môn học có nhu cầu gia sư cao nhất (đang mở)"
          height={320}>
          {loading ? <LoadingChart /> : subjectData && <Bar data={subjectData} options={barOptions} />}
        </ChartCard>

        <ChartCard icon={Star} iconBg="#fff7ed" iconColor="#f97316"
          title="Bảng xếp hạng Gia sư tốt nhất"
          subtitle="Top 10 gia sư có điểm đánh giá bình quân cao nhất"
          height={400}>
          {loading ? <LoadingChart /> : ratingData && (
            <Bar data={ratingData} options={{
              ...ratingBarOptions,
              plugins: {
                ...ratingBarOptions.plugins,
                tooltip: {
                  ...ratingBarOptions.plugins.tooltip,
                  callbacks: {
                    label: ctx => ` Điểm TB: ${ctx.parsed.x?.toFixed(2)}⭐ — ${ratingRaw[ctx.dataIndex]?.so_luot || 0} đánh giá`
                  }
                }
              }
            }} />
          )}
        </ChartCard>
      </div>

      {/* Rating details table */}
      {!loading && ratingRaw.length > 0 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
            <TrendingUp size={18} color="#f97316" />
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Chi tiết Top Gia sư được đánh giá cao</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-100)' }}>
                  {['#', 'Họ tên', 'Điểm TB', 'Lượt đánh giá', 'Khu vực', 'Trường ĐH'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ratingRaw.map((gs, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', width: 40 }}>
                      <span style={{ width: 26, height: 26, borderRadius: '50%', background: i < 3 ? '#fef9c3' : 'var(--gray-100)', color: i < 3 ? '#92400e' : 'var(--gray-500)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14, color: 'var(--gray-900)' }}>{gs.label}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-1">
                        <span style={{ fontWeight: 800, fontSize: 15, color: '#d97706' }}>{parseFloat(gs.count).toFixed(2)}</span>
                        <Star size={14} color="#fbbf24" fill="#fbbf24" />
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--gray-600)' }}>{gs.so_luot || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-500)' }}>{gs.ten_khu_vuc || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-500)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gs.ten_truong_hoc || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default StatsStudent;
