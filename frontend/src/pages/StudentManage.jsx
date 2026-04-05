import React, { useEffect, useState } from 'react';
import { getStudents } from '../services/api';
import { MapPin, Search, Filter, Layers } from 'lucide-react';

const StudentManage = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonHoc, setFilterMonHoc] = useState('');

    useEffect(() => {
        getStudents()
            .then(res => {
                setStudents(res.data);
                setFilteredStudents(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Lỗi tải dữ liệu học sinh:', err);
                setLoading(false);
            });
    }, []);

    // Logic Lọc
    useEffect(() => {
        let result = students;
        if (searchTerm) {
            result = result.filter(s => 
                s.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                s.ten_mon_hoc?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterMonHoc) {
            result = result.filter(s => s.ten_mon_hoc === filterMonHoc);
        }
        setFilteredStudents(result);
    }, [searchTerm, filterMonHoc, students]);

    const monHocs = [...new Set(students.map(s => s.ten_mon_hoc))].filter(Boolean);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Quản lý Nhu cầu Học sinh</h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Dữ liệu nhu cầu hiện thực từ SSMS (Top 200)</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="badge badge-orange">Số nhu cầu: {filteredStudents.length}</div>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên học sinh hoặc môn học..." 
                        style={{ width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
                    <Filter size={18} color="#64748b" />
                    <select 
                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                        value={filterMonHoc}
                        onChange={(e) => setFilterMonHoc(e.target.value)}
                    >
                        <option value="">Tất cả Môn học</option>
                        {monHocs.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải dữ liệu học sinh...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Họ tên học sinh</th>
                                    <th>Môn học</th>
                                    <th>Lớp</th>
                                    <th>Khu vực</th>
                                    <th>Ngân sách</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((s, idx) => (
                                    <tr key={s.id || idx}>
                                        <td><span style={{ fontWeight: '600', color: '#f59e0b' }}>#{s.id || idx}</span></td>
                                        <td>{s.ho_ten || 'Học sinh ẩn'}</td>
                                        <td>{s.ten_mon_hoc}</td>
                                        <td>{s.ten_lop_hoc}</td>
                                        <td><MapPin size={14} style={{ marginRight: '4px', display: 'inline', color: '#ef4444' }} /> {s.ten_khu_vuc}</td>
                                        <td style={{ fontWeight: '700', color: '#166534' }}>{s.ngan_sach?.toLocaleString()}đ/h</td>
                                        <td>
                                            <span style={{ 
                                                fontSize: '11px', 
                                                padding: '2px 8px', 
                                                borderRadius: '50px', 
                                                background: '#f1f5f9', 
                                                color: '#64748b',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                {s.trang_thai || 'Mới'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                            Không tìm thấy nhu cầu học tập nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentManage;
