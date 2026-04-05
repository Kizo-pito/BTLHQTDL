USE [ket_noi_gia_su];
GO

-- Top khu vuc co nhieu gia su hoat dong nhat
IF OBJECT_ID(N'dbo.thong_tin_gia_su', N'U') IS NULL
    OR OBJECT_ID(N'dbo.danh_muc_khu_vuc', N'U') IS NULL
BEGIN
    PRINT N'Chua tim thay bang dbo.thong_tin_gia_su hoac dbo.danh_muc_khu_vuc. Hay chay file 01_create_tables.sql va ETL truoc.';
END
ELSE
BEGIN
    SELECT TOP 10
        kv.khu_vuc_id,
        kv.ten_khu_vuc,
        kv.quan_huyen,
        kv.tinh_thanh,
        COUNT(gs.gia_su_id) AS so_luong_gia_su
    FROM dbo.thong_tin_gia_su AS gs
    INNER JOIN dbo.danh_muc_khu_vuc AS kv
        ON gs.khu_vuc_id = kv.khu_vuc_id
    WHERE gs.trang_thai = N'hoat_dong'
    GROUP BY
        kv.khu_vuc_id,
        kv.ten_khu_vuc,
        kv.quan_huyen,
        kv.tinh_thanh
    ORDER BY so_luong_gia_su DESC, kv.ten_khu_vuc ASC;
END
GO

-- Top truong dai hoc co nhieu gia su hoat dong nhat
IF OBJECT_ID(N'dbo.thong_tin_gia_su', N'U') IS NULL
    OR OBJECT_ID(N'dbo.danh_muc_truong_hoc', N'U') IS NULL
BEGIN
    PRINT N'Chua tim thay bang dbo.thong_tin_gia_su hoac dbo.danh_muc_truong_hoc. Hay chay file 01_create_tables.sql va ETL truoc.';
END
ELSE
BEGIN
    SELECT TOP 10
        th.truong_hoc_id,
        th.ten_truong_hoc,
        kv.ten_khu_vuc,
        kv.tinh_thanh,
        COUNT(gs.gia_su_id) AS so_luong_gia_su
    FROM dbo.thong_tin_gia_su AS gs
    INNER JOIN dbo.danh_muc_truong_hoc AS th
        ON gs.truong_hoc_id = th.truong_hoc_id
    LEFT JOIN dbo.danh_muc_khu_vuc AS kv
        ON th.khu_vuc_id = kv.khu_vuc_id
    WHERE gs.trang_thai = N'hoat_dong'
      AND th.loai_truong = N'dai_hoc'
    GROUP BY
        th.truong_hoc_id,
        th.ten_truong_hoc,
        kv.ten_khu_vuc,
        kv.tinh_thanh
    ORDER BY so_luong_gia_su DESC, th.ten_truong_hoc ASC;
END
GO

-- Top lop / mon hoc / khu vuc co nhieu hoc sinh dang can day nhat
IF OBJECT_ID(N'dbo.du_lieu_nhu_cau_hoc', N'U') IS NULL
    OR OBJECT_ID(N'dbo.danh_muc_lop_hoc', N'U') IS NULL
    OR OBJECT_ID(N'dbo.danh_muc_mon_hoc', N'U') IS NULL
    OR OBJECT_ID(N'dbo.danh_muc_khu_vuc', N'U') IS NULL
BEGIN
    PRINT N'Chua tim thay cac bang dashboard can thiet. Hay chay file 01_create_tables.sql va ETL truoc.';
END
ELSE
BEGIN
    SELECT TOP 10
        lh.ten_lop_hoc,
        lh.cap_hoc,
        mh.ten_mon_hoc,
        kv.ten_khu_vuc,
        kv.tinh_thanh,
        COUNT(DISTINCT COALESCE(CONVERT(NVARCHAR(30), nc.hoc_sinh_id), CONCAT(N'ANON_', CONVERT(NVARCHAR(30), nc.du_lieu_nhu_cau_hoc_id)))) AS so_luong_hoc_sinh,
        COUNT(nc.du_lieu_nhu_cau_hoc_id) AS so_luong_nhu_cau
    FROM dbo.du_lieu_nhu_cau_hoc AS nc
    INNER JOIN dbo.danh_muc_lop_hoc AS lh
        ON nc.lop_hoc_id = lh.lop_hoc_id
    INNER JOIN dbo.danh_muc_mon_hoc AS mh
        ON nc.mon_hoc_id = mh.mon_hoc_id
    INNER JOIN dbo.danh_muc_khu_vuc AS kv
        ON nc.khu_vuc_id = kv.khu_vuc_id
    WHERE nc.trang_thai_nhu_cau = N'dang_tim_gia_su'
    GROUP BY
        lh.ten_lop_hoc,
        lh.cap_hoc,
        mh.ten_mon_hoc,
        kv.ten_khu_vuc,
        kv.tinh_thanh
    ORDER BY so_luong_hoc_sinh DESC, so_luong_nhu_cau DESC, lh.ten_lop_hoc ASC, mh.ten_mon_hoc ASC;
END
GO

-- Top gia su co xep hang cao nhat
IF OBJECT_ID(N'dbo.du_lieu_xep_hang_gia_su', N'U') IS NULL
    OR OBJECT_ID(N'dbo.thong_tin_gia_su', N'U') IS NULL
BEGIN
    PRINT N'Chua tim thay bang dbo.du_lieu_xep_hang_gia_su hoac dbo.thong_tin_gia_su. Hay chay file 01_create_tables.sql va ETL truoc.';
END
ELSE
BEGIN
    SELECT TOP 10
        gs.gia_su_id,
        gs.ma_gia_su,
        gs.ho_ten,
        kv.ten_khu_vuc,
        th.ten_truong_hoc,
        CAST(AVG(xh.diem_xep_hang) AS DECIMAL(4,2)) AS diem_trung_binh,
        COUNT(xh.du_lieu_xep_hang_gia_su_id) AS so_luot_danh_gia
    FROM dbo.du_lieu_xep_hang_gia_su AS xh
    INNER JOIN dbo.thong_tin_gia_su AS gs
        ON xh.gia_su_id = gs.gia_su_id
    LEFT JOIN dbo.danh_muc_khu_vuc AS kv
        ON gs.khu_vuc_id = kv.khu_vuc_id
    LEFT JOIN dbo.danh_muc_truong_hoc AS th
        ON gs.truong_hoc_id = th.truong_hoc_id
    WHERE gs.trang_thai = N'hoat_dong'
    GROUP BY
        gs.gia_su_id,
        gs.ma_gia_su,
        gs.ho_ten,
        kv.ten_khu_vuc,
        th.ten_truong_hoc
    HAVING COUNT(xh.du_lieu_xep_hang_gia_su_id) >= 2
    ORDER BY diem_trung_binh DESC, so_luot_danh_gia DESC, gs.ho_ten ASC;
END
GO
