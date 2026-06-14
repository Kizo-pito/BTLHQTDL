const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// ===================================================
// CẤU HÌNH KẾT NỐI SQL SERVER
// ===================================================
const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_NAME || 'TutorSystem',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Kết nối thành công tới SQL Server [TutorSystem]');
        return pool;
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối Database:', err.message);
        process.exit(1);
    });

// ===================================================
// HELPER
// ===================================================
const handleError = (res, err) => {
    console.error('[API Error]', err.message);
    res.status(500).json({ success: false, message: err.message });
};

// ===================================================
// API 1: DASHBOARD SUMMARY — 4 KPI nhanh
// ===================================================
app.get('/api/dashboard/summary', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                (SELECT COUNT(*) FROM thong_tin_gia_su WHERE trang_thai = N'hoat_dong') AS tong_gia_su_hoat_dong,
                (SELECT COUNT(*) FROM du_lieu_nhu_cau_hoc WHERE trang_thai_nhu_cau = N'dang_tim_gia_su') AS tong_nhu_cau_dang_mo,
                (SELECT COUNT(*) FROM danh_muc_khu_vuc) AS tong_khu_vuc,
                (SELECT COUNT(*) FROM danh_muc_mon_hoc) AS tong_mon_hoc,
                (SELECT CAST(AVG(diem_xep_hang) AS DECIMAL(3,2)) FROM du_lieu_xep_hang_gia_su) AS diem_trung_binh_he_thong,
                (SELECT COUNT(*) FROM du_lieu_xep_hang_gia_su) AS tong_luot_danh_gia
        `);
        res.json({ success: true, data: result.recordset[0] });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 2: DANH SÁCH GIA SƯ — Đầy đủ thông tin + filter + phân trang
// ===================================================
app.get('/api/tutors', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { search, khu_vuc, hinh_thuc, mon_hoc, page = 1, limit = 12 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereConditions = [`g.trang_thai = N'hoat_dong'`];
        const request = pool.request();

        if (search) {
            whereConditions.push(`(g.ho_ten LIKE @search OR g.chuyen_nganh LIKE @search)`);
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        if (khu_vuc) {
            whereConditions.push(`k.ten_khu_vuc = @khu_vuc`);
            request.input('khu_vuc', sql.NVarChar, khu_vuc);
        }
        if (hinh_thuc) {
            whereConditions.push(`g.hinh_thuc_day = @hinh_thuc`);
            request.input('hinh_thuc', sql.NVarChar, hinh_thuc);
        }
        if (mon_hoc) {
            whereConditions.push(`EXISTS (SELECT 1 FROM du_lieu_gia_su_day_mon dm JOIN danh_muc_mon_hoc mh ON dm.mon_hoc_id = mh.mon_hoc_id WHERE dm.gia_su_id = g.gia_su_id AND mh.ten_mon_hoc = @mon_hoc)`);
            request.input('mon_hoc', sql.NVarChar, mon_hoc);
        }

        const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';
        request.input('limit', sql.Int, parseInt(limit));
        request.input('offset', sql.Int, offset);

        const result = await request.query(`
            SELECT
                COUNT(*) OVER() AS total_rows,
                g.gia_su_id, g.ma_gia_su, g.ho_ten, g.gioi_tinh, g.nam_sinh,
                g.hoc_vi, g.chuyen_nganh, g.nam_kinh_nghiem, g.hinh_thuc_day,
                g.hoc_phi_trung_binh_gio, g.trang_thai,
                t.ten_truong_hoc, t.loai_truong,
                k.ten_khu_vuc, k.tinh_thanh,
                CAST(AVG(x.diem_xep_hang) AS DECIMAL(3,2)) AS diem_trung_binh,
                COUNT(x.du_lieu_xep_hang_gia_su_id) AS so_luot_danh_gia,
                (
                    SELECT STRING_AGG(mh.ten_mon_hoc, ', ')
                    FROM du_lieu_gia_su_day_mon dm
                    JOIN danh_muc_mon_hoc mh ON dm.mon_hoc_id = mh.mon_hoc_id
                    WHERE dm.gia_su_id = g.gia_su_id
                ) AS danh_sach_mon_day
            FROM thong_tin_gia_su g
            LEFT JOIN danh_muc_truong_hoc t ON g.truong_hoc_id = t.truong_hoc_id
            LEFT JOIN danh_muc_khu_vuc k ON g.khu_vuc_id = k.khu_vuc_id
            LEFT JOIN du_lieu_xep_hang_gia_su x ON g.gia_su_id = x.gia_su_id
            ${whereClause}
            GROUP BY
                g.gia_su_id, g.ma_gia_su, g.ho_ten, g.gioi_tinh, g.nam_sinh,
                g.hoc_vi, g.chuyen_nganh, g.nam_kinh_nghiem, g.hinh_thuc_day,
                g.hoc_phi_trung_binh_gio, g.trang_thai,
                t.ten_truong_hoc, t.loai_truong, k.ten_khu_vuc, k.tinh_thanh
            ORDER BY diem_trung_binh DESC, g.nam_kinh_nghiem DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);

        res.json({
            success: true,
            data: result.recordset,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.recordset.length > 0 ? result.recordset[0].total_rows : 0,
                hasMore: result.recordset.length === parseInt(limit)
            }
        });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 3: CHI TIẾT GIA SƯ (theo ID)
// ===================================================
app.get('/api/tutors/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const id = parseInt(req.params.id);
        const request = pool.request();
        request.input('id', sql.Int, id);

        const reqTutor = request.query(`
            SELECT g.gia_su_id, g.ma_gia_su, g.ho_ten, g.gioi_tinh, g.nam_sinh,
                g.hoc_vi, g.chuyen_nganh, g.nam_kinh_nghiem, g.hinh_thuc_day,
                g.hoc_phi_trung_binh_gio, g.trang_thai, g.ngay_cap_nhat,
                t.ten_truong_hoc, t.loai_truong,
                k.ten_khu_vuc, k.quan_huyen, k.tinh_thanh
            FROM thong_tin_gia_su g
            LEFT JOIN danh_muc_truong_hoc t ON g.truong_hoc_id = t.truong_hoc_id
            LEFT JOIN danh_muc_khu_vuc k ON g.khu_vuc_id = k.khu_vuc_id
            WHERE g.gia_su_id = @id
        `);

        const reqSubjects = pool.request().input('id2', sql.Int, id).query(`
            SELECT mh.ten_mon_hoc, mh.nhom_mon_hoc, lh.ten_lop_hoc, lh.cap_hoc, dm.hoc_phi_trung_binh_gio
            FROM du_lieu_gia_su_day_mon dm
            JOIN danh_muc_mon_hoc mh ON dm.mon_hoc_id = mh.mon_hoc_id
            LEFT JOIN danh_muc_lop_hoc lh ON dm.lop_hoc_id = lh.lop_hoc_id
            WHERE dm.gia_su_id = @id2
            ORDER BY mh.nhom_mon_hoc, mh.ten_mon_hoc
        `);

        const reqRating = pool.request().input('id3', sql.Int, id).query(`
            SELECT CAST(AVG(diem_xep_hang) AS DECIMAL(3,2)) AS diem_trung_binh,
                   COUNT(*) AS so_luot_danh_gia,
                   COUNT(CASE WHEN diem_xep_hang = 5 THEN 1 END) AS so_5_sao,
                   COUNT(CASE WHEN diem_xep_hang = 4 THEN 1 END) AS so_4_sao,
                   COUNT(CASE WHEN diem_xep_hang = 3 THEN 1 END) AS so_3_sao
            FROM du_lieu_xep_hang_gia_su WHERE gia_su_id = @id3
        `);

        const [tutorResult, subjectsResult, ratingResult] = await Promise.all([
            reqTutor, reqSubjects, reqRating
        ]);

        if (!tutorResult.recordset.length)
            return res.status(404).json({ success: false, message: 'Không tìm thấy gia sư' });

        res.json({
            success: true,
            data: {
                ...tutorResult.recordset[0],
                mon_day: subjectsResult.recordset,
                rating: ratingResult.recordset[0]
            }
        });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 4: DANH SÁCH NHU CẦU HỌC — Đầy đủ thông tin + filter + phân trang
// ===================================================
app.get('/api/students', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { search, khu_vuc, mon_hoc, hinh_thuc, page = 1, limit = 12 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereConditions = [`nc.trang_thai_nhu_cau = N'dang_tim_gia_su'`];
        const request = pool.request();

        if (search) {
            whereConditions.push(`(h.ho_ten LIKE @search OR mh.ten_mon_hoc LIKE @search)`);
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        if (khu_vuc) {
            whereConditions.push(`k.ten_khu_vuc = @khu_vuc`);
            request.input('khu_vuc', sql.NVarChar, khu_vuc);
        }
        if (mon_hoc) {
            whereConditions.push(`mh.ten_mon_hoc = @mon_hoc`);
            request.input('mon_hoc', sql.NVarChar, mon_hoc);
        }
        if (hinh_thuc) {
            whereConditions.push(`nc.hinh_thuc_hoc = @hinh_thuc`);
            request.input('hinh_thuc', sql.NVarChar, hinh_thuc);
        }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        request.input('limit', sql.Int, parseInt(limit));
        request.input('offset', sql.Int, offset);

        const result = await request.query(`
            SELECT
                nc.du_lieu_nhu_cau_hoc_id AS id,
                h.ho_ten AS ten_hoc_sinh,
                h.hoc_luc,
                mh.ten_mon_hoc, mh.nhom_mon_hoc,
                lh.ten_lop_hoc, lh.cap_hoc,
                k.ten_khu_vuc, k.tinh_thanh,
                nc.hinh_thuc_hoc, nc.muc_tieu_hoc_tap,
                nc.ngan_sach_toi_da_gio, nc.so_buoi_moi_tuan,
                nc.trang_thai_nhu_cau, nc.ngay_dang, nc.nguon_du_lieu,
                nc.mon_hoc_id, nc.lop_hoc_id, nc.khu_vuc_id
            FROM du_lieu_nhu_cau_hoc nc
            LEFT JOIN thong_tin_hoc_sinh h ON nc.hoc_sinh_id = h.hoc_sinh_id
            JOIN danh_muc_mon_hoc mh ON nc.mon_hoc_id = mh.mon_hoc_id
            JOIN danh_muc_lop_hoc lh ON nc.lop_hoc_id = lh.lop_hoc_id
            JOIN danh_muc_khu_vuc k ON nc.khu_vuc_id = k.khu_vuc_id
            ${whereClause}
            ORDER BY nc.ngay_dang DESC, nc.du_lieu_nhu_cau_hoc_id DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);

        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 5: BỘ LỌC — options filter
// ===================================================
app.get('/api/filters', async (req, res) => {
    try {
        const pool = await poolPromise;
        const [khuVuc, monHoc] = await Promise.all([
            pool.request().query(`SELECT DISTINCT ten_khu_vuc, tinh_thanh FROM danh_muc_khu_vuc ORDER BY tinh_thanh, ten_khu_vuc`),
            pool.request().query(`SELECT DISTINCT ten_mon_hoc, nhom_mon_hoc FROM danh_muc_mon_hoc ORDER BY nhom_mon_hoc, ten_mon_hoc`)
        ]);
        res.json({
            success: true,
            data: {
                khu_vuc: khuVuc.recordset,
                mon_hoc: monHoc.recordset,
                hinh_thuc: ['online', 'truc_tiep', 'ca_hai']
            }
        });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 6: STATS — Gia sư theo Khu vực
// ===================================================
app.get('/api/stats/tutors-by-area', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 10 k.ten_khu_vuc AS label, COUNT(g.gia_su_id) AS count
            FROM thong_tin_gia_su g
            JOIN danh_muc_khu_vuc k ON g.khu_vuc_id = k.khu_vuc_id
            WHERE g.trang_thai = N'hoat_dong'
            GROUP BY k.ten_khu_vuc ORDER BY count DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 7: STATS — Gia sư theo Trường ĐH
// ===================================================
app.get('/api/stats/tutors-by-school', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 10 t.ten_truong_hoc AS label, COUNT(g.gia_su_id) AS count
            FROM thong_tin_gia_su g
            JOIN danh_muc_truong_hoc t ON g.truong_hoc_id = t.truong_hoc_id
            WHERE g.trang_thai = N'hoat_dong' AND t.loai_truong = N'dai_hoc'
            GROUP BY t.ten_truong_hoc ORDER BY count DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 8: STATS — Nhu cầu môn học
// ===================================================
app.get('/api/stats/subjects-demand', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 10 mh.ten_mon_hoc AS label, COUNT(nc.du_lieu_nhu_cau_hoc_id) AS count
            FROM du_lieu_nhu_cau_hoc nc
            JOIN danh_muc_mon_hoc mh ON nc.mon_hoc_id = mh.mon_hoc_id
            WHERE nc.trang_thai_nhu_cau = N'dang_tim_gia_su'
            GROUP BY mh.ten_mon_hoc ORDER BY count DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 9: STATS — Top Gia sư Rating cao
// ===================================================
app.get('/api/stats/top-rating', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 10
                g.ho_ten AS label,
                CAST(AVG(x.diem_xep_hang) AS DECIMAL(4,2)) AS count,
                COUNT(x.du_lieu_xep_hang_gia_su_id) AS so_luot,
                k.ten_khu_vuc, t.ten_truong_hoc
            FROM du_lieu_xep_hang_gia_su x
            JOIN thong_tin_gia_su g ON x.gia_su_id = g.gia_su_id
            LEFT JOIN danh_muc_khu_vuc k ON g.khu_vuc_id = k.khu_vuc_id
            LEFT JOIN danh_muc_truong_hoc t ON g.truong_hoc_id = t.truong_hoc_id
            WHERE g.trang_thai = N'hoat_dong'
            GROUP BY g.ho_ten, k.ten_khu_vuc, t.ten_truong_hoc
            HAVING COUNT(x.du_lieu_xep_hang_gia_su_id) >= 1
            ORDER BY count DESC, so_luot DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 10: STATS — Phân bổ hình thức dạy
// ===================================================
app.get('/api/stats/teaching-mode', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT ISNULL(hinh_thuc_day, N'Chua cap nhat') AS label, COUNT(*) AS count
            FROM thong_tin_gia_su WHERE trang_thai = N'hoat_dong'
            GROUP BY hinh_thuc_day
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 11: STATS — Phân bổ học vị gia sư
// ===================================================
app.get('/api/stats/degree-distribution', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 8 ISNULL(hoc_vi, N'Chua cap nhat') AS label, COUNT(*) AS count
            FROM thong_tin_gia_su WHERE trang_thai = N'hoat_dong'
            GROUP BY hoc_vi ORDER BY count DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 12: GỌI SP — Tìm gia sư phù hợp nhất (sp_tim_gia_su_phu_hop)
// POST /api/matching
// ===================================================
app.post('/api/matching', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { mon_hoc_id, khu_vuc_id, hinh_thuc, ngan_sach, top_n = 10 } = req.body;
        if (!mon_hoc_id)
            return res.status(400).json({ success: false, message: 'Thieu mon_hoc_id' });

        const request = pool.request();
        request.input('mon_hoc_id', sql.Int,          parseInt(mon_hoc_id));
        request.input('khu_vuc_id', sql.Int,          khu_vuc_id ? parseInt(khu_vuc_id) : null);
        request.input('hinh_thuc',  sql.NVarChar(50), hinh_thuc || null);
        request.input('ngan_sach',  sql.Decimal(12,2),ngan_sach ? parseFloat(ngan_sach) : null);
        request.input('top_n',      sql.Int,          parseInt(top_n));

        const result = await request.execute('sp_tim_gia_su_phu_hop');
        res.json({ success: true, data: result.recordset, total: result.recordset.length });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 13: GỌI SP — Ghép đôi gia sư ↔ nhu cầu (sp_ghep_doi)
// POST /api/matching/confirm
// ===================================================
app.post('/api/matching/confirm', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { nhu_cau_id, gia_su_id } = req.body;
        if (!nhu_cau_id || !gia_su_id)
            return res.status(400).json({ success: false, message: 'Thieu nhu_cau_id hoac gia_su_id' });

        const request = pool.request();
        request.input('nhu_cau_id', sql.BigInt, parseInt(nhu_cau_id));
        request.input('gia_su_id',  sql.Int,    parseInt(gia_su_id));
        request.output('message',   sql.NVarChar(255));

        const result = await request.execute('sp_ghep_doi');
        const { message } = result.output;
        if (result.returnValue !== 0)
            return res.status(400).json({ success: false, message });

        res.json({ success: true, message });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 14: CRUD — Thêm gia sư mới (gọi SP sp_them_gia_su có Transaction)
// POST /api/tutors
// ===================================================
app.post('/api/tutors', async (req, res) => {
    try {
        const pool = await poolPromise;
        const {
            ma_gia_su, ho_ten, gioi_tinh, nam_sinh, hoc_vi, chuyen_nganh,
            truong_hoc_id, khu_vuc_id, nam_kinh_nghiem, hinh_thuc_day,
            hoc_phi_trung_binh_gio, mon_hoc_ids
        } = req.body;

        if (!ma_gia_su || !ho_ten)
            return res.status(400).json({ success: false, message: 'Thieu ma gia su hoac ho ten' });

        const request = pool.request();
        request.input('ma_gia_su',              sql.NVarChar(50),   ma_gia_su);
        request.input('ho_ten',                 sql.NVarChar(150),  ho_ten);
        request.input('gioi_tinh',              sql.NVarChar(20),   gioi_tinh || null);
        request.input('nam_sinh',               sql.SmallInt,       nam_sinh ? parseInt(nam_sinh) : null);
        request.input('hoc_vi',                 sql.NVarChar(100),  hoc_vi || null);
        request.input('chuyen_nganh',           sql.NVarChar(150),  chuyen_nganh || null);
        request.input('truong_hoc_id',          sql.Int,            truong_hoc_id ? parseInt(truong_hoc_id) : null);
        request.input('khu_vuc_id',             sql.Int,            khu_vuc_id ? parseInt(khu_vuc_id) : null);
        request.input('nam_kinh_nghiem',        sql.TinyInt,        nam_kinh_nghiem ? parseInt(nam_kinh_nghiem) : null);
        request.input('hinh_thuc_day',          sql.NVarChar(50),   hinh_thuc_day || null);
        request.input('hoc_phi_trung_binh_gio', sql.Decimal(12,2),  hoc_phi_trung_binh_gio ? parseFloat(hoc_phi_trung_binh_gio) : null);
        request.input('mon_hoc_ids',            sql.NVarChar(sql.MAX), mon_hoc_ids || null);
        request.output('new_gia_su_id',         sql.Int);
        request.output('message',               sql.NVarChar(255));

        const result = await request.execute('sp_them_gia_su');
        const { new_gia_su_id, message } = result.output;
        if (result.returnValue !== 0)
            return res.status(400).json({ success: false, message });

        res.status(201).json({ success: true, message, data: { gia_su_id: new_gia_su_id } });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 15: CRUD — Cập nhật thông tin gia sư (Transaction thủ công)
// PUT /api/tutors/:id
// ===================================================
app.put('/api/tutors/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const id = parseInt(req.params.id);
        const { ho_ten, gioi_tinh, nam_sinh, hoc_vi, chuyen_nganh,
            khu_vuc_id, nam_kinh_nghiem, hinh_thuc_day, hoc_phi_trung_binh_gio } = req.body;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const r = new sql.Request(transaction);
            r.input('id',                     sql.Int,          id);
            r.input('ho_ten',                 sql.NVarChar(150),ho_ten);
            r.input('gioi_tinh',              sql.NVarChar(20), gioi_tinh || null);
            r.input('nam_sinh',               sql.SmallInt,     nam_sinh ? parseInt(nam_sinh) : null);
            r.input('hoc_vi',                 sql.NVarChar(100),hoc_vi || null);
            r.input('chuyen_nganh',           sql.NVarChar(150),chuyen_nganh || null);
            r.input('khu_vuc_id',             sql.Int,          khu_vuc_id ? parseInt(khu_vuc_id) : null);
            r.input('nam_kinh_nghiem',        sql.TinyInt,      nam_kinh_nghiem ? parseInt(nam_kinh_nghiem) : null);
            r.input('hinh_thuc_day',          sql.NVarChar(50), hinh_thuc_day || null);
            r.input('hoc_phi_trung_binh_gio', sql.Decimal(12,2),hoc_phi_trung_binh_gio ? parseFloat(hoc_phi_trung_binh_gio) : null);
            await r.query(`
                UPDATE thong_tin_gia_su SET
                    ho_ten = @ho_ten, gioi_tinh = @gioi_tinh, nam_sinh = @nam_sinh,
                    hoc_vi = @hoc_vi, chuyen_nganh = @chuyen_nganh,
                    khu_vuc_id = @khu_vuc_id, nam_kinh_nghiem = @nam_kinh_nghiem,
                    hinh_thuc_day = @hinh_thuc_day,
                    hoc_phi_trung_binh_gio = @hoc_phi_trung_binh_gio
                WHERE gia_su_id = @id
            `);
            await transaction.commit();
            res.json({ success: true, message: 'Cap nhat gia su thanh cong' });
        } catch (e) { await transaction.rollback(); throw e; }
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 16: CRUD — Cập nhật trạng thái gia sư (gọi SP)
// PATCH /api/tutors/:id/status
// ===================================================
app.patch('/api/tutors/:id/status', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { trang_thai } = req.body;
        const valid = ['hoat_dong', 'tam_an', 'an'];
        if (!trang_thai || !valid.includes(trang_thai))
            return res.status(400).json({ success: false, message: 'Trang thai khong hop le: ' + valid.join(', ') });

        const request = pool.request();
        request.input('gia_su_id',  sql.Int,          parseInt(req.params.id));
        request.input('trang_thai', sql.NVarChar(30), trang_thai);
        request.output('message',   sql.NVarChar(255));

        const result = await request.execute('sp_cap_nhat_trang_thai_gia_su');
        const { message } = result.output;
        if (result.returnValue !== 0)
            return res.status(400).json({ success: false, message });

        res.json({ success: true, message });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 17: CRUD — Xóa gia sư (soft delete, Transaction)
// DELETE /api/tutors/:id
// ===================================================
app.delete('/api/tutors/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const id = parseInt(req.params.id);
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const r = new sql.Request(transaction);
            r.input('id', sql.Int, id);
            await r.query(`UPDATE thong_tin_gia_su SET trang_thai = N'an' WHERE gia_su_id = @id`);
            await transaction.commit();
            res.json({ success: true, message: 'Da an gia su ID=' + id });
        } catch (e) { await transaction.rollback(); throw e; }
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 18: CRUD — Thêm nhu cầu học (Transaction thủ công)
// POST /api/students
// ===================================================
app.post('/api/students', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { hoc_sinh_id, mon_hoc_id, lop_hoc_id, khu_vuc_id,
            hinh_thuc_hoc, muc_tieu_hoc_tap,
            ngan_sach_toi_da_gio, so_buoi_moi_tuan } = req.body;

        if (!mon_hoc_id || !lop_hoc_id || !khu_vuc_id)
            return res.status(400).json({ success: false, message: 'Thieu mon_hoc_id, lop_hoc_id hoac khu_vuc_id' });

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const r = new sql.Request(transaction);
            r.input('hoc_sinh_id',          sql.Int,           hoc_sinh_id ? parseInt(hoc_sinh_id) : null);
            r.input('mon_hoc_id',           sql.Int,           parseInt(mon_hoc_id));
            r.input('lop_hoc_id',           sql.Int,           parseInt(lop_hoc_id));
            r.input('khu_vuc_id',           sql.Int,           parseInt(khu_vuc_id));
            r.input('hinh_thuc_hoc',        sql.NVarChar(50),  hinh_thuc_hoc || null);
            r.input('muc_tieu_hoc_tap',     sql.NVarChar(255), muc_tieu_hoc_tap || null);
            r.input('ngan_sach_toi_da_gio', sql.Decimal(12,2), ngan_sach_toi_da_gio ? parseFloat(ngan_sach_toi_da_gio) : null);
            r.input('so_buoi_moi_tuan',     sql.TinyInt,       so_buoi_moi_tuan ? parseInt(so_buoi_moi_tuan) : null);

            const result = await r.query(`
                INSERT INTO du_lieu_nhu_cau_hoc
                    (hoc_sinh_id, mon_hoc_id, lop_hoc_id, khu_vuc_id,
                     hinh_thuc_hoc, muc_tieu_hoc_tap, ngan_sach_toi_da_gio,
                     so_buoi_moi_tuan, trang_thai_nhu_cau, nguon_du_lieu)
                OUTPUT INSERTED.du_lieu_nhu_cau_hoc_id
                VALUES (@hoc_sinh_id, @mon_hoc_id, @lop_hoc_id, @khu_vuc_id,
                        @hinh_thuc_hoc, @muc_tieu_hoc_tap, @ngan_sach_toi_da_gio,
                        @so_buoi_moi_tuan, N'dang_tim_gia_su', N'he_thong')
            `);
            await transaction.commit();
            const newId = result.recordset[0].du_lieu_nhu_cau_hoc_id;
            res.status(201).json({ success: true, message: 'Dang nhu cau thanh cong', data: { id: newId } });
        } catch (e) { await transaction.rollback(); throw e; }
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 19: CRUD — Xóa nhu cầu học (soft delete, Transaction)
// DELETE /api/students/:id
// ===================================================
app.delete('/api/students/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const id = parseInt(req.params.id);
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const r = new sql.Request(transaction);
            r.input('id', sql.BigInt, id);
            await r.query(`UPDATE du_lieu_nhu_cau_hoc SET trang_thai_nhu_cau = N'tam_dung' WHERE du_lieu_nhu_cau_hoc_id = @id`);
            await transaction.commit();
            res.json({ success: true, message: 'Da tam dung nhu cau #' + id });
        } catch (e) { await transaction.rollback(); throw e; }
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 20: CATALOG — Danh sách lớp học (cho form dropdown)
// ===================================================
app.get('/api/catalog/lop-hoc', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(
            `SELECT lop_hoc_id, ten_lop_hoc, cap_hoc FROM danh_muc_lop_hoc ORDER BY cap_hoc, ten_lop_hoc`
        );
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 21: CATALOG — Danh sách trường đại học (cho form dropdown)
// ===================================================
app.get('/api/catalog/truong-hoc', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(
            `SELECT truong_hoc_id, ten_truong_hoc, loai_truong FROM danh_muc_truong_hoc WHERE loai_truong = N'dai_hoc' ORDER BY ten_truong_hoc`
        );
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// API 22: LỊCH SỬ GHÉP ĐÔI — Audit log từ Trigger (trg_log_ghep_doi)
// ===================================================
app.get('/api/matching/log', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 50
                l.log_id, l.nhu_cau_id,
                l.trang_thai_cu, l.trang_thai_moi, l.thoi_gian,
                mh.ten_mon_hoc, lh.ten_lop_hoc, k.ten_khu_vuc
            FROM log_ghep_doi l
            JOIN du_lieu_nhu_cau_hoc nc ON l.nhu_cau_id = nc.du_lieu_nhu_cau_hoc_id
            JOIN danh_muc_mon_hoc mh    ON nc.mon_hoc_id = mh.mon_hoc_id
            JOIN danh_muc_lop_hoc lh    ON nc.lop_hoc_id = lh.lop_hoc_id
            JOIN danh_muc_khu_vuc k     ON nc.khu_vuc_id = k.khu_vuc_id
            ORDER BY l.thoi_gian DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// MIDDLEWARE — roleGuard
// Đọc header x-user-role (vai_tro) và x-user-id (lien_ket_id).
// Frontend phải gửi kèm mỗi request của gia_su / hoc_sinh:
//   headers: { 'x-user-role': user.role, 'x-user-id': String(user.lien_ket_id) }
// ===================================================
const roleGuard = (allowedRoles) => (req, res, next) => {
    const role   = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    if (!role || !allowedRoles.includes(role))
        return res.status(403).json({
            success: false,
            message: `Can quyen: [${allowedRoles.join(', ')}]. Header x-user-role nhan duoc: "${role || 'khong co'}"`
        });
    req.userRole = role;
    req.userId   = userId ? parseInt(userId) : null;
    next();
};

// ===================================================
// AUTH — Đăng nhập (bcrypt compare)
// POST /api/auth/login
// Body: { username, password }
// Trả về: { role, lien_ket_id, name, username, tai_khoan_id }
// ===================================================
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ success: false, message: 'Thieu username hoac password' });
    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('username', sql.NVarChar(50), username);

        const result = await request.query(`
            SELECT tk.tai_khoan_id, tk.username, tk.mat_khau_hash,
                   tk.vai_tro, tk.lien_ket_id,
                   gs.ho_ten AS ten_gia_su,
                   hs.ho_ten AS ten_hoc_sinh
            FROM tai_khoan tk
            LEFT JOIN thong_tin_gia_su   gs
                ON tk.vai_tro = N'gia_su'   AND tk.lien_ket_id = gs.gia_su_id
            LEFT JOIN thong_tin_hoc_sinh hs
                ON tk.vai_tro = N'hoc_sinh' AND tk.lien_ket_id = hs.hoc_sinh_id
            WHERE tk.username = @username AND tk.trang_thai = N'hoat_dong'
        `);

        if (!result.recordset.length)
            return res.status(401).json({ success: false, message: 'Sai tai khoan hoac mat khau' });

        const row      = result.recordset[0];
        const isValid  = await bcrypt.compare(password, row.mat_khau_hash);
        if (!isValid)
            return res.status(401).json({ success: false, message: 'Sai tai khoan hoac mat khau' });

        const name = row.vai_tro === 'admin'
            ? 'Quan tri vien'
            : (row.ten_gia_su || row.ten_hoc_sinh || row.username);

        res.json({
            success: true,
            data: {
                tai_khoan_id: row.tai_khoan_id,
                username:     row.username,
                name,
                role:         row.vai_tro,
                lien_ket_id:  row.lien_ket_id,
            }
        });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// GIA SU 1 — Xem hồ sơ cá nhân
// GET /api/tutor-profile/:id        [roleGuard: gia_su]
// :id = gia_su_id = lien_ket_id trong tai_khoan
// ===================================================
app.get('/api/tutor-profile/:id', roleGuard(['gia_su']), async (req, res) => {
    try {
        const pool = await poolPromise;
        const id   = parseInt(req.params.id);

        const [profileR, subjectsR, ratingR] = await Promise.all([
            pool.request().input('id', sql.Int, id).query(`
                SELECT gia_su_id, ma_gia_su, ho_ten, gioi_tinh, nam_sinh,
                       hoc_vi, chuyen_nganh, nam_kinh_nghiem, hinh_thuc_day,
                       hoc_phi_trung_binh_gio, trang_thai, ngay_cap_nhat,
                       ten_truong_hoc, ten_khu_vuc, tinh_thanh,
                       danh_sach_mon_day, diem_trung_binh, so_luot_danh_gia
                FROM dbo.vw_gia_su_tong_hop
                WHERE gia_su_id = @id
            `),
            pool.request().input('id2', sql.Int, id).query(`
                SELECT mh.mon_hoc_id, mh.ten_mon_hoc, mh.nhom_mon_hoc,
                       lh.lop_hoc_id, lh.ten_lop_hoc, lh.cap_hoc,
                       dm.hoc_phi_trung_binh_gio
                FROM du_lieu_gia_su_day_mon dm
                JOIN danh_muc_mon_hoc mh    ON dm.mon_hoc_id  = mh.mon_hoc_id
                LEFT JOIN danh_muc_lop_hoc lh ON dm.lop_hoc_id = lh.lop_hoc_id
                WHERE dm.gia_su_id = @id2
                ORDER BY mh.nhom_mon_hoc, mh.ten_mon_hoc
            `),
            pool.request().input('id3', sql.Int, id).query(`
                SELECT CAST(AVG(diem_xep_hang) AS DECIMAL(3,2)) AS diem_tb,
                       COUNT(*)                                   AS so_luot
                FROM du_lieu_xep_hang_gia_su
                WHERE gia_su_id = @id3
            `)
        ]);

        if (!profileR.recordset.length)
            return res.status(404).json({ success: false, message: 'Khong tim thay gia su ID=' + id });

        res.json({
            success: true,
            data: { ...profileR.recordset[0], mon_day: subjectsR.recordset, rating: ratingR.recordset[0] }
        });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// GIA SU 2 — Cập nhật hồ sơ cá nhân
// PUT /api/tutor-profile/:id        [roleGuard: gia_su]
// ===================================================
app.put('/api/tutor-profile/:id', roleGuard(['gia_su']), async (req, res) => {
    try {
        const pool = await poolPromise;
        const id   = parseInt(req.params.id);
        const { ho_ten, gioi_tinh, nam_sinh, hoc_vi, chuyen_nganh,
                khu_vuc_id, nam_kinh_nghiem, hinh_thuc_day,
                hoc_phi_trung_binh_gio } = req.body;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const r = new sql.Request(transaction);
            r.input('id',                     sql.Int,           id);
            r.input('ho_ten',                 sql.NVarChar(150), ho_ten);
            r.input('gioi_tinh',              sql.NVarChar(20),  gioi_tinh || null);
            r.input('nam_sinh',               sql.SmallInt,      nam_sinh ? parseInt(nam_sinh) : null);
            r.input('hoc_vi',                 sql.NVarChar(100), hoc_vi || null);
            r.input('chuyen_nganh',           sql.NVarChar(150), chuyen_nganh || null);
            r.input('khu_vuc_id',             sql.Int,           khu_vuc_id ? parseInt(khu_vuc_id) : null);
            r.input('nam_kinh_nghiem',        sql.TinyInt,       nam_kinh_nghiem ? parseInt(nam_kinh_nghiem) : null);
            r.input('hinh_thuc_day',          sql.NVarChar(50),  hinh_thuc_day || null);
            r.input('hoc_phi_trung_binh_gio', sql.Decimal(12,2), hoc_phi_trung_binh_gio ? parseFloat(hoc_phi_trung_binh_gio) : null);
            await r.query(`
                UPDATE thong_tin_gia_su SET
                    ho_ten                 = @ho_ten,
                    gioi_tinh              = @gioi_tinh,
                    nam_sinh               = @nam_sinh,
                    hoc_vi                 = @hoc_vi,
                    chuyen_nganh           = @chuyen_nganh,
                    khu_vuc_id             = @khu_vuc_id,
                    nam_kinh_nghiem        = @nam_kinh_nghiem,
                    hinh_thuc_day          = @hinh_thuc_day,
                    hoc_phi_trung_binh_gio = @hoc_phi_trung_binh_gio
                WHERE gia_su_id = @id
            `);
            await transaction.commit();
            res.json({ success: true, message: 'Cap nhat ho so thanh cong' });
        } catch (e) { await transaction.rollback(); throw e; }
    } catch (err) { handleError(res, err); }
});

// ===================================================
// GIA SU 3 — Danh sách nhu cầu đang mở (có thể filter theo ID)
// GET /api/demands/available?khu_vuc_id=&mon_hoc_id=&page=&limit=   [roleGuard: gia_su]
// ===================================================
app.get('/api/demands/available', roleGuard(['gia_su']), async (req, res) => {
    try {
        const pool  = await poolPromise;
        const { khu_vuc_id, mon_hoc_id, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const request    = pool.request();
        const conditions = [`nc.trang_thai_nhu_cau = N'dang_tim_gia_su'`];

        if (khu_vuc_id) {
            conditions.push('nc.khu_vuc_id = @khu_vuc_id');
            request.input('khu_vuc_id', sql.Int, parseInt(khu_vuc_id));
        }
        if (mon_hoc_id) {
            conditions.push('nc.mon_hoc_id = @mon_hoc_id');
            request.input('mon_hoc_id', sql.Int, parseInt(mon_hoc_id));
        }
        request.input('limit',  sql.Int, parseInt(limit));
        request.input('offset', sql.Int, offset);

        const result = await request.query(`
            SELECT COUNT(*) OVER()                          AS total_rows,
                   nc.du_lieu_nhu_cau_hoc_id               AS id,
                   h.ho_ten  AS ten_hoc_sinh, h.hoc_luc,
                   mh.ten_mon_hoc, mh.nhom_mon_hoc,
                   lh.ten_lop_hoc, lh.cap_hoc,
                   k.ten_khu_vuc, k.tinh_thanh,
                   nc.hinh_thuc_hoc, nc.muc_tieu_hoc_tap,
                   nc.ngan_sach_toi_da_gio, nc.so_buoi_moi_tuan,
                   nc.trang_thai_nhu_cau, nc.ngay_dang,
                   nc.mon_hoc_id, nc.lop_hoc_id, nc.khu_vuc_id
            FROM du_lieu_nhu_cau_hoc nc
            LEFT JOIN thong_tin_hoc_sinh h  ON nc.hoc_sinh_id = h.hoc_sinh_id
            JOIN  danh_muc_mon_hoc mh       ON nc.mon_hoc_id  = mh.mon_hoc_id
            JOIN  danh_muc_lop_hoc lh       ON nc.lop_hoc_id  = lh.lop_hoc_id
            JOIN  danh_muc_khu_vuc k        ON nc.khu_vuc_id  = k.khu_vuc_id
            WHERE ${conditions.join(' AND ')}
            ORDER BY nc.ngay_dang DESC, nc.du_lieu_nhu_cau_hoc_id DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
        res.json({
            success: true,
            data: result.recordset,
            pagination: {
                page:  parseInt(page),
                limit: parseInt(limit),
                total: result.recordset.length > 0 ? result.recordset[0].total_rows : 0,
            }
        });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// GIA SU 4 — Nhận yêu cầu ghép đôi (gọi sp_ghep_doi với U-Lock)
// POST /api/demands/:id/accept      [roleGuard: gia_su]
// gia_su_id: lấy từ header x-user-id, hoặc body.gia_su_id
// ===================================================
app.post('/api/demands/:id/accept', roleGuard(['gia_su']), async (req, res) => {
    try {
        const pool       = await poolPromise;
        const nhu_cau_id = parseInt(req.params.id);
        const gia_su_id  = req.userId ?? (req.body.gia_su_id ? parseInt(req.body.gia_su_id) : null);

        if (!gia_su_id)
            return res.status(400).json({
                success: false,
                message: 'Thieu gia_su_id: gui qua header x-user-id hoac body.gia_su_id'
            });

        const request = pool.request();
        request.input('nhu_cau_id', sql.BigInt,      nhu_cau_id);
        request.input('gia_su_id',  sql.Int,          gia_su_id);
        request.output('message',   sql.NVarChar(255));

        const result        = await request.execute('sp_ghep_doi');
        const { message }   = result.output;
        if (result.returnValue !== 0)
            return res.status(400).json({ success: false, message });

        res.json({ success: true, message });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// HOC SINH 1 — Tạo nhu cầu học mới
// POST /api/students/demands        [roleGuard: hoc_sinh]
// hoc_sinh_id tự động từ header x-user-id
// ===================================================
app.post('/api/students/demands', roleGuard(['hoc_sinh']), async (req, res) => {
    try {
        const pool         = await poolPromise;
        const hoc_sinh_id  = req.userId;
        const { mon_hoc_id, lop_hoc_id, khu_vuc_id,
                hinh_thuc_hoc, muc_tieu_hoc_tap,
                ngan_sach_toi_da_gio, so_buoi_moi_tuan } = req.body;

        if (!mon_hoc_id || !lop_hoc_id || !khu_vuc_id)
            return res.status(400).json({ success: false, message: 'Thieu mon_hoc_id, lop_hoc_id hoac khu_vuc_id' });

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const r = new sql.Request(transaction);
            r.input('hoc_sinh_id',          sql.Int,           hoc_sinh_id || null);
            r.input('mon_hoc_id',           sql.Int,           parseInt(mon_hoc_id));
            r.input('lop_hoc_id',           sql.Int,           parseInt(lop_hoc_id));
            r.input('khu_vuc_id',           sql.Int,           parseInt(khu_vuc_id));
            r.input('hinh_thuc_hoc',        sql.NVarChar(50),  hinh_thuc_hoc || null);
            r.input('muc_tieu_hoc_tap',     sql.NVarChar(255), muc_tieu_hoc_tap || null);
            r.input('ngan_sach_toi_da_gio', sql.Decimal(12,2), ngan_sach_toi_da_gio ? parseFloat(ngan_sach_toi_da_gio) : null);
            r.input('so_buoi_moi_tuan',     sql.TinyInt,       so_buoi_moi_tuan ? parseInt(so_buoi_moi_tuan) : null);

            const result = await r.query(`
                INSERT INTO du_lieu_nhu_cau_hoc
                    (hoc_sinh_id, mon_hoc_id, lop_hoc_id, khu_vuc_id,
                     hinh_thuc_hoc, muc_tieu_hoc_tap, ngan_sach_toi_da_gio,
                     so_buoi_moi_tuan, trang_thai_nhu_cau, nguon_du_lieu)
                OUTPUT INSERTED.du_lieu_nhu_cau_hoc_id
                VALUES (@hoc_sinh_id, @mon_hoc_id, @lop_hoc_id, @khu_vuc_id,
                        @hinh_thuc_hoc, @muc_tieu_hoc_tap, @ngan_sach_toi_da_gio,
                        @so_buoi_moi_tuan, N'dang_tim_gia_su', N'he_thong')
            `);
            await transaction.commit();
            const newId = result.recordset[0].du_lieu_nhu_cau_hoc_id;
            res.status(201).json({ success: true, message: 'Dang nhu cau thanh cong', data: { id: newId } });
        } catch (e) { await transaction.rollback(); throw e; }
    } catch (err) { handleError(res, err); }
});

// ===================================================
// HOC SINH 2 — Xem trạng thái các nhu cầu của mình
// GET /api/students/demands/me      [roleGuard: hoc_sinh]
// ===================================================
app.get('/api/students/demands/me', roleGuard(['hoc_sinh']), async (req, res) => {
    try {
        const pool        = await poolPromise;
        const hoc_sinh_id = req.userId;
        if (!hoc_sinh_id)
            return res.status(400).json({ success: false, message: 'Thieu hoc_sinh_id (header x-user-id)' });

        const request = pool.request();
        request.input('hoc_sinh_id', sql.Int, hoc_sinh_id);
        const result = await request.query(`
            SELECT nc.du_lieu_nhu_cau_hoc_id AS id,
                   mh.ten_mon_hoc, lh.ten_lop_hoc, lh.cap_hoc,
                   k.ten_khu_vuc, k.tinh_thanh,
                   nc.hinh_thuc_hoc, nc.muc_tieu_hoc_tap,
                   nc.ngan_sach_toi_da_gio, nc.so_buoi_moi_tuan,
                   nc.trang_thai_nhu_cau, nc.ngay_dang
            FROM du_lieu_nhu_cau_hoc nc
            JOIN danh_muc_mon_hoc mh ON nc.mon_hoc_id = mh.mon_hoc_id
            JOIN danh_muc_lop_hoc lh ON nc.lop_hoc_id = lh.lop_hoc_id
            JOIN danh_muc_khu_vuc k  ON nc.khu_vuc_id = k.khu_vuc_id
            WHERE nc.hoc_sinh_id = @hoc_sinh_id
            ORDER BY nc.ngay_dang DESC, nc.du_lieu_nhu_cau_hoc_id DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

// ===================================================
// HOC SINH 3 — Lịch sử ghép đôi (từ bảng log do Trigger ghi)
// GET /api/students/match-results   [roleGuard: hoc_sinh]
// ===================================================
app.get('/api/students/match-results', roleGuard(['hoc_sinh']), async (req, res) => {
    try {
        const pool        = await poolPromise;
        const hoc_sinh_id = req.userId;
        if (!hoc_sinh_id)
            return res.status(400).json({ success: false, message: 'Thieu hoc_sinh_id (header x-user-id)' });

        const request = pool.request();
        request.input('hoc_sinh_id', sql.Int, hoc_sinh_id);
        const result = await request.query(`
            SELECT TOP 50
                l.log_id, l.nhu_cau_id,
                l.trang_thai_cu, l.trang_thai_moi, l.thoi_gian,
                mh.ten_mon_hoc, lh.ten_lop_hoc, k.ten_khu_vuc
            FROM log_ghep_doi l
            JOIN du_lieu_nhu_cau_hoc nc ON l.nhu_cau_id = nc.du_lieu_nhu_cau_hoc_id
            JOIN danh_muc_mon_hoc mh    ON nc.mon_hoc_id = mh.mon_hoc_id
            JOIN danh_muc_lop_hoc lh    ON nc.lop_hoc_id = lh.lop_hoc_id
            JOIN danh_muc_khu_vuc k     ON nc.khu_vuc_id = k.khu_vuc_id
            WHERE nc.hoc_sinh_id = @hoc_sinh_id
            ORDER BY l.thoi_gian DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { handleError(res, err); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
