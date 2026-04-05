SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'du_lieu_xep_hang_gia_su', N'U') IS NOT NULL
    DROP TABLE du_lieu_xep_hang_gia_su;
GO

IF OBJECT_ID(N'du_lieu_nhu_cau_hoc', N'U') IS NOT NULL
    DROP TABLE du_lieu_nhu_cau_hoc;
GO

IF OBJECT_ID(N'du_lieu_gia_su_day_mon', N'U') IS NOT NULL
    DROP TABLE du_lieu_gia_su_day_mon;
GO

IF OBJECT_ID(N'thong_tin_hoc_sinh', N'U') IS NOT NULL
    DROP TABLE thong_tin_hoc_sinh;
GO

IF OBJECT_ID(N'thong_tin_gia_su', N'U') IS NOT NULL
    DROP TABLE thong_tin_gia_su;
GO

IF OBJECT_ID(N'danh_muc_mon_hoc', N'U') IS NOT NULL
    DROP TABLE danh_muc_mon_hoc;
GO

IF OBJECT_ID(N'danh_muc_lop_hoc', N'U') IS NOT NULL
    DROP TABLE danh_muc_lop_hoc;
GO

IF OBJECT_ID(N'danh_muc_truong_hoc', N'U') IS NOT NULL
    DROP TABLE danh_muc_truong_hoc;
GO

IF OBJECT_ID(N'danh_muc_khu_vuc', N'U') IS NOT NULL
    DROP TABLE danh_muc_khu_vuc;
GO

CREATE TABLE danh_muc_khu_vuc (
    khu_vuc_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_khu_vuc NVARCHAR(50) NULL,
    ten_khu_vuc NVARCHAR(100) NOT NULL,
    quan_huyen NVARCHAR(100) NULL,
    tinh_thanh NVARCHAR(100) NOT NULL,
    CONSTRAINT UQ_danh_muc_khu_vuc UNIQUE (ten_khu_vuc, quan_huyen, tinh_thanh)
);
GO

CREATE TABLE danh_muc_truong_hoc (
    truong_hoc_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_truong_hoc NVARCHAR(50) NULL,
    ten_truong_hoc NVARCHAR(200) NOT NULL,
    loai_truong NVARCHAR(50) NOT NULL,
    khu_vuc_id INT NULL,
    CONSTRAINT FK_danh_muc_truong_hoc_khu_vuc FOREIGN KEY (khu_vuc_id) REFERENCES danh_muc_khu_vuc(khu_vuc_id),
    CONSTRAINT CK_danh_muc_truong_hoc_loai CHECK (
        loai_truong IN (N'dai_hoc', N'thpt', N'thcs', N'tieu_hoc', N'trung_tam', N'khac')
    )
);
GO

CREATE TABLE danh_muc_lop_hoc (
    lop_hoc_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_lop_hoc NVARCHAR(50) NULL,
    ten_lop_hoc NVARCHAR(50) NOT NULL,
    cap_hoc NVARCHAR(50) NOT NULL,
    CONSTRAINT UQ_danh_muc_lop_hoc UNIQUE (ten_lop_hoc, cap_hoc),
    CONSTRAINT CK_danh_muc_lop_hoc_cap_hoc CHECK (
        cap_hoc IN (N'tieu_hoc', N'thcs', N'thpt', N'dai_hoc', N'khac')
    )
);
GO

CREATE TABLE danh_muc_mon_hoc (
    mon_hoc_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_mon_hoc NVARCHAR(50) NULL,
    ten_mon_hoc NVARCHAR(100) NOT NULL,
    nhom_mon_hoc NVARCHAR(100) NULL,
    CONSTRAINT UQ_danh_muc_mon_hoc UNIQUE (ten_mon_hoc)
);
GO

CREATE TABLE thong_tin_gia_su (
    gia_su_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_gia_su NVARCHAR(50) NOT NULL,
    ho_ten NVARCHAR(150) NOT NULL,
    gioi_tinh NVARCHAR(20) NULL,
    nam_sinh SMALLINT NULL,
    hoc_vi NVARCHAR(100) NULL,
    chuyen_nganh NVARCHAR(150) NULL,
    truong_hoc_id INT NULL,
    khu_vuc_id INT NULL,
    nam_kinh_nghiem TINYINT NULL,
    hinh_thuc_day NVARCHAR(50) NULL,
    hoc_phi_trung_binh_gio DECIMAL(12,2) NULL,
    nguon_du_lieu NVARCHAR(50) NULL,
    trang_thai NVARCHAR(30) NOT NULL DEFAULT N'hoat_dong',
    ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_thong_tin_gia_su_truong_hoc FOREIGN KEY (truong_hoc_id) REFERENCES danh_muc_truong_hoc(truong_hoc_id),
    CONSTRAINT FK_thong_tin_gia_su_khu_vuc FOREIGN KEY (khu_vuc_id) REFERENCES danh_muc_khu_vuc(khu_vuc_id),
    CONSTRAINT UQ_thong_tin_gia_su UNIQUE (ma_gia_su),
    CONSTRAINT CK_thong_tin_gia_su_gioi_tinh CHECK (
        gioi_tinh IS NULL OR gioi_tinh IN (N'nam', N'nu', N'khac')
    ),
    CONSTRAINT CK_thong_tin_gia_su_nam_sinh CHECK (
        nam_sinh IS NULL OR nam_sinh BETWEEN 1900 AND 2100
    ),
    CONSTRAINT CK_thong_tin_gia_su_kinh_nghiem CHECK (
        nam_kinh_nghiem IS NULL OR nam_kinh_nghiem BETWEEN 0 AND 60
    ),
    CONSTRAINT CK_thong_tin_gia_su_hinh_thuc CHECK (
        hinh_thuc_day IS NULL OR hinh_thuc_day IN (N'online', N'truc_tiep', N'ca_hai')
    ),
    CONSTRAINT CK_thong_tin_gia_su_hoc_phi CHECK (
        hoc_phi_trung_binh_gio IS NULL OR hoc_phi_trung_binh_gio >= 0
    ),
    CONSTRAINT CK_thong_tin_gia_su_trang_thai CHECK (
        trang_thai IN (N'hoat_dong', N'tam_an', N'an')
    )
);
GO

CREATE TABLE thong_tin_hoc_sinh (
    hoc_sinh_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_hoc_sinh NVARCHAR(50) NOT NULL,
    ho_ten NVARCHAR(150) NULL,
    truong_hoc_id INT NULL,
    lop_hoc_id INT NULL,
    khu_vuc_id INT NULL,
    hoc_luc NVARCHAR(50) NULL,
    nguon_du_lieu NVARCHAR(50) NULL,
    trang_thai NVARCHAR(30) NOT NULL DEFAULT N'hoat_dong',
    ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_thong_tin_hoc_sinh_truong_hoc FOREIGN KEY (truong_hoc_id) REFERENCES danh_muc_truong_hoc(truong_hoc_id),
    CONSTRAINT FK_thong_tin_hoc_sinh_lop_hoc FOREIGN KEY (lop_hoc_id) REFERENCES danh_muc_lop_hoc(lop_hoc_id),
    CONSTRAINT FK_thong_tin_hoc_sinh_khu_vuc FOREIGN KEY (khu_vuc_id) REFERENCES danh_muc_khu_vuc(khu_vuc_id),
    CONSTRAINT UQ_thong_tin_hoc_sinh UNIQUE (ma_hoc_sinh),
    CONSTRAINT CK_thong_tin_hoc_sinh_hoc_luc CHECK (
        hoc_luc IS NULL OR hoc_luc IN (N'yeu', N'trung_binh', N'kha', N'gioi', N'xuat_sac')
    ),
    CONSTRAINT CK_thong_tin_hoc_sinh_trang_thai CHECK (
        trang_thai IN (N'hoat_dong', N'tam_an', N'an')
    )
);
GO

CREATE TABLE du_lieu_gia_su_day_mon (
    du_lieu_gia_su_day_mon_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    gia_su_id INT NOT NULL,
    mon_hoc_id INT NOT NULL,
    lop_hoc_id INT NULL,
    hoc_phi_trung_binh_gio DECIMAL(12,2) NULL,
    ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_du_lieu_gia_su_day_mon_gia_su FOREIGN KEY (gia_su_id) REFERENCES thong_tin_gia_su(gia_su_id),
    CONSTRAINT FK_du_lieu_gia_su_day_mon_mon_hoc FOREIGN KEY (mon_hoc_id) REFERENCES danh_muc_mon_hoc(mon_hoc_id),
    CONSTRAINT FK_du_lieu_gia_su_day_mon_lop_hoc FOREIGN KEY (lop_hoc_id) REFERENCES danh_muc_lop_hoc(lop_hoc_id),
    CONSTRAINT UQ_du_lieu_gia_su_day_mon UNIQUE (gia_su_id, mon_hoc_id, lop_hoc_id),
    CONSTRAINT CK_du_lieu_gia_su_day_mon_hoc_phi CHECK (
        hoc_phi_trung_binh_gio IS NULL OR hoc_phi_trung_binh_gio >= 0
    )
);
GO

CREATE TABLE du_lieu_nhu_cau_hoc (
    du_lieu_nhu_cau_hoc_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    hoc_sinh_id INT NULL,
    mon_hoc_id INT NOT NULL,
    lop_hoc_id INT NOT NULL,
    khu_vuc_id INT NOT NULL,
    hinh_thuc_hoc NVARCHAR(50) NULL,
    muc_tieu_hoc_tap NVARCHAR(255) NULL,
    ngan_sach_toi_da_gio DECIMAL(12,2) NULL,
    so_buoi_moi_tuan TINYINT NULL,
    trang_thai_nhu_cau NVARCHAR(30) NOT NULL DEFAULT N'dang_tim_gia_su',
    ngay_dang DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    nguon_du_lieu NVARCHAR(50) NULL,
    CONSTRAINT FK_du_lieu_nhu_cau_hoc_hoc_sinh FOREIGN KEY (hoc_sinh_id) REFERENCES thong_tin_hoc_sinh(hoc_sinh_id),
    CONSTRAINT FK_du_lieu_nhu_cau_hoc_mon_hoc FOREIGN KEY (mon_hoc_id) REFERENCES danh_muc_mon_hoc(mon_hoc_id),
    CONSTRAINT FK_du_lieu_nhu_cau_hoc_lop_hoc FOREIGN KEY (lop_hoc_id) REFERENCES danh_muc_lop_hoc(lop_hoc_id),
    CONSTRAINT FK_du_lieu_nhu_cau_hoc_khu_vuc FOREIGN KEY (khu_vuc_id) REFERENCES danh_muc_khu_vuc(khu_vuc_id),
    CONSTRAINT CK_du_lieu_nhu_cau_hoc_hinh_thuc CHECK (
        hinh_thuc_hoc IS NULL OR hinh_thuc_hoc IN (N'online', N'truc_tiep', N'ca_hai')
    ),
    CONSTRAINT CK_du_lieu_nhu_cau_hoc_ngan_sach CHECK (
        ngan_sach_toi_da_gio IS NULL OR ngan_sach_toi_da_gio >= 0
    ),
    CONSTRAINT CK_du_lieu_nhu_cau_hoc_so_buoi CHECK (
        so_buoi_moi_tuan IS NULL OR so_buoi_moi_tuan > 0
    ),
    CONSTRAINT CK_du_lieu_nhu_cau_hoc_trang_thai CHECK (
        trang_thai_nhu_cau IN (N'dang_tim_gia_su', N'da_ghep', N'tam_dung')
    )
);
GO

CREATE TABLE du_lieu_xep_hang_gia_su (
    du_lieu_xep_hang_gia_su_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    gia_su_id INT NOT NULL,
    hoc_sinh_id INT NULL,
    diem_xep_hang DECIMAL(3,2) NOT NULL,
    ngay_danh_gia DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    nguon_du_lieu NVARCHAR(50) NULL,
    CONSTRAINT FK_du_lieu_xep_hang_gia_su_gia_su FOREIGN KEY (gia_su_id) REFERENCES thong_tin_gia_su(gia_su_id),
    CONSTRAINT FK_du_lieu_xep_hang_gia_su_hoc_sinh FOREIGN KEY (hoc_sinh_id) REFERENCES thong_tin_hoc_sinh(hoc_sinh_id),
    CONSTRAINT CK_du_lieu_xep_hang_gia_su_diem CHECK (
        diem_xep_hang BETWEEN 0 AND 5
    )
);
GO

CREATE INDEX IX_thong_tin_gia_su_khu_vuc_truong
ON thong_tin_gia_su(khu_vuc_id, truong_hoc_id, trang_thai);
GO

CREATE INDEX IX_du_lieu_gia_su_day_mon
ON du_lieu_gia_su_day_mon(mon_hoc_id, lop_hoc_id);
GO

CREATE INDEX IX_du_lieu_nhu_cau_hoc_top
ON du_lieu_nhu_cau_hoc(mon_hoc_id, lop_hoc_id, khu_vuc_id, trang_thai_nhu_cau);
GO

CREATE INDEX IX_du_lieu_xep_hang_gia_su_top
ON du_lieu_xep_hang_gia_su(gia_su_id, diem_xep_hang);
GO

CREATE UNIQUE INDEX UX_danh_muc_khu_vuc_ma
ON danh_muc_khu_vuc(ma_khu_vuc)
WHERE ma_khu_vuc IS NOT NULL;
GO

CREATE UNIQUE INDEX UX_danh_muc_truong_hoc_ma
ON danh_muc_truong_hoc(ma_truong_hoc)
WHERE ma_truong_hoc IS NOT NULL;
GO

CREATE UNIQUE INDEX UX_danh_muc_lop_hoc_ma
ON danh_muc_lop_hoc(ma_lop_hoc)
WHERE ma_lop_hoc IS NOT NULL;
GO

CREATE UNIQUE INDEX UX_danh_muc_mon_hoc_ma
ON danh_muc_mon_hoc(ma_mon_hoc)
WHERE ma_mon_hoc IS NOT NULL;
GO
