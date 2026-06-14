-- ============================================================
-- 04_supplement_data.sql
-- Chạy SAU: 01_create_tables.sql | 02_dashboard_queries.sql | 03_views_sp_triggers.sql
-- Mục đích : Bổ sung dữ liệu demo, không DROP, không ALTER, không đụng data cũ
-- ============================================================
USE TutorSystem;
GO

-- ============================================================
-- PHẦN 1 — Bảng tai_khoan: CREATE nếu chưa có + INSERT 3 tài khoản
-- ============================================================
IF OBJECT_ID(N'tai_khoan', N'U') IS NULL
BEGIN
    CREATE TABLE tai_khoan (
        tai_khoan_id  INT           NOT NULL,
        username      NVARCHAR(50)  NOT NULL,
        mat_khau_hash NVARCHAR(255) NOT NULL,
        vai_tro       NVARCHAR(20)  NOT NULL,
        lien_ket_id   INT           NULL,
        trang_thai    NVARCHAR(20)  NOT NULL
            CONSTRAINT DF_tai_khoan_trang_thai DEFAULT N'hoat_dong',
        CONSTRAINT PK_tai_khoan            PRIMARY KEY (tai_khoan_id),
        CONSTRAINT UQ_tai_khoan_username   UNIQUE      (username),
        CONSTRAINT CK_tai_khoan_vai_tro    CHECK (vai_tro    IN (N'admin', N'gia_su', N'hoc_sinh')),
        CONSTRAINT CK_tai_khoan_trang_thai CHECK (trang_thai IN (N'hoat_dong', N'khoa', N'xoa'))
    );
    PRINT N'[P1] Tao bang tai_khoan OK.';
END
ELSE
    PRINT N'[P1] Bang tai_khoan da ton tai — bo qua CREATE.';
GO

-- Hash bên dưới là DEMO PLACEHOLDER — không xác thực được thật sự.
-- Sinh hash thật trước khi deploy:
--   node -e "require('bcryptjs').hash('123', 10).then(h => console.log(h))"
INSERT INTO tai_khoan (tai_khoan_id, username, mat_khau_hash, vai_tro, lien_ket_id, trang_thai)
SELECT v.tid, v.uname,
       N'$2b$10$xMpFORdemoONLYsaltAAAAuuOmKJLs5v4GZP5TQXH3R3pIyCHf9v',
       v.role, v.lk, N'hoat_dong'
FROM (VALUES
    (1, N'admin',   N'admin',    CAST(NULL AS INT)),
    (2, N'gs_demo', N'gia_su',   1              ),
    (3, N'hs_demo', N'hoc_sinh', 1              )
) AS v(tid, uname, role, lk)
WHERE NOT EXISTS (SELECT 1 FROM tai_khoan WHERE tai_khoan_id = v.tid);

PRINT N'[P1] tai_khoan insert: ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' dong.';
GO

-- ============================================================
-- PHẦN 2 — du_lieu_nhu_cau_hoc: 5 dòng trang_thai_nhu_cau = 'tam_dung'
-- ============================================================
-- Giả định FK (dữ liệu CSV đã nhập trước):
--   hoc_sinh_id  50, 100, 150, 200, 250  → phải có trong thong_tin_hoc_sinh
--   mon_hoc_id   1=Toan 2=T.Anh 3=Vat_ly 4=Ngu_van 5=Hoa_hoc  (1-9, theo 01_create_tables)
--   lop_hoc_id   6=Lop6 9=Lop9 10=Lop10 11=Lop11 12=Lop12     (IDENTITY tu 01_create_tables)
--   khu_vuc_id   1–21 (danh_muc_khu_vuc, tu CSV)
-- Nếu FK thất bại: comment cột hoc_sinh_id và thay bằng NULL để kiểm tra trước.
SET IDENTITY_INSERT du_lieu_nhu_cau_hoc ON;
GO

INSERT INTO du_lieu_nhu_cau_hoc
    (du_lieu_nhu_cau_hoc_id, hoc_sinh_id, mon_hoc_id, lop_hoc_id, khu_vuc_id,
     hinh_thuc_hoc, muc_tieu_hoc_tap, ngan_sach_toi_da_gio, so_buoi_moi_tuan,
     trang_thai_nhu_cau, ngay_dang, nguon_du_lieu)
SELECT v.id, v.hs, v.mon, v.lop, v.kv, v.ht, v.mt, v.ns, v.sb,
       N'tam_dung', CAST(N'2026-06-01' AS DATE), N'supplement'
FROM (VALUES
    (1001, 50,  1, 12, 1, N'online',    N'On thi dai hoc khoi A',        150000.00, 3),
    (1002, 100, 2,  9, 3, N'truc_tiep', N'Nang diem hoc ky',             120000.00, 2),
    (1003, 150, 3, 10, 5, N'ca_hai',    N'Cai thien diem trung binh',    100000.00, 2),
    (1004, 200, 4,  6, 7, N'online',    N'Hoc he bo sung',                80000.00, 1),
    (1005, 250, 5, 11, 9, N'truc_tiep', N'On thi hoc ky cuoi nam',       130000.00, 3)
) AS v(id, hs, mon, lop, kv, ht, mt, ns, sb)
WHERE NOT EXISTS (
    SELECT 1 FROM du_lieu_nhu_cau_hoc WHERE du_lieu_nhu_cau_hoc_id = v.id
);

PRINT N'[P2] du_lieu_nhu_cau_hoc insert: ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' dong.';
GO

SET IDENTITY_INSERT du_lieu_nhu_cau_hoc OFF;
GO

-- ============================================================
-- PHẦN 3 — thong_tin_hoc_sinh: 1 học sinh mới HS_1001 (không có nhu cầu nào)
-- ============================================================
-- khu_vuc_id = 3 (Thu Duc, Ho Chi Minh) — giá trị hợp lệ trong khoảng 1–21
SET IDENTITY_INSERT thong_tin_hoc_sinh ON;
GO

INSERT INTO thong_tin_hoc_sinh
    (hoc_sinh_id, ma_hoc_sinh, ho_ten, khu_vuc_id, trang_thai, nguon_du_lieu)
SELECT 1001, N'HS_1001', N'Hoc sinh Demo 1001', 3, N'hoat_dong', N'supplement'
WHERE NOT EXISTS (SELECT 1 FROM thong_tin_hoc_sinh WHERE hoc_sinh_id = 1001);

PRINT N'[P3] thong_tin_hoc_sinh insert: ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' dong.';
GO

SET IDENTITY_INSERT thong_tin_hoc_sinh OFF;
GO

-- ============================================================
-- BÁO CÁO CUỐI
-- ============================================================
PRINT N'';
PRINT N'=== TONG KET 04_supplement_data.sql ===';
PRINT N'Bang                   | Dong them | Ghi chu';
PRINT N'-----------------------+-----------+------------------------------------------';
PRINT N'tai_khoan              |   3 (max) | admin / gs_demo / hs_demo — pw=123 PLACEHOLDER';
PRINT N'du_lieu_nhu_cau_hoc   |   5       | id 1001–1005, trang_thai=tam_dung';
PRINT N'thong_tin_hoc_sinh     |   1       | id 1001, HS_1001, khong co nhu_cau';
PRINT N'';
PRINT N'RUI RO FK:';
PRINT N'  - hoc_sinh_id 50/100/150/200/250 phai ton tai trong thong_tin_hoc_sinh';
PRINT N'    (nhap tu CSV truoc). Neu thieu: P2 se loi, comment hoc_sinh_id -> NULL.';
PRINT N'  - mon_hoc_id 1–5 phai ton tai trong danh_muc_mon_hoc.';
PRINT N'  - lop_hoc_id 6/9/10/11/12 phai ton tai trong danh_muc_lop_hoc.';
PRINT N'  - khu_vuc_id 1/3/5/7/9 phai ton tai trong danh_muc_khu_vuc.';
PRINT N'';
PRINT N'TINH DOC_LAP: File nay chay duoc ngay sau 01+02+03 + nhap CSV.';
PRINT N'========================================';
GO
