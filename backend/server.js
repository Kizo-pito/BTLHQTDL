const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. CẤU HÌNH KẾT NỐI SQL SERVER
const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_NAME || 'TutorSystem',
    options: {
        encrypt: true, 
        trustServerCertificate: true 
    }
};

// 2. KẾT NỐI DATABASE
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Đã kết nối thành công tới SQL Server (TutorSystem)');
        return pool;
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối Database:', err.message);
    });

// ===============================================
// 3. API DÀNH CHO FRONTEND
// ===============================================

// API 1: Danh sách Gia sư (Sử dụng ALIAS rõ ràng cho Frontend)
app.get('/api/tutors', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 200 
                g.ma_gia_su AS ma_gia_su, 
                g.ho_ten AS ho_ten, 
                g.hoc_vi AS hoc_vi, 
                t.ten_truong_hoc AS ten_truong_hoc, 
                k.ten_khu_vuc AS ten_khu_vuc, 
                g.trang_thai AS trang_thai
            FROM thong_tin_gia_su g
            LEFT JOIN danh_muc_truong_hoc t ON g.truong_hoc_id = t.truong_hoc_id
            LEFT JOIN danh_muc_khu_vuc k ON g.khu_vuc_id = k.khu_vuc_id
            ORDER BY g.ngay_cap_nhat DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API 2: Danh sách Nhu cầu Học sinh (Sử dụng ALIAS rõ ràng cho Frontend)
app.get('/api/students', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 200 
                n.du_lieu_nhu_cau_hoc_id AS id, 
                h.ho_ten AS ho_ten, 
                m.ten_mon_hoc AS ten_mon_hoc, 
                l.ten_lop_hoc AS ten_lop_hoc, 
                k.ten_khu_vuc AS ten_khu_vuc, 
                n.ngan_sach_toi_da_gio AS ngan_sach, 
                n.trang_thai_nhu_cau AS trang_thai
            FROM du_lieu_nhu_cau_hoc n
            LEFT JOIN thong_tin_hoc_sinh h ON n.hoc_sinh_id = h.hoc_sinh_id
            LEFT JOIN danh_muc_mon_hoc m ON n.mon_hoc_id = m.mon_hoc_id
            LEFT JOIN danh_muc_lop_hoc l ON n.lop_hoc_id = l.lop_hoc_id
            LEFT JOIN danh_muc_khu_vuc k ON n.khu_vuc_id = k.khu_vuc_id
            ORDER BY n.ngay_dang DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API 3: Thống kê Gia sư theo Khu vực
app.get('/api/stats/tutors-by-area', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 10 k.ten_khu_vuc AS label, COUNT(g.gia_su_id) AS count
            FROM thong_tin_gia_su g
            JOIN danh_muc_khu_vuc k ON g.khu_vuc_id = k.khu_vuc_id
            GROUP BY k.ten_khu_vuc
            ORDER BY count DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API 4: Thống kê Gia sư theo Trường ĐH
app.get('/api/stats/tutors-by-school', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 10 t.ten_truong_hoc AS label, COUNT(g.gia_su_id) AS count
            FROM thong_tin_gia_su g
            JOIN danh_muc_truong_hoc t ON g.truong_hoc_id = t.truong_hoc_id
            WHERE t.loai_truong = 'dai_hoc'
            GROUP BY t.ten_truong_hoc
            ORDER BY count DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API 5: Thống kê Nhu cầu Môn học
app.get('/api/stats/subjects-demand', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 10 m.ten_mon_hoc AS label, COUNT(n.du_lieu_nhu_cau_hoc_id) AS count
            FROM du_lieu_nhu_cau_hoc n
            JOIN danh_muc_mon_hoc m ON n.mon_hoc_id = m.mon_hoc_id
            GROUP BY m.ten_mon_hoc
            ORDER BY count DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API 6: Thống kê Top Gia sư Rating
app.get('/api/stats/top-rating', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 10 g.ho_ten AS label, CAST(AVG(x.diem_xep_hang) AS DECIMAL(10,2)) AS count
            FROM du_lieu_xep_hang_gia_su x
            JOIN thong_tin_gia_su g ON x.gia_su_id = g.gia_su_id
            GROUP BY g.ho_ten
            ORDER BY count DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Node.js (Minh) đang chạy tại: http://localhost:${PORT}`);
});
