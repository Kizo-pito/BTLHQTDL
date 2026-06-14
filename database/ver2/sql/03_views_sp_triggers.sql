-- =================================================================
-- FILE: 03_views_sp_triggers.sql
-- MÔ TẢ: Tạo Views, Stored Procedures, Triggers cho TutorSystem
-- CHẠY SAU: 01_create_tables.sql + ETL
-- =================================================================
USE TutorSystem;
GO

-- =================================================================
-- PHẦN 1: VIEWS
-- =================================================================

-- VIEW 1: Tổng hợp thông tin gia sư đầy đủ (dùng cho Dashboard + API)
IF OBJECT_ID(N'dbo.vw_gia_su_tong_hop', 'V') IS NOT NULL
    DROP VIEW dbo.vw_gia_su_tong_hop;
GO

CREATE VIEW dbo.vw_gia_su_tong_hop AS
SELECT
    g.gia_su_id,
    g.ma_gia_su,
    g.ho_ten,
    g.gioi_tinh,
    g.nam_sinh,
    YEAR(GETDATE()) - g.nam_sinh                    AS tuoi,
    g.hoc_vi,
    g.chuyen_nganh,
    g.nam_kinh_nghiem,
    g.hinh_thuc_day,
    g.hoc_phi_trung_binh_gio,
    g.trang_thai,
    g.ngay_cap_nhat,
    g.nguon_du_lieu,
    t.ten_truong_hoc,
    t.loai_truong,
    k.ten_khu_vuc,
    k.quan_huyen,
    k.tinh_thanh,
    -- Tổng hợp môn dạy
    (
        SELECT STRING_AGG(mh.ten_mon_hoc, N', ')
        FROM dbo.du_lieu_gia_su_day_mon dm
        JOIN dbo.danh_muc_mon_hoc mh ON dm.mon_hoc_id = mh.mon_hoc_id
        WHERE dm.gia_su_id = g.gia_su_id
    )                                               AS danh_sach_mon_day,
    -- Điểm rating
    CAST(AVG(x.diem_xep_hang) AS DECIMAL(3,2))     AS diem_trung_binh,
    COUNT(x.du_lieu_xep_hang_gia_su_id)            AS so_luot_danh_gia
FROM dbo.thong_tin_gia_su g
LEFT JOIN dbo.danh_muc_truong_hoc t ON g.truong_hoc_id = t.truong_hoc_id
LEFT JOIN dbo.danh_muc_khu_vuc k   ON g.khu_vuc_id    = k.khu_vuc_id
LEFT JOIN dbo.du_lieu_xep_hang_gia_su x ON g.gia_su_id = x.gia_su_id
GROUP BY
    g.gia_su_id, g.ma_gia_su, g.ho_ten, g.gioi_tinh, g.nam_sinh,
    g.hoc_vi, g.chuyen_nganh, g.nam_kinh_nghiem, g.hinh_thuc_day,
    g.hoc_phi_trung_binh_gio, g.trang_thai, g.ngay_cap_nhat, g.nguon_du_lieu,
    t.ten_truong_hoc, t.loai_truong,
    k.ten_khu_vuc, k.quan_huyen, k.tinh_thanh;
GO


-- VIEW 2: Nhu cầu học đang mở (dùng cho trang StudentManage)
IF OBJECT_ID(N'dbo.vw_nhu_cau_dang_mo', 'V') IS NOT NULL
    DROP VIEW dbo.vw_nhu_cau_dang_mo;
GO

CREATE VIEW dbo.vw_nhu_cau_dang_mo AS
SELECT
    nc.du_lieu_nhu_cau_hoc_id   AS id,
    h.ho_ten                    AS ten_hoc_sinh,
    h.ma_hoc_sinh,
    h.hoc_luc,
    mh.ten_mon_hoc,
    mh.nhom_mon_hoc,
    lh.ten_lop_hoc,
    lh.cap_hoc,
    k.ten_khu_vuc,
    k.tinh_thanh,
    nc.hinh_thuc_hoc,
    nc.muc_tieu_hoc_tap,
    nc.ngan_sach_toi_da_gio,
    nc.so_buoi_moi_tuan,
    nc.trang_thai_nhu_cau,
    nc.ngay_dang,
    nc.nguon_du_lieu,
    nc.mon_hoc_id,
    nc.lop_hoc_id,
    nc.khu_vuc_id,
    nc.hoc_sinh_id
FROM dbo.du_lieu_nhu_cau_hoc nc
LEFT JOIN dbo.thong_tin_hoc_sinh h  ON nc.hoc_sinh_id = h.hoc_sinh_id
JOIN  dbo.danh_muc_mon_hoc mh       ON nc.mon_hoc_id  = mh.mon_hoc_id
JOIN  dbo.danh_muc_lop_hoc lh       ON nc.lop_hoc_id  = lh.lop_hoc_id
JOIN  dbo.danh_muc_khu_vuc k        ON nc.khu_vuc_id  = k.khu_vuc_id
WHERE nc.trang_thai_nhu_cau = N'dang_tim_gia_su';
GO


-- VIEW 3: Dashboard KPI tổng hợp
IF OBJECT_ID(N'dbo.vw_dashboard_kpi', 'V') IS NOT NULL
    DROP VIEW dbo.vw_dashboard_kpi;
GO

CREATE VIEW dbo.vw_dashboard_kpi AS
SELECT
    (SELECT COUNT(*) FROM dbo.thong_tin_gia_su
     WHERE trang_thai = N'hoat_dong')                              AS tong_gia_su_hoat_dong,
    (SELECT COUNT(*) FROM dbo.du_lieu_nhu_cau_hoc
     WHERE trang_thai_nhu_cau = N'dang_tim_gia_su')               AS tong_nhu_cau_dang_mo,
    (SELECT COUNT(*) FROM dbo.du_lieu_nhu_cau_hoc
     WHERE trang_thai_nhu_cau = N'da_ghep')                       AS tong_da_ghep_doi,
    (SELECT COUNT(*) FROM dbo.danh_muc_khu_vuc)                   AS tong_khu_vuc,
    (SELECT COUNT(*) FROM dbo.danh_muc_mon_hoc)                   AS tong_mon_hoc,
    (SELECT CAST(AVG(diem_xep_hang) AS DECIMAL(3,2))
     FROM dbo.du_lieu_xep_hang_gia_su)                            AS diem_tb_he_thong,
    (SELECT COUNT(*) FROM dbo.du_lieu_xep_hang_gia_su)            AS tong_luot_danh_gia,
    (SELECT COUNT(*) FROM dbo.thong_tin_hoc_sinh
     WHERE trang_thai = N'hoat_dong')                             AS tong_hoc_sinh;
GO


-- =================================================================
-- PHẦN 2: STORED PROCEDURES
-- =================================================================

-- SP 1: Tìm gia sư phù hợp nhất cho một nhu cầu học
IF OBJECT_ID(N'dbo.sp_tim_gia_su_phu_hop', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_tim_gia_su_phu_hop;
GO

CREATE PROCEDURE dbo.sp_tim_gia_su_phu_hop
    @mon_hoc_id     INT,
    @khu_vuc_id     INT           = NULL,
    @hinh_thuc      NVARCHAR(50)  = NULL,
    @ngan_sach      DECIMAL(12,2) = NULL,
    @top_n          INT           = 10
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@top_n)
        g.gia_su_id,
        g.ma_gia_su,
        g.ho_ten,
        g.gioi_tinh,
        g.hoc_vi,
        g.chuyen_nganh,
        g.nam_kinh_nghiem,
        g.hinh_thuc_day,
        dm.hoc_phi_trung_binh_gio   AS hoc_phi_mon_nay,
        g.hoc_phi_trung_binh_gio    AS hoc_phi_trung_binh,
        k.ten_khu_vuc,
        k.tinh_thanh,
        t.ten_truong_hoc,
        CAST(AVG(x.diem_xep_hang) AS DECIMAL(3,2)) AS diem_trung_binh,
        COUNT(x.du_lieu_xep_hang_gia_su_id)         AS so_luot_danh_gia,
        -- Điểm phù hợp (scoring)
        (
            ISNULL(CAST(AVG(x.diem_xep_hang) AS DECIMAL(3,2)), 0) * 20
            + ISNULL(g.nam_kinh_nghiem, 0) * 5
            + CASE WHEN g.khu_vuc_id = @khu_vuc_id THEN 30 ELSE 0 END
            + CASE WHEN g.hinh_thuc_day = @hinh_thuc OR @hinh_thuc IS NULL
                        OR g.hinh_thuc_day = N'ca_hai' THEN 20 ELSE 0 END
        )                           AS diem_phu_hop
    FROM dbo.thong_tin_gia_su g
    JOIN dbo.du_lieu_gia_su_day_mon dm
        ON g.gia_su_id = dm.gia_su_id AND dm.mon_hoc_id = @mon_hoc_id
    LEFT JOIN dbo.danh_muc_truong_hoc t ON g.truong_hoc_id = t.truong_hoc_id
    LEFT JOIN dbo.danh_muc_khu_vuc k    ON g.khu_vuc_id    = k.khu_vuc_id
    LEFT JOIN dbo.du_lieu_xep_hang_gia_su x ON g.gia_su_id = x.gia_su_id
    WHERE
        g.trang_thai = N'hoat_dong'
        AND (
            @hinh_thuc IS NULL
            OR g.hinh_thuc_day = @hinh_thuc
            OR g.hinh_thuc_day = N'ca_hai'
        )
        AND (
            @ngan_sach IS NULL
            OR dm.hoc_phi_trung_binh_gio IS NULL
            OR dm.hoc_phi_trung_binh_gio <= @ngan_sach
        )
    GROUP BY
        g.gia_su_id, g.ma_gia_su, g.ho_ten, g.gioi_tinh,
        g.hoc_vi, g.chuyen_nganh, g.nam_kinh_nghiem,
        g.hinh_thuc_day, dm.hoc_phi_trung_binh_gio,
        g.hoc_phi_trung_binh_gio, g.khu_vuc_id,
        k.ten_khu_vuc, k.tinh_thanh, t.ten_truong_hoc
    ORDER BY diem_phu_hop DESC, diem_trung_binh DESC;
END;
GO


-- SP 2: Thêm gia sư mới (có Transaction + kiểm tra trùng)
IF OBJECT_ID(N'dbo.sp_them_gia_su', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_them_gia_su;
GO

CREATE PROCEDURE dbo.sp_them_gia_su
    @ma_gia_su              NVARCHAR(50),
    @ho_ten                 NVARCHAR(150),
    @gioi_tinh              NVARCHAR(20)  = NULL,
    @nam_sinh               SMALLINT      = NULL,
    @hoc_vi                 NVARCHAR(100) = NULL,
    @chuyen_nganh           NVARCHAR(150) = NULL,
    @truong_hoc_id          INT           = NULL,
    @khu_vuc_id             INT           = NULL,
    @nam_kinh_nghiem        TINYINT       = NULL,
    @hinh_thuc_day          NVARCHAR(50)  = NULL,
    @hoc_phi_trung_binh_gio DECIMAL(12,2) = NULL,
    @mon_hoc_ids            NVARCHAR(MAX) = NULL,   -- comma-separated: '1,2,3'
    @new_gia_su_id          INT           OUTPUT,
    @message                NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Kiểm tra trùng mã
        IF EXISTS (SELECT 1 FROM dbo.thong_tin_gia_su WHERE ma_gia_su = @ma_gia_su)
        BEGIN
            SET @message = N'Mã gia sư đã tồn tại: ' + @ma_gia_su;
            ROLLBACK TRANSACTION;
            RETURN -1;
        END

        -- Thêm gia sư
        INSERT INTO dbo.thong_tin_gia_su (
            ma_gia_su, ho_ten, gioi_tinh, nam_sinh, hoc_vi, chuyen_nganh,
            truong_hoc_id, khu_vuc_id, nam_kinh_nghiem, hinh_thuc_day,
            hoc_phi_trung_binh_gio, trang_thai, nguon_du_lieu
        )
        VALUES (
            @ma_gia_su, @ho_ten, @gioi_tinh, @nam_sinh, @hoc_vi, @chuyen_nganh,
            @truong_hoc_id, @khu_vuc_id, @nam_kinh_nghiem, @hinh_thuc_day,
            @hoc_phi_trung_binh_gio, N'hoat_dong', N'he_thong'
        );

        SET @new_gia_su_id = SCOPE_IDENTITY();

        -- Thêm môn dạy nếu có
        IF @mon_hoc_ids IS NOT NULL AND LEN(@mon_hoc_ids) > 0
        BEGIN
            INSERT INTO dbo.du_lieu_gia_su_day_mon (gia_su_id, mon_hoc_id, hoc_phi_trung_binh_gio)
            SELECT
                @new_gia_su_id,
                CAST(TRIM(value) AS INT),
                @hoc_phi_trung_binh_gio
            FROM STRING_SPLIT(@mon_hoc_ids, ',')
            WHERE LEN(TRIM(value)) > 0;
        END

        SET @message = N'Thêm gia sư thành công. ID = ' + CAST(@new_gia_su_id AS NVARCHAR);
        COMMIT TRANSACTION;
        RETURN 0;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @message = N'Lỗi: ' + ERROR_MESSAGE();
        SET @new_gia_su_id = -1;
        RETURN -1;
    END CATCH
END;
GO


-- SP 3: Ghép đôi gia sư – học sinh (có Transaction)
IF OBJECT_ID(N'dbo.sp_ghep_doi', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_ghep_doi;
GO

CREATE PROCEDURE dbo.sp_ghep_doi
    @nhu_cau_id   BIGINT,
    @gia_su_id    INT,
    @message      NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Kiểm tra gia sư còn hoạt động không
        IF NOT EXISTS (
            SELECT 1 FROM dbo.thong_tin_gia_su
            WHERE gia_su_id = @gia_su_id AND trang_thai = N'hoat_dong'
        )
        BEGIN
            SET @message = N'Gia sư ID=' + CAST(@gia_su_id AS NVARCHAR) + N' không tồn tại hoặc đã nghỉ.';
            ROLLBACK TRANSACTION;
            RETURN -1;
        END

        -- Cập nhật trạng thái nhu cầu → đã ghép (Tận dụng U-Lock để tránh Race Condition)
        UPDATE dbo.du_lieu_nhu_cau_hoc
        SET trang_thai_nhu_cau = N'da_ghep'
        WHERE du_lieu_nhu_cau_hoc_id = @nhu_cau_id AND trang_thai_nhu_cau = N'dang_tim_gia_su';

        IF @@ROWCOUNT = 0
        BEGIN
            SET @message = N'Nhu cầu #' + CAST(@nhu_cau_id AS NVARCHAR) + N' không tồn tại hoặc đã được ghép bởi gia sư khác.';
            ROLLBACK TRANSACTION;
            RETURN -1;
        END

        SET @message = N'Ghép đôi thành công! Gia sư ID=' + CAST(@gia_su_id AS NVARCHAR)
                     + N' ↔ Nhu cầu #' + CAST(@nhu_cau_id AS NVARCHAR);
        COMMIT TRANSACTION;
        RETURN 0;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @message = N'Lỗi giao dịch: ' + ERROR_MESSAGE();
        RETURN -1;
    END CATCH
END;
GO


-- SP 4: Cập nhật trạng thái gia sư (có Transaction)
IF OBJECT_ID(N'dbo.sp_cap_nhat_trang_thai_gia_su', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_cap_nhat_trang_thai_gia_su;
GO

CREATE PROCEDURE dbo.sp_cap_nhat_trang_thai_gia_su
    @gia_su_id    INT,
    @trang_thai   NVARCHAR(30),
    @message      NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM dbo.thong_tin_gia_su WHERE gia_su_id = @gia_su_id)
        BEGIN
            SET @message = N'Không tìm thấy gia sư ID=' + CAST(@gia_su_id AS NVARCHAR);
            ROLLBACK TRANSACTION;
            RETURN -1;
        END

        UPDATE dbo.thong_tin_gia_su
        SET trang_thai = @trang_thai, ngay_cap_nhat = SYSDATETIME()
        WHERE gia_su_id = @gia_su_id;

        SET @message = N'Cập nhật trạng thái thành công → ' + @trang_thai;
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @message = N'Lỗi: ' + ERROR_MESSAGE();
        RETURN -1;
    END CATCH
END;
GO


-- =================================================================
-- PHẦN 3: TRIGGERS
-- =================================================================

-- TRIGGER 1: Tự động cập nhật ngay_cap_nhat khi sửa gia sư
IF OBJECT_ID(N'dbo.trg_cap_nhat_ngay_gia_su', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_cap_nhat_ngay_gia_su;
GO

CREATE TRIGGER dbo.trg_cap_nhat_ngay_gia_su
ON dbo.thong_tin_gia_su
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    -- Chỉ cập nhật ngay_cap_nhat nếu không phải chính cột này được update
    IF NOT UPDATE(ngay_cap_nhat)
    BEGIN
        UPDATE dbo.thong_tin_gia_su
        SET ngay_cap_nhat = SYSDATETIME()
        WHERE gia_su_id IN (SELECT gia_su_id FROM inserted);
    END
END;
GO


-- TRIGGER 2: Tự động cập nhật ngay_cap_nhat khi sửa học sinh
IF OBJECT_ID(N'dbo.trg_cap_nhat_ngay_hoc_sinh', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_cap_nhat_ngay_hoc_sinh;
GO

CREATE TRIGGER dbo.trg_cap_nhat_ngay_hoc_sinh
ON dbo.thong_tin_hoc_sinh
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(ngay_cap_nhat)
    BEGIN
        UPDATE dbo.thong_tin_hoc_sinh
        SET ngay_cap_nhat = SYSDATETIME()
        WHERE hoc_sinh_id IN (SELECT hoc_sinh_id FROM inserted);
    END
END;
GO





-- TRIGGER 4: Ghi log khi nhu cầu chuyển trạng thái "da_ghep"
-- (Trigger minh họa audit trail — quan trọng cho môn HQTCSDL)
IF OBJECT_ID(N'dbo.log_ghep_doi', 'U') IS NOT NULL
    DROP TABLE dbo.log_ghep_doi;
GO

CREATE TABLE dbo.log_ghep_doi (
    log_id          INT IDENTITY(1,1) PRIMARY KEY,
    nhu_cau_id      BIGINT NOT NULL,
    trang_thai_cu   NVARCHAR(30),
    trang_thai_moi  NVARCHAR(30),
    thoi_gian       DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

IF OBJECT_ID(N'dbo.trg_log_ghep_doi', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_log_ghep_doi;
GO

CREATE TRIGGER dbo.trg_log_ghep_doi
ON dbo.du_lieu_nhu_cau_hoc
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    -- Chỉ ghi log khi trạng thái thay đổi
    IF UPDATE(trang_thai_nhu_cau)
    BEGIN
        INSERT INTO dbo.log_ghep_doi (nhu_cau_id, trang_thai_cu, trang_thai_moi)
        SELECT
            i.du_lieu_nhu_cau_hoc_id,
            d.trang_thai_nhu_cau,
            i.trang_thai_nhu_cau
        FROM inserted i
        JOIN deleted  d ON i.du_lieu_nhu_cau_hoc_id = d.du_lieu_nhu_cau_hoc_id
        WHERE i.trang_thai_nhu_cau <> d.trang_thai_nhu_cau;
    END
END;
GO

-- =================================================================
-- KIỂM TRA KẾT QUẢ
-- =================================================================
PRINT N'=== VIEWS ===';
SELECT TABLE_NAME AS view_name FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_NAME LIKE N'vw_%' ORDER BY TABLE_NAME;

PRINT N'=== STORED PROCEDURES ===';
SELECT name FROM sys.procedures WHERE name LIKE N'sp_%' ORDER BY name;

PRINT N'=== TRIGGERS ===';
SELECT name FROM sys.triggers WHERE name LIKE N'trg_%' ORDER BY name;

-- Test nhanh
PRINT N'=== TEST VIEW vw_dashboard_kpi ===';
SELECT * FROM dbo.vw_dashboard_kpi;

PRINT N'=== TEST VIEW vw_gia_su_tong_hop (Top 3) ===';
SELECT TOP 3 ho_ten, hoc_vi, ten_khu_vuc, danh_sach_mon_day, diem_trung_binh
FROM dbo.vw_gia_su_tong_hop
WHERE trang_thai = N'hoat_dong'
ORDER BY diem_trung_binh DESC;
GO
