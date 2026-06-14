-- ============================================================
-- 05_role_patch.sql
-- Chạy SAU: 01_create_tables.sql → 02 → 03 → 04_supplement_data.sql
-- Mục đích : Định nghĩa chuẩn (canonical) bảng tai_khoan.
--            Idempotent — chạy lại bao nhiêu lần cũng an toàn.
-- ============================================================
-- QUAN TRỌNG — Sai lệch với 04_supplement_data.sql:
--   04 tạo CK_tai_khoan_trang_thai CHECK ('hoat_dong','khoa','xoa')
--   05 dùng chk_trang_thai         CHECK ('hoat_dong','bi_khoa')   ← chuẩn
--   Script này sẽ DROP CK_tai_khoan_trang_thai cũ rồi ADD chk_trang_thai mới.
-- ============================================================
USE TutorSystem;
GO

-- ============================================================
-- TRƯỜNG HỢP A — Bảng tai_khoan CHƯA TỒN TẠI
-- Tạo mới với đầy đủ constraints chuẩn.
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
        CONSTRAINT PK_tai_khoan          PRIMARY KEY (tai_khoan_id),
        CONSTRAINT UQ_tai_khoan_username UNIQUE      (username),
        CONSTRAINT chk_vai_tro    CHECK (vai_tro    IN (N'admin', N'gia_su', N'hoc_sinh')),
        CONSTRAINT chk_trang_thai CHECK (trang_thai IN (N'hoat_dong', N'bi_khoa'))
    );
    PRINT N'[05-A] CREATE TABLE tai_khoan OK.';
    PRINT N'[05-A]   chk_vai_tro    : admin | gia_su | hoc_sinh';
    PRINT N'[05-A]   chk_trang_thai : hoat_dong | bi_khoa';
END

-- ============================================================
-- TRƯỜNG HỢP B — Bảng tai_khoan ĐÃ TỒN TẠI (do 04 hoặc chạy thủ công)
-- Patch từng constraint thiếu / sai.
-- ============================================================
ELSE
BEGIN
    PRINT N'[05-B] Bang tai_khoan da ton tai — bat dau patch constraints.';

    -- ── B1: chk_vai_tro ─────────────────────────────────────────────
    IF NOT EXISTS (
        SELECT 1 FROM sys.check_constraints
        WHERE parent_object_id = OBJECT_ID(N'tai_khoan')
          AND name = N'chk_vai_tro'
    )
    BEGIN
        ALTER TABLE tai_khoan
            ADD CONSTRAINT chk_vai_tro
                CHECK (vai_tro IN (N'admin', N'gia_su', N'hoc_sinh'));
        PRINT N'[05-B]   + CONSTRAINT chk_vai_tro ADDED (admin | gia_su | hoc_sinh).';
    END
    ELSE
        PRINT N'[05-B]   chk_vai_tro da ton tai — bo qua.';

    -- ── B2: chk_trang_thai ──────────────────────────────────────────
    -- Xoá constraint cũ từ 04_supplement_data.sql nếu còn tồn tại
    -- (04 dùng values 'khoa'/'xoa' — không khớp chuẩn mới 'bi_khoa').
    IF EXISTS (
        SELECT 1 FROM sys.check_constraints
        WHERE parent_object_id = OBJECT_ID(N'tai_khoan')
          AND name = N'CK_tai_khoan_trang_thai'
    )
    BEGIN
        ALTER TABLE tai_khoan DROP CONSTRAINT CK_tai_khoan_trang_thai;
        PRINT N'[05-B]   DROP CK_tai_khoan_trang_thai (gia tri cu: hoat_dong/khoa/xoa).';
    END

    IF NOT EXISTS (
        SELECT 1 FROM sys.check_constraints
        WHERE parent_object_id = OBJECT_ID(N'tai_khoan')
          AND name = N'chk_trang_thai'
    )
    BEGIN
        ALTER TABLE tai_khoan
            ADD CONSTRAINT chk_trang_thai
                CHECK (trang_thai IN (N'hoat_dong', N'bi_khoa'));
        PRINT N'[05-B]   + CONSTRAINT chk_trang_thai ADDED (hoat_dong | bi_khoa).';
    END
    ELSE
        PRINT N'[05-B]   chk_trang_thai da ton tai — bo qua.';
END
GO

-- ============================================================
-- XÁC NHẬN — In trạng thái constraints sau khi patch
-- ============================================================
SELECT
    cc.name          AS constraint_name,
    cc.definition    AS [check_expression]
FROM sys.check_constraints cc
WHERE cc.parent_object_id = OBJECT_ID(N'tai_khoan')
ORDER BY cc.name;
GO

PRINT N'[05] 05_role_patch.sql hoan thanh.';
GO
