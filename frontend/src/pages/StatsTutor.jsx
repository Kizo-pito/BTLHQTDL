import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { getStatsTutorsByArea, getStatsTutorsBySchool } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatsTutor = () => {
    const [areaData, setAreaData] = useState(null);
    const [schoolData, setSchoolData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getStatsTutorsByArea(), getStatsTutorsBySchool()])
            .then(([areaRes, schoolRes]) => {
                setAreaData({
                    labels: areaRes.data.map(d => d.label),
                    datasets: [{
                        label: 'Số lượng Gia sư',
                        data: areaRes.data.map(d => d.count),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    }]
                });
                setSchoolData({
                    labels: schoolRes.data.map(d => d.label),
                    datasets: [{
                        label: 'Số lượng Gia sư',
                        data: schoolRes.data.map(d => d.count),
                        backgroundColor: [
                            '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
                            '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'
                        ],
                    }]
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Lỗi tải thống kê gia sư:', err);
                setLoading(false);
            });
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
        },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Top Khu vực nhiều Gia sư nhất</h2>
                <div style={{ height: '350px' }}>
                    {loading ? <p>Đang tải dữ liệu...</p> : areaData && <Bar data={areaData} options={options} />}
                </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Top Trường Đại học (Xếp theo Kho dữ liệu)</h2>
                <div style={{ height: '400px', display: 'flex', justifyContent: 'center' }}>
                    {loading ? <p>Đang tải dữ liệu...</p> : schoolData && (
                        <div style={{ width: '100%', maxWidth: '500px' }}>
                             <Pie data={schoolData} options={options} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsTutor;
