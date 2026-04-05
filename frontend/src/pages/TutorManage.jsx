import React, { useEffect, useState } from 'react';
import { getTutors } from '../services/api';
import { Search, Filter, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const TutorManage = () => {
    const [tutors, setTutors] = useState([]);
    const [filteredTutors, setFilteredTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterArea, setFilterArea] = useState('');

    useEffect(() => {
        getTutors()
            .then(res => {
                setTutors(res.data);
                setFilteredTutors(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Lỗi tải dữ liệu gia sư:', err);
                setLoading(false);
            });
    }, []);

    // Logic Lọc Dữ liệu
    useEffect(() => {
        let result = tutors;
        if (searchTerm) {
            result = result.filter(t => 
                t.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                t.ma_gia_su?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterArea) {
            result = result.filter(t => t.ten_khu_vuc === filterArea);
        }
        setFilteredTutors(result);
    }, [searchTerm, filterArea, tutors]);

    // Lấy danh sách khu vực để lọc
    const areas = [...new Set(tutors.map(t => t.ten_khu_vuc))].filter(Boolean);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Quản lý Gia sư</h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Dữ liệu thực từ SQL Server (Top 200)</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="badge badge-blue">Tổng số: {filteredTutors.length}</div>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên hoặc mã gia sư..." 
                        style={{ width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
                    <Filter size={18} color="#64748b" />
                    <select 
                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                        value={filterArea}
                        onChange={(e) => setFilterArea(e.target.value)}
                    >
                        <option value="">Lọc theo Khu vực</option>
                        {areas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải dữ liệu...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th>Mã Gia sư</th>
                                    <th>Họ tên</th>
                                    <th>Học vị</th>
                                    <th>Trường Đại học</th>
                                    <th>Khu vực</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTutors.map((t, idx) => (
                                    <tr key={t.ma_gia_su || idx} style={{ transition: 'background 0.2s' }} className="table-row-hover">
                                        <td><span style={{ fontWeight: '600', color: '#6366f1' }}>{t.ma_gia_su || 'N/A'}</span></td>
                                        <td>{t.ho_ten || 'Không có tên'}</td>
                                        <td>{t.hoc_vi || 'N/A'}</td>
                                        <td style={{ color: '#475569' }}>{t.ten_truong_hoc || 'Chưa cập nhật'}</td>
                                        <td><MapPin size={14} style={{ marginRight: '4px', display: 'inline', color: '#ef4444' }} /> {t.ten_khu_vuc || 'N/A'}</td>
                                        <td>
                                            <span className={`badge ${t.trang_thai === 'hoat_dong' ? 'badge-green' : 'badge-orange'}`}>
                                                {t.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Tạm ẩn'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTutors.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                            Không tìm thấy gia sư nào khớp với từ khóa.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <style>{`
                .table-row-hover:hover { background-color: #f8fafc; }
            `}</style>
        </div>
    );
};

export default TutorManage;
