import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getStatsSubjectsDemand, getStatsTopRating } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatsStudent = () => {
    const [subjectData, setSubjectData] = useState(null);
    const [ratingData, setRatingData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getStatsSubjectsDemand(), getStatsTopRating()])
            .then(([subRes, ratRes]) => {
                setSubjectData({
                    labels: subRes.data.map(d => d.label),
                    datasets: [{
                        label: 'Số lượng Nhu cầu',
                        data: subRes.data.map(d => d.count),
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    }]
                });
                setRatingData({
                    labels: ratRes.data.map(d => d.label),
                    datasets: [{
                        label: 'Điểm Đánh giá (TB)',
                        data: ratRes.data.map(d => d.count),
                        backgroundColor: [
                             '#f59e0b', '#f97316', '#fbbf24', '#fcd34d', '#fde68a',
                             '#2563eb', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'
                        ],
                    }]
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Lỗi tải thống kê học sinh:', err);
                setLoading(false);
            });
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Top Môn học & Lớp có nhu cầu cao nhất</h2>
                <div style={{ height: '350px' }}>
                    {loading ? <p>Đang tải dữ liệu...</p> : subjectData && <Bar data={subjectData} options={options} />}
                </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Top Gia sư đạt Rating cao nhất (Xếp hạng)</h2>
                <div style={{ height: '400px', display: 'flex', justifyContent: 'center' }}>
                    {loading ? <p>Đang tải dữ liệu...</p> : ratingData && (
                        <div style={{ width: '100%', maxWidth: '500px' }}>
                             <Doughnut data={ratingData} options={options} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsStudent;
