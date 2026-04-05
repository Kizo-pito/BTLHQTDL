import React from 'react';
import { Database, Users, GraduationCap, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
    const { isAuthenticated } = useAuth();

    const stats = [
        { label: 'Gia sư hệ thống', value: '58,000+', icon: <Users color="#2563eb" />, color: '#eff6ff' },
        { label: 'Nhu cầu học tập', value: '12,500+', icon: <GraduationCap color="#10b981" />, color: '#f0fdf4' },
        { label: 'Khu vực kết nối', value: '24 Quận/Huyện', icon: <Database color="#f59e0b" />, color: '#fff7ed' }
    ];

    return (
        <div style={{ padding: '1rem' }}>
            {/* Hero Section */}
            <header style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem', 
                background: 'white', 
                borderRadius: '24px', 
                marginBottom: '3rem',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '1.5rem' }}>
                    <ShieldCheck size={16} color="#10b981" /> Hệ thống đã được bảo mật & Làm sạch dữ liệu
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '1.5rem', color: '#0f172a' }}>
                    Trung tâm Điều hành <span style={{ color: '#2563eb' }}>TutorSystem</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                    Nền tảng quản trị kho dữ liệu gia sư thế hệ mới. Tích hợp ETL từ nhiều nguồn dữ liệu, chuẩn hóa Warehouse và hiển thị Dashboard thông minh qua SQL Server.
                </p>
                
                {!isAuthenticated && (
                    <Link to="/login" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '16px', borderRadius: '12px' }}>
                        Bắt đầu Quản trị ngay
                    </Link>
                )}
            </header>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                {stats.map((item, idx) => (
                    <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}>
                        <div style={{ background: item.color, padding: '1rem', borderRadius: '16px' }}>
                            {item.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{item.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{item.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Architecture Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <div className="card" style={{ padding: '2.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Zap size={20} color="#f59e0b" /> Kiến trúc Hệ thống Warehouse
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {[
                            { step: '1. ETL Process', desc: 'Trích xuất từ Excel/CSV và nạp vào SQL Server bằng Python Pandas.' },
                            { step: '2. Data Warehouse', desc: 'Dữ liệu được chuẩn hóa, phân vùng tại Microsoft SQL Server (SSMS).' },
                            { step: '3. API Service', desc: 'Node.js Express đóng vai trò cầu nối, cung cấp dữ liệu qua RESTful API.' },
                            { step: '4. Visual Analysis', desc: 'React & Chart.js hiển thị biểu đồ thống kê chuyên sâu cho Leader.' }
                        ].map((item, i) => (
                            <li key={i} style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem', borderLeft: '3px solid #e2e8f0' }}>
                                <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{item.step}</div>
                                <div style={{ fontSize: '14px', color: '#64748b' }}>{item.desc}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card" style={{ padding: '2.5rem', background: '#0f172a', color: 'white' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: '#38bdf8' }}>Tiêu chuẩn Quản trị</h3>
                    <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.7', marginBottom: '2rem' }}>
                        Hệ thống đảm bảo tính toàn vẹn của dữ liệu gia sư. Mọi thông tin cá nhân đều được mã hóa và bảo mật qua lớp xác thực (Auth Guard).
                    </p>
                    <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px' }}>
                        <BarChart3 size={40} color="#38bdf8" style={{ marginBottom: '1rem' }} />
                        <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '5px' }}>Trạng thái hệ thống</div>
                        <div style={{ color: '#10b981', fontWeight: '700' }}>● ONLINE & CONNECTED TO SSMS</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
